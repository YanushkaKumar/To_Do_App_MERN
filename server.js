require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
//
// CORS configuration for Docker
app.use(cors({
  origin: '*',
  credentials: true
}));


app.use(bodyParser.json());

const JWT_SECRET = process.env.JWT_SECRET || '12345';

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('MongoDB connection error:', error));

// --- Schemas ---

const contactSchema = new mongoose.Schema({
    name: String,
    email: String,
    message: String,
});

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const taskSchema = new mongoose.Schema({
    text: { type: String, required: true },
    completed: { type: Boolean, default: false },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    tags: { type: [String], default: [] },
    dueDate: { type: Date, default: null },
    archived: { type: Boolean, default: false },
    important: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field on save
taskSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Contact = mongoose.model('Contact', contactSchema);
const User = mongoose.model('User', userSchema);
const Task = mongoose.model('Task', taskSchema);

// --- Middleware ---

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access denied' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token' });
        req.user = { id: user.id };
        next();
    });
};

// Optional middleware for routes that can work with or without auth
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (!err) {
                req.user = { id: user.id };
            }
        });
    }
    next();
};

// --- Root Route ---
app.get('/', (req, res) => {
    res.json({
        message: 'Todo App Backend API',
        version: '1.0.0',
        status: 'running',
        timestamp: new Date().toISOString(),
        endpoints: {
            auth: [
                'POST /register',
                'POST /login'
            ],
            tasks: [
                'GET /api/tasks',
                'POST /api/tasks',
                'PUT /api/tasks/:id',
                'DELETE /api/tasks/:id'
            ],
            legacy_tasks: [
                'GET /tasks (requires auth)',
                'POST /tasks (requires auth)',
                'PUT /tasks/:id (requires auth)',
                'DELETE /tasks/:id (requires auth)'
            ],
            other: [
                'GET /api/health',
                'POST /send-message'
            ]
        }
    });
});

// --- Health Check Route (REQUIRED for Docker) ---
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        service: 'backend-api',
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// Basic health check without /api prefix
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        service: 'backend-api'
    });
});

// --- Auth Routes (keeping existing paths for compatibility) ---

app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        console.log('Registration attempt:', { username, hasPassword: !!password });
        
        if (!username || !password) {
            return res.status(400).json({ success: false, error: 'Username and password are required' });
        }

        const existingUser = await User.findOne({ username: username.trim() });
        if (existingUser) {
            console.log('Username already exists:', username);
            return res.status(400).json({ success: false, error: 'Username already exists' });
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({ username: username.trim(), password: hashedPassword });
        await newUser.save();
        
        console.log('User registered successfully:', username);
        res.status(201).json({ success: true, message: 'Registration successful!' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, error: 'Registration failed' });
    }
});

// UPDATED LOGIN ROUTE with better debugging
app.post('/api/login', async (req, res) => {
    try {
        console.log('Login attempt received:', { 
            body: req.body,
            username: req.body?.username,
            hasPassword: !!req.body?.password 
        });

        const { username, password } = req.body;
        
        if (!username || !password) {
            console.log('Missing credentials:', { username: !!username, password: !!password });
            return res.status(400).json({ error: 'Username and password are required' });
        }

        console.log('Looking for user:', username.trim());
        const user = await User.findOne({ username: username.trim() });
        
        if (!user) {
            console.log('User not found:', username);
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        
        console.log('User found, checking password...');
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            console.log('Password mismatch for user:', username);
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        
        console.log('Password match successful, generating token...');
        const token = jwt.sign(
            { id: user._id, username: user.username }, 
            JWT_SECRET, 
            { expiresIn: '1d' }
        );
        
        console.log('Login successful for user:', username);
        res.json({ success: true, token, username: user.username });
    } catch (error) {
        console.error('Login error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        res.status(500).json({ error: 'Login failed' });
    }
});

app.post('/send-message', async (req, res) => {
    const { name, email, message } = req.body;
    
    if (!name || !email || !message) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const newContact = new Contact({ name, email, message });
        await newContact.save();
        res.status(201).json({ message: 'Message sent successfully!' });
    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// --- Task Routes (with /api prefix for Docker compatibility) ---

// Debug route to check if API routes are working
app.get('/api', (req, res) => {
    res.json({
        message: 'API is working',
        timestamp: new Date().toISOString(),
        available_routes: [
            'GET /api/health',
            'GET /api/tasks',
            'POST /api/tasks',
            'PUT /api/tasks/:id',
            'DELETE /api/tasks/:id'
        ]
    });
});

// Get all tasks for authenticated user
app.get('/api/tasks', optionalAuth, async (req, res) => {
    try {
        let tasks;
        
        if (req.user) {
            // If authenticated, get user's tasks
            tasks = await Task.find({ userId: req.user.id }).sort({ createdAt: -1 });
        } else {
            // If not authenticated, return empty array or sample tasks
            tasks = [];
        }
        
        res.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

// Create new task
app.post('/api/tasks', optionalAuth, async (req, res) => {
    try {
        const { text, priority, tags, dueDate } = req.body;
        
        if (!text || !text.trim()) {
            return res.status(400).json({ error: 'Task text is required' });
        }

        let taskData = {
            text: text.trim(),
            priority: priority || 'medium',
            tags: tags || [],
            dueDate: dueDate ? new Date(dueDate) : null,
        };

        // If authenticated, associate with user
        if (req.user) {
            taskData.userId = req.user.id;
        } else {
            // For demo purposes, create a temporary user ID
            // In production, you might want to require authentication
            taskData.userId = new mongoose.Types.ObjectId();
        }

        const newTask = new Task(taskData);
        await newTask.save();
        
        res.status(201).json(newTask);
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ error: 'Failed to add task. Please try again.' });
    }
});

// Update task
app.put('/api/tasks/:id', optionalAuth, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid task ID' });
        }

        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // If authenticated, check ownership
        if (req.user && task.userId.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Build update object dynamically
        const updateData = {};
        const allowedUpdates = ['text', 'completed', 'priority', 'tags', 'dueDate', 'archived', 'important'];
        
        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });

        // Add updated timestamp
        updateData.updatedAt = new Date();

        const updatedTask = await Task.findByIdAndUpdate(id, updateData, { 
            new: true, 
            runValidators: true 
        });
        
        res.json(updatedTask);
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ error: 'Failed to update task' });
    }
});

// Delete task
app.delete('/api/tasks/:id', optionalAuth, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid task ID' });
        }

        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // If authenticated, check ownership
        if (req.user && task.userId.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        await Task.findByIdAndDelete(id);
        res.json({ message: 'Task deleted successfully', deletedTask: task });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

// --- Backward compatibility routes (without /api prefix) ---

// Keep existing task routes for backward compatibility
app.get('/tasks', authenticateToken, async (req, res) => {
    try {
        const tasks = await Task.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

app.post('/tasks', authenticateToken, async (req, res) => {
    try {
        const { text, priority, tags, dueDate } = req.body;
        if (!text) {
            return res.status(400).json({ error: 'Task text is required' });
        }
        const newTask = new Task({
            text,
            userId: req.user.id,
            priority,
            tags,
            dueDate,
        });
        await newTask.save();
        res.status(201).json(newTask);
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ error: 'Failed to add task. Please try again.' });
    }
});

app.put('/tasks/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task.findById(id);

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        if (task.userId.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const updateData = {};
        const allowedUpdates = ['text', 'completed', 'priority', 'tags', 'dueDate', 'archived', 'important'];
        
        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });

        const updatedTask = await Task.findByIdAndUpdate(id, updateData, { new: true });
        res.json(updatedTask);
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ error: 'Failed to update task' });
    }
});

app.delete('/tasks/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task.findById(id);

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        if (task.userId.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        await Task.findByIdAndDelete(id);
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

// --- Error Handling ---

// Global error handler
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
    console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5050;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`MongoDB URI: ${process.env.MONGO_URI}`);
});

// Graceful shutdown handling
process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    await mongoose.connection.close();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('Shutting down gracefully...');
    await mongoose.connection.close();
    process.exit(0);
});
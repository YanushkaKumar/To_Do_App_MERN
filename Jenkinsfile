// This is a declarative Jenkins pipeline script.
// It automates building, pushing, and deploying the To-Do application.

pipeline {
    // This pipeline can run on any available Jenkins agent.
    agent any

    // Environment variables make the pipeline reusable and easy to configure.
    // These values are taken from your Terraform outputs.
    environment {
        AWS_ACCOUNT_ID          = '881962383269'
        AWS_REGION              = 'us-east-1'
        FRONTEND_ECR_REPO_NAME  = 'app-frontend-free'
        BACKEND_ECR_REPO_NAME   = 'app-backend-free'
        ECS_CLUSTER_NAME        = 'app-cluster-free-tier'
        FRONTEND_SERVICE_NAME   = 'frontend-service'
        BACKEND_SERVICE_NAME    = 'backend-service'
        // Construct the full ECR repository URLs
        FRONTEND_IMAGE_URL      = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${FRONTEND_ECR_REPO_NAME}"
        BACKEND_IMAGE_URL       = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${BACKEND_ECR_REPO_NAME}"
    }

    stages {
        // Stage 1: Checkout code from your Git repository.
        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                // This step automatically checks out the code from the Git repository
                // that this Jenkins job is configured to use.
                checkout scm
            }
        }

        // Stage 2: Build the backend Docker image and push it to ECR.
        stage('Build & Push Backend') {
            steps {
                echo "Building backend Docker image..."
                // The 'withAWS' block uses the Jenkins credentials to interact with AWS.
                withAWS(credentials: 'aws-credentials', region: AWS_REGION) {
                    // Get a temporary login password from ECR.
                    def ecrLogin = sh(script: "aws ecr get-login-password --region ${AWS_REGION}", returnStdout: true).trim()
                    
                    // Use the Docker Pipeline plugin to securely log in, build, and push.
                    docker.withRegistry("https://${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com", [username: 'AWS', password: ecrLogin]) {
                        // Build the backend image. The Dockerfile is in the root directory.
                        def backendImage = docker.build("${BACKEND_ECR_REPO_NAME}:${BUILD_NUMBER}", '.')
                        
                        echo "Pushing backend image to ${BACKEND_IMAGE_URL}:${BUILD_NUMBER}"
                        // Push the image to the ECR repository.
                        backendImage.push()
                    }
                }
            }
        }

        // Stage 3: Build the frontend Docker image and push it to ECR.
        stage('Build & Push Frontend') {
            steps {
                echo "Building frontend Docker image..."
                withAWS(credentials: 'aws-credentials', region: AWS_REGION) {
                    def ecrLogin = sh(script: "aws ecr get-login-password --region ${AWS_REGION}", returnStdout: true).trim()
                    
                    docker.withRegistry("https://${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com", [username: 'AWS', password: ecrLogin]) {
                        // Build the frontend image. The Dockerfile is inside the 'App' directory.
                        // We must specify the build context directory.
                        def frontendImage = docker.build("${FRONTEND_ECR_REPO_NAME}:${BUILD_NUMBER}", './App')
                        
                        echo "Pushing frontend image to ${FRONTEND_IMAGE_URL}:${BUILD_NUMBER}"
                        frontendImage.push()
                    }
                }
            }
        }

        // Stage 4: Deploy the new images to the ECS services.
        stage('Deploy to ECS') {
            steps {
                echo "Deploying new versions to ECS..."
                withAWS(credentials: 'aws-credentials', region: AWS_REGION) {
                    // First, we need to create new task definition revisions with the new image tags.
                    // This is more robust than updating the service directly with an image override.

                    // Get the current backend task definition JSON.
                    def backendTaskDefJson = sh(script: "aws ecs describe-task-definition --task-definition backend-task-ec2 --query taskDefinition", returnStdout: true).trim()
                    // Create a new definition with the updated image URL.
                    def newBackendTaskDef = sh(script: """
                        echo '${backendTaskDefJson}' | jq '.containerDefinitions[0].image = "${BACKEND_IMAGE_URL}:${BUILD_NUMBER}" | .family = "backend-task-ec2"'
                    """, returnStdout: true).trim()
                    // Register the new task definition revision.
                    def backendTaskRevision = sh(script: "aws ecs register-task-definition --cli-input-json '${newBackendTaskDef}' --query 'taskDefinition.taskDefinitionArn'", returnStdout: true).trim()
                    echo "Registered new backend task definition: ${backendTaskRevision}"

                    // Get the current frontend task definition JSON.
                    def frontendTaskDefJson = sh(script: "aws ecs describe-task-definition --task-definition frontend-task-ec2 --query taskDefinition", returnStdout: true).trim()
                    // Create a new definition with the updated image URL.
                    def newFrontendTaskDef = sh(script: """
                        echo '${frontendTaskDefJson}' | jq '.containerDefinitions[0].image = "${FRONTEND_IMAGE_URL}:${BUILD_NUMBER}" | .family = "frontend-task-ec2"'
                    """, returnStdout: true).trim()
                    // Register the new task definition revision.
                    def frontendTaskRevision = sh(script: "aws ecs register-task-definition --cli-input-json '${newFrontendTaskDef}' --query 'taskDefinition.taskDefinitionArn'", returnStdout: true).trim()
                    echo "Registered new frontend task definition: ${frontendTaskRevision}"


                    // Now, update the ECS services to use the new task definition revisions.
                    // This will trigger a rolling deployment with zero downtime.
                    echo "Updating backend service..."
                    sh "aws ecs update-service --cluster ${ECS_CLUSTER_NAME} --service ${BACKEND_SERVICE_NAME} --task-definition ${backendTaskRevision}"
                    
                    echo "Updating frontend service..."
                    sh "aws ecs update-service --cluster ${ECS_CLUSTER_NAME} --service ${FRONTEND_SERVICE_NAME} --task-definition ${frontendTaskRevision}"
                }
            }
        }
    }
    post {
        // This block runs after all stages are complete.
        always {
            echo 'Pipeline finished.'
        }
        success {
            echo 'Deployment was successful!'
        }
        failure {
            echo 'Pipeline failed. Please check the logs.'
        }
    }
}
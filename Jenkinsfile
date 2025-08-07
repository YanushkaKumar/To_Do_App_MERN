// This declarative Jenkins pipeline builds and deploys the backend service
// It triggers automatically on a GitHub push.
//
pipeline {
    agent any

    triggers {
        githubPush()
    }

    environment {
        AWS_ACCOUNT_ID        = '881962383269'
        AWS_REGION            = 'us-east-1'
        BACKEND_ECR_REPO_NAME = 'app-backend-free'
        ECS_CLUSTER_NAME      = 'my-ecs-cluster'
        BACKEND_SERVICE_NAME  = 'backend-service'
        IMAGE_TAG             = "build-${BUILD_NUMBER}"
        ECR_REGISTRY_URL      = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
        // Full ECR Image URL with the unique build tag
        ECR_IMAGE_URL         = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${BACKEND_ECR_REPO_NAME}:${IMAGE_TAG}"
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }

        stage('Login to AWS ECR') {
            steps {
                script {
                    withAWS(credentials: 'aws-credentials', region: AWS_REGION) {
                        echo "Authenticating with AWS ECR..."
                        bat "aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY_URL}"
                    }
                }
            }
        }

        stage('Build & Push Backend') {
            steps {
                script {
                    echo "Building and pushing backend Docker image..."
                    def backendImage = docker.build("${ECR_IMAGE_URL}", "-f Dockerfile .")
                    backendImage.push()
                }
            }
        }

        stage('Deploy Backend to ECS') {
            steps {
                script {
                    echo "Deploying new backend version to ECS..."
                    withAWS(credentials: 'aws-credentials', region: AWS_REGION) {
                        // Step 1: Read the task definition template
                        def taskDefTemplate = readFile('task-definition.json')
                        
                        // Step 2: Inject the correct ECR image URL for this build
                        def newTaskDef = taskDefTemplate.replace('__ECR_IMAGE_URL__', ECR_IMAGE_URL)

                        // Step 3: Write the updated JSON to a temporary file. This is the key fix.
                        writeFile(file: 'updated-task-def.json', text: newTaskDef)

                        // Step 4: Register the new task definition by telling the AWS CLI to read from the file
                        // The file:// syntax is the most reliable way to pass JSON.
                        def registrationResult = bat(script: 'aws ecs register-task-definition --cli-input-json file://updated-task-def.json', returnStdout: true).trim()
                        
                        // Step 5: Write the result to a file so PowerShell can parse it
                        writeFile(file: 'new-task-def.json', text: registrationResult)
                        
                        // Step 6: Extract the new task definition ARN (Amazon Resource Name)
                        def newTaskDefArn = bat(script: 'powershell -command "(Get-Content -Path .\\new-task-def.json | ConvertFrom-Json).taskDefinition.taskDefinitionArn"', returnStdout: true).trim()

                        // Step 7: Update the ECS service to use the new task definition revision
                        echo "Updating service with new task definition: ${newTaskDefArn}"
                        bat "aws ecs update-service --cluster ${ECS_CLUSTER_NAME} --service ${BACKEND_SERVICE_NAME} --task-definition ${newTaskDefArn}"
                    }
                }
            }
        }
    }
    
    post {
        always {
            // Good practice to clean up temporary files and log out
            echo "Logging out from AWS ECR..."
            bat "docker logout ${ECR_REGISTRY_URL}"
            deleteDir() // Deletes the workspace
        }
    }
}
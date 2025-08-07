// This declarative Jenkins pipeline builds and deploys the backend service
// It triggers automatically on a GitHub push.

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

        // ==================== TEMPORARY DIAGNOSTIC DEPLOY STAGE ====================
        stage('Deploy Backend to ECS (Diagnostic)') {
            steps {
                script {
                    echo "Attempting to register the new task definition..."
                    withAWS(credentials: 'aws-credentials', region: AWS_REGION) {
                        def taskDefTemplate = readFile('task-definition.json')
                        def newTaskDef = taskDefTemplate.replace('__ECR_IMAGE_URL__', ECR_IMAGE_URL)
                        writeFile(file: 'updated-task-def.json', text: newTaskDef)
                        
                        // This will now print the REAL error message from AWS
                        bat "aws ecs register-task-definition --cli-input-json file://updated-task-def.json"
                    }
                }
            }
        }
    }
    
    post {
        always {
            echo "Logging out from AWS ECR..."
            bat "docker logout ${ECR_REGISTRY_URL}"
            deleteDir()
        }
    }
}
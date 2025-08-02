// This is a declarative Jenkins pipeline script, corrected for a Windows environment
// and using the standard --password-stdin method for ECR login.

pipeline {
    agent any

    triggers {
        githubPush()
    }

    environment {
        AWS_ACCOUNT_ID          = '881962383269'
        AWS_REGION              = 'us-east-1'
        FRONTEND_ECR_REPO_NAME  = 'app-frontend-free'
        BACKEND_ECR_REPO_NAME   = 'app-backend-free'
        ECS_CLUSTER_NAME        = 'app-cluster-free-tier'
        FRONTEND_SERVICE_NAME   = 'frontend-service'
        BACKEND_SERVICE_NAME    = 'backend-service'
        // Use the build number to create unique image tags
        IMAGE_TAG               = "build-${BUILD_NUMBER}"
        // Define the ECR registry URL once
        ECR_REGISTRY_URL        = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }

        // This stage logs into AWS ECR once for all subsequent stages.
        stage('Login to AWS ECR') {
            steps {
                script {
                    withAWS(credentials: 'aws-credentials', region: AWS_REGION) {
                        echo "Authenticating with AWS ECR..."
                        
                        // *** FIX: Pipe the password directly to 'docker login' using --password-stdin ***
                        // This is the most robust and secure method for programmatic logins.
                        bat "aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY_URL}"
                    }
                }
            }
        }

        stage('Build & Push Backend') {
            steps {
                script {
                    echo "Building and pushing backend Docker image..."
                    // Build the image, tagging it with the ECR URL and the unique build tag.
                    def backendImage = docker.build("${ECR_REGISTRY_URL}/${BACKEND_ECR_REPO_NAME}:${IMAGE_TAG}", '.')
                    
                    // Push the unique tag.
                    backendImage.push()
                    
                    // Also tag the image as 'latest' and push that tag.
                    backendImage.push('latest')
                }
            }
        }

        stage('Build & Push Frontend') {
            steps {
                script {
                    echo "Building and pushing frontend Docker image..."
                    // The Dockerfile is inside the 'App' directory.
                    def frontendImage = docker.build("${ECR_REGISTRY_URL}/${FRONTEND_ECR_REPO_NAME}:${IMAGE_TAG}", './App')

                    // Push the unique tag.
                    frontendImage.push()

                    // Also tag the image as 'latest' and push that tag.
                    frontendImage.push('latest')
                }
            }
        }

        stage('Deploy to ECS') {
            steps {
                script {
                    echo "Deploying new versions to ECS..."
                    withAWS(credentials: 'aws-credentials', region: AWS_REGION) {
                        // This tells ECS to restart the service, which will automatically pull the image tagged 'latest'.
                        echo "Updating backend service..."
                        bat "aws ecs update-service --cluster ${ECS_CLUSTER_NAME} --service ${BACKEND_SERVICE_NAME} --force-new-deployment"
                        
                        echo "Updating frontend service..."
                        bat "aws ecs update-service --cluster ${ECS_CLUSTER_NAME} --service ${FRONTEND_SERVICE_NAME} --force-new-deployment"
                    }
                }
            }
        }
    }
    
    post {
        always {
            echo "Logging out from AWS ECR..."
            // It's good practice to log out from the Docker registry.
            bat "docker logout ${ECR_REGISTRY_URL}"
        }
    }
}
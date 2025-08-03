// This is a declarative Jenkins pipeline script, corrected for a Windows environment
// and using the correct Docker login method and Dockerfile paths.

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

        stage('Login to AWS ECR') {
            steps {
                script {
                    withAWS(credentials: 'aws-credentials', region: AWS_REGION) {
                        echo "Authenticating with AWS ECR..."
                        // Pipe the password directly to 'docker login' using --password-stdin
                        bat "aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY_URL}"
                    }
                }
            }
        }
        
        stage('Build & Push Frontend') {
            steps {
                script {
                    echo "Building and pushing frontend Docker image..."
                    
                    // Use the project root as the build context and specify the Dockerfile path
                    def frontendImage = docker.build("${ECR_REGISTRY_URL}/${FRONTEND_ECR_REPO_NAME}:${IMAGE_TAG}", "-f App/frontend.Dockerfile .")

                    frontendImage.push()
                    frontendImage.push('latest')
                }
            }
        }

        stage('Build & Push Backend') {
            steps {
                script {
                    echo "Building and pushing backend Docker image..."
                    // Specify the correct Dockerfile name using the -f flag
                    def backendImage = docker.build("${ECR_REGISTRY_URL}/${BACKEND_ECR_REPO_NAME}:${IMAGE_TAG}", "-f backend.Dockerfile .")
                    
                    backendImage.push()
                    backendImage.push('latest')
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
            bat "docker logout ${ECR_REGISTRY_URL}"
        }
    }
}
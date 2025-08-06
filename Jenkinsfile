// This declarative Jenkins pipeline builds and deploys the backend service
// It triggers automatically on a GitHub push.

pipeline {
    agent any

    triggers {
        githubPush()
    }

    environment {
        AWS_ACCOUNT_ID          = '881962383269'
        AWS_REGION              = 'us-east-1'
        BACKEND_ECR_REPO_NAME   = 'app-backend-free'
        ECS_CLUSTER_NAME        = 'my-ecs-cluster'
        BACKEND_SERVICE_NAME    = 'backend-service'
        IMAGE_TAG               = "build-${BUILD_NUMBER}"
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
                        // Use bat for Windows agents
                        bat "aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY_URL}"
                    }
                }
            }
        }

        stage('Build & Push Backend') {
            steps {
                script {
                    echo "Building and pushing backend Docker image..."
                    // Use the correct Dockerfile name as provided in your project
                    def backendImage = docker.build("${ECR_REGISTRY_URL}/${BACKEND_ECR_REPO_NAME}:${IMAGE_TAG}", "-f Dockerfile .")
                    
                    backendImage.push()
                    backendImage.push('latest')
                }
            }
        }

        stage('Deploy Backend to ECS') {
            steps {
                script {
                    echo "Deploying new backend version to ECS..."
                    withAWS(credentials: 'aws-credentials', region: AWS_REGION) {
                        // This command tells ECS to restart the service, which will pull the 'latest' image tag.
                        bat "aws ecs update-service --cluster ${ECS_CLUSTER_NAME} --service ${BACKEND_SERVICE_NAME} --force-new-deployment"
                    }
                }
            }
        }
    }
    
    post {
        always {
            // Good practice to log out after the pipeline finishes
            echo "Logging out from AWS ECR..."
            bat "docker logout ${ECR_REGISTRY_URL}"
        }
    }
}
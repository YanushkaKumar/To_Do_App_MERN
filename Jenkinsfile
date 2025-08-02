// This is a declarative Jenkins pipeline script, corrected for a Windows environment.
//niougfuhy
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
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }

        stage('Build & Push Backend') {
            steps {
                script {
                    echo "Building backend Docker image..."
                    withAWS(credentials: 'aws-credentials', region: AWS_REGION) {
                        // *** FIX: Use 'bat' for Windows instead of 'sh' ***
                        def ecrLogin = bat(script: "aws ecr get-login-password --region ${AWS_REGION}", returnStdout: true).trim()
                        
                        docker.withRegistry("https://${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com", [username: 'AWS', password: ecrLogin]) {
                            // Tag the image with both the unique build number and 'latest'
                            def backendImage = docker.build("${BACKEND_ECR_REPO_NAME}:${IMAGE_TAG}", '.')
                            backendImage.push()
                            backendImage.push('latest') // Also push the 'latest' tag
                        }
                    }
                }
            }
        }

        stage('Build & Push Frontend') {
            steps {
                script {
                    echo "Building frontend Docker image..."
                    withAWS(credentials: 'aws-credentials', region: AWS_REGION) {
                        // *** FIX: Use 'bat' for Windows instead of 'sh' ***
                        def ecrLogin = bat(script: "aws ecr get-login-password --region ${AWS_REGION}", returnStdout: true).trim()
                        
                        docker.withRegistry("https://${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com", [username: 'AWS', password: ecrLogin]) {
                            // The Dockerfile is inside the 'App' directory.
                            def frontendImage = docker.build("${FRONTEND_ECR_REPO_NAME}:${IMAGE_TAG}", './App')
                            frontendImage.push()
                            frontendImage.push('latest') // Also push the 'latest' tag
                        }
                    }
                }
            }
        }

        stage('Deploy to ECS') {
            steps {
                script {
                    echo "Deploying new versions to ECS..."
                    withAWS(credentials: 'aws-credentials', region: AWS_REGION) {
                        // *** SIMPLIFIED DEPLOYMENT LOGIC ***
                        // This is a more robust method that avoids complex, platform-specific commands.
                        // It tells ECS to restart the service, which will automatically pull the image tagged 'latest' from ECR.
                        
                        echo "Updating backend service..."
                        // *** FIX: Use 'bat' for Windows instead of 'sh' ***
                        bat "aws ecs update-service --cluster ${ECS_CLUSTER_NAME} --service ${BACKEND_SERVICE_NAME} --force-new-deployment"
                        
                        echo "Updating frontend service..."
                        // *** FIX: Use 'bat' for Windows instead of 'sh' ***
                        bat "aws ecs update-service --cluster ${ECS_CLUSTER_NAME} --service ${FRONTEND_SERVICE_NAME} --force-new-deployment"
                    }
                }
            }
        }
    }
    
    post {
        always {
            echo 'Pipeline finished.'
        }
    }
}
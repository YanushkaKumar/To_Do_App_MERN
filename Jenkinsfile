// This declarative Jenkins pipeline builds and deploys the backend service
pipeline {
    agent any

    environment {
        AWS_ACCOUNT_ID          = '881962383269'
        AWS_REGION              = 'us-east-1'
        BACKEND_ECR_REPO_NAME   = 'app-backend-free'
        ECS_CLUSTER_NAME        = 'my-ecs-cluster'
        BACKEND_SERVICE_NAME    = 'backend-service'
        // Jenkins Credentials IDs for your AWS Secrets
        MONGO_SECRET_CRED_ID    = 'mongo-uri-secret-arn'
        JWT_SECRET_CRED_ID      = 'jwt-secret-arn'
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
                        def ecrRegistryUrl = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
                        echo "Authenticating with AWS ECR at ${ecrRegistryUrl}..."
                        bat "aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ecrRegistryUrl}"
                    }
                }
            }
        }

        stage('Build & Push Backend Image') {
            steps {
                script {
                    def imageTag = "build-${BUILD_NUMBER}"
                    env.ECR_IMAGE_URL = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${BACKEND_ECR_REPO_NAME}:${imageTag}"
                    
                    echo "Building and pushing backend Docker image: ${ECR_IMAGE_URL}"
                    def backendImage = docker.build(ECR_IMAGE_URL, "-f Dockerfile .")
                    backendImage.push()
                }
            }
        }

        stage('Deploy Backend to ECS') {
            steps {
                script {
                    echo "Starting ECS deployment..."
                    withAWS(credentials: 'aws_cred', region: AWS_REGION) {
                        // Use Jenkins credentials to securely fetch secret ARNs
                        withCredentials([string(credentialsId: MONGO_SECRET_CRED_ID, variable: 'MONGO_URI_ARN'),
                                         string(credentialsId: JWT_SECRET_CRED_ID, variable: 'JWT_SECRET_ARN')]) {

                            echo "Preparing new task definition..."
                            def taskDefTemplate = readFile('task-definition.json')
                            
                            // Replace all placeholders
                            def newTaskDef = taskDefTemplate.replace('__ECR_IMAGE_URL__', ECR_IMAGE_URL)
                                                            .replace('__MONGO_URI_SECRET_ARN__', MONGO_URI_ARN)
                                                            .replace('__JWT_SECRET_ARN__', JWT_SECRET_ARN)

                            writeFile(file: 'updated-task-def.json', text: newTaskDef)
                            
                            echo "Registering new task definition revision..."
                            def registerOutput = bat(script: "aws ecs register-task-definition --cli-input-json file://updated-task-def.json", returnStdout: true).trim()
                            
                            def newTaskArn = readJSON(text: registerOutput).taskDefinition.taskDefinitionArn
                            echo "Successfully registered Task Definition: ${newTaskArn}"

                            echo "Updating ECS service '${BACKEND_SERVICE_NAME}' to use new task definition..."
                            bat """
                                aws ecs update-service --cluster ${ECS_CLUSTER_NAME} --service ${BACKEND_SERVICE_NAME} --task-definition "${newTaskArn}"
                            """
                            echo "Deployment initiated successfully."
                        }
                    }
                }
            }
        }
    }
    
    post {
        always {
            // *** THIS IS THE CORRECTED BLOCK ***
            script {
                echo "Pipeline cleanup..."
                def ecrRegistryUrl = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
                bat "docker logout ${ecrRegistryUrl}"
                deleteDir()
            }
        }
    }
}
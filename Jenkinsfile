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

        // ==================== NEW DIAGNOSTIC STAGE ====================
        stage('Diagnose AWS Identity') {
            steps {
                script {
                    withAWS(credentials: 'aws-credentials', region: AWS_REGION) {
                        echo "Checking the AWS identity being used by the pipeline..."
                        bat "aws sts get-caller-identity"
                    }
                }
            }
        }
        // ==============================================================

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
                        def taskDefTemplate = readFile('task-definition.json')
                        def newTaskDef = taskDefTemplate.replace('__ECR_IMAGE_URL__', ECR_IMAGE_URL)
                        writeFile(file: 'updated-task-def.json', text: newTaskDef)
                        def registrationResult = bat(script: 'aws ecs register-task-definition --cli-input-json file://updated-task-def.json', returnStdout: true).trim()
                        writeFile(file: 'new-task-def.json', text: registrationResult)
                        def newTaskDefArn = bat(script: 'powershell -command "(Get-Content -Path .\\new-task-def.json | ConvertFrom-Json).taskDefinition.taskDefinitionArn"', returnStdout: true).trim()
                        echo "Updating service with new task definition: ${newTaskDefArn}"
                        bat "aws ecs update-service --cluster ${ECS_CLUSTER_NAME} --service ${BACKEND_SERVICE_NAME} --task-definition ${newTaskDefArn}"
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
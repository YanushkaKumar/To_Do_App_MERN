pipeline {
    agent any

    environment {
        AWS_ACCOUNT_ID          = '881962383269'
        AWS_REGION              = 'us-east-1'
        BACKEND_ECR_REPO_NAME   = 'app-backend-free'
        ECS_CLUSTER_NAME        = 'my-ecs-cluster'
        BACKEND_SERVICE_NAME    = 'backend-service'
        MONGO_VALUE_CRED_ID    = 'mongo-uri-value'
       
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
                    withAWS(credentials: 'aws-credentials', region: AWS_REGION) {
                        withCredentials([string(credentialsId: MONGO_VALUE_CRED_ID, variable: 'MONGO_URI_VALUE'),
                                         string(credentialsId: JWT_VALUE_CRED_ID, variable: 'JWT_SECRET_VALUE')]) {

                            echo "Preparing new task definition..."
                            def taskDefTemplate = readFile('task-definition.json')
                            
                            def newTaskDef = taskDefTemplate.replace('__ECR_IMAGE_URL__', ECR_IMAGE_URL)
                                                            .replace('__MONGO_URI_VALUE__', MONGO_URI_VALUE)
                                                            .replace('__JWT_SECRET_VALUE__', JWT_SECRET_VALUE)

                            writeFile(file: 'updated-task-def.json', text: newTaskDef)
                            
                            echo "Registering new task definition revision..."
                            def rawOutput = bat(script: "aws ecs register-task-definition --cli-input-json file://updated-task-def.json", returnStdout: true).trim()
                            
                            // The real error was that rawOutput included the command prompt line.
                            // This line cleans the string, keeping only the JSON part.
                            def jsonOutput = rawOutput.substring(rawOutput.indexOf('{'))
                            
                            def newTaskArn = readJSON(text: jsonOutput).taskDefinition.taskDefinitionArn
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
            script {
                echo "Pipeline cleanup..."
                def ecrRegistryUrl = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
                bat "docker logout ${ecrRegistryUrl}"
                deleteDir()
            }
        }
    }
}
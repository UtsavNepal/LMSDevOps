pipeline {
    agent any
    
    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-creds')
        SONAR_TOKEN = credentials('sonar-token')
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh '''
                    sonar-scanner \
                        -Dsonar.projectKey=LMS \
                        -Dsonar.sources=. \
                        -Dsonar.host.url=http://localhost:9000 \
                        -Dsonar.login=${SONAR_TOKEN}
                    '''
                }
            }
        }
        
        stage('Build Docker Images') {
            steps {
                script {
                    def services = ['frontend', 'backend']
                    services.each { service ->
                        sh "docker build -t utsavnepal1/lms-${service}:${BUILD_NUMBER} -f ${service}.Dockerfile ."
                    }
                }
            }
        }
        
        stage('Vulnerability Scan') {
            steps {
                script {
                    def services = ['frontend', 'backend']
                    services.each { service ->
                        sh "trivy image --exit-code 1 --severity CRITICAL utsavnepal1/lms-${service}:${BUILD_NUMBER}"
                    }
                }
            }
        }
        
        stage('Push to Docker Hub') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh "echo ${DOCKER_PASS} | docker login -u ${DOCKER_USER} --password-stdin"
                        def services = ['frontend', 'backend']
                        services.each { service ->
                            sh "docker push utsavnepal1/lms-${service}:${BUILD_NUMBER}"
                        }
                    }
                }
            }
        }
        
        stage('Deploy') {
            steps {
                sh "docker-compose down"
                sh "docker-compose up -d"
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
        success {
            slackSend(color: 'good', message: "Build ${BUILD_NUMBER} succeeded!")
        }
        failure {
            slackSend(color: 'danger', message: "Build ${BUILD_NUMBER} failed!")
        }
    }
}
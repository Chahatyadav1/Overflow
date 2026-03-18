pipeline {
    agent any

    tools {
        nodejs 'NodeJS-18'
    }

    environment {
        SONAR_HOST_URL = 'http://sonarqube:9000'
        SONAR_AUTH_TOKEN = credentials('sonarqube-token')
        JWT_SECRET = 'jenkins-jwt-secret'
        MONGO_URI = 'mongodb://localhost:27017/test' // Will be overridden by in-memory in tests
    }

    stages {
        stage('Checkout') {
            steps { checkout scm }
        }
        stage('Install Dependencies') {
            steps { sh 'npm ci' }
        }
        stage('Lint') {
            steps { sh 'npm run lint' }
        }
        stage('Test and Coverage') {
            steps { sh 'npm test -- --coverage' }
            post { always { junit 'junit.xml' } }
        }
        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh 'npm run sonar'
                }
            }
        }
        stage('Build Docker Image') {
            steps {
                script {
                    docker.build("orderflow-api:${env.BUILD_ID}")
                }
            }
        }
        stage('Push Docker Image') {
            when { branch 'main' }
            steps {
                script {
                    docker.withRegistry('', 'dockerhub-credentials') {
                        docker.image("orderflow-api:${env.BUILD_ID}").push()
                        docker.image("orderflow-api:${env.BUILD_ID}").push('latest')
                    }
                }
            }
        }
    }
    post { always { cleanWs() } }
}

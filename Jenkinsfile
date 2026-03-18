pipeline {
    agent any

    tools {
        nodejs 'nodejs-24-14-0'
        jdk 'jdk-21'
    }

    environment {
        SONAR_SCANNER_HOME = tool 'sonarqube'
        JWT_SECRET = 'jenkins-jwt-secret'
        MONGO_URI = 'mongodb://localhost:27017/test' // overridden in tests
    }

    stages {

        stage('Clean Workspace') {
            steps {
                cleanWs()
            }
        }

        stage('Checkout SCM') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Lint') {
            steps {
                sh 'npm run lint'
            }
        }

        stage('Test and Coverage') {
            steps {
                sh 'npm test -- --coverage'
            }
            post {
                always {
                    junit 'junit.xml' // make sure jest-junit is configured
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh '''
                        $SONAR_SCANNER_HOME/bin/sonar-scanner \
                        -Dsonar.projectKey=orderflow-api \
                        -Dsonar.sources=src \
                        -Dsonar.tests=tests \
                        -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
                    '''
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
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

     /*   stage('Push Docker Image') {
            when {
                branch 'main'
            }
            steps {
                script {
                    docker.withRegistry('', 'dockerhub-credentials') {
                        docker.image("orderflow-api:${env.BUILD_ID}").push()
                        docker.image("orderflow-api:${env.BUILD_ID}").push('latest')
                    }
                }
            }
        }
        */
    }

    post {
        always {
            cleanWs()
        }
    }
}
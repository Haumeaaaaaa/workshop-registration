pipeline {
    agent any
    
    environment {
        // Ties the Docker image tag to the Jenkins build number
        TAG = "${env.BUILD_NUMBER}"
    }
    
    stages {
        stage('Test') {
            steps {
                echo 'Running Jest tests in isolated containers...'
                sh 'docker build --target test ./workshops-api'
                sh 'docker build --target test ./registrations-api'
            }
        }
        
        stage('Build Images') {
            steps {
                echo 'Building production images...'
                sh 'docker build --target production -t workshop-workshops-api:${TAG} ./workshops-api'
                sh 'docker build --target production -t workshop-registrations-api:${TAG} ./registrations-api'
                // Injects the Jenkins build number into the React footer
                sh 'docker build --build-arg BUILD_NUMBER=${TAG} -t workshop-frontend:${TAG} ./frontend'
                sh 'docker build -t workshop-proxy:${TAG} ./proxy'
            }
        }
        
        stage('Deploy') {
        steps {
            echo 'Deploying application stack...'
            withCredentials([file(credentialsId: 'prod-env', variable: 'SECRET_ENV')]) {
                sh 'cp $SECRET_ENV .env'
                
                // Download the official Docker Compose binary directly into the workspace
                sh 'curl -sSL https://github.com/docker/compose/releases/download/v2.30.3/docker-compose-linux-x86_64 -o docker-compose'
                sh 'chmod +x docker-compose'
                
                // Run it using the downloaded binary
                sh 'TAG=${TAG} ./docker-compose up -d --no-build'
            }
        }
    }
        
        stage('Smoke Test') {
            steps {
                echo 'Waiting for containers to boot...'
                sh 'sleep 10'
                echo 'Pinging healthcheck through the Nginx proxy...'
                // host.docker.internal allows the Jenkins container to ping your host's port 8080
                sh 'curl -f http://host.docker.internal:8080/api/workshops/health || exit 1'
            }
        }
    }
    
    post {
        always {
            echo 'Pipeline complete. Cleaning up secrets...'
            sh 'rm -f .env'
        }
    }
}
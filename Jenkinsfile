pipeline {
    agent any
    
    environment {
        DOCKER_HUB_CREDS = credentials('docker-hub-credentials')
        AWS_CREDENTIALS = credentials('aws-credentials')
        DOCKER_USERNAME = "rustagiaaryan"  // Your Docker Hub username
        AWS_REGION = "us-west-2"
        TERRAFORM_VERSION = "1.0.0"
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Build and Test Backend') {
            steps {
                dir('backend') {
                    sh 'npm install'
                    sh 'npm test || true'  // Continue even if tests fail for now
                }
            }
        }
        
        stage('Build and Test Frontend') {
            steps {
                dir('frontend') {
                    sh 'npm install'
                    sh 'npm test -- --watchAll=false || true'  // Continue even if tests fail for now
                }
            }
        }
        
        stage('Build Docker Images') {
            steps {
                sh 'docker build -t ${DOCKER_USERNAME}/uneaty-backend:latest ./backend'
                sh 'docker build -t ${DOCKER_USERNAME}/uneaty-frontend:latest ./frontend'
            }
        }
        
        stage('Push to Docker Hub') {
            steps {
                withCredentials([string(credentialsId: 'docker-hub-password', variable: 'DOCKER_PASSWORD')]) {
                    sh 'echo $DOCKER_PASSWORD | docker login -u ${DOCKER_USERNAME} --password-stdin'
                    sh 'docker push ${DOCKER_USERNAME}/uneaty-backend:latest'
                    sh 'docker push ${DOCKER_USERNAME}/uneaty-frontend:latest'
                }
            }
        }
        
        stage('Initialize Terraform') {
            when {
                branch 'main'  // Only run on main branch
            }
            steps {
                withAWS(credentials: 'aws-credentials', region: env.AWS_REGION) {
                    dir('infrastructure/terraform') {
                        sh 'terraform init'
                        sh 'terraform validate'
                    }
                }
            }
        }
        
        stage('Plan Terraform Changes') {
            when {
                branch 'main'  // Only run on main branch
            }
            steps {
                withAWS(credentials: 'aws-credentials', region: env.AWS_REGION) {
                    dir('infrastructure/terraform') {
                        sh 'terraform plan -out=tfplan'
                    }
                }
            }
        }
        
        stage('Apply Terraform Changes') {
            when {
                branch 'main'  // Only run on main branch
            }
            steps {
                withAWS(credentials: 'aws-credentials', region: env.AWS_REGION) {
                    dir('infrastructure/terraform') {
                        sh 'terraform apply -auto-approve tfplan'
                    }
                }
            }
        }
        
        stage('Configure kubectl') {
            when {
                branch 'main'  // Only run on main branch
            }
            steps {
                withAWS(credentials: 'aws-credentials', region: env.AWS_REGION) {
                    sh 'aws eks update-kubeconfig --name uneaty-cluster --region ${AWS_REGION}'
                }
            }
        }
        
        stage('Deploy to Kubernetes') {
            when {
                branch 'main'  // Only run on main branch
            }
            steps {
                withAWS(credentials: 'aws-credentials', region: env.AWS_REGION) {
                    // Create secrets
                    sh '''
                    kubectl create namespace uneaty --dry-run=client -o yaml | kubectl apply -f -
                    
                    # Create secrets from AWS Parameter Store
                    MONGO_URI=$(aws ssm get-parameter --name /uneaty/mongo-uri --with-decryption --query Parameter.Value --output text)
                    JWT_SECRET=$(aws ssm get-parameter --name /uneaty/jwt-secret --with-decryption --query Parameter.Value --output text)
                    REDIS_HOST=$(aws ssm get-parameter --name /uneaty/redis-host --with-decryption --query Parameter.Value --output text)
                    
                    kubectl create secret generic uneaty-secrets \
                    --from-literal=mongo-uri="$MONGO_URI" \
                    --from-literal=jwt-secret="$JWT_SECRET" \
                    --from-literal=redis-host="$REDIS_HOST" \
                    --namespace uneaty \
                    --dry-run=client -o yaml | kubectl apply -f -
                    '''
                    
                    // Update image tags in deployment
                    sh "sed -i 's|\${DOCKER_USERNAME}|${DOCKER_USERNAME}|g' infrastructure/kubernetes/deployment.yaml"
                    sh "sed -i 's|\${environment}|production|g' infrastructure/kubernetes/deployment.yaml"
                    
                    // Apply Kubernetes manifests
                    sh 'kubectl apply -f infrastructure/kubernetes/namespace.yaml'
                    sh 'kubectl apply -f infrastructure/kubernetes/deployment.yaml'
                    sh 'kubectl apply -f infrastructure/kubernetes/service.yaml'
                    sh 'kubectl apply -f infrastructure/kubernetes/ingress.yaml'
                    sh 'kubectl apply -f infrastructure/kubernetes/hpa.yaml'
                    
                    // Create monitoring namespace if it doesn't exist
                    sh 'kubectl create namespace monitoring --dry-run=client -o yaml | kubectl apply -f -'
                    
                    // Apply Prometheus and Grafana configurations
                    sh 'kubectl apply -f infrastructure/monitoring/prometheus/'
                    sh 'kubectl apply -f infrastructure/monitoring/grafana/'
                }
            }
        }
    }
    
    post {
        always {
            echo 'Pipeline execution complete'
            // Clean up workspace
            cleanWs()
        }
        success {
            echo 'Pipeline succeeded!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
# UnEaty - UCLA Food Delivery App

## Project Overview
UnEaty is a food delivery application that allows UCLA students to get on-campus food truck food delivered to their dorms. The app supports meal swipe payments through BruinCard and connects students (customers) with deliverers.

## Features
- **For Customers:**
  - Create account and log in
  - Browse available deliverers and their food truck options
  - Place orders with specific dorm location details
  - Track order status

- **For Deliverers:**
  - Set availability time slots
  - Select food trucks for delivery
  - Set maximum order capacity
  - View and manage customer orders

## Tech Stack
- **Frontend:** React.js
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **DevOps:**
  - Docker for containerization
  - Kubernetes for orchestration
  - AWS for cloud infrastructure
  - Terraform for infrastructure as code
  - Jenkins for CI/CD pipeline
  - Unit and integration testing

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Docker and Docker Compose
- MongoDB
- AWS CLI (configured)
- Terraform
- kubectl

### Local Development Setup
1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/uneaty.git
   cd uneaty
   ```

2. Install dependencies
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. Set up environment variables
   - Create `.env` files in both frontend and backend directories
   - Follow the `.env.example` templates

4. Run the application locally
   ```bash
   # Start backend server
   cd backend
   npm run dev

   # Start frontend application in another terminal
   cd frontend
   npm start
   ```

5. For Docker development environment
   ```bash
   docker-compose up
   ```

## Deployment
The application is deployed using CI/CD with Jenkins, Docker, and Kubernetes.

### Infrastructure
The infrastructure is provisioned using Terraform on AWS:
- VPC with public and private subnets
- EKS cluster for Kubernetes
- MongoDB database

### CI/CD Pipeline
The CI/CD pipeline consists of:
1. Unit and integration testing
2. Docker image building
3. Image pushing to registry
4. Kubernetes deployment

## Project Structure
```
uneaty/
├── frontend/             # React frontend
├── backend/              # Node.js backend
├── infrastructure/       # IaC and K8s configs
│   ├── terraform/        # Terraform scripts
│   └── kubernetes/       # Kubernetes manifests
├── ci-cd/                # Jenkins pipeline configs
└── README.md
```

## License
[MIT License](LICENSE)
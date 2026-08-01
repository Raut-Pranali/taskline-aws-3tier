# 🚀 Taskline — Highly Available 3-Tier Web Application on AWS

A full-stack task management app deployed on a secure, multi-tier AWS architecture — built to demonstrate
hands-on cloud infrastructure design, not just application code.


## Table of Contents

* [Overview](https://github.com/Raut-Pranali/taskline-aws-3tier#overview)
* [Demo Video](https://github.com/Raut-Pranali/taskline-aws-3tier#demo-video)
* [Architecture](https://github.com/Raut-Pranali/taskline-aws-3tier#architecture)
* [Features](https://github.com/Raut-Pranali/taskline-aws-3tier#-features)
* [AWS Services Used](https://github.com/Raut-Pranali/taskline-aws-3tier#%EF%B8%8F-aws-services-used)
* [Project Workflow](https://github.com/Raut-Pranali/taskline-aws-3tier#-project-workflow)
* [Tech Stack](https://github.com/Raut-Pranali/taskline-aws-3tier#tech-stack)
* [Challenges Solved](https://github.com/Raut-Pranali/taskline-aws-3tier#challenges-solved)
* [Future Improvements](https://github.com/Raut-Pranali/taskline-aws-3tier#future-improvements)


## 📋 Overview

Taskline is a full-stack task management application deployed on a secure, highly available, multi-tier
AWS architecture — built manually through the AWS Console (no Infrastructure as Code) to demonstrate
hands-on, practical cloud engineering skills.

The application itself is intentionally simple — a task manager with basic CRUD functionality. The real
focus of this project is the **infrastructure it runs on**: a production-style 3-tier architecture with
network isolation, load balancing, auto-scaling, a managed database, content delivery via CloudFront, a
web application firewall, and secure admin access — the same architectural patterns used in real-world,
production AWS environments.


## 🎥 Demo Video






## 🏗️ Architecture


<img width="980" height="1225" alt="image" src="https://github.com/user-attachments/assets/d346f280-0701-463f-867b-6dea972a4138" />







## ✨ Features

### Application
- Create, view, update, and delete tasks (full CRUD)
- Mark tasks as complete/incomplete
- Set task priority (Low / Medium / High)
- Add optional notes to each task
- Real-time task count summary (open vs. total)
- Responsive, single-page interface with no full-page reloads

### Infrastructure & DevOps
- **Highly available architecture** — Auto Scaling Group automatically replaces unhealthy EC2 instances, detected via ALB health checks on `/api/health`
- **Multi-tier network isolation** — app and database run in private subnets with no direct internet access; CloudFront/ALB is the only public entry point for traffic
- **Least-privilege security model** — security groups enforce a strict access chain (Internet → ALB → App tier → Database tier), with no tier reachable by skipping the one before it
- **Managed, scalable database** — Amazon RDS (PostgreSQL) handles backups, patching, and failover instead of a self-managed database server
- **Content delivery via CloudFront** — static assets served from edge locations for faster global load times
- **Web application firewall** — AWS WAF filters malicious requests (e.g., SQL injection attempts) before they reach the application
- **Secure admin access** — AWS Systems Manager (SSM) Session Manager provides shell access to private EC2 instances without exposing SSH to the internet
- **Environment-based configuration** — database credentials and connection details are injected via environment variables, never hardcoded in source code
- **Process resilience** — the backend runs under `pm2`, ensuring it stays online and can restart automatically if the process crashes
- **Custom domain with HTTPS** — Route 53 DNS routing combined with an AWS Certificate Manager (ACM) SSL/TLS certificate


## ☁️ AWS Services Used

| AWS Service | Purpose in Taskline |
|---|---|
| **Amazon VPC** | Provides an isolated virtual network with public and private subnets, separating the app and database tiers from direct internet access. |
| **Amazon EC2** | Hosts the React frontend and Node.js/Express backend, running inside the private app-tier subnet. |
| **Amazon RDS (PostgreSQL)** | Fully managed relational database that stores task data, with automated backups and patching handled by AWS. |
| **Application Load Balancer (ALB)** | Distributes incoming traffic across EC2 instances and performs health checks to ensure only healthy instances serve requests. |
| **Auto Scaling Group (ASG)** | Automatically replaces unhealthy EC2 instances and scales capacity based on demand, ensuring high availability. |
| **Amazon CloudFront** | CDN in front of the ALB — caches static assets at edge locations for faster load times, while passing dynamic API requests through to the ALB. |
| **NAT Gateway** | Allows EC2 instances in the private subnet to reach the internet for updates and package installs, without being directly reachable from it. |
| **Internet Gateway (IGW)** | Enables internet connectivity for resources in the public subnet, including the ALB. |
| **AWS WAF** | Filters malicious HTTP requests (e.g., SQL injection attempts) before they reach the application. |
| **AWS Systems Manager (SSM)** | Provides secure admin access to private EC2 instances without exposing SSH to the internet. |
| **Amazon Route 53** | Provides DNS management and routes users to Taskline through a custom domain. |
| **AWS Certificate Manager (ACM)** | Issues and manages the SSL/TLS certificate used to serve the application securely over HTTPS. |
| **Security Groups** | Act as instance-level firewalls enforcing least-privilege access between the ALB, EC2, and RDS tiers. |

## 🔄 Project Workflow

### Request Flow (Runtime)

1. **User** visits the application via a custom domain
2. **Amazon Route 53** resolves the domain to the CloudFront distribution
3. **Amazon CloudFront** serves cached static assets from the nearest edge location, or forwards the request onward for dynamic content
4. **AWS WAF** inspects incoming requests and blocks malicious traffic before it reaches the application
5. **Application Load Balancer (ALB)** forwards the request to a healthy EC2 instance, based on continuous health checks against `/api/health`
6. **EC2 instance** (private app-tier subnet) — Nginx serves the React frontend directly, or proxies `/api/*` requests to the Express backend
7. **Express backend** queries or updates data in **Amazon RDS (PostgreSQL)**, reachable only from the app-tier security group
8. The response travels back through the same path to the user's browser

### Admin Access Flow

1. Administrator connects via **AWS Systems Manager (SSM) Session Manager**
2. SSM provides a secure shell session to the private EC2 instance — no SSH port is exposed to the internet
3. Admin can deploy updates, view logs, or troubleshoot directly on the instance

### Deployment Workflow (How the Infrastructure Was Built)

1. **VPC and subnets** — public and private subnets across Availability Zones, Internet Gateway, NAT Gateway, and route tables
2. **Security groups** — strict access chain: Internet → ALB → App tier → Database tier
3. **RDS PostgreSQL** — provisioned in the private DB subnet, schema loaded, connectivity verified
4. **EC2 and app deployment** — Node.js and Nginx installed, application cloned from GitHub, backend connected to RDS
5. **ALB and target group** — health check configured on `/api/health`, traffic routed to healthy instances
6. **Auto Scaling Group** — launch template built from the working EC2 configuration, attached for automatic instance recovery
7. **CloudFront and WAF** — content delivery and request filtering added at the edge
8. **Route 53 and testing** — custom domain connected, failover and instance-replacement testing performed



## 🛠️ Tech Stack

### Frontend
- **React** – component-based UI library
- **Vite** – build tool and development server

### Backend
- **Node.js** – JavaScript runtime
- **Express.js** – REST API framework

### Database
- **PostgreSQL** – relational database
- **Amazon RDS** – managed PostgreSQL hosting in production

### Infrastructure & DevOps
- **Amazon VPC** – isolated network with public/private subnets
- **Amazon EC2** – application hosting
- **Application Load Balancer (ALB)** – traffic distribution and health checks
- **Auto Scaling Group (ASG)** – automatic instance recovery and scaling
- **Amazon CloudFront** – content delivery network
- **AWS WAF** – web application firewall
- **AWS Systems Manager (SSM)** – secure admin access
- **Amazon Route 53** – DNS management
- **AWS Certificate Manager (ACM)** – SSL/TLS certificates
- **NAT Gateway / Internet Gateway** – network traffic routing
- **Security Groups** – tier-to-tier access control

### Process Management & Web Server
- **pm2** – Node.js process manager, keeps the backend running
- **Nginx** – reverse proxy, serves static frontend files and routes API requests

### Version Control
- **Git** – version control
- **GitHub** – repository hosting

## 🐛 Challenges Solved

Real issues encountered and resolved during this build — not a copy-pasted tutorial:

### Local Development
- **PostgreSQL authentication locked out** — forgot the local `postgres` user password after installation. Resolved by temporarily setting `pg_hba.conf` authentication to `trust`, resetting the password via `psql`, then reverting the config back to secure authentication.
- **Duplicate/conflicting `pg_hba.conf` entries** — an edit created duplicate rules, and PostgreSQL was matching the first (unintended) rule instead of the intended one. Resolved by identifying and correcting the exact duplicate lines rather than adding new ones on top.
- **Backend couldn't connect to the database** — `.env` still contained placeholder values (`your-rds-endpoint...`, wrong username, `DB_SSL=true`) left over from the example file instead of actual local values. Diagnosed via the exact error in the terminal logs (`ENOTFOUND`) and fixed by correcting all `.env` values to match the local PostgreSQL setup.

### AWS Infrastructure
- **Oversized, costly RDS instance class** — initially configured with `db.m5.large`, showing an estimated cost of ~$374/month. Caught before creation by reviewing the AWS cost estimate; switched to the free-tier-eligible `db.t3.micro` under the Burstable classes filter.
- **RDS created in the wrong VPC** — an earlier attempt had RDS provisioning into an unrelated VPC (`test-vpc`), which would have made it unreachable from the app tier. Caught by explicitly verifying the VPC ID before finalizing creation.
- **App tier placed in a public subnet** — the app-tier EC2 instance was initially planned for a public subnet, which would have exposed it directly to the internet and bypassed the ALB entirely. Corrected by moving it to a private subnet, consistent with the 3-tier architecture design.
- **RDS security group open to the entire internet (`0.0.0.0/0`)** — caught before going further; restricted the inbound rule to only accept traffic from the app-tier EC2 security group, enforcing least-privilege access between tiers.
- **Missing database on RDS** — schema load failed with `database "todoapp" does not exist` because the "Initial database name" field was left blank during RDS creation. Resolved by connecting to the default `postgres` database and creating the database manually.

### Application Deployment
- **Nginx 500 Internal Server Error** — caused by file permissions; Nginx runs as `www-data`, which lacked access to files under `/home/ubuntu/`. Diagnosed via `/var/log/nginx/error.log` (`Permission denied`) and resolved with directory permission changes up the full file path.
- **Frontend couldn't reach the API despite the backend working correctly** — `curl` tests run directly on the EC2 instance confirmed both the backend and the Nginx reverse proxy were functioning. The actual bug was a hardcoded `localhost:4000` fallback in the frontend's API client, which caused the


## 🚀 Future Improvements

- **Infrastructure as Code** — convert the manually built AWS Console setup to Terraform, enabling version-controlled, repeatable infrastructure deployments
- **CI/CD Pipeline** — automate deployments with GitHub Actions, triggering a build-and-deploy to the Auto Scaling Group on every push to `main`
- **Multi-AZ expansion** — extend the current single-AZ setup to span two Availability Zones for both EC2 (ASG) and RDS, achieving true high availability as originally planned in the architecture diagram
- **Secrets management** — move database credentials from `.env` files to AWS Secrets Manager or SSM Parameter Store, removing plaintext secrets from EC2 instances entirely
- **CloudWatch monitoring & alarms** — add dashboards and automated alerts for EC2 CPU/memory, ALB request/error rates, and RDS performance metrics
- **Automated backups & disaster recovery testing** — schedule regular RDS snapshot testing and document a formal recovery runbook
- **User authentication** — add login/signup so tasks are scoped per user, rather than a single shared task list






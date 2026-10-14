# Workshop Registration System

A full-stack, containerized workshop registration platform designed to address the IT skills gap in the Clark Freeport Zone and Central Luzon. The application provides a scalable React frontend and a dual-microservice backend, completely orchestrated and deployed via an automated Jenkins CI/CD pipeline.

## 🏗️ Architecture Diagram

```text
 Browser ──► :8080 ┌─────────┐   /                  ┌──────────┐
                   │  proxy  │ ───────────────────► │ frontend │  (React, Vite static build)
                   │ (Nginx) │                      └──────────┘
                   │         │  /api/workshops/     ┌───────────────┐
                   │         │ ───────────────────► │ workshops-api │ ──┐
                   │         │                      │   (Express)   │   │   ┌──────────┐
                   │         │                      └───────────────┘   ├──►│    db    │  (MySQL 8.0)
                   │         │  /api/registrations/ ┌───────────────────┐   │   │  :3306   │  not published
                   │         │ ───────────────────► │ registrations-api │ ──┘   └────┬─────┘
                   └─────────┘                      │     (Express)     │            │
                                                    └───────────────────┘            │
              all containers on bridge network "app-network"                         │
                                                                             volume: mysql-data
```

## 📋 Prerequisites
OS: Windows with PowerShell (or macOS/Linux bash)

Docker: Docker Desktop installed and engine actively running

Git: Installed and authenticated

## 🚀 How to Start Jenkins and the Stack
1. Start the Jenkins CI/CD Server
Jenkins manages the deployment of the application. It runs in its own isolated container.
```text
cd infra/jenkins
docker compose up -d
```
Access the application at http://localhost:8080.

## ⚙️ How the Trigger is Configured
The deployment pipeline is fully automated via Jenkins SCM Polling.

Schedule: * * * * * (Polls the connected GitHub repository every minute).

Action: When Jenkins detects a new code commit, it automatically executes the Jenkinsfile. It runs through the following stages: Test (Jest unit tests) → Build Images (Tags with Jenkins build number) → Deploy (Zero-downtime container swap) → Smoke Test (Health check verification).

## 📂 Project Layout
```text
workshop-registration/
├── docker-compose.yml              (Main orchestration file)
├── Jenkinsfile                     (Declarative CI/CD Pipeline definition)
├── db/                             Dockerfile, init.sql (Schema and Clark-focused seed data)
├── frontend/                       Dockerfile (build → nginx), vite config
│   └── src/                        App.jsx, api.js, hooks/useTheme.js, components/{LookupBox,ManageTable}.jsx, styles/theme.css
├── infra/jenkins/                  docker-compose.yml (Jenkins standalone service)
├── proxy/                          Dockerfile, nginx.conf (Routing rules for APIs and Frontend)
├── registrations-api/              Dockerfile (base → test → production), server.js, schema.js
└── workshops-api/                  Dockerfile (base → test → production), server.js
```
## 👥 Team Members and Roles
Project Lead / Scrum Master - Prevandos, John Carlos J.

DevOps / CI-CD Engineer - Prevandos, John Carlos J.

Infrastructure Engineer - Neaguit, Kenneth Joseph L.

Backend and Database Engineer - Mendoza, Luise Timmy Anne M.

Frontend, QA, and Documentation Lead - Ancheta, Via Ysabelle B.

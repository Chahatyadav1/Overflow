# OrderFlow API

**OrderFlow** is a production-ready order management system built with Node.js, Express, and MongoDB. It demonstrates best practices in API design, authentication, validation, error handling, logging, and comprehensive testing. The project is specifically crafted to excel in CI/CD pipelines (Jenkins, SonarQube, Docker) with high code coverage and zero linting issues.

## ✨ Features

- **User Authentication**: JWT-based signup/login with role-based access (customer/admin).
- **Product Management**: CRUD operations with pagination, filtering, soft deletes (admin only).
- **Order Processing**: Create orders with multiple items, automatic stock deduction, status updates, cancellation with stock restoration.
- **Validation**: Joi schemas for all endpoints.
- **Error Handling**: Centralized error middleware with consistent JSON responses.
- **Logging**: Winston logging to files and console.
- **Testing**: Unit + integration tests with Jest, Supertest, and in-memory MongoDB (90%+ coverage).
- **Docker**: Multi-stage Dockerfile and Docker Compose for local development.
- **CI/CD Ready**: Jenkinsfile with stages for lint, test, SonarQube analysis, Docker build/push.
- **SonarQube**: Pre-configured for coverage and static analysis.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm
- Docker & Docker Compose (optional)

### Installation

```bash
npm install
cp .env.example .env
# Edit .env with your values
# Overflow

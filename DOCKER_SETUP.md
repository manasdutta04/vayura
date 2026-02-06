# Docker Setup Guide

This guide explains how to run Vayura locally using Docker containers. This ensures a consistent environment for both the Next.js frontend and Python backend.

## Prerequisites

1.  **Docker Desktop**: Download and install [Docker Desktop](https://www.docker.com/products/docker-desktop/) for your OS (Windows, Mac, or Linux).
2.  **Environment Variables**:
    - Create a `.env` file in the root directory.
    - Copy the contents from `.env.example`.
    - Fill in your Firebase credentials.

> [!IMPORTANT]
> Ensure Docker Desktop is **running** before proceeding (look for the whale icon in your taskbar).

##  Running the App

To build and start the application, simply run:

```bash
docker-compose up --build
```

_The `--build` flag ensures that any changes to `package.json` or `Dockerfile` are rebuilt._

### Accessing the App

Once the logs show that the server is ready:

- **Frontend Dashboard**: [http://localhost:3000](http://localhost:3000)
- **Oxygen Service (Backend)**: [http://localhost:8000/health](http://localhost:8000/health)

## Stopping the App

To stop the containers, press `Ctrl + C` in your terminal.

To completely tear down the containers and remove volumes:

```bash
docker-compose down
```

## 🛠 Troubleshooting

**"Error during connect"**:

- This usually means Docker is not running. Start Docker Desktop and try again.

**"Firebase Config Missing"**:

- Make sure you have created `.env` (not `.env.local`) because Docker Compose looks for `.env` by default.

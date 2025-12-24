# Docker & GitHub Actions Guide

## 0. Initial Setup (If not done yet)
Since your project is not yet on GitHub, follow these steps in your terminal:

```bash
# 1. Initialize Git
git init

# 2. Add all files
git add .

# 3. Commit your changes
git commit -m "Initial setup with Docker and Dashboard"

# 4. Link to GitHub (Create a new repo on GitHub.com first!)
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# 5. Push code
git push -u origin main
```

## 1. GitHub Secrets Setup
To enable the automatic building and pushing of your Docker image, you need to configure "Secrets" in your GitHub repository settings.

### How to get your Docker Credentials:
1.  **Register/Login**: Go to [hub.docker.com](https://hub.docker.com/) and sign up or log in.
2.  **Username**: This is your Docker ID (displayed in the top right corner).
3.  **Password**: You can use your login password, but it's **highly recommended** to use an Access Token:
    *   Click your profile icon -> **Account Settings**.
    *   Go to **Security** -> **New Access Token**.
    *   Description: "GitHub Actions".
    *   Access permissions: "Read, Write, Delete".
    *   Copy the generated token string. Use this as your `DOCKER_PASSWORD`.

### Add them to GitHub:
1.  Go to your GitHub Repository -> **Settings** -> **Secrets and variables** -> **Actions**.
2.  Click **New repository secret**.
3.  Add the following secrets:

| Secret Name       | Description                                      | Used For               |
| ----------------- | ------------------------------------------------ | ---------------------- |
| `DOCKER_USERNAME` | Your Docker Hub username                         | CI/CD Pipeline (Login) |
| `DOCKER_PASSWORD` | Your Docker Hub Access Token (recommended)       | CI/CD Pipeline (Login) |

### Application Secrets (Runtime)
When you runs the container, you will need to provide these environment variables (either via an `.env` file or command line flags). You generally **do not** need these for the *Build* step, but you will need them to *Run* the app.

- `PRIVATE_KEY`: Your wallet private key.
- `PINATA_JWT`: Your Pinata JWT for IPFS uploads.
- `CONTRACT_ADDRESS`: The deployed StudentRegistry contract address.
- `RPC_URL`: (Optional) Custom RPC URL (e.g., Alchemy/Infura).

## 2. Running with Docker

### Build Locally
```bash
docker build -t student-registry .
```

### Run Locally
Create a `.env` file with your keys, then run:

```bash
docker run -p 3000:3000 --env-file .env student-registry
```

Your app will be available at `http://localhost:3000`.

## 3. GitHub Actions
The workflow is defined in `.github/workflows/main.yml`.
- It triggers on every `push` to the `main` branch.
- It attempts to login to Docker Hub using the secrets above.
- It builds the image and pushes it to `YOUR_USERNAME/student-registry-dapp:latest`.

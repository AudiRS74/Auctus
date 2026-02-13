# 🚀 Streamlit DevOps Project

A complete, production-ready Streamlit application configured with Docker, GitHub Actions, and Codespaces support.

## 📁 Project Structure
- `Dockerfile`: Container configuration using Python 3.11-slim.
- `requirements.txt`: Python dependencies with pinned versions.
- `app.py`: Interactive dashboard with system monitoring and analytics.
- `.dockerignore`: Optimized build exclusions.
- `.github/workflows/`: Automated CI/CD pipeline.
- `.devcontainer/`: Configuration for mobile development via Codespaces.

---

## 📱 ANDROID SETUP STEPS
*Exact steps for GitHub Mobile app or Chrome browser:*
1. **Open Chrome** on your Android phone and go to `github.com`.
2. **Log in** to your account.
3. Tap the **"+" icon** in the top right and select **New repository**.
4. Name it `streamlit-devops`, set it to **Public**, and tap **Create repository**.
5. Tap **"uploading an existing file"** in the quick setup section.
6. Upload the 7 files provided in this project.
7. Tap **Commit changes**.

---

## ☁️ GITHUB CODESPACE LAUNCH
*Test from your phone browser without installing anything:*
1. On your repo's main page, tap the green **"Code"** button.
2. Select the **"Codespaces"** tab.
3. Tap **"Create codespace on main"**.
4. Wait for the terminal to appear in your browser.
5. In the terminal, type: `streamlit run app.py --server.port 8501 --server.address 0.0.0.0`
6. A popup will appear saying "Your application is running on port 8501". Tap **Open in Browser**.

---

## 🪟 WINDOWS 11 COMMANDS
*Exact PowerShell lines to run on your PC:*
```powershell
# 1. Clone the project
git clone https://github.com/YOUR_USERNAME/streamlit-devops.git
cd streamlit-devops

# 2. Build the Docker image
docker build -t streamlit-app:1.0.0 .

# 3. Run the container
docker run -d -p 8501:8501 --name my-dashboard streamlit-app:1.0.0

# 4. View the app
# Open your browser and go to: http://localhost:8501
```

---

## 🐳 DOCKER HUB PUSH
*Push your image so Windows 11 can just pull it:*
1. Create an account at `hub.docker.com`.
2. In your terminal/PowerShell:
```bash
docker login
docker tag streamlit-app:1.0.0 YOUR_DOCKERHUB_USERNAME/streamlit-app:v1
docker push YOUR_DOCKERHUB_USERNAME/streamlit-app:v1
```
3. On Windows 11, just run: `docker run -p 8501:8501 YOUR_DOCKERHUB_USERNAME/streamlit-app:v1`

---

## 🛠️ Error Handling
- **Port Conflict**: If 8501 is busy, change the `-p 8501:8501` to `-p 9000:8501`.
- **Module Not Found**: Ensure you ran `pip install -r requirements.txt`.
- **Docker Permission**: Ensure Docker Desktop is running on Windows.

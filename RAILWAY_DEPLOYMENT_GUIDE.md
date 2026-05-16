# Deploying TaskFlow to Railway

This project has been explicitly structured and configured for automatic deployment on [Railway.app](https://railway.app/). 
The SQLite local-only setup has been completely removed, and the system is back to using strict **PostgreSQL**.

Follow these exact steps to get your app live on the internet.

### Step 1: Upload to GitHub
1. Create a new empty repository on your GitHub account (e.g., `taskflow`).
2. Open a terminal in your `TaskFlow` folder.
3. Run the following commands to push your code:
```bash
git init
git add .
git commit -m "Initial commit for Railway deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/taskflow.git
git push -u origin main
```

### Step 2: Setup Railway
1. Go to [Railway.app](https://railway.app/) and log in with your GitHub account.
2. Click the **"New Project"** button.
3. Select **"Deploy from GitHub repo"**.
4. Choose your `taskflow` repository.
5. Railway will automatically start building it. **(Wait, don't leave this screen yet!)**

### Step 3: Add PostgreSQL Database
1. In your new Railway project dashboard, click the **"New"** button in the top right.
2. Select **"Database"** -> **"Add PostgreSQL"**.
3. Railway will spin up a PostgreSQL instance and *automatically inject* the `DATABASE_URL` environment variable into your `taskflow` app!

### Step 4: Add the Secret Key
1. Click on your `taskflow` service block in the Railway canvas.
2. Go to the **Variables** tab.
3. Click **New Variable**.
4. Name: `JWT_SECRET`
5. Value: *[Enter a long random string of your choice, e.g., "my-super-secret-key-1234"]*
6. Click **Add**.

### Step 5: Final Verification
Because we updated the `package.json` to include `"start": "npx prisma db push --accept-data-loss && node server/src/app.js"`, Railway will now automatically push the database schema to your new PostgreSQL instance every time it deploys.

Your app will restart automatically after you add the variables.
Once the deployment dot turns green, click the **Domain link** (or generate one in the Settings tab) and your app is fully live!

# TaskFlow - Project Management Web App

TaskFlow is a standalone web application designed for creating projects, assigning tasks, and tracking progress with role-based access control.

## 🚀 Features
- **Authentication**: Secure Signup and Login using JWT.
- **Project Management**: Create projects, add members by email, and manage project details.
- **Task Tracking**: Assign tasks to members, set due dates, and update statuses (TODO, IN PROGRESS, DONE) via a Kanban board.
- **Role-Based Access**: 
  - **Admin**: Can manage the project, add/remove members, and create/delete tasks.
  - **Member**: Can view the project, and update the status of tasks assigned to them.
- **Dashboard**: High-level overview of projects, tasks, and overdue items.

## ⚙️ Tech Stack
- **Frontend**: HTML5, Vanilla CSS (Custom Design System), Vanilla JS
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Auth**: bcrypt, jsonwebtoken

## 🛠️ Local Development

### Prerequisites
- Node.js (v18+)
- PostgreSQL

### Setup
1. Clone the repository.
2. Navigate to the `server` directory: `cd server`
3. Install dependencies: `npm install`
4. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
5. Update `DATABASE_URL` in `.env` with your PostgreSQL connection string.
6. Push the database schema: `npx prisma db push`
7. Start the development server: `npm run dev`
8. Open your browser to `http://localhost:3000`

## 🌐 Deployment (Railway)
This project is pre-configured for deployment on Railway.

1. Push your code to GitHub.
2. Create a new project on [Railway.app](https://railway.app/).
3. Add a PostgreSQL database plugin.
4. Link your GitHub repository.
5. Railway will automatically inject the `DATABASE_URL`.
6. Add the `JWT_SECRET` environment variable in the Railway dashboard.
7. The app will build and deploy automatically using the configuration in `railway.json`.

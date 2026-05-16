require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Static Files (Frontend)
app.use(express.static(path.join(__dirname, '../../public')));

const projectRouter = require('./routes/projects');
const taskRouter = require('./routes/tasks');
const memberRouter = require('./routes/members');
const dashboardRouter = require('./routes/dashboard');

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', projectRouter);
app.use('/api/projects/:projectId/tasks', taskRouter);
app.use('/api/projects/:projectId/members', memberRouter);
app.use('/api/dashboard', dashboardRouter);

// Fallback for frontend routing (if any)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

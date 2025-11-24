require('dotenv').config();
const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors');
const prisma = require('./prismaClient.js');
const authRoutes = require('./routes/auth.js')
const taskRoutes = require('./routes/task.js');
const userRoutes = require('./routes/user.js');
const attachmentRoutes = require('./src/routes/attachments');
const commentRoutes = require('./src/routes/comments');
const dashboardRoutes = require('./src/routes/dashboard');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
  try {
    const result = await prisma.$queryRawUnsafe("SELECT NOW()");
    res.json({ success: true, time: result[0].now });
  } catch (error) {
    console.error("DB ERROR:", error);
    res.status(500).json({ success: false, message: "DB error" });
  }
});

// Test route to check if tables are working
app.get("/api/test-tables", async (req, res) => {
  try {
    // Test users table
    const users = await prisma.user.findMany();
    const tasks = await prisma.task.findMany();
    const comments = await prisma.comment.findMany();

    res.json({
      success: true,
      tables: {
        users: users.length,
        tasks: tasks.length,
        comments: comments.length,
        attachments: await prisma.attachment.count(),
        notifications: await prisma.notification.count(),
        activities: await prisma.activity.count()
      },
      message: 'All tables are accessible!'
    });
  } catch (error) {
    console.error("Table test error:", error);
    res.status(500).json({
      success: false,
      message: "Error accessing tables",
      error: error.message
    });
  }
});

app.use('/api/auth', authRoutes)
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes)
app.use('/api/attachments', attachmentRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/dashboard', dashboardRoutes);



app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

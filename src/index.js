import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import path from 'path';  // To work with paths
import { fileURLToPath } from 'url';  // To convert the current module's URL to a file path
import authRoutes from './routes/authRoutes.js';
import memberRoutes from './routes/memberRoutes.js';
import profileRoutes from './routes/profileRoutes.js';

dotenv.config();
const app = express();

// Resolve the directory name using `import.meta.url`
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);  // This will give you the current directory

// Enable CORS for frontend connection
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

// Parse JSON payloads
app.use(express.json());
app.use(bodyParser.json());

// Serve static files from the "uploads" directory
// This makes files in the "uploads" directory accessible at /uploads/{filename}
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Debug middleware to inspect requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/member', memberRoutes);
app.use('/api/profile', profileRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Global Error Handler:', err.stack);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

app.use((req, res, next) => {
    console.log('Incoming Request:', req.method, req.url);
    next();
});

// Start the server
const PORT = process.env.PORT || 5786;
app.listen(PORT, () => {
    console.log(`App is listening at http://localhost:${PORT}`);
});

export default app;

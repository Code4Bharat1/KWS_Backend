import path from 'path';  // To work with paths
import { fileURLToPath } from 'url';  // To convert the current module's URL to a file path


import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import authRoutes from './routes/authRoutes.js';
import memberRoutes from './routes/memberRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import sandouqchaRoutes from './routes/sandouqchaRoutes.js';
import sandouqchaTransactionRoutes from './routes/sandouqchaTransactionRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import nonkwsRoutes from './routes/nonkwsRoutes.js';
import forgotRoutes from './routes/forgotRoutes.js';
import { setupEventListeners } from './middleware/eventListener.js';

dotenv.config();
const app = express();

// Resolve the directory name using `import.meta.url`
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);  // This will give you the current directory

// Enable CORS for frontend connection
app.use(cors({
    origin: true, 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow these HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow these headers
    credentials: true, // Allow credentials (e.g., cookies)
}));

// Parse JSON payloads
app.use(express.json());
app.use(bodyParser.json());
setupEventListeners(process);

// Serve static files from the "uploads" directory
// This makes files in the "uploads" directory accessible at /uploads/{filename}
app.use('/uploads/profile-pictures', express.static(path.join(__dirname, '../uploads/profile-pictures')));
app.use('/profile-pictures', express.static(path.join(__dirname, '../profile-pictures')));
app.use('/uploads/form-scanned', express.static(path.join(__dirname, '../uploads/form-scanned')));
app.use('/scanned-forms', express.static(path.join(__dirname, '../scanned-forms')));
app.use('/uploads/transaction-slips', express.static(path.join(__dirname, '../uploads/transaction-slips')));


// Debug middleware to inspect requests
app.use((req, res, next) => {
    
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/member', memberRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/transaction', transactionRoutes);
app.use('/api/sandouqcha', sandouqchaRoutes);
app.use('/api/sandouqchaTransaction', sandouqchaTransactionRoutes);
app.use('/api/staff',staffRoutes);
app.use('/api/event',eventRoutes);
app.use('/api/nonkws',nonkwsRoutes);
app.use('/api/forgot',forgotRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Global Error Handler:', err.stack);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

app.use((req, res, next) => {
    // console.log('Incoming Request:', req.method, req.url);
    next();
});

// Start the server
const PORT = process.env.PORT || 5786;
app.listen(PORT, () => {
    console.log(`App is listening at http://localhost:${PORT}`);
});

export default app;

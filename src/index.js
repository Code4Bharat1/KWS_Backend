import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import authRoutes from './routes/authRoutes.js';



dotenv.config();
const app = express();
app.use(express.json()); 


app.use(cors({
    origin: 'http://localhost:3000', 
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Enable cookies if needed
}));

app.use(bodyParser.json());

app.use('/api/auth', authRoutes);  

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

const PORT = process.env.PORT || 5786;
app.listen(PORT, () => {
    console.log(`App is listening at http://localhost:${PORT}`);
});

export default app;

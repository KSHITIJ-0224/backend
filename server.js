import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import contactRoutes from './routes/contactRoutes.js';
import careersRoutes from './routes/careers.js';
import ScheduleCallRoutes from "./routes/ScheduleCallRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: `${__dirname}/.env` });

const app = express();

// Middleware
app.use(express.json());

// CORS Configuration - Allow Vercel frontend and localhost
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://192.168.31.21:3000',
    'http://localhost:5000',
    'https://arutis.vercel.app',
    'https://arutis-project.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Explicit preflight handling
app.options('*', cors(corsOptions));

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to arutis_db successfully');
  } catch (err) {
    console.error('❌ Connection error:', err.message);
    process.exit(1);
  }
};

connectDB();

// Routes
app.use('/api/contact', contactRoutes);
app.use('/api/careers', careersRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Arutis Server is running' });
});

// CTA schedule-call route
app.use("/api/schedule-call", ScheduleCallRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

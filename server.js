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

// ✅ CRITICAL: Middleware order matters! JSON MUST come before CORS
app.use(express.json());

// ✅ CORS Configuration - FIXED
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://192.168.31.21:3000',
    'http://localhost:5000',
    'https://arutis-project.vercel.app',
    'https://backend-seven-murex-21.vercel.app',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
  maxAge: 86400 // Cache preflight for 24 hours
};

// ✅ Apply CORS to ALL routes
app.use(cors(corsOptions));

// ✅ Explicit preflight handling (critical for Vercel)
app.options('*', cors(corsOptions));

// ✅ Additional manual CORS headers as fallback
app.use((req, res, next) => {
  const origin = req.get('origin');
  
  if (corsOptions.origin.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Max-Age', '86400');
  }
  
  // Handle OPTIONS preflight directly
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

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
app.use('/api/schedule-call', ScheduleCallRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Arutis Server is running' });
});

// ✅ Global error handler (doesn't forget CORS headers)
app.use((err, req, res, next) => {
  const origin = req.get('origin');
  if (corsOptions.origin.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  console.error('Error:', err);
  res.status(500).json({ error: err.message });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('✅ CORS configured for:', corsOptions.origin);
});

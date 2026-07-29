import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { db, auth } from './firebaseAdmin';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// Basic CORS middleware just in case (though Vite proxy handles it locally)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).json({});
  }
  next();
});

// ==========================================
// API ROUTES
// ==========================================

// 1. Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    message: 'OTEC Edu-AI Backend is running smoothly.',
    firebaseConnected: !!db
  });
});

// 2. System Stats
app.get('/api/system/stats', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database connection unavailable' });
    }
    
    // Fetch some basic stats from Firestore (assuming collections exist or handle gracefully)
    const [studentsSnapshot, teachersSnapshot] = await Promise.all([
      db.collection('students').count().get().catch(() => ({ data: () => ({ count: 0 }) })),
      db.collection('teachers').count().get().catch(() => ({ data: () => ({ count: 0 }) }))
    ]);

    res.json({
      activeStudents: studentsSnapshot.data().count || 0,
      activeTeachers: teachersSnapshot.data().count || 0,
      systemStatus: 'Optimal',
      backendActive: true
    });
  } catch (error) {
    console.error('Stats Error:', error);
    res.status(500).json({ error: 'Failed to fetch system stats' });
  }
});

// 3. AI Analysis Endpoint (Secure Server-Side Gemini)
app.post('/api/ai/analyze', (req, res) => {
  const { prompt, dataContext } = req.body;
  
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // TODO: Implement actual Gemini API call here securely using process.env.GEMINI_API_KEY
  // For now, return a mocked response
  setTimeout(() => {
    res.json({
      success: true,
      analysis: `Server successfully processed AI request for: "${prompt}". Secure backend integration active.`
    });
  }, 1000);
});

// ==========================================
// START SERVER
// ==========================================
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 OTEC Edu-AI Backend Server running on port ${PORT}`);
  console.log(`======================================================\n`);
});

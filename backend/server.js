import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db.js';
import userRoutes from './routes/user.route.js';
import jobRoutes from './routes/job.route.js';
import reportRoutes from './routes/reports.route.js';
import workflowRouter from './routes/workflow.route.js';
import connectorRoutes from './routes/connector.route.js';
import integrationsRoutes from './routes/integrations.route.js';
import hubspotRoutes from './routes/hubspot.route.js';
import sheetsRoutes from './routes/sheets.route.js';
import { initializeJobProcessor } from './controllers/job.controller.js';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/workflows', workflowRouter);
app.use('/api/connectors', connectorRoutes);
app.use('/api/integrations', integrationsRoutes);
app.use('/api/integrations/hubspot', hubspotRoutes);
app.use('/api/integrations/sheets', sheetsRoutes);

// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'API is running...' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        message: 'Something went wrong!' 
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    
    // Initialize job processor after server is running
    initializeJobProcessor();
});


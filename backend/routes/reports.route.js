import express from 'express';
import { auth } from '../middleware/auth.js';
import {
  getJobMetrics,
  getJobsByDataSource,
  getEnrichmentStats,
  getJobsTimeSeries,
  getRecentJobs,
  getAllReports
} from '../controllers/reports.controller.js';

const router = express.Router();

// Apply authentication middleware to all reports routes
router.use(auth);

// Report routes
router.get('/metrics', getJobMetrics);
router.get('/distribution', getJobsByDataSource);
router.get('/enrichment-stats', getEnrichmentStats);
router.get('/time-series', getJobsTimeSeries);
router.get('/recent-jobs', getRecentJobs);
router.get('/', getAllReports);

export default router;

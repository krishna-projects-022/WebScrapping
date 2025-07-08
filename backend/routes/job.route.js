import express from 'express';
import { auth } from '../middleware/auth.js';
import {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  runJob
} from '../controllers/job.controller.js';

const router = express.Router();

// Apply authentication middleware to all job routes
router.use(auth);

// Job routes
router.get('/', getJobs);
router.get('/:id', getJobById);
router.post('/', createJob);
router.put('/:id', updateJob);
router.delete('/:id', deleteJob);
router.post('/:id/run', runJob);

export default router;

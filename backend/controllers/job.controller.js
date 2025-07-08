import Job from '../models/job.model.js';
import { jobProcessingService } from '../services/job-processing.service.js';

/**
 * Get all jobs for a user
 */
export const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
};

/**
 * Get a job by ID
 */
export const getJobById = async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    res.json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
};

/**
 * Create a new job
 */
export const createJob = async (req, res) => {
  try {
    const {
      name,
      dataSource,
      url,
      selectors,
      enrichments,
      outputFormat,
      schedule,
      login
    } = req.body;
    
    // Basic validation
    if (!name) {
      return res.status(400).json({ error: 'Job name is required' });
    }
    
    if (dataSource === 'website' && !url) {
      return res.status(400).json({ error: 'URL is required for website scraping' });
    }
    
    // Create new job
    const newJob = new Job({
      name,
      dataSource,
      url,
      selectors,
      enrichments: enrichments || [],
      outputFormat: outputFormat || 'csv',
      schedule: schedule || 'manual',
      login,
      createdBy: req.user._id
    });
    
    const savedJob = await newJob.save();
    
    // Schedule job if not manual
    if (savedJob.schedule !== 'manual') {
      jobProcessingService.scheduleJob(savedJob);
    }
    
    res.status(201).json({
      message: 'Job created successfully',
      job: savedJob
    });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: 'Failed to create job' });
  }
};

/**
 * Update a job
 */
export const updateJob = async (req, res) => {
  try {
    const {
      name,
      dataSource,
      url,
      selectors,
      enrichments,
      outputFormat,
      schedule,
      login
    } = req.body;
    
    const job = await Job.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    // Only allow updates if job is not running
    if (job.status === 'running') {
      return res.status(400).json({ error: 'Cannot update a running job' });
    }
    
    // Update fields
    job.name = name || job.name;
    job.dataSource = dataSource || job.dataSource;
    job.url = url || job.url;
    job.selectors = selectors || job.selectors;
    job.enrichments = enrichments || job.enrichments;
    job.outputFormat = outputFormat || job.outputFormat;
    job.login = login || job.login;
    
    // Handle schedule changes
    const oldSchedule = job.schedule;
    job.schedule = schedule || job.schedule;
    
    const updatedJob = await job.save();
    
    // Update scheduling if changed
    if (oldSchedule !== updatedJob.schedule) {
      if (oldSchedule !== 'manual') {
        jobProcessingService.cancelJob(updatedJob._id);
      }
      
      if (updatedJob.schedule !== 'manual') {
        jobProcessingService.scheduleJob(updatedJob);
      }
    }
    
    res.json({
      message: 'Job updated successfully',
      job: updatedJob
    });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ error: 'Failed to update job' });
  }
};

/**
 * Delete a job
 */
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    // Cancel scheduling if active
    if (job.schedule !== 'manual') {
      jobProcessingService.cancelJob(job._id);
    }
    
    await job.deleteOne();
    
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ error: 'Failed to delete job' });
  }
};

/**
 * Run a job immediately
 */
export const runJob = async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    // Prevent running an already running job
    if (job.status === 'running') {
      return res.status(400).json({ error: 'Job is already running' });
    }
    
    // Start job execution in the background
    res.json({ message: 'Job started successfully' });
    
    // Define function to update job
    const updateJobById = async (jobId, updates) => {
      await Job.findByIdAndUpdate(jobId, updates);
    };
    
    // Define function to get job by ID
    const getJobById = async (jobId) => {
      return Job.findById(jobId);
    };
    
    // Execute job
    jobProcessingService.executeJob(
      job._id,
      0, // retry count
      updateJobById,
      getJobById
    ).catch(error => {
      console.error(`Job execution failed for ${job._id}:`, error);
    });
  } catch (error) {
    console.error('Error running job:', error);
    res.status(500).json({ error: 'Failed to run job' });
  }
};

/**
 * Initialize the job processor with database access
 */
export const initializeJobProcessor = () => {
  // Function to get schedulable jobs
  const getSchedulableJobs = async () => {
    return Job.find({
      schedule: { $ne: 'manual' },
      status: { $ne: 'running' }
    });
  };
  
  // Initialize the job processor
  jobProcessingService.initialize(getSchedulableJobs);
};

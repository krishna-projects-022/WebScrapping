import { scraperService } from './scraper.service.js';
import { enrichmentService } from './enrichment.service.js';
import { proxyService } from './proxy.service.js';
import { apiConnectorService } from './api-connector.service.js';
import cron from 'node-cron';

/**
 * Job Processing Service
 * Handles job scheduling, execution, and retries
 */
export class JobProcessingService {
  constructor() {
    // Store active job schedules
    this.scheduledJobs = new Map();
    // Track running jobs to prevent duplicates
    this.runningJobs = new Set();
    // Maximum number of retries
    this.maxRetries = 3;
  }
  
  /**
   * Initialize the job scheduler
   * @param {Function} getJobs - Function to fetch scheduled jobs
   */
  initialize(getJobs) {
    this.getJobs = getJobs;
    
    // Schedule initial jobs
    this.scheduleAllJobs();
    
    // Re-schedule jobs every hour to pick up new ones
    cron.schedule('0 * * * *', () => {
      console.log('Refreshing job schedules...');
      this.scheduleAllJobs();
    });
    
    console.log('Job processing service initialized');
  }
  
  /**
   * Schedule all jobs in the database
   */
  async scheduleAllJobs() {
    try {
      if (!this.getJobs) {
        console.error('getJobs function not provided');
        return;
      }
      
      // Get all jobs that need scheduling
      const jobs = await this.getJobs();
      
      // Clear existing schedules
      this.clearAllSchedules();
      
      // Schedule each job
      for (const job of jobs) {
        this.scheduleJob(job);
      }
      
      console.log(`${jobs.length} jobs scheduled`);
    } catch (error) {
      console.error('Failed to schedule jobs:', error);
    }
  }
  
  /**
   * Schedule a single job
   * @param {Object} job - Job configuration
   */
  scheduleJob(job) {
    if (job.schedule === 'manual') {
      // Manual jobs don't need scheduling
      return;
    }
    
    let cronExpression;
    
    // Convert schedule to cron expression
    switch (job.schedule) {
      case 'hourly':
        cronExpression = '0 * * * *'; // Every hour
        break;
      case 'daily':
        cronExpression = '0 9 * * *'; // Every day at 9 AM
        break;
      case 'weekly':
        cronExpression = '0 9 * * 1'; // Every Monday at 9 AM
        break;
      case 'monthly':
        cronExpression = '0 9 1 * *'; // 1st day of every month at 9 AM
        break;
      default:
        console.warn(`Invalid schedule for job ${job._id}: ${job.schedule}`);
        return;
    }
    
    // Create the scheduled task
    const task = cron.schedule(cronExpression, () => {
      this.executeJob(job._id);
    });
    
    // Store the task for later reference
    this.scheduledJobs.set(job._id.toString(), task);
    
    console.log(`Job ${job.name} (${job._id}) scheduled: ${job.schedule}`);
  }
  
  /**
   * Clear all scheduled jobs
   */
  clearAllSchedules() {
    for (const [jobId, task] of this.scheduledJobs.entries()) {
      task.stop();
      console.log(`Schedule cleared for job ${jobId}`);
    }
    
    this.scheduledJobs.clear();
  }
  
  /**
   * Execute a job by ID
   * @param {string} jobId - ID of the job to run
   * @param {number} retryCount - Current retry attempt
   * @param {Function} updateJob - Function to update job status
   * @param {Function} getJobById - Function to get job by ID
   * @returns {Promise<Object>} - Job results
   */
  async executeJob(jobId, retryCount = 0, updateJob, getJobById) {
    let job = null; // Ensure job is always defined for error handling
    
    // Skip if job is already running
    if (this.runningJobs.has(jobId.toString())) {
      console.log(`Job ${jobId} is already running, skipping`);
      return null;
    }
    
    // Mark job as running
    this.runningJobs.add(jobId.toString());
    
    try {
      // Get job details
      job = await getJobById(jobId);
      
      if (!job) {
        throw new Error(`Job ${jobId} not found`);
      }
      
      console.log(`Executing job: ${job.name} (${jobId})`);
      
      // Update job status to running
      await updateJob(jobId, { 
        status: 'running',
        startTime: new Date()
      });
      // Log after updating job to running
      console.log(`Job ${jobId} status set to running`);
      
      // Prepare scraper configuration
      const scraperConfig = {
        url: job.url,
        selectors: job.selectors,
        takeScreenshot: true
      };
      // Add proxy from rotation service if available
      const proxy = proxyService.getProxy();
      if (proxy) {
        scraperConfig.proxy = proxy;
      }
      // Add login info if available
      if (job.login && typeof job.login === 'object' && Object.keys(job.login).length > 0) {
        scraperConfig.login = job.login;
      }
      let scrapedData;
      if (job.dataSource === 'website') {
        console.log(`Scraping website: ${job.url}`);
        scrapedData = await scraperService.scrapeWebsite(scraperConfig);
      } else if (job.dataSource === 'api') {
        console.log(`Fetching from API: ${job.apiEndpoint}`);
        const apiConfig = {
          url: job.apiEndpoint,
          method: job.apiMethod || 'GET',
          headers: job.apiHeaders || {},
          params: job.apiParams || {},
          data: job.apiData || null,
          auth: job.apiAuth || null,
          mapping: job.apiMapping || null,
          dataPath: job.apiDataPath || null
        };
        const apiResponse = await apiConnectorService.fetchData(apiConfig);
        if (!apiResponse.success) {
          throw new Error(`API error: ${apiResponse.error}`);
        }
        scrapedData = apiResponse.data;
      } else {
        throw new Error(`Unsupported data source: ${job.dataSource}`);
      }
      
      // Apply enrichment if requested
      if (job.enrichments && job.enrichments.length > 0) {
        console.log(`Applying enrichments: ${job.enrichments.join(', ')}`);
        scrapedData = await enrichmentService.enrichData(scrapedData, job.enrichments);
      }
      
      const endTime = Date.now();
      
      // Calculate processing time in seconds
      const processingTime = (endTime - processingStartTime) / 1000;
      
      // Count records
      const recordCount = this.countRecords(scrapedData);
      
      // Update job with results
      await updateJob(jobId, {
        status: 'completed',
        results: scrapedData,
        lastRun: new Date(),
        processingTime,
        records: recordCount
      });
      // Log after updating job to completed
      console.log(`Job ${jobId} status set to completed`);
      
      console.log(`Job ${jobId} completed successfully with ${recordCount} records`);
      
      // Remove from running jobs
      this.runningJobs.delete(jobId.toString());
      
      return scrapedData;
    } catch (error) {
      console.error(`Job ${jobId} failed:`, error);
      
      // Detailed error message including stack trace for debugging
      const detailedError = {
        message: error.message,
        stack: error.stack,
        cause: error.cause ? JSON.stringify(error.cause) : 'Unknown',
        url: job?.url,
        timestamp: new Date().toISOString()
      };
      
      // Log detailed error for debugging
      console.error(`Detailed error for job ${jobId}:`, JSON.stringify(detailedError, null, 2));
      
      // Retry logic
      if (retryCount < this.maxRetries) {
        console.log(`Retrying job ${jobId} (attempt ${retryCount + 1}/${this.maxRetries})`);
        
        // Wait before retry with exponential backoff
        const delayMs = 5000 * Math.pow(2, retryCount);
        console.log(`Waiting ${delayMs / 1000} seconds before retry...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        
        // Remove from running jobs for retry
        this.runningJobs.delete(jobId.toString());
        
        // Retry with incremented count
        return this.executeJob(jobId, retryCount + 1, updateJob, getJobById);
      }
      
      // Update job with failure status after max retries
      await updateJob(jobId, { 
        status: 'failed',
        error: `Error: ${error.message}. Retried ${this.maxRetries} times without success.`,
        lastRun: new Date()
      });
      // Log after updating job to failed
      console.log(`Job ${jobId} status set to failed`);
      
      // Remove from running jobs
      this.runningJobs.delete(jobId.toString());
      
      throw error;
    }
  }
  
  /**
   * Count total records in scraped data
   * @param {Object} data - Scraped data object
   * @returns {number} - Total record count
   */
  countRecords(data) {
    if (!data) return 0;
    
    let count = 0;
    
    // Count records in all data fields
    for (const key in data) {
      if (Array.isArray(data[key])) {
        count += data[key].length;
      }
    }
    
    return count;
  }
  
  /**
   * Cancel a scheduled job
   * @param {string} jobId - ID of the job to cancel
   * @returns {boolean} - Whether the job was successfully canceled
   */
  cancelJob(jobId) {
    const task = this.scheduledJobs.get(jobId.toString());
    
    if (task) {
      task.stop();
      this.scheduledJobs.delete(jobId.toString());
      console.log(`Job ${jobId} schedule canceled`);
      return true;
    }
    
    return false;
  }
}

// Export singleton instance
export const jobProcessingService = new JobProcessingService();

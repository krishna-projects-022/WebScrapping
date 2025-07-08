import Job from '../models/job.model.js';
import mongoose from 'mongoose';

/**
 * Get job metrics and statistics
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const getJobMetrics = async (req, res) => {
  try {
    const userId = req.user._id;
    const { timeframe = 30 } = req.query;
    
    // Set start date based on timeframe
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeframe));
    
    // Get job metrics for the selected timeframe
    const metrics = await Job.aggregate([
      { 
        $match: { 
          createdBy: new mongoose.Types.ObjectId(userId),
          createdAt: { $gte: startDate }
        } 
      },
      {
        $group: {
          _id: null,
          totalJobs: { $sum: 1 },
          completedJobs: { 
            $sum: { 
              $cond: [{ $eq: ["$status", "completed"] }, 1, 0] 
            } 
          },
          failedJobs: { 
            $sum: { 
              $cond: [{ $eq: ["$status", "failed"] }, 1, 0] 
            } 
          },
          runningJobs: { 
            $sum: { 
              $cond: [{ $eq: ["$status", "running"] }, 1, 0] 
            } 
          },
          pendingJobs: { 
            $sum: { 
              $cond: [{ $eq: ["$status", "pending"] }, 1, 0] 
            } 
          },
          totalRecords: { $sum: "$records" },
          avgProcessingTime: { $avg: "$processingTime" }
        }
      }
    ]);
    
    // Calculate success rate
    const result = metrics[0] || {
      totalJobs: 0,
      completedJobs: 0,
      failedJobs: 0,
      runningJobs: 0,
      pendingJobs: 0,
      totalRecords: 0,
      avgProcessingTime: 0
    };
    
    result.successRate = result.totalJobs > 0 
      ? (result.completedJobs / result.totalJobs) * 100 
      : 0;
      
    res.json(result);
  } catch (error) {
    console.error('Error getting job metrics:', error);
    res.status(500).json({ error: 'Failed to get job metrics' });
  }
};

/**
 * Get job distribution by data source
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const getJobsByDataSource = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const distribution = await Job.aggregate([
      { 
        $match: { 
          createdBy: new mongoose.Types.ObjectId(userId)
        } 
      },
      {
        $group: {
          _id: "$dataSource",
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          dataSource: "$_id",
          count: 1,
          _id: 0
        }
      }
    ]);
    
    res.json(distribution);
  } catch (error) {
    console.error('Error getting job distribution:', error);
    res.status(500).json({ error: 'Failed to get job distribution' });
  }
};

/**
 * Get enrichment usage statistics
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const getEnrichmentStats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const enrichmentStats = await Job.aggregate([
      { 
        $match: { 
          createdBy: new mongoose.Types.ObjectId(userId),
          enrichments: { $exists: true, $ne: [] }
        } 
      },
      { $unwind: "$enrichments" },
      {
        $group: {
          _id: "$enrichments",
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          enrichmentType: "$_id",
          count: 1,
          _id: 0
        }
      }
    ]);
    
    res.json(enrichmentStats);
  } catch (error) {
    console.error('Error getting enrichment stats:', error);
    res.status(500).json({ error: 'Failed to get enrichment stats' });
  }
};

/**
 * Get jobs time series data
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const getJobsTimeSeries = async (req, res) => {
  try {
    const userId = req.user._id;
    const { timeframe = 30, interval = 'day' } = req.query;
    
    // Set start date based on timeframe
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeframe));
    
    // Define date format based on interval
    let dateFormat;
    switch (interval) {
      case 'hour':
        dateFormat = "%Y-%m-%d %H:00";
        break;
      case 'week':
        dateFormat = "%Y-%U"; // Year-Week
        break;
      case 'month':
        dateFormat = "%Y-%m";
        break;
      case 'day':
      default:
        dateFormat = "%Y-%m-%d";
    }
    
    // Get time series data
    const timeSeries = await Job.aggregate([
      { 
        $match: { 
          createdBy: new mongoose.Types.ObjectId(userId),
          createdAt: { $gte: startDate }
        } 
      },
      {
        $group: {
          _id: { 
            date: { $dateToString: { format: dateFormat, date: "$createdAt" } },
            status: "$status"
          },
          count: { $sum: 1 },
          records: { $sum: "$records" }
        }
      },
      { $sort: { "_id.date": 1 } }
    ]);
    
    // Transform into a more usable format
    const formattedData = {};
    
    timeSeries.forEach(item => {
      const { date } = item._id;
      const status = item._id.status;
      
      if (!formattedData[date]) {
        formattedData[date] = {
          date,
          total: 0,
          completed: 0,
          failed: 0,
          running: 0,
          pending: 0,
          records: 0
        };
      }
      
      formattedData[date][status] = item.count;
      formattedData[date].total += item.count;
      formattedData[date].records += item.records;
    });
    
    res.json(Object.values(formattedData));
  } catch (error) {
    console.error('Error getting jobs time series:', error);
    res.status(500).json({ error: 'Failed to get jobs time series' });
  }
};

/**
 * Get recent jobs with details
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const getRecentJobs = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 10 } = req.query;
    
    const recentJobs = await Job.find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select('name status dataSource url records processingTime createdAt lastRun');
    
    res.json(recentJobs);
  } catch (error) {
    console.error('Error getting recent jobs:', error);
    res.status(500).json({ error: 'Failed to get recent jobs' });
  }
};

/**
 * Get all reports data in one call
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const getAllReports = async (req, res) => {
  try {
    const userId = req.user._id;
    const { timeframe = 30 } = req.query;
    
    // Run all queries in parallel
    const [metrics, distribution, enrichmentStats, timeSeries, recentJobs] = await Promise.all([
      // Get metrics
      Job.aggregate([
        { 
          $match: { 
            createdBy: new mongoose.Types.ObjectId(userId),
            createdAt: { $gte: new Date(Date.now() - timeframe * 24 * 60 * 60 * 1000) }
          } 
        },
        {
          $group: {
            _id: null,
            totalJobs: { $sum: 1 },
            completedJobs: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
            failedJobs: { $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] } },
            runningJobs: { $sum: { $cond: [{ $eq: ["$status", "running"] }, 1, 0] } },
            pendingJobs: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
            totalRecords: { $sum: "$records" },
            avgProcessingTime: { $avg: "$processingTime" }
          }
        }
      ]),
      
      // Get distribution by data source
      Job.aggregate([
        { $match: { createdBy: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: "$dataSource", count: { $sum: 1 } } },
        { $project: { dataSource: "$_id", count: 1, _id: 0 } }
      ]),
      
      // Get enrichment stats
      Job.aggregate([
        { $match: { createdBy: new mongoose.Types.ObjectId(userId), enrichments: { $exists: true, $ne: [] } } },
        { $unwind: "$enrichments" },
        { $group: { _id: "$enrichments", count: { $sum: 1 } } },
        { $project: { enrichmentType: "$_id", count: 1, _id: 0 } }
      ]),
      
      // Get time series
      Job.aggregate([
        { 
          $match: { 
            createdBy: new mongoose.Types.ObjectId(userId),
            createdAt: { $gte: new Date(Date.now() - timeframe * 24 * 60 * 60 * 1000) }
          } 
        },
        {
          $group: {
            _id: { 
              date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              status: "$status"
            },
            count: { $sum: 1 },
            records: { $sum: "$records" }
          }
        },
        { $sort: { "_id.date": 1 } }
      ]),
      
      // Get recent jobs
      Job.find({ createdBy: userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('name status dataSource url records processingTime createdAt lastRun')
    ]);
    
    // Process metrics
    const metricsData = metrics[0] || {
      totalJobs: 0,
      completedJobs: 0,
      failedJobs: 0,
      runningJobs: 0,
      pendingJobs: 0,
      totalRecords: 0,
      avgProcessingTime: 0
    };
    
    metricsData.successRate = metricsData.totalJobs > 0 
      ? (metricsData.completedJobs / metricsData.totalJobs) * 100 
      : 0;
    
    // Process time series
    const timeSeriesData = {};
    
    timeSeries.forEach(item => {
      const { date } = item._id;
      const status = item._id.status;
      
      if (!timeSeriesData[date]) {
        timeSeriesData[date] = {
          date,
          total: 0,
          completed: 0,
          failed: 0,
          running: 0,
          pending: 0,
          records: 0
        };
      }
      
      timeSeriesData[date][status] = item.count;
      timeSeriesData[date].total += item.count;
      timeSeriesData[date].records += item.records;
    });
    
    // Return all data
    res.json({
      metrics: metricsData,
      distribution,
      enrichmentStats,
      timeSeries: Object.values(timeSeriesData),
      recentJobs
    });
  } catch (error) {
    console.error('Error getting reports data:', error);
    res.status(500).json({ error: 'Failed to get reports data' });
  }
};

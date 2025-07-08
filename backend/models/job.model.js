import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  dataSource: {
    type: String,
    required: true,
    enum: ['website', 'api', 'upload'],
    default: 'website'
  },
  url: {
    type: String,
    required: function() {
      return this.dataSource === 'website' || this.dataSource === 'api';
    }
  },
  selectors: {
    type: mongoose.Schema.Types.Mixed,
    required: function() {
      return this.dataSource === 'website';
    }
  },
  login: {
    usernameSelector: String,
    passwordSelector: String,
    submitSelector: String,
    username: String,
    password: String
  },
  enrichments: [{
    type: String,
    enum: ['email', 'company', 'social', 'phone']
  }],
  outputFormat: {
    type: String,
    enum: ['csv', 'json', 'excel'],
    default: 'csv'
  },
  schedule: {
    type: String,
    enum: ['manual', 'hourly', 'daily', 'weekly', 'monthly'],
    default: 'manual'
  },
  status: {
    type: String,
    enum: ['pending', 'running', 'completed', 'failed', 'scheduled'],
    default: 'pending'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  results: mongoose.Schema.Types.Mixed,
  records: {
    type: Number,
    default: 0
  },
  processingTime: Number,
  error: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastRun: Date,
  startTime: Date
}, {
  timestamps: true
});

// Virtual for formatted processing time
jobSchema.virtual('formattedProcessingTime').get(function() {
  if (!this.processingTime) return '0s';
  return `${this.processingTime.toFixed(2)}s`;
});

// Ensure virtuals are included in JSON output
jobSchema.set('toJSON', { virtuals: true });
jobSchema.set('toObject', { virtuals: true });

const Job = mongoose.model('Job', jobSchema);

export default Job;

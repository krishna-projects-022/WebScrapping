import mongoose from 'mongoose';

const StepSchema = new mongoose.Schema({
  type: { type: String, required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  condition: { type: String },
  params: { type: Object }
}, { _id: false });

const WorkflowSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  steps: { type: [StepSchema], required: true },
  schedule: { type: String, required: true },
  enabled: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Workflow = mongoose.model('Workflow', WorkflowSchema);
export default Workflow;

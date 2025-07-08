import express from 'express';
import Workflow from '../models/workflow.model.js';
import { workflowRunnerService } from '../services/workflow-runner.service.js';

const router = express.Router();

// Create a new workflow
router.post('/', async (req, res) => {
  try {
    const workflow = new Workflow(req.body);
    await workflow.save();
    res.status(201).json(workflow);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all workflows
router.get('/', async (req, res) => {
  const workflows = await Workflow.find();
  res.json(workflows);
});

// Get a workflow by ID
router.get('/:id', async (req, res) => {
  const workflow = await Workflow.findById(req.params.id);
  if (!workflow) return res.status(404).json({ error: 'Not found' });
  res.json(workflow);
});

// Update a workflow
router.put('/:id', async (req, res) => {
  const workflow = await Workflow.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!workflow) return res.status(404).json({ error: 'Not found' });
  res.json(workflow);
});

// Delete a workflow
router.delete('/:id', async (req, res) => {
  const result = await Workflow.findByIdAndDelete(req.params.id);
  if (!result) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true });
});

// Run a workflow by ID
router.post('/:id/run', async (req, res) => {
  const workflow = await Workflow.findById(req.params.id);
  if (!workflow) return res.status(404).json({ error: 'Not found' });
  try {
    const result = await workflowRunnerService.runWorkflow(workflow, req.body.input || {});
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

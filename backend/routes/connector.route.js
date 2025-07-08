import express from 'express';
import Connector from '../models/connector.model.js';

const router = express.Router();

// Create connector
router.post('/', async (req, res) => {
  try {
    const connector = new Connector(req.body);
    await connector.save();
    res.status(201).json(connector);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// List connectors
router.get('/', async (req, res) => {
  const connectors = await Connector.find();
  res.json(connectors);
});

// Get connector by ID
router.get('/:id', async (req, res) => {
  const connector = await Connector.findById(req.params.id);
  if (!connector) return res.status(404).json({ error: 'Not found' });
  res.json(connector);
});

// Update connector
router.put('/:id', async (req, res) => {
  const connector = await Connector.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!connector) return res.status(404).json({ error: 'Not found' });
  res.json(connector);
});

// Delete connector
router.delete('/:id', async (req, res) => {
  const result = await Connector.findByIdAndDelete(req.params.id);
  if (!result) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true });
});

// Test connector connection (dummy implementation)
router.post('/:id/test', async (req, res) => {
  // In a real app, test the connector's config (e.g., ping API)
  res.json({ success: true, message: 'Connection test successful (dummy)' });
});

export default router;

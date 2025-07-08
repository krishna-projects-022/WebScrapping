import mongoose from 'mongoose';

const ConnectorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true }, // e.g., 'crm', 'spreadsheet', 'webhook', etc.
  config: { type: Object, required: true }, // connector-specific config (API keys, etc.)
  status: { type: String, default: 'idle' }, // 'idle', 'connected', 'error', etc.
  enabled: { type: Boolean, default: true },
  lastSync: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Connector = mongoose.model('Connector', ConnectorSchema);
export default Connector;

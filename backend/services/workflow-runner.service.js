// Workflow Runner Service: executes workflows step by step, supports chaining and conditions
import { jobProcessingService } from './job-processing.service.js';
// import { enrichmentService } from './enrichment.service.js';

export class WorkflowRunnerService {
  constructor() {}

  async runWorkflow(workflow, input = {}) {
    let context = { ...input };
    for (const step of workflow.steps) {
      // Evaluate condition if present
      if (step.condition) {
        try {
          // eslint-disable-next-line no-eval
          if (!eval(step.condition)) continue;
        } catch (e) {
          console.error('Condition eval error:', e);
          continue;
        }
      }
      switch (step.type) {
        case 'scrape':
          context[step.jobId] = await jobProcessingService.runJob(step.params || {});
          break;
        case 'enrich':
          context[step.jobId] = await enrichmentService.enrichData(context[step.inputKey], step.params.enrichmentTypes);
          break;
        case 'export':
          // Implement export logic (e.g., to CSV, webhook, etc.)
          context[step.jobId] = { exported: true };
          break;
        default:
          console.warn('Unknown step type:', step.type);
      }
    }
    return context;
  }
}

export const workflowRunnerService = new WorkflowRunnerService();

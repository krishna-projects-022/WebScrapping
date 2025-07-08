import React, { useEffect, useState } from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { TopBar } from '@/components/TopBar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Calendar, Zap, Play, Pause, Settings, Plus } from 'lucide-react';
import { toast } from 'sonner';
import {
  getWorkflows,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  runWorkflow,
  getWorkflow
} from '../lib/workflowApi';
import { getJobs as fetchJobs } from '../lib/jobApi';

const defaultWorkflow = {
  name: '',
  description: '',
  steps: [],
  schedule: '',
  enabled: true
};

const WorkflowAutomation = () => {
  const [workflows, setWorkflows] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(defaultWorkflow);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('workflows');

  // Jobs for step selection
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetchWorkflows();
    fetchJobs().then(setJobs).catch(() => {});
  }, []);

  // Fetch jobs when switching to 'create' tab or editing a workflow
  useEffect(() => {
    if (activeTab === 'create') {
      fetchJobs().then(setJobs).catch(() => {});
    }
  }, [activeTab]);

  // Fix: Ensure getWorkflows returns an array
  async function fetchWorkflows() {
    try {
      const data = await getWorkflows();
      setWorkflows(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error('Failed to fetch workflows');
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleStepChange(idx, field, value) {
    const steps = [...form.steps];
    // Defensive: ensure step exists and has all fields
    if (!steps[idx]) {
      steps[idx] = { type: '', jobId: '', condition: '', params: {} };
    } else {
      steps[idx] = {
        type: steps[idx].type || '',
        jobId: steps[idx].jobId || '',
        condition: typeof steps[idx].condition === 'string' ? steps[idx].condition : '',
        params: steps[idx].params || {}
      };
    }
    steps[idx][field] = value;
    setForm({ ...form, steps });
  }

  function addStep() {
    setForm({ ...form, steps: [...form.steps, { type: '', jobId: '', condition: '', params: {} }] });
  }

  function removeStep(idx) {
    const steps = [...form.steps];
    steps.splice(idx, 1);
    setForm({ ...form, steps });
  }

  function validateForm() {
    if (!form.name.trim()) {
      toast.error('Workflow name is required');
      return false;
    }
    if (!form.schedule) {
      toast.error('Schedule is required');
      return false;
    }
    if (!Array.isArray(form.steps) || form.steps.length === 0) {
      toast.error('At least one step is required');
      return false;
    }
    for (const [i, step] of form.steps.entries()) {
      if (!step.type) {
        toast.error(`Step ${i + 1} is missing a type`);
        return false;
      }
    }
    return true;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      // Only send fields that exist in the backend schema
      const payload = {
        name: form.name,
        description: form.description,
        steps: form.steps,
        schedule: form.schedule,
        enabled: form.enabled
      };
      if (selected) {
        await updateWorkflow(selected._id, payload);
        toast.success('Workflow updated');
      } else {
        await createWorkflow(payload);
        toast.success('Workflow created');
      }
      setForm(defaultWorkflow);
      setSelected(null);
      fetchWorkflows();
      setActiveTab('workflows');
    } catch (e) {
      toast.error('Failed to save workflow');
    }
    setLoading(false);
  }

  function handleEdit(wf) {
    setSelected(wf);
    // Ensure all steps have 'condition' property
    const steps = (wf.steps || []).map(step => ({
      type: step.type || '',
      jobId: step.jobId || '',
      condition: typeof step.condition === 'string' ? step.condition : '',
      params: step.params || {}
    }));
    setForm({ ...wf, steps });
    // Fetch jobs when editing a workflow
    fetchJobs().then(setJobs).catch(() => {});
  }

  async function handleDelete(id) {
    setLoading(true);
    try {
      await deleteWorkflow(id);
      toast.success('Workflow deleted');
      fetchWorkflows();
    } catch (e) {
      toast.error('Failed to delete workflow');
    }
    setLoading(false);
  }

  // Fix: handle result type for workflow run
  async function handleRun(id) {
    setLoading(true);
    try {
      const res = await runWorkflow(id);
      setResult(res && typeof res === 'object' && 'result' in res ? res.result : res);
      toast.success('Workflow run complete');
    } catch (e) {
      toast.error('Failed to run workflow');
    }
    setLoading(false);
  }

  function handleCancel() {
    setSelected(null);
    setForm(defaultWorkflow);
  }

  // Add toggle workflow enabled/paused
  function handleToggleWorkflow(id, enabled) {
    setWorkflows(workflows => workflows.map(wf => wf._id === id ? { ...wf, enabled: !enabled } : wf));
    // Optionally, update backend as well
    updateWorkflow(id, { enabled: !enabled }).catch(() => toast.error('Failed to update workflow status'));
  }

  // Fix: New Workflow button should clear form and switch to create tab
  function handleNewWorkflow() {
    setSelected(null);
    setForm(defaultWorkflow);
    setActiveTab('create');
  }

  return (
    <>
      <AppSidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Workflow Automation" />
        <div className="flex-1 p-6 space-y-6 overflow-auto bg-gray-50">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Workflows</p>
                    <p className="text-2xl font-bold text-green-600">
                      {workflows.filter(w => w.enabled).length}
                    </p>
                  </div>
                  <Play className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Scheduled Jobs</p>
                    <p className="text-2xl font-bold text-blue-600">8</p>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Executions Today</p>
                    <p className="text-2xl font-bold text-teal-600">24</p>
                  </div>
                  <Zap className="h-8 w-8 text-teal-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Success Rate</p>
                    <p className="text-2xl font-bold text-orange-600">96%</p>
                  </div>
                  <Settings className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList>
              <TabsTrigger value="workflows">Workflows</TabsTrigger>
              <TabsTrigger value="scheduling">Job Scheduling</TabsTrigger>
              <TabsTrigger value="create">Create New</TabsTrigger>
            </TabsList>
            <TabsContent value="workflows" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Active Workflows</h2>
                <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleNewWorkflow}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Workflow
                </Button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {workflows.map((workflow) => (
                  <Card key={workflow._id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{workflow.name}</CardTitle>
                        <Badge variant={workflow.enabled ? 'default' : 'secondary'}>
                          {workflow.enabled ? 'active' : 'paused'}
                        </Badge>
                      </div>
                      <CardDescription>
                        {workflow.schedule}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          {workflow.trigger === 'time' ? <Clock className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
                          <span className="text-sm capitalize">{workflow.trigger} Trigger</span>
                        </div>
                        
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Last run: {workflow.lastRun}</p>
                          <p>Next run: {workflow.nextRun}</p>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleWorkflow(workflow._id, workflow.enabled)}
                          >
                            {workflow.enabled ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleEdit(workflow)}>
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="scheduling" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Job Scheduling Options</CardTitle>
                  <CardDescription>Configure when and how your workflows run</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Clock className="h-6 w-6 text-blue-600" />
                        <h3 className="font-semibold">Time Triggers</h3>
                      </div>
                      <ul className="text-sm space-y-1 text-gray-600">
                        <li>• Hourly, Daily, Weekly, Monthly</li>
                        <li>• Custom cron expressions</li>
                        <li>• Timezone support</li>
                        <li>• Holiday scheduling</li>
                      </ul>
                    </Card>
                    
                    <Card className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Zap className="h-6 w-6 text-orange-600" />
                        <h3 className="font-semibold">Event Triggers</h3>
                      </div>
                      <ul className="text-sm space-y-1 text-gray-600">
                        <li>• Data changes</li>
                        <li>• File uploads</li>
                        <li>• API webhooks</li>
                        <li>• User actions</li>
                      </ul>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="create" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Create New Workflow</CardTitle>
                  <CardDescription>Set up a new automated workflow</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Workflow Name</label>
                    <Input
                      placeholder="Enter workflow name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Input
                      placeholder="Enter workflow description"
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Schedule</label>
                    <Select value={form.schedule} onValueChange={(value) => setForm({...form, schedule: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select schedule" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Every Hour</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Steps</label>
                    {form.steps.map((step, idx) => (
                      <div key={idx} className="flex gap-2 mb-2">
                        <Select value={step.type} onValueChange={value => handleStepChange(idx, 'type', value)}>
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="scrape">Scrape</SelectItem>
                            <SelectItem value="enrich">Enrich</SelectItem>
                            <SelectItem value="export">Export</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={step.jobId || ''} onValueChange={value => handleStepChange(idx, 'jobId', value)}>
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Select Job" />
                          </SelectTrigger>
                          <SelectContent>
                            {/* Remove the invalid empty value option */}
                            {jobs.map(job => (
                              <SelectItem key={job._id} value={job._id}>{job.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Condition (optional)"
                          value={step.condition || ''}
                          onChange={e => handleStepChange(idx, 'condition', e.target.value)}
                          className="w-40"
                        />
                        <Button type="button" size="sm" variant="destructive" onClick={() => removeStep(idx)}>
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button type="button" size="sm" onClick={addStep} className="mt-2">Add Step</Button>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Enabled</label>
                    <input
                      type="checkbox"
                      checked={form.enabled}
                      onChange={e => setForm({ ...form, enabled: e.target.checked })}
                      className="ml-2"
                    />
                  </div>
                  <Button onClick={handleSubmit} className="w-full bg-teal-600 hover:bg-teal-700" disabled={loading}>
                    {loading ? 'Processing...' : selected ? 'Update Workflow' : 'Create Workflow'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
};

export default WorkflowAutomation;

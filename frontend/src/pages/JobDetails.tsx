import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { TopBar } from "@/components/TopBar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, ArrowLeft, Download, Clock, Server, CalendarIcon, FileType, BarChart2, Loader2, RefreshCw } from "lucide-react";
import { getJobById, runJob } from "@/lib/api";
import { toast } from "sonner";

// Job type based on backend schema
interface Job {
  _id: string;
  name: string;
  dataSource: 'website' | 'api' | 'upload';
  url?: string;
  selectors?: Record<string, string>;
  enrichments: string[];
  outputFormat: 'csv' | 'json' | 'excel';
  schedule: 'manual' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'scheduled';
  records?: number;
  processingTime?: number;
  error?: string;
  createdAt: string;
  lastRun?: string;
  results?: any;
  login?: {
    usernameSelector?: string;
    passwordSelector?: string;
    submitSelector?: string;
    username?: string;
    password?: string;
  };
}

const JobDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // Fetch job details
  const fetchJobDetails = async () => {
    if (!id) return;
    
    try {
      setError(null);
      setIsRefreshing(true);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('You must be logged in to view job details');
      }
      
      const jobData = await getJobById(id, token);
      setJob(jobData);
      
      // If job is running, ensure polling is active
      if (jobData.status === 'running') {
        startPolling();
      } else if (pollingInterval) {
        // If job is no longer running, stop polling
        stopPolling();
      }
    } catch (err: any) {
      console.error('Error fetching job details:', err);
      setError(err.message || 'Failed to load job details');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Start polling for job updates
  const startPolling = () => {
    if (pollingInterval) return; // Don't create multiple intervals
    
    const interval = setInterval(() => {
      fetchJobDetails();
    }, 3000); // Poll every 3 seconds
    
    setPollingInterval(interval);
    setIsRunning(true);
  };

  // Stop polling for job updates
  const stopPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    setIsRunning(false);
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // Initial fetch
  useEffect(() => {
    fetchJobDetails();
    
    // When navigating away, store job status in sessionStorage if job is running
    return () => {
      if (job && job.status === 'running') {
        sessionStorage.setItem(`job_${id}_running`, 'true');
      }
    };
  }, [id]);

  // Handle the "Run Job" button click
  const handleRunJob = async () => {
    if (!id) return;
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('You must be logged in to run a job');
        navigate('/login');
        return;
      }
      
      setIsRunning(true);
      
      // Run the job
      await runJob(id, token);
      toast.success('Job started successfully');
      
      // Store running state in sessionStorage for persistence across page navigation
      sessionStorage.setItem(`job_${id}_running`, 'true');
      
      // Start polling for updates immediately
      startPolling();
      
    } catch (err: any) {
      console.error('Error running job:', err);
      toast.error(err.message || 'Failed to run job');
      setIsRunning(false);
      sessionStorage.removeItem(`job_${id}_running`);
    }
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return dateString;
    
    return date.toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format processing time
  const formatProcessingTime = (time?: number) => {
    if (!time) return '0s';
    
    if (time < 1) {
      return `${(time * 1000).toFixed(0)}ms`;
    }
    
    return `${time.toFixed(2)}s`;
  };

  return (
    <>
      <AppSidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Job Details" />
        
        <div className="flex-1 p-6 space-y-6 overflow-auto bg-gray-50">
          {/* Back Button */}
          <Button 
            variant="outline" 
            className="space-x-1 mb-4" 
            onClick={() => {
              // Store job state in sessionStorage before navigating away
              if (job && job.status === 'running') {
                sessionStorage.setItem(`job_${job._id}_running`, 'true');
              }
              navigate('/data-jobs', { state: { refreshJobs: true } });
            }}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Jobs</span>
          </Button>
          
          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-navy-600" />
              <span className="ml-2 text-lg">Loading job details...</span>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <Card className="p-6 bg-red-50 border-red-200">
              <CardContent className="p-0 flex items-center text-red-600">
                <AlertCircle className="h-5 w-5 mr-2" />
                <p>{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Job Details */}
          {!loading && !error && job && (
            <div className="space-y-6">
              {/* Header Section */}
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-2xl flex items-center gap-2">
                        {job.name}
                        <Badge 
                          variant={
                            job.status === 'completed' ? 'default' : 
                            job.status === 'running' ? 'secondary' : 
                            job.status === 'scheduled' ? 'outline' :
                            job.status === 'failed' ? 'destructive' : 
                            'outline'
                          }
                          className="ml-2"
                        >
                          {job.status}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {job.url && (
                          <span className="text-blue-600 hover:underline">{job.url}</span>
                        )}
                      </CardDescription>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchJobDetails}
                        disabled={isRefreshing}
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Refresh
                      </Button>
                      
                      {job.status === 'completed' && (
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                      )}
                      
                      <Button 
                        size="sm" 
                        className="bg-teal-600 hover:bg-teal-700"
                        disabled={job.status === 'running' || isRunning}
                        onClick={handleRunJob}
                      >
                        {job.status === 'running' || isRunning ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Running...
                          </>
                        ) : 'Run Now'}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="flex items-center gap-2">
                      <Server className="h-5 w-5 text-gray-500" />
                      <div>
                        <div className="text-sm font-medium">Data Source</div>
                        <div className="text-lg">{job.dataSource}</div>
                      </div>
                    </div>
                    {/* Show URL only for website jobs */}
                    {job.dataSource === 'website' && job.url && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">URL:</span> <span className="text-blue-600 break-all">{job.url}</span>
                      </div>
                    )}
                    {/* Show API endpoint for API jobs */}
                    {job.dataSource === 'api' && (job as any).apiEndpoint && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">API Endpoint:</span> <span className="break-all">{(job as any).apiEndpoint}</span>
                      </div>
                    )}
                    {/* Show upload info for upload jobs */}
                    {job.dataSource === 'upload' && (job as any).uploadFileName && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">File:</span> <span className="break-all">{(job as any).uploadFileName}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <BarChart2 className="h-5 w-5 text-gray-500" />
                      <div>
                        <div className="text-sm font-medium">Records</div>
                        <div className="text-lg">{job.records?.toLocaleString() || 0}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5 text-gray-500" />
                      <div>
                        <div className="text-sm font-medium">Created</div>
                        <div className="text-lg">{formatDate(job.createdAt)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-gray-500" />
                      <div>
                        <div className="text-sm font-medium">Last Run</div>
                        <div className="text-lg">{formatDate(job.lastRun)}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Details Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Job Configuration */}
                <Card>
                  <CardHeader>
                    <CardTitle>Job Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Enrichments</h3>
                      <div className="flex flex-wrap gap-2">
                        {job.enrichments && job.enrichments.length > 0 ? (
                          job.enrichments.map((enrichment) => (
                            <Badge key={enrichment} variant="outline">
                              {enrichment}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-gray-500">No enrichments</span>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-2">Schedule</h3>
                      <div className="text-base">{job.schedule}</div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-2">Output Format</h3>
                      <div className="flex items-center gap-2">
                        <FileType className="h-4 w-4 text-gray-500" />
                        <span className="uppercase">{job.outputFormat}</span>
                      </div>
                    </div>
                    
                    {job.dataSource === 'website' && job.selectors && (
                      <div>
                        <h3 className="text-sm font-medium mb-2">Selectors</h3>
                        <div className="bg-gray-50 p-3 rounded-md text-sm font-mono">
                          {Object.entries(job.selectors).map(([key, value]) => (
                            <div key={key} className="mb-1">
                              <span className="text-blue-600">{key}:</span> {typeof value === 'object' ? JSON.stringify(value) : value}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {job.login && job.login.usernameSelector && (
                      <div>
                        <h3 className="text-sm font-medium mb-2">Login Configuration</h3>
                        <div className="bg-gray-50 p-3 rounded-md text-sm">
                          <div className="mb-1">
                            <span className="font-medium">Username Selector:</span> {job.login.usernameSelector}
                          </div>
                          <div className="mb-1">
                            <span className="font-medium">Password Selector:</span> {job.login.passwordSelector}
                          </div>
                          <div>
                            <span className="font-medium">Submit Selector:</span> {job.login.submitSelector}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Execution Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Execution Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Processing Time</h3>
                      <div className="text-base">{formatProcessingTime(job.processingTime)}</div>
                    </div>
                    
                    {/* Add real-time status for running jobs */}
                    {job.status === 'running' && (
                      <div>
                        <h3 className="text-sm font-medium mb-2 text-blue-600">Status</h3>
                        <div className="bg-blue-50 border border-blue-200 p-3 rounded-md">
                          <div className="flex items-center mb-2">
                            <Loader2 className="h-4 w-4 mr-2 animate-spin text-blue-600" />
                            <span className="text-blue-600 font-medium">Job is currently running</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-blue-600 h-2.5 rounded-full animate-pulse" style={{ width: '100%' }}></div>
                          </div>
                          <p className="text-sm mt-2 text-gray-600">
                            Real-time updates will appear here. This page automatically refreshes.
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Show error only if job is failed, running, or if job is completed and error is from this run */}
                    {job.error && (
                      job.status === 'failed' || job.status === 'running'
                    ) && (
                      <div>
                        <h3 className="text-sm font-medium mb-2 text-red-600">Error</h3>
                        <div className="bg-red-50 border border-red-200 p-3 rounded-md text-sm text-red-600">
                          {job.error}
                        </div>
                      </div>
                    )}
                    
                    {job.status === 'completed' && job.records && job.records > 0 && (
                      <div>
                        <h3 className="text-sm font-medium mb-2">Results Preview</h3>
                        <div className="bg-gray-50 p-3 rounded-md overflow-auto max-h-72">
                          {job.results ? (
                            <pre className="text-xs">{JSON.stringify(job.results, null, 2)}</pre>
                          ) : (
                            <p className="text-gray-500">No preview available</p>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    {job.status === 'completed' && (
                      <Button variant="outline" size="sm" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Download Full Results
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default JobDetails;

import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { TopBar } from "@/components/TopBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useNavigate, useLocation } from "react-router-dom";
import { Plus, Search, Download, Eye, AlertCircle, Loader2 } from "lucide-react";
import { getJobs, runJob } from "@/lib/api";
import { toast } from "sonner";

// Define the Job type based on the backend schema
interface Job {
  _id: string;
  name: string;
  dataSource: 'website' | 'api' | 'upload';
  url?: string;
  enrichments: string[];
  outputFormat: 'csv' | 'json' | 'excel';
  schedule: 'manual' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'scheduled';
  records?: number;
  processingTime?: number;
  createdAt: string;
  lastRun?: string;
  error?: string;
}

const DataJobs = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [runningJobs, setRunningJobs] = useState<Set<string>>(new Set());
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // Fetch jobs from the API
  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('You must be logged in to view jobs');
      }
      
      const jobsData = await getJobs(token);
      setJobs(jobsData);
      
      // Check for any running jobs from sessionStorage and add them to runningJobs state
      const runningJobsFromSession = new Set<string>();
      
      // Add running jobs from backend
      jobsData.forEach(job => {
        if (job.status === 'running') {
          runningJobsFromSession.add(job._id);
        } else {
          // If a job is not running anymore, remove from session storage
          sessionStorage.removeItem(`job_${job._id}_running`);
        }
      });
      
      // Add any jobs marked as running in sessionStorage
      jobsData.forEach(job => {
        if (sessionStorage.getItem(`job_${job._id}_running`) === 'true') {
          runningJobsFromSession.add(job._id);
        }
      });
      
      setRunningJobs(runningJobsFromSession);
      
      // If there are running jobs, start polling
      if (runningJobsFromSession.size > 0) {
        startPolling();
      }
    } catch (err: any) {
      console.error('Error fetching jobs:', err);
      setError(err.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };
  
  // Start polling for job updates
  const startPolling = () => {
    if (pollingInterval) return; // Don't create multiple intervals
    
    const interval = setInterval(() => {
      const token = localStorage.getItem('token');
      if (token) {
        // Use a non-loading fetch to update jobs without affecting UI
        getJobs(token)
          .then(jobsData => {
            setJobs(jobsData);
            
            // Update running jobs state
            const stillRunning = new Set<string>();
            jobsData.forEach(job => {
              if (job.status === 'running') {
                stillRunning.add(job._id);
              } else {
                // If job is no longer running, remove from sessionStorage and runningJobs
                sessionStorage.removeItem(`job_${job._id}_running`);
                setRunningJobs(prev => {
                  const newSet = new Set(prev);
                  newSet.delete(job._id);
                  return newSet;
                });
              }
            });
            setRunningJobs(stillRunning);
            
            // If no jobs are running anymore, stop polling
            if (stillRunning.size === 0) {
              stopPolling();
            }
          })
          .catch(err => {
            console.error('Error polling jobs:', err);
          });
      }
    }, 3000); // Poll every 3 seconds
    
    setPollingInterval(interval);
  };
  
  // Stop polling for job updates
  const stopPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // Fetch jobs on mount or when navigating back with refreshJobs flag
  useEffect(() => {
    fetchJobs();
    
    // Check if we need to refresh based on location state
    if (location.state && location.state.refreshJobs) {
      fetchJobs();
      // Clear the state to prevent multiple refreshes
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location]);

  // Filter jobs based on search term
  const filteredJobs = jobs.filter(job => 
    job.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.dataSource?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle the "Run Now" button click
  const handleRunJob = async (jobId: string) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('You must be logged in to run a job');
        navigate('/login');
        return;
      }
      
      // Add job to running jobs set
      setRunningJobs(prev => {
        const newSet = new Set(prev);
        newSet.add(jobId);
        return newSet;
      });
      
      // Store running state in sessionStorage
      sessionStorage.setItem(`job_${jobId}_running`, 'true');
      
      // Start polling
      startPolling();
      
      // Run the job
      await runJob(jobId, token);
      toast.success('Job started successfully');
      
    } catch (err: any) {
      console.error('Error running job:', err);
      toast.error(err.message || 'Failed to run job');
      
      // Remove job from running jobs set
      setRunningJobs(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
      
      // Remove from sessionStorage
      sessionStorage.removeItem(`job_${jobId}_running`);
    }
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return dateString;
    
    // If date is today, show time
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      // Fix arithmetic: convert to milliseconds first
      const diffMs = today.getTime() - date.getTime();
      
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      if (hours < 1) {
        const minutes = Math.floor(diffMs / (1000 * 60));
        return `${minutes}m ago`;
      }
      return `${hours}h ago`;
    }
    
    // Otherwise show date
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <>
      <AppSidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Data Jobs" />
        
        <div className="flex-1 p-6 space-y-6 overflow-auto bg-gray-50">
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search jobs..."
                className="pl-10 w-full sm:w-80"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              onClick={() => navigate("/create-job")}
              className="bg-navy-800 hover:bg-navy-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Job
            </Button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-navy-600" />
              <span className="ml-2 text-lg">Loading jobs...</span>
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

          {/* Jobs List */}
          {!loading && !error && (
            <div className="space-y-4">
              {filteredJobs.length > 0 ? filteredJobs.map((job) => (
                <Card key={job._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{job.name}</h3>
                          <Badge 
                            variant={
                              job.status === 'completed' ? 'default' : 
                              job.status === 'running' ? 'secondary' : 
                              job.status === 'scheduled' ? 'outline' :
                              job.status === 'failed' ? 'destructive' : 
                              'outline'
                            }
                          >
                            {job.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Records:</span> {job.records?.toLocaleString() || 0}
                          </div>
                          <div>
                            <span className="font-medium">Source:</span> {job.dataSource}
                          </div>
                          <div>
                            <span className="font-medium">Created:</span> {formatDate(job.createdAt)}
                          </div>
                          <div>
                            <span className="font-medium">Last Run:</span> {formatDate(job.lastRun)}
                          </div>
                          {/* Show URL only for website jobs */}
                          {job.dataSource === 'website' && job.url && (
                            <div>
                              <span className="font-medium">URL:</span> {job.url}
                            </div>
                          )}
                          {/* Show API endpoint for API jobs */}
                          {job.dataSource === 'api' && (job as any).apiEndpoint && (
                            <div>
                              <span className="font-medium">API Endpoint:</span> {(job as any).apiEndpoint}
                            </div>
                          )}
                          {/* Show upload info for upload jobs */}
                          {job.dataSource === 'upload' && (job as any).uploadFileName && (
                            <div>
                              <span className="font-medium">File:</span> {(job as any).uploadFileName}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/data-jobs/${job._id}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
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
                          disabled={job.status === 'running' || runningJobs.has(job._id)}
                          onClick={() => handleRunJob(job._id)}
                        >
                          {job.status === 'running' || runningJobs.has(job._id) ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Running...
                            </>
                          ) : 'Run Now'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )) : (
                <Card className="p-6 text-center bg-gray-50 border-gray-200">
                  <CardContent className="p-0">
                    <p className="text-gray-500">No jobs found matching your search.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Empty State (if no jobs) */}
          {!loading && !error && filteredJobs.length === 0 && searchTerm === "" && (
            <Card className="p-12 text-center">
              <CardContent>
                <div className="max-w-md mx-auto">
                  <div className="mb-4">
                    <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                      <Plus className="h-8 w-8 text-gray-400" />
                    </div>
                  </div>
                  <CardTitle className="mb-2">No Data Jobs Yet</CardTitle>
                  <CardDescription className="mb-6">
                    Create your first data job to start automating your workflows
                  </CardDescription>
                  <Button 
                    onClick={() => navigate("/create-job")}
                    className="bg-navy-800 hover:bg-navy-700"
                  >
                    Create Your First Job
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </>
  );
};

export default DataJobs;

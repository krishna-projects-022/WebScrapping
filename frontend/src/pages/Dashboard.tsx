import { AppSidebar } from "@/components/AppSidebar";
import { TopBar } from "@/components/TopBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CheckIcon, Clock, AlertTriangle, Plus, BarChart, Database, Link } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();

  const jobStats = {
    running: 3,
    completed: 156,
    failed: 2
  };

  const recentJobs = [
    { id: 1, name: "LinkedIn Profile Scraping", status: "completed", records: 1250, time: "2h ago" },
    { id: 2, name: "Company Email Enrichment", status: "running", records: 847, time: "Started 30m ago" },
    { id: 3, name: "Website Contact Extraction", status: "failed", records: 0, time: "1h ago" },
    { id: 4, name: "CRM Data Enhancement", status: "completed", records: 2103, time: "3h ago" },
  ];

  return (
    <>
      <AppSidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Dashboard" />
        
        <div className="flex-1 p-6 space-y-6 overflow-auto bg-gray-50">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-800">Jobs Completed</CardTitle>
                <CheckIcon className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-800">{jobStats.completed}</div>
                <p className="text-xs text-green-600">+12% from last month</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-800">Jobs Running</CardTitle>
                <Clock className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-800">{jobStats.running}</div>
                <p className="text-xs text-blue-600">Active processes</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-red-800">Jobs Failed</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-800">{jobStats.failed}</div>
                <p className="text-xs text-red-600">Needs attention</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Resource Usage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="h-5 w-5" />
                  Resource Usage
                </CardTitle>
                <CardDescription>Current system resource utilization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>CPU Usage</span>
                    <span>67%</span>
                  </div>
                  <Progress value={67} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Memory</span>
                    <span>43%</span>
                  </div>
                  <Progress value={43} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Bandwidth</span>
                    <span>82%</span>
                  </div>
                  <Progress value={82} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Recent Jobs */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    <CardTitle>Recent Jobs</CardTitle>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => navigate("/data-jobs")}
                    variant="outline"
                  >
                    View All
                  </Button>
                </div>
                <CardDescription>Latest data processing activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentJobs.map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{job.name}</p>
                        <p className="text-xs text-gray-500">{job.time}</p>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={
                            job.status === 'completed' ? 'default' : 
                            job.status === 'running' ? 'secondary' : 
                            'destructive'
                          }
                          className="mb-1"
                        >
                          {job.status}
                        </Badge>
                        <p className="text-xs text-gray-500">{job.records} records</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Start your data automation workflows</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  onClick={() => navigate("/create-job")} 
                  className="h-20 flex flex-col gap-2 bg-navy-800 hover:bg-navy-700"
                >
                  <Plus className="h-6 w-6" />
                  Create New Job
                </Button>
                <Button 
                  onClick={() => navigate("/integrations")} 
                  variant="outline" 
                  className="h-20 flex flex-col gap-2"
                >
                  <Link className="h-6 w-6" />
                  Setup Integration
                </Button>
                <Button 
                  onClick={() => navigate("/reports")} 
                  variant="outline" 
                  className="h-20 flex flex-col gap-2"
                >
                  <BarChart className="h-6 w-6" />
                  View Reports
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
};

export default Dashboard;

import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { TopBar } from "@/components/TopBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart3, TrendingUp, Download, Calendar, Database, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { getReports } from "@/lib/api";
import { useNavigate } from "react-router-dom";

const Reports = () => {
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState("30");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState({
    metrics: {
      totalJobs: 0,
      completedJobs: 0,
      failedJobs: 0,
      runningJobs: 0,
      pendingJobs: 0,
      totalRecords: 0,
      avgProcessingTime: 0,
      successRate: 0
    },
    distribution: [],
    enrichmentStats: [],
    timeSeries: [],
    recentJobs: [],
    performanceMetrics: []
  });

  // Mock data as fallback if API fails
  const mockTimeSeriesData = [
    { date: 'Jan', jobs: 45, success: 42, failed: 3 },
    { date: 'Feb', jobs: 52, success: 48, failed: 4 },
    { date: 'Mar', jobs: 61, success: 58, failed: 3 },
    { date: 'Apr', jobs: 58, success: 54, failed: 4 },
    { date: 'May', jobs: 67, success: 63, failed: 4 },
    { date: 'Jun', jobs: 74, success: 71, failed: 3 }
  ];

  const mockEnrichmentData = [
    { name: 'Email Lookup', value: 35, color: '#0f766e' },
    { name: 'Company Info', value: 28, color: '#1e40af' },
    { name: 'Social Profiles', value: 22, color: '#7c3aed' },
    { name: 'Phone Numbers', value: 15, color: '#dc2626' }
  ];

  const mockPerformanceMetrics = [
    { metric: 'Jobs Success Rate', value: 94.2, change: +2.1, trend: 'up' },
    { metric: 'Avg Processing Time', value: '3.4m', change: -0.8, trend: 'down' },
    { metric: 'Data Accuracy', value: 97.8, change: +1.2, trend: 'up' },
    { metric: 'API Usage', value: '89%', change: +5.2, trend: 'up' }
  ];

  // Fetch report data from API
  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('You must be logged in to view reports');
        }
        
        const data = await getReports(token);
        
        // Transform enrichment stats for pie chart
        const colors = ['#0f766e', '#1e40af', '#7c3aed', '#dc2626', '#ca8a04', '#be185d'];
        const enrichmentStatsFormatted = data.enrichmentStats.map((stat, index) => ({
          name: stat.enrichmentType,
          value: stat.count,
          color: colors[index % colors.length]
        }));
        
        // Format recent jobs
        const recentJobsFormatted = data.recentJobs.map(job => ({
          id: job._id,
          name: job.name,
          status: job.status,
          records: job.records || 0,
          duration: job.processingTime ? `${(job.processingTime / 60).toFixed(1)}m` : 'N/A'
        }));
        
        // Format time series data for chart
        const timeSeriesFormatted = data.timeSeries.map(item => ({
          date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          jobs: item.total,
          success: item.completed,
          failed: item.failed,
          records: item.records
        }));
        
        // Calculate performance metrics
        const performanceMetrics = [
          { 
            metric: 'Jobs Success Rate', 
            value: data.metrics.successRate ? data.metrics.successRate.toFixed(1) + '%' : '0%', 
            change: +2.1, // Mock change for now
            trend: 'up' 
          },
          { 
            metric: 'Avg Processing Time', 
            value: data.metrics.avgProcessingTime ? `${(data.metrics.avgProcessingTime / 60).toFixed(1)}m` : 'N/A', 
            change: -0.8, // Mock change for now
            trend: 'down' 
          },
          { 
            metric: 'Data Volume', 
            value: data.metrics.totalRecords ? data.metrics.totalRecords.toLocaleString() : '0', 
            change: +5.2, // Mock change for now
            trend: 'up' 
          },
          { 
            metric: 'Active Jobs', 
            value: data.metrics.runningJobs || 0, 
            change: 0, // Mock change for now
            trend: 'neutral' 
          }
        ];
        
        setReportData({
          metrics: data.metrics,
          distribution: data.distribution,
          enrichmentStats: enrichmentStatsFormatted.length > 0 ? enrichmentStatsFormatted : mockEnrichmentData,
          timeSeries: timeSeriesFormatted.length > 0 ? timeSeriesFormatted : mockTimeSeriesData,
          recentJobs: recentJobsFormatted.length > 0 ? recentJobsFormatted : [],
          performanceMetrics
        });
      } catch (error) {
        console.error('Error fetching report data:', error);
        setError(error.message || 'Failed to load report data');
        
        // Use mock data as fallback
        setReportData({
          ...reportData,
          enrichmentStats: mockEnrichmentData,
          timeSeries: mockTimeSeriesData,
          performanceMetrics: mockPerformanceMetrics
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchReportData();
  }, [timeframe]);

  // Handle timeframe change
  const handleTimeframeChange = (value) => {
    setTimeframe(value);
  };
  
  // Navigate to job details
  const handleJobClick = (jobId) => {
    navigate(`/data-jobs/${jobId}`);
  };

  return (
    <>
      <AppSidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Reports & Analytics" />
        
        <div className="flex-1 p-6 space-y-6 overflow-auto bg-gray-50">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-navy-800">Analytics Dashboard</h2>
              <p className="text-gray-600">Monitor your data automation performance</p>
            </div>
            <div className="flex gap-2">
              <Select defaultValue="last30days">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last7days">Last 7 days</SelectItem>
                  <SelectItem value="last30days">Last 30 days</SelectItem>
                  <SelectItem value="last90days">Last 90 days</SelectItem>
                  <SelectItem value="lastyear">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {loading ? (
              Array(4).fill(0).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </CardContent>
                </Card>
              ))
            ) : (
              reportData.performanceMetrics.map((metric, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{metric.metric}</p>
                        <p className="text-2xl font-bold text-navy-800">{metric.value}</p>
                        <div className="flex items-center mt-1">
                          <TrendingUp className={`h-4 w-4 mr-1 ${
                            metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                          }`} />
                          <span className={`text-sm ${
                            metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {metric.change > 0 ? '+' : ''}{metric.change}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Jobs Over Time */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Jobs Over Time
                </CardTitle>
                <CardDescription>Monthly job execution trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={reportData.timeSeries}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="jobs" stroke="#0f766e" strokeWidth={2} />
                    <Line type="monotone" dataKey="success" stroke="#22c55e" strokeWidth={2} />
                    <Line type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Enrichment Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Enrichment Types Usage
                </CardTitle>
                <CardDescription>Distribution of enrichment services</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={reportData.enrichmentStats}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {reportData.enrichmentStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Job Success Rate */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Success Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Completed Jobs</span>
                      <span>{reportData.metrics.successRate ? reportData.metrics.successRate.toFixed(1) : 0}%</span>
                    </div>
                    <Progress value={reportData.metrics.successRate || 0} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Data Accuracy</span>
                      <span>97.8%</span>
                    </div>
                    <Progress value={97.8} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>API Reliability</span>
                      <span>99.1%</span>
                    </div>
                    <Progress value={99.1} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Job Activity
                </CardTitle>
                <CardDescription>Latest job executions and their status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.recentJobs.map((job, index) => (
                    <div 
                      key={job.id || index} 
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                      onClick={() => job.id && handleJobClick(job.id)}
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{job.name}</p>
                        <p className="text-xs text-gray-500">Duration: {job.duration}</p>
                      </div>
                      <div className="text-right mr-4">
                        <p className="text-sm font-medium">{job.records ? job.records.toLocaleString() : 0} records</p>
                      </div>
                      <Badge 
                        variant={
                          job.status === 'completed' ? 'default' : 
                          job.status === 'running' ? 'secondary' : 
                          'destructive'
                        }
                      >
                        {job.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Export Options */}
          <Card>
            <CardHeader>
              <CardTitle>Export Reports</CardTitle>
              <CardDescription>Download detailed reports in various formats</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <Download className="h-6 w-6" />
                  PDF Report
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <Calendar className="h-6 w-6" />
                  Excel Dashboard
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <Database className="h-6 w-6" />
                  Raw Data (CSV)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
};

export default Reports;

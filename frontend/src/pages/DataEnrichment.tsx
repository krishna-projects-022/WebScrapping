
import { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { TopBar } from "@/components/TopBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Building, Target, Zap, Clock, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const DataEnrichment = () => {
  const [activeProcessors, setActiveProcessors] = useState([
    {
      id: "profile-aug",
      name: "Profile Augmentation",
      description: "Employment history, skills, endorsements",
      icon: User,
      enabled: true,
      progress: 75,
      features: ["LinkedIn History", "Skills Extraction", "Endorsements", "Education Data"]
    },
    {
      id: "company-exp",
      name: "Company Data Expansion", 
      description: "Corporate hierarchies, technographics",
      icon: Building,
      enabled: true,
      progress: 60,
      features: ["Tech Stack", "Company Size", "Revenue Data", "Leadership"]
    }
  ]);

  const [enrichmentJobs, setEnrichmentJobs] = useState([
    {
      id: 1,
      name: "Sales Lead Enrichment",
      status: "running",
      progress: 45,
      records: 1250,
      completed: 563,
      type: "profile-aug"
    },
    {
      id: 2,
      name: "Company Intelligence",
      status: "completed",
      progress: 100,
      records: 800,
      completed: 800,
      type: "company-exp"
    }
  ]);

  const handleToggleProcessor = (processorId, currentStatus) => {
    setActiveProcessors(processors => 
      processors.map(p => 
        p.id === processorId ? { ...p, enabled: !currentStatus } : p
      )
    );
    toast.success(`Processor ${currentStatus ? 'disabled' : 'enabled'} successfully!`);
  };

  const handleStartEnrichment = () => {
    toast.success("New enrichment job started!");
  };

  return (
    <>
      <AppSidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Data Enrichment" />
        
        <div className="flex-1 p-6 space-y-6 overflow-auto bg-gray-50">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                    <p className="text-2xl font-bold text-blue-600">3</p>
                  </div>
                  <Zap className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Records Processed</p>
                    <p className="text-2xl font-bold text-green-600">12.5K</p>
                  </div>
                  <Target className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Success Rate</p>
                    <p className="text-2xl font-bold text-teal-600">94%</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-teal-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg. Time</p>
                    <p className="text-2xl font-bold text-orange-600">2.3s</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="processors" className="space-y-6">
            <TabsList>
              <TabsTrigger value="processors">Processors</TabsTrigger>
              <TabsTrigger value="jobs">Running Jobs</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="processors" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Enrichment Processors</h2>
                <Button onClick={handleStartEnrichment} className="bg-teal-600 hover:bg-teal-700">
                  Start New Job
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {activeProcessors.map((processor) => (
                  <Card key={processor.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-teal-100 rounded-lg">
                            <processor.icon className="h-6 w-6 text-teal-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{processor.name}</CardTitle>
                            <CardDescription>{processor.description}</CardDescription>
                          </div>
                        </div>
                        <Switch
                          checked={processor.enabled}
                          onCheckedChange={() => handleToggleProcessor(processor.id, processor.enabled)}
                        />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Processing Capability</span>
                            <span>{processor.progress}%</span>
                          </div>
                          <Progress value={processor.progress} className="h-2" />
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium mb-2">Features:</p>
                          <div className="flex flex-wrap gap-2">
                            {processor.features.map((feature, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="jobs" className="space-y-6">
              <h2 className="text-xl font-semibold">Active Enrichment Jobs</h2>
              
              <div className="space-y-4">
                {enrichmentJobs.map((job) => (
                  <Card key={job.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold">{job.name}</h3>
                          <p className="text-sm text-gray-600">
                            {job.completed} / {job.records} records processed
                          </p>
                        </div>
                        <Badge variant={job.status === 'running' ? 'default' : 'secondary'}>
                          {job.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{job.progress}%</span>
                        </div>
                        <Progress value={job.progress} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Enrichment Settings</CardTitle>
                  <CardDescription>Configure data enrichment parameters</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">API Rate Limit (requests/minute)</label>
                    <Input type="number" defaultValue="100" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Timeout (seconds)</label>
                    <Input type="number" defaultValue="30" className="mt-1" />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Auto-retry failed enrichments</label>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
};

export default DataEnrichment;

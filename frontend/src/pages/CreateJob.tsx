import { useState, useContext } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { TopBar } from "@/components/TopBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Play, Save, Globe, Upload, Database, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createJob, runJob } from "@/lib/api";

const CreateJob = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [jobData, setJobData] = useState({
    name: "",
    dataSource: "website",
    url: "",
    selectors: "",
    enrichments: [],
    outputFormat: "csv",
    schedule: "manual",
    login: null
  });
  
  // Add state for login credentials
  const [loginCredentials, setLoginCredentials] = useState({
    usernameSelector: "",
    passwordSelector: "",
    submitSelector: "",
    username: "",
    password: ""
  });
  
  const [requiresLogin, setRequiresLogin] = useState(false);

  const steps = [
    { id: 1, title: "Data Source", description: "Choose where to get your data" },
    { id: 2, title: "Extraction Rules", description: "Define how to extract data" },
    { id: 3, title: "Enrichment", description: "Select enrichment options" },
    { id: 4, title: "Output & Schedule", description: "Configure output and scheduling" },
    { id: 5, title: "Review", description: "Review and create job" }
  ];

  const enrichmentOptions = [
    { id: "email", label: "Email Lookup", description: "Find email addresses" },
    { id: "company", label: "Company Info", description: "Get company details" },
    { id: "social", label: "Social Profiles", description: "Find social media profiles" },
    { id: "phone", label: "Phone Numbers", description: "Lookup phone numbers" }
  ];

  const handleNext = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleCreateJob = async () => {
    // Basic validation
    if (!jobData.name) {
      toast.error("Please enter a job name");
      return;
    }

    if (!jobData.dataSource) {
      toast.error("Please select a data source");
      return;
    }

    if (jobData.dataSource === "website" && !jobData.url) {
      toast.error("Please enter a valid URL");
      return;
    }
    
    // If login is required, validate login credentials
    if (requiresLogin) {
      if (!loginCredentials.usernameSelector || !loginCredentials.passwordSelector) {
        toast.error("Please enter both username and password selectors");
        return;
      }
      
      if (!loginCredentials.username || !loginCredentials.password) {
        toast.error("Please enter your username and password");
        return;
      }
    }

    try {
      setLoading(true);
      
      // Parse selectors if provided as a string
      let parsedJobData = {...jobData};
      
      if (jobData.dataSource === "website" && jobData.selectors) {
        try {
          // Try to parse as JSON if it looks like JSON
          if (jobData.selectors.trim().startsWith('{')) {
            parsedJobData.selectors = JSON.parse(jobData.selectors);
          }
        } catch (e) {
          console.warn("Failed to parse selectors as JSON, sending as string");
        }
      }
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error("You must be logged in to create a job");
        navigate("/login");
        return;
      }
      
      // Include login credentials in job data if required
      if (requiresLogin) {
        parsedJobData.login = {
          ...loginCredentials
        };
      }
      
      await createJob(parsedJobData, token);
      toast.success("Job created successfully!");
      navigate("/data-jobs");
    } catch (error) {
      console.error("Failed to create job:", error);
      toast.error(error.message || "Failed to create job");
    } finally {
      setLoading(false);
    }
  };

  const handleRunNow = async () => {
    // Basic validation
    if (!jobData.name) {
      toast.error("Please enter a job name");
      return;
    }

    if (!jobData.dataSource) {
      toast.error("Please select a data source");
      return;
    }

    if (jobData.dataSource === "website" && !jobData.url) {
      toast.error("Please enter a valid URL");
      return;
    }
    
    // If login is required, validate login credentials
    if (requiresLogin) {
      if (!loginCredentials.usernameSelector || !loginCredentials.passwordSelector) {
        toast.error("Please enter both username and password selectors");
        return;
      }
      
      if (!loginCredentials.username || !loginCredentials.password) {
        toast.error("Please enter your username and password");
        return;
      }
    }
    
    try {
      setLoading(true);
      
      // Parse selectors if provided as a string
      let parsedJobData = {...jobData};
      
      if (jobData.dataSource === "website" && jobData.selectors) {
        try {
          // Try to parse as JSON if it looks like JSON
          if (jobData.selectors.trim().startsWith('{')) {
            parsedJobData.selectors = JSON.parse(jobData.selectors);
          }
        } catch (e) {
          console.warn("Failed to parse selectors as JSON, sending as string");
        }
      }
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error("You must be logged in to create a job");
        navigate("/login");
        return;
      }
      
      // Include login credentials in job data if required
      if (requiresLogin) {
        parsedJobData.login = {
          ...loginCredentials
        };
      }
      
      // First create the job
      const response = await createJob(parsedJobData, token);
      
      // Then run it
      await runJob(response.job._id, token);
      
      toast.success("Job started running!");
      navigate("/data-jobs");
    } catch (error) {
      console.error("Failed to run job:", error);
      toast.error(error.message || "Failed to run job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AppSidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Create New Job" />
        
        <div className="flex-1 p-6 space-y-6 overflow-auto bg-gray-50">
          {/* Progress Steps */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      currentStep >= step.id ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {step.id}
                    </div>
                    <div className="ml-3">
                      <p className={`text-sm font-medium ${
                        currentStep >= step.id ? 'text-teal-600' : 'text-gray-500'
                      }`}>
                        {step.title}
                      </p>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-16 h-0.5 mx-4 ${
                        currentStep > step.id ? 'bg-teal-600' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </CardHeader>
          </Card>

          {/* Step Content */}
          <Card>
            <CardHeader>
              <CardTitle>{steps[currentStep - 1].title}</CardTitle>
              <CardDescription>{steps[currentStep - 1].description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="jobName">Job Name</Label>
                    <Input
                      id="jobName"
                      placeholder="Enter job name"
                      value={jobData.name}
                      onChange={(e) => setJobData({...jobData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Data Source Type</Label>
                    <div className="grid grid-cols-3 gap-4 mt-2">
                      {[
                        { id: "website", label: "Website", icon: Globe, desc: "Scrape from websites" },
                        { id: "api", label: "API", icon: Database, desc: "Connect to APIs" },
                        { id: "upload", label: "Upload", icon: Upload, desc: "Upload CSV/Excel files" }
                      ].map((source) => (
                        <Card 
                          key={source.id}
                          className={`cursor-pointer transition-colors ${
                            jobData.dataSource === source.id ? 'border-teal-600 bg-teal-50' : 'hover:bg-gray-50'
                          }`}
                          onClick={() => setJobData({...jobData, dataSource: source.id})}
                        >
                          <CardContent className="p-4 text-center">
                            <source.icon className="h-8 w-8 mx-auto mb-2 text-teal-600" />
                            <h3 className="font-medium">{source.label}</h3>
                            <p className="text-xs text-gray-500 mt-1">{source.desc}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                  {jobData.dataSource === "website" && (
                    <div>
                      <Label htmlFor="url">Website URL</Label>
                      <Input
                        id="url"
                        placeholder="https://example.com"
                        value={jobData.url}
                        onChange={(e) => setJobData({...jobData, url: e.target.value})}
                      />
                    </div>
                  )}
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="selectors">CSS Selectors</Label>
                    <Textarea
                      id="selectors"
                      placeholder="Enter CSS selectors for data extraction..."
                      value={jobData.selectors}
                      onChange={(e) => setJobData({...jobData, selectors: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Example Selectors</Label>
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <p><code>.name</code> - Extract names</p>
                        <p><code>.email</code> - Extract emails</p>
                        <p><code>.company</code> - Extract companies</p>
                      </div>
                    </div>
                    <div>
                      <Label>Format</Label>
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <p>Use JSON format:</p>
                        <p><code>{`{"titles": "h1", "prices": ".price"}`}</code></p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4 border-t pt-4">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="requires-login" 
                        checked={requiresLogin} 
                        onCheckedChange={setRequiresLogin} 
                      />
                      <Label htmlFor="requires-login">Site Requires Authentication</Label>
                    </div>
                    
                    {requiresLogin && (
                      <div className="space-y-4 p-4 border rounded-md bg-gray-50">
                        <h3 className="text-md font-medium">Login Information</h3>
                        
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <Label>Username/Email Selector</Label>
                            <Input
                              placeholder="CSS selector for username field (e.g. #username)"
                              value={loginCredentials.usernameSelector}
                              onChange={(e) => setLoginCredentials({
                                ...loginCredentials,
                                usernameSelector: e.target.value
                              })}
                            />
                          </div>
                          
                          <div>
                            <Label>Password Selector</Label>
                            <Input
                              placeholder="CSS selector for password field (e.g. #password)"
                              value={loginCredentials.passwordSelector}
                              onChange={(e) => setLoginCredentials({
                                ...loginCredentials,
                                passwordSelector: e.target.value
                              })}
                            />
                          </div>
                          
                          <div>
                            <Label>Submit Button Selector</Label>
                            <Input
                              placeholder="CSS selector for submit button (e.g. button[type='submit'])"
                              value={loginCredentials.submitSelector}
                              onChange={(e) => setLoginCredentials({
                                ...loginCredentials,
                                submitSelector: e.target.value
                              })}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div>
                            <Label>Username/Email</Label>
                            <Input
                              placeholder="Your username"
                              value={loginCredentials.username}
                              onChange={(e) => setLoginCredentials({
                                ...loginCredentials,
                                username: e.target.value
                              })}
                            />
                          </div>
                          
                          <div>
                            <Label>Password</Label>
                            <Input
                              type="password"
                              placeholder="Your password"
                              value={loginCredentials.password}
                              onChange={(e) => setLoginCredentials({
                                ...loginCredentials,
                                password: e.target.value
                              })}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <Label>Select Enrichment Options</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      {enrichmentOptions.map((option) => (
                        <Card key={option.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{option.label}</h4>
                              <p className="text-sm text-gray-500">{option.description}</p>
                            </div>
                            <Switch
                              checked={jobData.enrichments.includes(option.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setJobData({
                                    ...jobData,
                                    enrichments: [...jobData.enrichments, option.id]
                                  });
                                } else {
                                  setJobData({
                                    ...jobData,
                                    enrichments: jobData.enrichments.filter(e => e !== option.id)
                                  });
                                }
                              }}
                            />
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-4">
                  <div>
                    <Label>Output Format</Label>
                    <Select value={jobData.outputFormat} onValueChange={(value) => setJobData({...jobData, outputFormat: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Schedule</Label>
                    <Select value={jobData.schedule} onValueChange={(value) => setJobData({...jobData, schedule: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium mb-3">Job Configuration</h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Name:</span> {jobData.name}</p>
                        <p><span className="font-medium">Data Source:</span> {jobData.dataSource}</p>
                        {jobData.url && <p><span className="font-medium">URL:</span> {jobData.url}</p>}
                        <p><span className="font-medium">Output:</span> {jobData.outputFormat.toUpperCase()}</p>
                        <p><span className="font-medium">Schedule:</span> {jobData.schedule}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium mb-3">Enrichments</h3>
                      <div className="space-y-1">
                        {jobData.enrichments.length > 0 ? (
                          jobData.enrichments.map(e => (
                            <Badge key={e} variant="secondary">
                              {enrichmentOptions.find(opt => opt.id === e)?.label}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">No enrichments selected</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label>Login Requirements</Label>
                    <div className="mt-2">
                      <Switch
                        checked={requiresLogin}
                        onCheckedChange={setRequiresLogin}
                      />
                    </div>
                    {requiresLogin && (
                      <div className="mt-4 p-4 bg-gray-100 rounded">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="usernameSelector">Username Selector</Label>
                            <Input
                              id="usernameSelector"
                              placeholder="Enter username selector"
                              value={loginCredentials.usernameSelector}
                              onChange={(e) => setLoginCredentials({...loginCredentials, usernameSelector: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="passwordSelector">Password Selector</Label>
                            <Input
                              id="passwordSelector"
                              placeholder="Enter password selector"
                              value={loginCredentials.passwordSelector}
                              onChange={(e) => setLoginCredentials({...loginCredentials, passwordSelector: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="submitSelector">Submit Selector</Label>
                            <Input
                              id="submitSelector"
                              placeholder="Enter submit button selector"
                              value={loginCredentials.submitSelector}
                              onChange={(e) => setLoginCredentials({...loginCredentials, submitSelector: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="mt-4">
                          <Label htmlFor="username">Username</Label>
                          <Input
                            id="username"
                            placeholder="Enter your username"
                            value={loginCredentials.username}
                            onChange={(e) => setLoginCredentials({...loginCredentials, username: e.target.value})}
                          />
                        </div>
                        <div className="mt-4">
                          <Label htmlFor="password">Password</Label>
                          <Input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            value={loginCredentials.password}
                            onChange={(e) => setLoginCredentials({...loginCredentials, password: e.target.value})}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <div className="space-x-2">
              {currentStep === 5 ? (
                <>
                  <Button 
                    variant="outline" 
                    onClick={handleCreateJob}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Job
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={handleRunNow} 
                    className="bg-teal-600 hover:bg-teal-700"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Starting...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Save & Run Now
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={handleNext} 
                  className="bg-navy-800 hover:bg-navy-700"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default CreateJob;

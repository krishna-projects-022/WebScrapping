
import { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { TopBar } from "@/components/TopBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Plus, Play, Settings, Trash2, ArrowRight, Download, Upload, Database, Mail, Building, User } from "lucide-react";
import { toast } from "sonner";

const Enrichment = () => {
  const navigate = useNavigate();
  const [pipelines, setPipelines] = useState([
    {
      id: 1,
      name: "Lead Enrichment Pipeline",
      status: "active",
      lastRun: "2 hours ago",
      steps: ["Extract", "Email Lookup", "Company Info", "Export"]
    },
    {
      id: 2,
      name: "Contact Enhancement",
      status: "draft",
      lastRun: "Never",
      steps: ["Upload", "Phone Lookup", "Social Profiles", "CRM Push"]
    }
  ]);

  const pipelineBlocks = [
    { id: "extract", label: "Extract Data", icon: Download, color: "bg-blue-500" },
    { id: "upload", label: "Upload Data", icon: Upload, color: "bg-green-500" },
    { id: "email", label: "Email Lookup", icon: Mail, color: "bg-orange-500" },
    { id: "company", label: "Company Info", icon: Building, color: "bg-purple-500" },
    { id: "profile", label: "Profile Match", icon: User, color: "bg-pink-500" },
    { id: "export", label: "Export Data", icon: Database, color: "bg-teal-500" }
  ];

  const [selectedPipeline, setSelectedPipeline] = useState(null);
  const [isBuilding, setIsBuilding] = useState(false);

  const handleCreatePipeline = () => {
    setIsBuilding(true);
    setSelectedPipeline(null);
  };

  const handleRunPipeline = (pipelineId) => {
    toast.success("Pipeline started running!");
  };

  const handleDeletePipeline = (pipelineId) => {
    setPipelines(pipelines.filter(p => p.id !== pipelineId));
    toast.success("Pipeline deleted successfully!");
  };

  return (
    <>
      <AppSidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Enrichment Pipelines" />
        
        <div className="flex-1 p-6 space-y-6 overflow-auto bg-gray-50">
          {/* Header Actions */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-navy-800">Pipeline Builder</h2>
              <p className="text-gray-600">Create visual data enrichment workflows</p>
            </div>
            <Button 
              onClick={handleCreatePipeline}
              className="bg-teal-600 hover:bg-teal-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Pipeline
            </Button>
          </div>

          {isBuilding ? (
            /* Pipeline Builder */
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Building Blocks */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Building Blocks</CardTitle>
                  <CardDescription>Drag blocks to build your pipeline</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pipelineBlocks.map((block) => (
                    <div
                      key={block.id}
                      className="flex items-center p-3 border rounded-lg cursor-move hover:bg-gray-50"
                      draggable
                    >
                      <div className={`p-2 rounded ${block.color} text-white mr-3`}>
                        <block.icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium">{block.label}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Pipeline Canvas */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Pipeline Canvas</CardTitle>
                  <CardDescription>Drop blocks here to create your workflow</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="min-h-96 border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center">
                    <div className="text-center">
                      <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 mb-2">Drag blocks here to build your pipeline</p>
                      <p className="text-sm text-gray-400">Start with an input block (Extract or Upload)</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={() => setIsBuilding(false)}>
                      Cancel
                    </Button>
                    <div className="space-x-2">
                      <Button variant="outline">
                        Save Draft
                      </Button>
                      <Button className="bg-teal-600 hover:bg-teal-700">
                        Save & Activate
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Configuration Panel */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Configuration</CardTitle>
                  <CardDescription>Configure selected block</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-gray-500 py-8">
                    <Settings className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">Select a block to configure</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* Pipelines List */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {pipelines.map((pipeline) => (
                <Card key={pipeline.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{pipeline.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge 
                            variant={pipeline.status === 'active' ? 'default' : 'secondary'}
                          >
                            {pipeline.status}
                          </Badge>
                          <span className="text-sm text-gray-500">Last run: {pipeline.lastRun}</span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeletePipeline(pipeline.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Pipeline Steps Visualization */}
                    <div className="flex items-center space-x-2 mb-4">
                      {pipeline.steps.map((step, index) => (
                        <div key={index} className="flex items-center">
                          <div className="px-3 py-1 bg-teal-100 text-teal-800 rounded text-sm">
                            {step}
                          </div>
                          {index < pipeline.steps.length - 1 && (
                            <ArrowRight className="h-4 w-4 text-gray-400 mx-1" />
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-between">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedPipeline(pipeline)}
                      >
                        Edit Pipeline
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-teal-600 hover:bg-teal-700"
                        onClick={() => handleRunPipeline(pipeline.id)}
                        disabled={pipeline.status === 'draft'}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Run Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* Empty State */}
              {pipelines.length === 0 && (
                <Card className="lg:col-span-2 p-12 text-center">
                  <CardContent>
                    <Database className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <CardTitle className="mb-2">No Pipelines Yet</CardTitle>
                    <CardDescription className="mb-6">
                      Create your first enrichment pipeline to automate data processing
                    </CardDescription>
                    <Button 
                      onClick={handleCreatePipeline}
                      className="bg-teal-600 hover:bg-teal-700"
                    >
                      Create Your First Pipeline
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default Enrichment;

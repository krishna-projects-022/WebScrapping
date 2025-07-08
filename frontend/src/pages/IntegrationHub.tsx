import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { TopBar } from "@/components/TopBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Database, FileText, Mail, Webhook, Settings, Plus, Download, Trash } from "lucide-react";
import { toast } from "sonner";
import { getConnectors, createConnector, updateConnector, deleteConnector, testConnector } from "@/lib/connectorApi";

const IntegrationHub = () => {
  const [customOutputs, setCustomOutputs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newOutput, setNewOutput] = useState({
    name: "",
    type: "json",
    description: "",
    logic: "",
    configField: ""
  });
  const [editOutput, setEditOutput] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', type: '', description: '', logic: '', configField: '' });
  const [showEditModal, setShowEditModal] = useState(false);

  // Fetch connectors from backend
  useEffect(() => {
    fetchConnectors();
  }, []);

  const fetchConnectors = async () => {
    setLoading(true);
    try {
      const connectors = await getConnectors();
      setCustomOutputs(connectors);
    } catch (e) {
      toast.error("Failed to fetch connectors");
    }
    setLoading(false);
  };

  const handleToggleOutput = async (outputId, currentStatus) => {
    const connector = customOutputs.find(o => o._id === outputId);
    if (!connector) return;
    try {
      await updateConnector(outputId, { ...connector, enabled: !currentStatus });
      fetchConnectors();
      toast.success(`Output logic ${currentStatus ? 'disabled' : 'enabled'}!`);
    } catch {
      toast.error('Failed to update connector');
    }
  };

  const handleCreateOutput = async () => {
    if (!newOutput.name || !newOutput.logic) {
      toast.error("Please fill in name and logic");
      return;
    }
    let config: any = { logic: newOutput.logic };
    if (newOutput.type === 'crm') config.apiKey = newOutput.configField;
    if (newOutput.type === 'spreadsheet') config.sheetUrl = newOutput.configField;
    if (newOutput.type === 'webhook') config.webhookUrl = newOutput.configField;
    if (newOutput.type === 'email') config.email = newOutput.configField;
    if (newOutput.type === 'database') config.connectionString = newOutput.configField;
    try {
      await createConnector({ ...newOutput, config, enabled: true });
      setNewOutput({ name: "", type: "json", description: "", logic: "", configField: "" });
      fetchConnectors();
      toast.success("Custom output logic created!");
    } catch {
      toast.error('Failed to create connector');
    }
  };

  const handleDeleteOutput = async (outputId) => {
    try {
      await deleteConnector(outputId);
      fetchConnectors();
      toast.success('Connector deleted');
    } catch {
      toast.error('Failed to delete connector');
    }
  };

  const handleTestOutput = async (outputId) => {
    try {
      await testConnector(outputId);
      toast.success("Output logic test completed successfully!");
    } catch {
      toast.error('Failed to test connector');
    }
  };

  const openEditModal = (output) => {
    setEditOutput(output);
    setEditForm({
      name: output.name,
      type: output.type,
      description: output.description,
      logic: output.config?.logic || '',
      configField: output.config?.apiKey || output.config?.sheetUrl || output.config?.webhookUrl || output.config?.email || output.config?.connectionString || ''
    });
    setShowEditModal(true);
  };

  const handleEditFormChange = (field, value) => {
    setEditForm({ ...editForm, [field]: value });
  };

  const handleSaveEdit = async () => {
    if (!editForm.name || !editForm.logic) {
      toast.error('Please fill in name and logic');
      return;
    }
    let config: any = { logic: editForm.logic };
    if (editForm.type === 'crm') config.apiKey = editForm.configField;
    if (editForm.type === 'spreadsheet') config.sheetUrl = editForm.configField;
    if (editForm.type === 'webhook') config.webhookUrl = editForm.configField;
    if (editForm.type === 'email') config.email = editForm.configField;
    if (editForm.type === 'database') config.connectionString = editForm.configField;
    try {
      await updateConnector(editOutput._id, {
        name: editForm.name,
        type: editForm.type,
        description: editForm.description,
        config,
        enabled: editOutput.enabled
      });
      setShowEditModal(false);
      fetchConnectors();
      toast.success('Connector updated!');
    } catch {
      toast.error('Failed to update connector');
    }
  };

  const outputTypes = [
    { value: "json", label: "JSON Transform", icon: Code },
    { value: "csv", label: "CSV Export", icon: FileText },
    { value: "webhook", label: "Webhook", icon: Webhook },
    { value: "email", label: "Email Logic", icon: Mail },
    { value: "database", label: "Database Insert", icon: Database }
  ];

  return (
    <>
      <AppSidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Integration Hub" />
        
        <div className="flex-1 p-6 space-y-6 overflow-auto bg-gray-50">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Custom Outputs</p>
                    <p className="text-2xl font-bold text-blue-600">{customOutputs.length}</p>
                  </div>
                  <Code className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Logic</p>
                    <p className="text-2xl font-bold text-green-600">
                      {customOutputs.filter(o => o.enabled).length}
                    </p>
                  </div>
                  <Settings className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Executions Today</p>
                    <p className="text-2xl font-bold text-teal-600">156</p>
                  </div>
                  <Webhook className="h-8 w-8 text-teal-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Success Rate</p>
                    <p className="text-2xl font-bold text-orange-600">98%</p>
                  </div>
                  <Download className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="outputs" className="space-y-6">
            <TabsList>
              <TabsTrigger value="outputs">Custom Outputs</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="create">Create Logic</TabsTrigger>
            </TabsList>

            <TabsContent value="outputs" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Custom Output Logic</h2>
                <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleCreateOutput}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Output
                </Button>
              </div>

              <div className="space-y-4">
                {customOutputs.map((output) => {
                  const outputType = outputTypes.find(t => t.value === output.type);
                  const IconComponent = outputType?.icon;
                  
                  return (
                    <Card key={output._id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              {IconComponent && (
                                <IconComponent className="h-5 w-5 text-blue-600" />
                              )}
                            </div>
                            <div>
                              <CardTitle className="text-lg">{output.name}</CardTitle>
                              <CardDescription>{output.description}</CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={output.enabled ? 'default' : 'secondary'}>
                              {output.enabled ? 'Active' : 'Inactive'}
                            </Badge>
                            <Switch
                              checked={output.enabled}
                              onCheckedChange={() => handleToggleOutput(output._id, output.enabled)}
                            />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700">Logic Code:</label>
                            <pre className="mt-2 p-3 bg-gray-100 rounded text-sm overflow-x-auto">
                              <code>{output.config?.logic}</code>
                            </pre>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleTestOutput(output._id)}
                            >
                              Test Logic
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => openEditModal(output)}>
                              <Settings className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteOutput(output._id)}>
                              <Trash className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="templates" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Output Logic Templates</CardTitle>
                  <CardDescription>Pre-built templates for common output scenarios</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {outputTypes.map((type) => (
                      <Card key={type.value} className="p-4 hover:bg-gray-50 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-teal-100 rounded">
                            <type.icon className="h-5 w-5 text-teal-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">{type.label}</h3>
                            <p className="text-sm text-gray-600">
                              {type.value === 'json' && 'Transform data to custom JSON format'}
                              {type.value === 'csv' && 'Export data in CSV format with custom columns'}
                              {type.value === 'webhook' && 'Send data to external webhooks'}
                              {type.value === 'email' && 'Send email notifications with custom logic'}
                              {type.value === 'database' && 'Insert data into external databases'}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="create" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Create Custom Output Logic</CardTitle>
                  <CardDescription>Build your own data transformation and output logic</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Output Name</label>
                      <Input
                        placeholder="Enter output name"
                        value={newOutput.name}
                        onChange={(e) => setNewOutput({...newOutput, name: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Output Type</label>
                      <select 
                        className="w-full p-2 border rounded"
                        value={newOutput.type}
                        onChange={(e) => setNewOutput({...newOutput, type: e.target.value})}
                      >
                        {outputTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Input
                      placeholder="Describe what this output logic does"
                      value={newOutput.description}
                      onChange={(e) => setNewOutput({...newOutput, description: e.target.value})}
                    />
                  </div>
                  
                  {/* Type-specific config field for creation */}
                  {newOutput.type === 'crm' && (
                    <Input placeholder="API Key" value={newOutput.configField || ''} onChange={e => setNewOutput({...newOutput, configField: e.target.value})} />
                  )}
                  {newOutput.type === 'spreadsheet' && (
                    <Input placeholder="Sheet URL" value={newOutput.configField || ''} onChange={e => setNewOutput({...newOutput, configField: e.target.value})} />
                  )}
                  {newOutput.type === 'webhook' && (
                    <Input placeholder="Webhook URL" value={newOutput.configField || ''} onChange={e => setNewOutput({...newOutput, configField: e.target.value})} />
                  )}
                  {newOutput.type === 'email' && (
                    <Input placeholder="Email Address" value={newOutput.configField || ''} onChange={e => setNewOutput({...newOutput, configField: e.target.value})} />
                  )}
                  {newOutput.type === 'database' && (
                    <Input placeholder="Connection String" value={newOutput.configField || ''} onChange={e => setNewOutput({...newOutput, configField: e.target.value})} />
                  )}
                  
                  <div>
                    <label className="text-sm font-medium">Logic Code</label>
                    <Textarea
                      placeholder="Enter your custom logic code..."
                      rows={8}
                      value={newOutput.logic}
                      onChange={(e) => setNewOutput({...newOutput, logic: e.target.value})}
                      className="font-mono text-sm"
                    />
                  </div>
                  
                  <Button onClick={handleCreateOutput} className="w-full bg-teal-600 hover:bg-teal-700">
                    Create Output Logic
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Edit Connector</h2>
            <div className="space-y-3">
              <Input
                placeholder="Name"
                value={editForm.name}
                onChange={e => handleEditFormChange('name', e.target.value)}
              />
              <select
                className="w-full p-2 border rounded"
                value={editForm.type}
                onChange={e => handleEditFormChange('type', e.target.value)}
              >
                {outputTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              <Input
                placeholder="Description"
                value={editForm.description}
                onChange={e => handleEditFormChange('description', e.target.value)}
              />
              {/* Type-specific config field */}
              {editForm.type === 'crm' && (
                <Input placeholder="API Key" value={editForm.configField} onChange={e => handleEditFormChange('configField', e.target.value)} />
              )}
              {editForm.type === 'spreadsheet' && (
                <Input placeholder="Sheet URL" value={editForm.configField} onChange={e => handleEditFormChange('configField', e.target.value)} />
              )}
              {editForm.type === 'webhook' && (
                <Input placeholder="Webhook URL" value={editForm.configField} onChange={e => handleEditFormChange('configField', e.target.value)} />
              )}
              {editForm.type === 'email' && (
                <Input placeholder="Email Address" value={editForm.configField} onChange={e => handleEditFormChange('configField', e.target.value)} />
              )}
              {editForm.type === 'database' && (
                <Input placeholder="Connection String" value={editForm.configField} onChange={e => handleEditFormChange('configField', e.target.value)} />
              )}
              <Textarea
                placeholder="Logic Code"
                rows={6}
                value={editForm.logic}
                onChange={e => handleEditFormChange('logic', e.target.value)}
                className="font-mono text-sm"
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
              <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleSaveEdit}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default IntegrationHub;

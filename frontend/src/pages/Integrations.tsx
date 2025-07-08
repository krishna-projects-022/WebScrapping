import { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { TopBar } from "@/components/TopBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Settings, Plus, CheckCircle, XCircle, Link } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Integrations = () => {
  const [integrations, setIntegrations] = useState([
    {
      id: "salesforce",
      name: "Salesforce",
      description: "Sync data with Salesforce CRM",
      logo: "🏢",
      connected: true,
      lastSync: "2 hours ago",
      category: "CRM"
    },
    {
      id: "hubspot",
      name: "HubSpot",
      description: "Connect to HubSpot for lead management",
      logo: "🎯",
      connected: false,
      lastSync: "Never",
      category: "CRM"
    },
    {
      id: "sheets",
      name: "Google Sheets",
      description: "Export data to Google Sheets",
      logo: "📊",
      connected: true,
      lastSync: "1 hour ago",
      category: "Storage"
    },
    {
      id: "slack",
      name: "Slack",
      description: "Get notifications in Slack",
      logo: "💬",
      connected: false,
      lastSync: "Never",
      category: "Communication"
    },
    {
      id: "webhook",
      name: "Webhooks",
      description: "Send data to custom endpoints",
      logo: "🔗",
      connected: true,
      lastSync: "30 minutes ago",
      category: "Custom"
    },
    {
      id: "zapier",
      name: "Zapier",
      description: "Connect to 5000+ apps via Zapier",
      logo: "⚡",
      connected: false,
      lastSync: "Never",
      category: "Automation"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const navigate = useNavigate();

  const categories = ["all", "CRM", "Storage", "Communication", "Custom", "Automation"];

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || integration.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleToggleConnection = (integrationId, currentStatus) => {
    setIntegrations(integrations.map(integration => 
      integration.id === integrationId 
        ? { 
            ...integration, 
            connected: !currentStatus,
            lastSync: !currentStatus ? "Just now" : "Never"
          }
        : integration
    ));
    
    const action = currentStatus ? "disconnected from" : "connected to";
    const integration = integrations.find(i => i.id === integrationId);
    toast.success(`Successfully ${action} ${integration.name}!`);
  };

  const connectedCount = integrations.filter(i => i.connected).length;

  return (
    <>
      <AppSidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Integrations" />
        
        <div className="flex-1 p-6 space-y-6 overflow-auto bg-gray-50">
          {/* Header Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Connected</p>
                    <p className="text-2xl font-bold text-green-600">{connectedCount}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Available</p>
                    <p className="text-2xl font-bold text-blue-600">{integrations.length - connectedCount}</p>
                  </div>
                  <Plus className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Available</p>
                    <p className="text-2xl font-bold text-navy-800">{integrations.length}</p>
                  </div>
                  <Link className="h-8 w-8 text-navy-800" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search integrations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category === "all" ? "All" : category}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Integrations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIntegrations.map((integration) => (
              <Card key={integration.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{integration.logo}</div>
                      <div>
                        <CardTitle className="text-lg">{integration.name}</CardTitle>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {integration.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {integration.connected ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    {integration.description}
                  </CardDescription>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-gray-500">
                      Last sync: {integration.lastSync}
                    </div>
                    <Badge 
                      variant={integration.connected ? "default" : "secondary"}
                    >
                      {integration.connected ? "Connected" : "Available"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={integration.connected}
                        onCheckedChange={() => handleToggleConnection(integration.id, integration.connected)}
                      />
                      <span className="text-sm">
                        {integration.connected ? "Disconnect" : "Connect"}
                      </span>
                    </div>
                    
                    {integration.connected && integration.id === 'salesforce' ? (
                      <Button size="sm" variant="outline" onClick={() => navigate('/salesforce-config')}>
                        <Settings className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                    ) : integration.connected && integration.id === 'hubspot' ? (
                      <Button size="sm" variant="outline" onClick={() => navigate('/hubspot-config')}>
                        <Settings className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                    ) : integration.connected && integration.id === 'sheets' ? (
                      <Button size="sm" variant="outline" onClick={() => navigate('/sheets-config')}>
                        <Settings className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                    ) : integration.connected ? (
                      <Button size="sm" variant="outline">
                        <Settings className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                    ) : integration.id === 'salesforce' ? (
                      <Button size="sm" variant="outline" onClick={() => window.open('http://localhost:5000/api/integrations/salesforce/auth', '_blank')}>
                        Connect
                      </Button>
                    ) : integration.id === 'hubspot' ? (
                      <Button size="sm" variant="outline" onClick={() => navigate('/hubspot-config')}>
                        Connect
                      </Button>
                    ) : integration.id === 'sheets' ? (
                      <Button size="sm" variant="outline" onClick={() => navigate('/sheets-config')}>
                        Connect
                      </Button>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {filteredIntegrations.length === 0 && (
            <Card className="p-12 text-center">
              <CardContent>
                <Link className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <CardTitle className="mb-2">No Integrations Found</CardTitle>
                <CardDescription>
                  Try adjusting your search or filter criteria
                </CardDescription>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </>
  );
};

export default Integrations;

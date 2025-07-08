import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { TopBar } from "@/components/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const SalesforceConfig = () => {
  const [status, setStatus] = useState("Checking connection...");
  const [connected, setConnected] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // TODO: Replace with real API call to check Salesforce connection status
    // Example: fetch('/api/integrations/salesforce/status')
    setTimeout(() => {
      setConnected(false); // Set to true if already connected
      setStatus("Not connected to Salesforce");
    }, 500);
  }, []);

  const handleConnect = () => {
    window.open("http://localhost:5000/api/integrations/salesforce/auth", "_blank");
  };

  return (
    <>
      <AppSidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Salesforce Configuration" />
        <div className="flex-1 p-6 space-y-6 overflow-auto bg-gray-50">
          <Card className="max-w-xl mx-auto">
            <CardHeader>
              <CardTitle>Salesforce Integration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-lg font-medium">{status}</div>
              {!connected && (
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleConnect}>
                  Connect to Salesforce
                </Button>
              )}
              {connected && (
                <div className="text-green-600 font-semibold">Connected!</div>
              )}
              <Button variant="outline" onClick={() => navigate('/integrations')}>
                Back to Integrations
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
};

export default SalesforceConfig;

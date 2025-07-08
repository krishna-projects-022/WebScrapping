import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { TopBar } from "@/components/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const HubspotConfig = () => {
  const [status, setStatus] = useState("Checking connection...");
  const [connected, setConnected] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/integrations/hubspot/status")
      .then((res) => res.json())
      .then((data) => {
        setConnected(data.connected);
        setStatus(data.connected ? "Connected to HubSpot" : "Not connected to HubSpot");
      })
      .catch(() => {
        setConnected(false);
        setStatus("Error checking HubSpot connection");
      });
  }, []);

  const handleConnect = () => {
    window.open("http://localhost:5000/api/integrations/hubspot/auth", "_blank");
  };

  return (
    <>
      <AppSidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="HubSpot Configuration" />
        <div className="flex-1 p-6 space-y-6 overflow-auto bg-gray-50">
          <Card className="max-w-xl mx-auto">
            <CardHeader>
              <CardTitle>HubSpot Integration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-lg font-medium">{status}</div>
              {!connected && (
                <Button className="bg-orange-600 hover:bg-orange-700" onClick={handleConnect}>
                  Connect to HubSpot
                </Button>
              )}
              {connected && (
                <div className="text-green-600 font-semibold">Connected!</div>
              )}
              <Button variant="outline" onClick={() => navigate("/integrations")}>Back to Integrations</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
};

export default HubspotConfig;

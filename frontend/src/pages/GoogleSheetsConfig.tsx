import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { TopBar } from "@/components/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const GoogleSheetsConfig = () => {
  const [status, setStatus] = useState("Checking connection...");
  const [connected, setConnected] = useState(false);
  const [spreadsheetId, setSpreadsheetId] = useState("");
  const [range, setRange] = useState("Sheet1!A1");
  const [values, setValues] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/integrations/sheets/status")
      .then((res) => res.json())
      .then((data) => {
        setConnected(data.connected);
        setStatus(data.connected ? "Connected to Google Sheets" : "Not connected to Google Sheets");
      })
      .catch(() => {
        setConnected(false);
        setStatus("Error checking Google Sheets connection");
      });
  }, []);

  const handleSend = async () => {
    setSending(true);
    setResult(null);
    try {
      const res = await fetch("/api/integrations/sheets/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spreadsheetId, range, values: values.split(",") }),
      });
      let data;
      let text;
      try {
        data = await res.json();
      } catch (jsonErr) {
        // Only try to read text if json failed and not already read
        text = text || await res.clone().text();
        setResult({ error: `Invalid JSON response: ${text}` });
        setSending(false);
        return;
      }
      setResult(data);
    } catch (err) {
      setResult({ error: err.message });
    }
    setSending(false);
  };

  return (
    <>
      <AppSidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Google Sheets Configuration" />
        <div className="flex-1 p-6 space-y-6 overflow-auto bg-gray-50">
          <Card className="max-w-xl mx-auto">
            <CardHeader>
              <CardTitle>Google Sheets Integration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-lg font-medium">{status}</div>
              <div className="space-y-2">
                <Input
                  placeholder="Spreadsheet ID"
                  value={spreadsheetId}
                  onChange={e => setSpreadsheetId(e.target.value)}
                  disabled={sending}
                />
                <Input
                  placeholder="Range (e.g. Sheet1!A1)"
                  value={range}
                  onChange={e => setRange(e.target.value)}
                  disabled={sending}
                />
                <textarea
                  className="w-full border rounded p-2 text-sm"
                  placeholder="Comma-separated values (e.g. John,Smith,30)"
                  value={values}
                  onChange={e => setValues(e.target.value)}
                  rows={3}
                  disabled={sending}
                />
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={handleSend}
                  disabled={sending || !spreadsheetId || !range || !values}
                >
                  {sending ? "Sending..." : "Send Data to Sheet"}
                </Button>
                {result && (
                  <pre className="bg-gray-100 p-2 rounded text-xs mt-2 overflow-x-auto max-h-40">{JSON.stringify(result, null, 2)}</pre>
                )}
              </div>
              <Button variant="outline" onClick={() => navigate("/integrations")}>Back to Integrations</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
};

export default GoogleSheetsConfig;

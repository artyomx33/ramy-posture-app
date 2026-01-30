"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Camera, UserPlus, Activity, FileText, ChevronRight, ChevronLeft, Check, AlertCircle, RotateCcw, Download, Sparkles } from "lucide-react";

// Types
interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
  createdAt: string;
}

interface Photo {
  type: "front" | "back" | "left" | "right";
  url: string | null;
  file: File | null;
  status: "empty" | "uploading" | "uploaded" | "analyzing" | "analyzed";
}

interface AnalysisResult {
  type: string;
  finding: string;
  severity: "normal" | "mild" | "moderate" | "severe";
  measurement?: string;
}

interface Session {
  id: string;
  clientId: string;
  clientName: string;
  createdAt: string;
  status: "in_progress" | "analyzed" | "completed";
  photos: Photo[];
  analysis: AnalysisResult[];
  recommendations: string[];
}

// Mock data
const mockClients: Client[] = [
  { id: "1", name: "Sarah Mitchell", email: "sarah@email.com", phone: "+1 555-0123", notes: "Lower back pain, desk worker", createdAt: "2025-01-15" },
  { id: "2", name: "James Chen", email: "james@email.com", phone: "+1 555-0124", notes: "Neck stiffness from sports", createdAt: "2025-01-20" },
  { id: "3", name: "Maria Rodriguez", email: "maria@email.com", phone: "+1 555-0125", notes: "Post-surgery rehabilitation", createdAt: "2025-01-25" },
];

const mockSessions: Session[] = [
  {
    id: "s1",
    clientId: "1",
    clientName: "Sarah Mitchell",
    createdAt: "2025-01-28",
    status: "completed",
    photos: [
      { type: "front", url: null, file: null, status: "analyzed" },
      { type: "back", url: null, file: null, status: "analyzed" },
      { type: "left", url: null, file: null, status: "analyzed" },
      { type: "right", url: null, file: null, status: "analyzed" },
    ],
    analysis: [
      { type: "Shoulders", finding: "Left shoulder 2.3cm lower than right", severity: "moderate", measurement: "-2.3cm" },
      { type: "Head Position", finding: "Forward head posture detected", severity: "mild", measurement: "+1.2cm" },
      { type: "Hips", finding: "Hips level and aligned", severity: "normal" },
    ],
    recommendations: [
      "Upper back strengthening exercises",
      "Neck traction therapy",
      "Postural correction training",
    ],
  },
];

export default function Home() {
  // State
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [sessions, setSessions] = useState<Session[]>(mockSessions);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [activeTab, setActiveTab] = useState("clients");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showNewClientDialog, setShowNewClientDialog] = useState(false);
  const [newClient, setNewClient] = useState({ name: "", email: "", phone: "", notes: "" });

  // Photo upload state
  const [photos, setPhotos] = useState<Photo[]>([
    { type: "front", url: null, file: null, status: "empty" },
    { type: "back", url: null, file: null, status: "empty" },
    { type: "left", url: null, file: null, status: "empty" },
    { type: "right", url: null, file: null, status: "empty" },
  ]);

  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  // Handlers
  const handleCreateClient = () => {
    if (!newClient.name) return;
    const client: Client = {
      id: Date.now().toString(),
      ...newClient,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setClients([...clients, client]);
    setNewClient({ name: "", email: "", phone: "", notes: "" });
    setShowNewClientDialog(false);
    setSelectedClient(client);
  };

  const handleStartSession = (client: Client) => {
    const session: Session = {
      id: Date.now().toString(),
      clientId: client.id,
      clientName: client.name,
      createdAt: new Date().toISOString(),
      status: "in_progress",
      photos: [
        { type: "front", url: null, file: null, status: "empty" },
        { type: "back", url: null, file: null, status: "empty" },
        { type: "left", url: null, file: null, status: "empty" },
        { type: "right", url: null, file: null, status: "empty" },
      ],
      analysis: [],
      recommendations: [],
    };
    setCurrentSession(session);
    setPhotos(session.photos);
    setAnalysisResults([]);
    setRecommendations([]);
    setActiveTab("session");
  };

  const handlePhotoUpload = (type: "front" | "back" | "left" | "right", file: File) => {
    const url = URL.createObjectURL(file);
    setPhotos((prev) =>
      prev.map((p) =>
        p.type === type ? { ...p, url, file, status: "uploaded" } : p
      )
    );
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    // Simulate AI analysis
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    const mockAnalysis: AnalysisResult[] = [
      { type: "Shoulders", finding: "Left shoulder 2.5cm lower than right", severity: "moderate", measurement: "-2.5cm" },
      { type: "Head Position", finding: "Forward head posture detected", severity: "mild", measurement: "+3.1cm" },
      { type: "Hips", finding: "Right hip rotated 5° anteriorly", severity: "mild", measurement: "5°" },
      { type: "Spine", finding: "Thoracic kyphosis within normal range", severity: "normal" },
    ];
    
    const mockRecommendations = [
      "Upper trapezius stretching and strengthening",
      "Deep neck flexor exercises",
      "Hip rotator stretches",
      "Postural awareness training",
    ];
    
    setAnalysisResults(mockAnalysis);
    setRecommendations(mockRecommendations);
    setIsAnalyzing(false);
  };

  const allPhotosUploaded = photos.every((p) => p.status !== "empty");

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "normal": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "mild": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "moderate": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "severe": return "bg-red-500/20 text-red-400 border-red-500/30";
      default: return "bg-slate-500/20 text-slate-400";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "normal": return <Check className="w-4 h-4" />;
      case "mild": return <AlertCircle className="w-4 h-4" />;
      case "moderate": return <AlertCircle className="w-4 h-4" />;
      case "severe": return <AlertCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Posture Diagnostics
              </h1>
              <p className="text-xs text-slate-400">Ramy's Therapy Clinic</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
              <TabsList className="bg-slate-800/50 border border-slate-700">
                <TabsTrigger value="clients" className="data-[state=active]:bg-slate-700">
                  Clients
                </TabsTrigger>
                <TabsTrigger value="sessions" className="data-[state=active]:bg-slate-700">
                  Sessions
                </TabsTrigger>
                <TabsTrigger value="session" disabled={!currentSession} className="data-[state=active]:bg-slate-700">
                  Current Session
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Clients Tab */}
          <TabsContent value="clients" className="mt-0">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Clients</h2>
              <Dialog open={showNewClientDialog} onOpenChange={setShowNewClientDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-cyan-600 hover:bg-cyan-700">
                    <UserPlus className="w-4 h-4 mr-2" />
                    New Client
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-900 border-slate-700 text-slate-100">
                  <DialogHeader>
                    <DialogTitle>Add New Client</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={newClient.name}
                        onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                        className="bg-slate-800 border-slate-700"
                        placeholder="Full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newClient.email}
                        onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                        className="bg-slate-800 border-slate-700"
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={newClient.phone}
                        onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                        className="bg-slate-800 border-slate-700"
                        placeholder="+1 555-0123"
                      />
                    </div>
                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        value={newClient.notes}
                        onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
                        className="bg-slate-800 border-slate-700"
                        placeholder="Medical history, concerns, etc."
                      />
                    </div>
                    <Button onClick={handleCreateClient} className="w-full bg-cyan-600 hover:bg-cyan-700">
                      Create Client
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clients.map((client) => (
                <Card key={client.id} className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{client.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {client.email && (
                      <p className="text-sm text-slate-400">{client.email}</p>
                    )}
                    {client.phone && (
                      <p className="text-sm text-slate-400">{client.phone}</p>
                    )}
                    {client.notes && (
                      <p className="text-sm text-slate-500 line-clamp-2">{client.notes}</p>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-slate-700 hover:bg-slate-800"
                        onClick={() => handleStartSession(client)}
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        New Session
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions" className="mt-0">
            <h2 className="text-2xl font-semibold mb-6">Past Sessions</h2>
            <div className="space-y-4">
              {sessions.map((session) => (
                <Card key={session.id} className="bg-slate-900 border-slate-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center">
                          <FileText className="w-6 h-6 text-slate-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{session.clientName}</h3>
                          <p className="text-sm text-slate-400">
                            {new Date(session.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="border-slate-700">
                          {session.analysis.length} findings
                        </Badge>
                        <Button variant="outline" size="sm" className="border-slate-700">
                          View Report
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Current Session Tab - SPLIT VIEW */}
          <TabsContent value="session" className="mt-0">
            {currentSession ? (
              <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">
                {/* LEFT PANEL - Photos */}
                <div className="flex-1 flex flex-col">
                  <Card className="flex-1 bg-slate-900 border-slate-800 flex flex-col">
                    <CardHeader className="border-b border-slate-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Camera className="w-5 h-5 text-cyan-400" />
                            Photo Capture
                          </CardTitle>
                          <p className="text-sm text-slate-400 mt-1">
                            Client: <span className="text-slate-200">{currentSession.clientName}</span>
                          </p>
                        </div>
                        <Badge variant="outline" className="border-slate-700">
                          {photos.filter((p) => p.status !== "empty").length}/4 photos
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="flex-1 p-6">
                      <div className="grid grid-cols-2 gap-4 h-full">
                        {photos.map((photo) => (
                          <div
                            key={photo.type}
                            className="relative group"
                          >
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handlePhotoUpload(photo.type, file);
                              }}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            
                            <div
                              className={`h-full min-h-[200px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${
                                photo.url
                                  ? "border-slate-700 bg-slate-800/50"
                                  : "border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800/30"
                              }`}
                            >
                              {photo.url ? (
                                <div className="relative w-full h-full">
                                  <img
                                    src={photo.url}
                                    alt={`${photo.type} view`}
                                    className="w-full h-full object-cover rounded-xl"
                                  />
                                  <div className="absolute top-2 left-2">
                                    <Badge className="bg-slate-900/80 text-slate-200 border-slate-700">
                                      {photo.type.charAt(0).toUpperCase() + photo.type.slice(1)}
                                    </Badge>
                                  </div>
                                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      className="bg-slate-900/80 hover:bg-slate-800"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        setPhotos((prev) =>
                                          prev.map((p) =>
                                            p.type === photo.type
                                              ? { ...p, url: null, file: null, status: "empty" }
                                              : p
                                          )
                                        );
                                      }}
                                    >
                                      <RotateCcw className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-3">
                                    <Upload className="w-8 h-8 text-slate-500" />
                                  </div>
                                  <p className="text-sm font-medium text-slate-300">
                                    {photo.type.charAt(0).toUpperCase() + photo.type.slice(1)}
                                  </p>
                                  <p className="text-xs text-slate-500 mt-1">Click to upload</p>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    
                    <div className="p-6 border-t border-slate-800">
                      <Button
                        className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
                        disabled={!allPhotosUploaded || isAnalyzing}
                        onClick={handleAnalyze}
                      >
                        {isAnalyzing ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Analyze Posture
                          </>
                        )}
                      </Button>
                    </div>
                  </Card>
                </div>

                {/* RIGHT PANEL - Analysis */}
                <div className="flex-1 flex flex-col">
                  <Card className="flex-1 bg-slate-900 border-slate-800 flex flex-col">
                    <CardHeader className="border-b border-slate-800">
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-cyan-400" />
                        Analysis Results
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="flex-1 p-0">
                      <ScrollArea className="h-full">
                        <div className="p-6 space-y-6">
                          {!analysisResults.length ? (
                            <div className="h-full flex flex-col items-center justify-center text-center py-12">
                              <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
                                <Activity className="w-10 h-10 text-slate-600" />
                              </div>
                              <h3 className="text-lg font-medium text-slate-300 mb-2">
                                Waiting for Analysis
                              </h3>
                              <p className="text-sm text-slate-500 max-w-xs">
                                Upload all 4 photos and click "Analyze Posture" to see AI-generated results
                              </p>
                            </div>
                          ) : (
                            <>
                              {/* Summary Stats */}
                              <div className="grid grid-cols-3 gap-3">
                                <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                                  <p className="text-2xl font-bold text-cyan-400">
                                    {analysisResults.filter((r) => r.severity !== "normal").length}
                                  </p>
                                  <p className="text-xs text-slate-400">Issues Found</p>
                                </div>
                                <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                                  <p className="text-2xl font-bold text-emerald-400">
                                    {analysisResults.filter((r) => r.severity === "normal").length}
                                  </p>
                                  <p className="text-xs text-slate-400">Normal</p>
                                </div>
                                <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                                  <p className="text-2xl font-bold text-blue-400">94%</p>
                                  <p className="text-xs text-slate-400">Confidence</p>
                                </div>
                              </div>

                              <Separator className="bg-slate-800" />

                              {/* Findings */}
                              <div>
                                <h3 className="text-sm font-medium text-slate-300 mb-3">Postural Findings</h3>
                                <div className="space-y-2">
                                  {analysisResults.map((result, idx) => (
                                    <div
                                      key={idx}
                                      className={`p-4 rounded-lg border ${getSeverityColor(result.severity)}`}
                                    >
                                      <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2">
                                          {getSeverityIcon(result.severity)}
                                          <span className="font-medium">{result.type}</span>
                                        </div>
                                        {result.measurement && (
                                          <span className="text-sm font-mono">{result.measurement}</span>
                                        )}
                                      </div>
                                      <p className="text-sm mt-1 opacity-90">{result.finding}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <Separator className="bg-slate-800" />

                              {/* Recommendations */}
                              <div>
                                <h3 className="text-sm font-medium text-slate-300 mb-3">Recommended Treatments</h3>
                                <div className="space-y-2">
                                  {recommendations.map((rec, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg"
                                    >
                                      <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-xs font-medium text-cyan-400">{idx + 1}</span>
                                      </div>
                                      <p className="text-sm text-slate-300">{rec}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="flex gap-3 pt-4">
                                <Button variant="outline" className="flex-1 border-slate-700">
                                  <FileText className="w-4 h-4 mr-2" />
                                  View Full Report
                                </Button>
                                <Button variant="outline" className="flex-1 border-slate-700">
                                  <Download className="w-4 h-4 mr-2" />
                                  Export PDF
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
                <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
                  <Camera className="w-10 h-10 text-slate-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-300 mb-2">No Active Session</h3>
                <p className="text-slate-500 mb-6">Select a client to start a new posture analysis session</p>
                <Button onClick={() => setActiveTab("clients")} className="bg-cyan-600 hover:bg-cyan-700">
                  Go to Clients
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

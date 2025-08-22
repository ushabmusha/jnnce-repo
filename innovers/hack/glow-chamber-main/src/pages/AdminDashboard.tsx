import { useState, useEffect } from 'react';
import {
  Plus,
  Users,
  FileText,
  Eye,
  Upload,
  LogOut,
  Key,
  BarChart3,
  Trash2,
  Download,
  Copy,
  Settings,
  Mic,
  MicOff,
  MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import ClassroomDetails from '@/components/ClassroomDetails';
import RoomChat from '@/components/RoomChat';

interface ActivityLog {
  id: string;
  type: 'upload' | 'view' | 'edit' | 'join';
  userId: string;
  userEmail: string;
  userName: string;
  pdfId?: string;
  pdfName?: string;
  description: string;
  timestamp: string;
}

interface ChatMessage {
  id: string;
  roomId: string;
  userId: string;
  userName: string;
  userEmail: string;
  message: string;
  timestamp: string;
  isAdmin: boolean;
}

interface Room {
  id: string;
  name: string;
  description: string;
  passkey: string;
  createdAt: string;
  adminId: string;
  pdfs: PDF[];
  members: string[];
  views: number;
  activityLog: ActivityLog[];
  chatMessages?: ChatMessage[];
}

interface PDF {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
  views: number;
  content: string;
  lastEditedAt?: string;
  lastEditedBy?: string;
  lastEditDescription?: string;
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [newRoom, setNewRoom] = useState({ name: '', description: '' });
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showPDFViewer, setShowPDFViewer] = useState(false);
  const [selectedPDF, setSelectedPDF] = useState<PDF | null>(null);
  const [showClassroomDetails, setShowClassroomDetails] = useState(false);
  const [detailsRoom, setDetailsRoom] = useState<Room | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/auth');
      return;
    }
    loadRooms();
  }, [user, navigate]);

  useEffect(() => {
    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      setSpeechSynthesis(window.speechSynthesis);
    }
  }, []);

  useEffect(() => {
    // Stop speech when PDF viewer is closed
    if (!showPDFViewer && speechSynthesis && isReading) {
      speechSynthesis.cancel();
      setIsReading(false);
    }
  }, [showPDFViewer, speechSynthesis, isReading]);

  const loadRooms = () => {
    const allRooms = JSON.parse(localStorage.getItem('rooms') || '[]');

    // Migration: Add activityLog to existing rooms if it doesn't exist
    const migratedRooms = allRooms.map((room: any) => ({
      ...room,
      activityLog: room.activityLog || []
    }));

    if (JSON.stringify(allRooms) !== JSON.stringify(migratedRooms)) {
      localStorage.setItem('rooms', JSON.stringify(migratedRooms));
    }

    const userRooms = migratedRooms.filter((room: Room) => room.adminId === user?.id);
    setRooms(userRooms);
  };

  const generatePasskey = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const logActivity = (roomId: string, activity: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    const allRooms = JSON.parse(localStorage.getItem('rooms') || '[]');
    const roomIndex = allRooms.findIndex((r: Room) => r.id === roomId);

    if (roomIndex !== -1) {
      const newActivity: ActivityLog = {
        ...activity,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString()
      };

      if (!allRooms[roomIndex].activityLog) {
        allRooms[roomIndex].activityLog = [];
      }

      allRooms[roomIndex].activityLog.push(newActivity);
      localStorage.setItem('rooms', JSON.stringify(allRooms));
    }
  };

  const createRoom = () => {
    if (!newRoom.name.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a room name.",
        variant: "destructive"
      });
      return;
    }

    const room: Room = {
      id: Date.now().toString(),
      name: newRoom.name,
      description: newRoom.description,
      passkey: generatePasskey(),
      createdAt: new Date().toISOString(),
      adminId: user!.id,
      pdfs: [],
      members: [],
      views: 0,
      activityLog: []
    };

    const allRooms = JSON.parse(localStorage.getItem('rooms') || '[]');
    allRooms.push(room);
    localStorage.setItem('rooms', JSON.stringify(allRooms));
    
    setRooms(prev => [...prev, room]);
    setNewRoom({ name: '', description: '' });
    setShowCreateRoom(false);
    
    toast({
      title: "Room Created Successfully!",
      description: `Room "${room.name}" created with passkey: ${room.passkey}`,
      className: "bg-success text-success-foreground"
    });
  };

  const simulateFileUpload = (roomId: string) => {
    const pdfNames = [
      'Project Documentation.pdf',
      'User Manual.pdf',
      'Technical Specifications.pdf',
      'Research Report.pdf',
      'Meeting Notes.pdf'
    ];
    
    const randomName = pdfNames[Math.floor(Math.random() * pdfNames.length)];
    const newPDF: PDF = {
      id: Date.now().toString(),
      name: randomName,
      size: `${Math.floor(Math.random() * 5 + 1)}.${Math.floor(Math.random() * 10)}MB`,
      uploadedAt: new Date().toISOString(),
      views: 0,
      content: `This is a simulated PDF content for "${randomName}". 

In a real application, this would contain the actual PDF content that users can view, copy, and export.

Key Features:
• Secure document sharing
• Real-time analytics
• User access management
• PDF viewing capabilities

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.

This content can be edited by both admins and users, providing collaborative document management capabilities.`
    };

    const allRooms = JSON.parse(localStorage.getItem('rooms') || '[]');
    const roomIndex = allRooms.findIndex((r: Room) => r.id === roomId);
    if (roomIndex !== -1) {
      allRooms[roomIndex].pdfs.push(newPDF);
      localStorage.setItem('rooms', JSON.stringify(allRooms));

      // Log the upload activity
      logActivity(roomId, {
        type: 'upload',
        userId: user!.id,
        userEmail: user!.email,
        userName: user!.name,
        pdfId: newPDF.id,
        pdfName: newPDF.name,
        description: `Uploaded PDF "${newPDF.name}" (${newPDF.size})`
      });

      loadRooms();

      toast({
        title: "PDF Uploaded Successfully!",
        description: `"${newPDF.name}" has been uploaded to the room.`,
        className: "bg-success text-success-foreground"
      });
    }
  };

  const viewPDF = (pdf: PDF) => {
    setSelectedPDF(pdf);
    setShowPDFViewer(true);

    // Increment view count and log activity
    const allRooms = JSON.parse(localStorage.getItem('rooms') || '[]');
    const roomIndex = allRooms.findIndex((r: Room) => r.pdfs.some(p => p.id === pdf.id));
    if (roomIndex !== -1) {
      const pdfIndex = allRooms[roomIndex].pdfs.findIndex((p: PDF) => p.id === pdf.id);
      if (pdfIndex !== -1) {
        allRooms[roomIndex].pdfs[pdfIndex].views++;
        allRooms[roomIndex].views++;
        localStorage.setItem('rooms', JSON.stringify(allRooms));

        // Log the view activity
        logActivity(allRooms[roomIndex].id, {
          type: 'view',
          userId: user!.id,
          userEmail: user!.email,
          userName: user!.name,
          pdfId: pdf.id,
          pdfName: pdf.name,
          description: `Viewed PDF "${pdf.name}"`
        });

        loadRooms();
      }
    }
  };

  const copyPasskey = (passkey: string) => {
    navigator.clipboard.writeText(passkey);
    toast({
      title: "Passkey Copied!",
      description: "Room passkey has been copied to clipboard.",
      className: "bg-success text-success-foreground"
    });
  };

  const toggleTextToSpeech = () => {
    if (!speechSynthesis || !selectedPDF?.content) {
      toast({
        title: "Text-to-Speech Not Available",
        description: "Your browser doesn't support text-to-speech or no content available.",
        variant: "destructive"
      });
      return;
    }

    if (isReading) {
      // Stop reading
      speechSynthesis.cancel();
      setIsReading(false);
      toast({
        title: "Reading Stopped",
        description: "Text-to-speech has been stopped.",
        className: "bg-success text-success-foreground"
      });
    } else {
      // Start reading
      const utterance = new SpeechSynthesisUtterance(selectedPDF.content);

      // Configure speech settings
      utterance.rate = 0.8; // Slightly slower for better comprehension
      utterance.pitch = 1;
      utterance.volume = 1;

      // Handle speech events
      utterance.onstart = () => {
        setIsReading(true);
        toast({
          title: "Reading Started",
          description: "Text-to-speech is now reading the PDF content.",
          className: "bg-success text-success-foreground"
        });
      };

      utterance.onend = () => {
        setIsReading(false);
        toast({
          title: "Reading Completed",
          description: "Finished reading the PDF content.",
          className: "bg-success text-success-foreground"
        });
      };

      utterance.onerror = () => {
        setIsReading(false);
        toast({
          title: "Reading Error",
          description: "An error occurred while reading the content.",
          variant: "destructive"
        });
      };

      speechSynthesis.speak(utterance);
    }
  };

  const deleteRoom = (roomId: string) => {
    const allRooms = JSON.parse(localStorage.getItem('rooms') || '[]');
    const filteredRooms = allRooms.filter((r: Room) => r.id !== roomId);
    localStorage.setItem('rooms', JSON.stringify(filteredRooms));
    loadRooms();
    
    toast({
      title: "Room Deleted",
      description: "Room has been successfully deleted.",
      className: "bg-success text-success-foreground"
    });
  };

  const viewClassroomDetails = (room: Room) => {
    setDetailsRoom(room);
    setShowClassroomDetails(true);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
      className: "bg-success text-success-foreground"
    });
  };

  const totalPDFs = rooms.reduce((sum, room) => sum + room.pdfs.length, 0);
  const totalViews = rooms.reduce((sum, room) => sum + room.views, 0);
  const totalMembers = rooms.reduce((sum, room) => sum + room.members.length, 0);

  // Show classroom details if selected
  if (showClassroomDetails && detailsRoom) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">Welcome back, {user?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <ClassroomDetails
            room={detailsRoom}
            onBack={() => setShowClassroomDetails(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Welcome back, {user?.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rooms.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total PDFs</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPDFs}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalViews}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMembers}</div>
            </CardContent>
          </Card>
        </div>

        {/* Create Room Button */}
        <div className="mb-6">
          <Dialog open={showCreateRoom} onOpenChange={setShowCreateRoom}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" />
                Create New Room
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Room</DialogTitle>
                <DialogDescription>
                  Create a new room for sharing PDF documents with users.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="room-name">Room Name</Label>
                  <Input
                    id="room-name"
                    placeholder="Enter room name"
                    value={newRoom.name}
                    onChange={(e) => setNewRoom(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="room-description">Description</Label>
                  <Textarea
                    id="room-description"
                    placeholder="Enter room description"
                    value={newRoom.description}
                    onChange={(e) => setNewRoom(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <Button onClick={createRoom} className="w-full">
                  Create Room
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <Card key={room.id} className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{room.name}</CardTitle>
                    <CardDescription className="mt-1">{room.description}</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteRoom(room.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between bg-muted p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Key className="w-4 h-4 text-primary" />
                    <span className="font-mono text-sm">{room.passkey}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyPasskey(room.passkey)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>PDFs: {room.pdfs.length}</span>
                  <span>Members: {room.members.length}</span>
                  <span>Views: {room.views}</span>
                </div>

                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      onClick={() => simulateFileUpload(room.id)}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload PDF
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => viewClassroomDetails(room)}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      View Classroom
                    </Button>
                  </div>

                  <RoomChat
                    roomId={room.id}
                    roomName={room.name}
                    isAdmin={true}
                  />
                  
                  {room.pdfs.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">PDFs in this room:</h4>
                      {room.pdfs.map((pdf) => (
                        <div key={pdf.id} className="flex items-center justify-between bg-muted/50 p-2 rounded">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{pdf.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {pdf.size} • {pdf.views} views
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewPDF(pdf)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {rooms.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No rooms yet</h3>
            <p className="text-muted-foreground mb-4">Create your first room to start sharing PDFs</p>
            <Button onClick={() => setShowCreateRoom(true)} className="bg-gradient-primary hover:opacity-90">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Room
            </Button>
          </div>
        )}
      </div>

      {/* PDF Viewer Dialog */}
      <Dialog open={showPDFViewer} onOpenChange={setShowPDFViewer}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedPDF?.name}</span>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">{selectedPDF?.views} views</Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleTextToSpeech}
                  className={isReading ? "bg-primary text-primary-foreground" : ""}
                >
                  {isReading ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
                  {isReading ? 'Stop' : 'Read'}
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            <div className="bg-muted p-4 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm">{selectedPDF?.content}</pre>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
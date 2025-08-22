import { useState, useEffect, useRef } from 'react';
import { LogOut, Key, FileText, Eye, Download, Copy, Edit, Search, Mic, MicOff, Settings, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [joinedRooms, setJoinedRooms] = useState<Room[]>([]);
  const [passkey, setPasskey] = useState('');
  const [selectedPDF, setSelectedPDF] = useState<PDF | null>(null);
  const [showPDFViewer, setShowPDFViewer] = useState(false);
  const [editingContent, setEditingContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);
  const [showClassroomDetails, setShowClassroomDetails] = useState(false);
  const [detailsRoom, setDetailsRoom] = useState<Room | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!user || user.role !== 'user') {
      navigate('/auth');
      return;
    }
    loadJoinedRooms();
  }, [user, navigate]);

  useEffect(() => {
    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      setSpeechSynthesis(window.speechSynthesis);
    }

    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();

      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      setRecognition(recognitionInstance);
    }
  }, []);

  useEffect(() => {
    // Stop speech when PDF viewer is closed
    if (!showPDFViewer && speechSynthesis && isReading) {
      speechSynthesis.cancel();
      setIsReading(false);
    }
  }, [showPDFViewer, speechSynthesis, isReading]);

  const loadJoinedRooms = () => {
    const allRooms = JSON.parse(localStorage.getItem('rooms') || '[]');

    // Migration: Add activityLog to existing rooms if it doesn't exist
    const migratedRooms = allRooms.map((room: any) => ({
      ...room,
      activityLog: room.activityLog || []
    }));

    if (JSON.stringify(allRooms) !== JSON.stringify(migratedRooms)) {
      localStorage.setItem('rooms', JSON.stringify(migratedRooms));
    }

    const userRooms = migratedRooms.filter((room: Room) => room.members.includes(user?.id || ''));
    setJoinedRooms(userRooms);
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

  const joinRoom = () => {
    if (!passkey.trim()) {
      toast({
        title: "Missing Passkey",
        description: "Please enter a room passkey.",
        variant: "destructive"
      });
      return;
    }

    const allRooms = JSON.parse(localStorage.getItem('rooms') || '[]');
    const room = allRooms.find((r: Room) => r.passkey === passkey.toUpperCase());
    
    if (!room) {
      toast({
        title: "Invalid Passkey",
        description: "No room found with this passkey.",
        variant: "destructive"
      });
      return;
    }

    if (room.members.includes(user?.id || '')) {
      toast({
        title: "Already Joined",
        description: "You are already a member of this room.",
        variant: "destructive"
      });
      return;
    }

    // Add user to room
    const roomIndex = allRooms.findIndex((r: Room) => r.id === room.id);
    allRooms[roomIndex].members.push(user?.id || '');
    localStorage.setItem('rooms', JSON.stringify(allRooms));

    // Log the join activity
    logActivity(room.id, {
      type: 'join',
      userId: user!.id,
      userEmail: user!.email,
      userName: user!.name,
      description: `Joined the classroom "${room.name}"`
    });

    setPasskey('');
    loadJoinedRooms();

    toast({
      title: "Successfully Joined Room!",
      description: `You've joined "${room.name}". Access PDFs and collaborate with others.`,
      className: "bg-success text-success-foreground"
    });
  };

  const viewPDF = (pdf: PDF) => {
    setSelectedPDF(pdf);
    setEditingContent(pdf.content);
    setIsEditing(false);
    setShowPDFViewer(true);

    // Increment view count and log activity
    const allRooms = JSON.parse(localStorage.getItem('rooms') || '[]');
    const roomIndex = allRooms.findIndex((r: Room) => r.pdfs.some(p => p.id === pdf.id));
    if (roomIndex !== -1) {
      const pdfIndex = allRooms[roomIndex].pdfs.findIndex((p: PDF) => p.id === pdf.id);
      if (pdfIndex !== -1) {
        allRooms[roomIndex].pdfs[pdfIndex].views++;
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

        loadJoinedRooms();
      }
    }
  };

  const saveEdit = () => {
    if (!selectedPDF) return;

    const allRooms = JSON.parse(localStorage.getItem('rooms') || '[]');
    const roomIndex = allRooms.findIndex((r: Room) => r.pdfs.some(p => p.id === selectedPDF.id));
    if (roomIndex !== -1) {
      const pdfIndex = allRooms[roomIndex].pdfs.findIndex((p: PDF) => p.id === selectedPDF.id);
      if (pdfIndex !== -1) {
        const oldContent = allRooms[roomIndex].pdfs[pdfIndex].content;
        const editDescription = oldContent !== editingContent ?
          `Modified PDF content (${Math.abs(editingContent.length - oldContent.length)} character difference)` :
          'No changes made to content';

        // Update PDF with edit tracking
        allRooms[roomIndex].pdfs[pdfIndex].content = editingContent;
        allRooms[roomIndex].pdfs[pdfIndex].lastEditedAt = new Date().toISOString();
        allRooms[roomIndex].pdfs[pdfIndex].lastEditedBy = user!.name;
        allRooms[roomIndex].pdfs[pdfIndex].lastEditDescription = editDescription;

        localStorage.setItem('rooms', JSON.stringify(allRooms));

        // Log the edit activity
        logActivity(allRooms[roomIndex].id, {
          type: 'edit',
          userId: user!.id,
          userEmail: user!.email,
          userName: user!.name,
          pdfId: selectedPDF.id,
          pdfName: selectedPDF.name,
          description: editDescription
        });

        setSelectedPDF({
          ...selectedPDF,
          content: editingContent,
          lastEditedAt: new Date().toISOString(),
          lastEditedBy: user!.name,
          lastEditDescription: editDescription
        });
        setIsEditing(false);
        toast({
          title: "Changes Saved!",
          description: "PDF content has been updated successfully.",
          className: "bg-success text-success-foreground"
        });
      }
    }
  };

  const copyContent = () => {
    navigator.clipboard.writeText(selectedPDF?.content || '');
    toast({
      title: "Content Copied!",
      description: "PDF content has been copied to clipboard.",
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

  const toggleVoiceAssistant = () => {
    if (!recognition) {
      toast({
        title: "Voice Recognition Not Available",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive"
      });
      return;
    }

    if (!isEditing) {
      toast({
        title: "Enable Edit Mode",
        description: "Please enable edit mode first to use voice assistant.",
        variant: "destructive"
      });
      return;
    }

    if (isRecording) {
      // Stop recording
      recognition.stop();
      setIsRecording(false);
      toast({
        title: "Recording Stopped",
        description: "Voice recording has been stopped.",
        className: "bg-success text-success-foreground"
      });
    } else {
      // Start recording
      recognition.onstart = () => {
        setIsRecording(true);
        toast({
          title: "Recording Started",
          description: "Speak now to add text at cursor position.",
          className: "bg-success text-success-foreground"
        });
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;

        if (textareaRef.current) {
          const textarea = textareaRef.current;
          const cursorPosition = textarea.selectionStart;
          const textBefore = editingContent.substring(0, cursorPosition);
          const textAfter = editingContent.substring(cursorPosition);

          // Insert the transcribed text at cursor position
          const newContent = textBefore + transcript + textAfter;
          setEditingContent(newContent);

          // Set cursor position after the inserted text
          setTimeout(() => {
            if (textarea) {
              textarea.focus();
              textarea.setSelectionRange(
                cursorPosition + transcript.length,
                cursorPosition + transcript.length
              );
            }
          }, 0);
        }

        toast({
          title: "Text Added",
          description: `Added: "${transcript}"`,
          className: "bg-success text-success-foreground"
        });
      };

      recognition.onerror = (event) => {
        setIsRecording(false);
        toast({
          title: "Recording Error",
          description: `Speech recognition error: ${event.error}`,
          variant: "destructive"
        });
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    }
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

  const viewClassroomDetails = (room: Room) => {
    setDetailsRoom(room);
    setShowClassroomDetails(true);
  };

  const totalPDFs = joinedRooms.reduce((sum, room) => sum + room.pdfs.length, 0);

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
                <h1 className="text-xl font-bold">User Dashboard</h1>
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
              <h1 className="text-xl font-bold">User Dashboard</h1>
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
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Rooms Joined</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{joinedRooms.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">PDFs Available</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">{totalPDFs}</div>
            </CardContent>
          </Card>
        </div>

        {/* Join Room */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Key className="w-5 h-5 mr-2" />
              Join a Room
            </CardTitle>
            <CardDescription>Enter the passkey provided by the admin to join a room</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <Input
                placeholder="Enter room passkey"
                value={passkey}
                onChange={(e) => setPasskey(e.target.value.toUpperCase())}
                className="font-mono"
              />
              <Button onClick={joinRoom} className="bg-gradient-primary hover:opacity-90">
                <Search className="w-4 h-4 mr-2" />
                Join Room
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Joined Rooms */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {joinedRooms.map((room) => (
            <Card key={room.id} className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-lg">{room.name}</CardTitle>
                <CardDescription>{room.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  {room.pdfs.length} PDFs available
                </div>
                
                {room.pdfs.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Available PDFs:</h4>
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

                <div className="pt-2 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <RoomChat
                      roomId={room.id}
                      roomName={room.name}
                      isAdmin={false}
                    />
                    <Button
                      variant="outline"
                      onClick={() => viewClassroomDetails(room)}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      View Classroom
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {joinedRooms.length === 0 && (
          <div className="text-center py-12">
            <Key className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No rooms joined yet</h3>
            <p className="text-muted-foreground">Use a passkey to join your first room and access PDFs</p>
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleVoiceAssistant}
                  className={isRecording ? "bg-red-500 text-white animate-pulse" : ""}
                  disabled={!isEditing}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {isRecording ? 'Recording...' : 'Voice'}
                </Button>
                <Button variant="outline" size="sm" onClick={copyContent}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => isEditing ? saveEdit() : setIsEditing(true)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {isEditing ? 'Save' : 'Edit'}
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            {isEditing ? (
              <textarea
                ref={textareaRef}
                value={editingContent}
                onChange={(e) => setEditingContent(e.target.value)}
                className="w-full h-80 p-4 border rounded-lg resize-none bg-background"
                placeholder="Click here to position your cursor, then use the Voice button to add text at that position..."
              />
            ) : (
              <div className="bg-muted p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm">{selectedPDF?.content}</pre>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  FileText,
  Eye,
  Edit,
  Upload,
  Users,
  Clock,
  User,
  Calendar,
  Activity,
  MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
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

interface ClassroomDetailsProps {
  room: Room;
  onBack: () => void;
}

export default function ClassroomDetails({ room, onBack }: ClassroomDetailsProps) {
  const { user } = useAuth();
  const [roomData, setRoomData] = useState<Room>(room);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    // Load users data for displaying names
    const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
    setUsers(allUsers);
    
    // Refresh room data
    const allRooms = JSON.parse(localStorage.getItem('rooms') || '[]');
    const updatedRoom = allRooms.find((r: Room) => r.id === room.id);
    if (updatedRoom) {
      setRoomData(updatedRoom);
    }
  }, [room.id]);

  const getUserName = (userId: string) => {
    const foundUser = users.find(u => u.id === userId);
    return foundUser ? foundUser.name : 'Unknown User';
  };

  const getUserEmail = (userId: string) => {
    const foundUser = users.find(u => u.id === userId);
    return foundUser ? foundUser.email : 'unknown@email.com';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'upload': return <Upload className="w-4 h-4 text-blue-500" />;
      case 'view': return <Eye className="w-4 h-4 text-green-500" />;
      case 'edit': return <Edit className="w-4 h-4 text-orange-500" />;
      case 'join': return <Users className="w-4 h-4 text-purple-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'upload': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'view': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'edit': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'join': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  // Sort activity log by timestamp (newest first)
  const sortedActivityLog = [...(roomData.activityLog || [])].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Get member details
  const memberDetails = roomData.members.map(memberId => {
    const memberUser = users.find(u => u.id === memberId);
    return {
      id: memberId,
      name: memberUser?.name || 'Unknown User',
      email: memberUser?.email || 'unknown@email.com',
      joinedAt: roomData.activityLog?.find(log => log.type === 'join' && log.userId === memberId)?.timestamp
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{roomData.name}</h1>
            <p className="text-muted-foreground">{roomData.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <RoomChat
            roomId={roomData.id}
            roomName={roomData.name}
            isAdmin={user?.role === 'admin'}
            variant="compact"
          />
          <Badge variant="secondary" className="font-mono">
            {roomData.passkey}
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total PDFs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roomData.pdfs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roomData.members.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roomData.views}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activities</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sortedActivityLog.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activity">Activity History</TabsTrigger>
          <TabsTrigger value="pdfs">PDF Details</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Complete history of all activities in this classroom
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {sortedActivityLog.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No activity recorded yet
                    </p>
                  ) : (
                    sortedActivityLog.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg border">
                        <div className="flex-shrink-0">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Badge className={getActivityColor(activity.type)}>
                                {activity.type.toUpperCase()}
                              </Badge>
                              <span className="text-sm font-medium">{activity.userName}</span>
                              <span className="text-xs text-muted-foreground">({activity.userEmail})</span>
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Clock className="w-3 h-3 mr-1" />
                              {formatDate(activity.timestamp)}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                          {activity.pdfName && (
                            <p className="text-xs text-muted-foreground mt-1">
                              PDF: {activity.pdfName}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pdfs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>PDF Documents</CardTitle>
              <CardDescription>
                Detailed information about all PDFs in this classroom
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {roomData.pdfs.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No PDFs uploaded yet
                  </p>
                ) : (
                  roomData.pdfs.map((pdf) => (
                    <div key={pdf.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{pdf.name}</h3>
                        <Badge variant="outline">{pdf.size}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Uploaded:</span> {formatDate(pdf.uploadedAt)}
                        </div>
                        <div>
                          <span className="font-medium">Views:</span> {pdf.views}
                        </div>
                        {pdf.lastEditedAt && (
                          <>
                            <div>
                              <span className="font-medium">Last Edited:</span> {formatDate(pdf.lastEditedAt)}
                            </div>
                            <div>
                              <span className="font-medium">Edited By:</span> {pdf.lastEditedBy}
                            </div>
                          </>
                        )}
                      </div>
                      {pdf.lastEditDescription && (
                        <div className="mt-2 text-sm">
                          <span className="font-medium">Last Edit:</span> {pdf.lastEditDescription}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Classroom Members</CardTitle>
              <CardDescription>
                All users who have joined this classroom
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {memberDetails.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No members have joined yet
                  </p>
                ) : (
                  memberDetails.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                      {member.joinedAt && (
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Joined</p>
                          <p className="text-sm">{formatDate(member.joinedAt)}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Room Chat</CardTitle>
              <CardDescription>
                Real-time messaging for all classroom members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Chat with Room Members</h3>
                <p className="text-muted-foreground mb-4">
                  Use the chat button in the header above to start messaging with all room members in real-time.
                </p>
                <div className="bg-muted p-4 rounded-lg text-left">
                  <h4 className="font-medium mb-2">Chat Features:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Real-time messaging with all room members</li>
                    <li>• Typing indicators when someone is typing</li>
                    <li>• Unread message notifications</li>
                    <li>• Admin badges for administrator messages</li>
                    <li>• Message timestamps and user identification</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MessageCircle, Send, X, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

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

interface TypingUser {
  userId: string;
  userName: string;
  timestamp: number;
}

interface RoomChatProps {
  roomId: string;
  roomName: string;
  isAdmin?: boolean;
  variant?: 'default' | 'compact';
}

export default function RoomChat({ roomId, roomName, isAdmin = false, variant = 'default' }: RoomChatProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Load messages from localStorage
  const loadMessages = () => {
    const allMessages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
    const roomMessages = allMessages.filter((msg: ChatMessage) => msg.roomId === roomId);
    setMessages(roomMessages);
  };

  // Load typing users from localStorage
  const loadTypingUsers = () => {
    const allTypingUsers = JSON.parse(localStorage.getItem('typingUsers') || '[]');
    const roomTypingUsers = allTypingUsers.filter((tu: TypingUser & { roomId: string }) => tu.roomId === roomId);
    // Filter out old typing indicators (older than 3 seconds)
    const currentTime = Date.now();
    const activeTypingUsers = roomTypingUsers.filter((tu: TypingUser) => currentTime - tu.timestamp < 3000);
    setTypingUsers(activeTypingUsers);
  };

  // Save message to localStorage
  const saveMessage = (message: ChatMessage) => {
    const allMessages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
    allMessages.push(message);
    localStorage.setItem('chatMessages', JSON.stringify(allMessages));
  };

  // Update typing status
  const updateTypingStatus = (typing: boolean) => {
    const allTypingUsers = JSON.parse(localStorage.getItem('typingUsers') || '[]');
    const filteredTypingUsers = allTypingUsers.filter((tu: TypingUser & { roomId: string }) => 
      !(tu.roomId === roomId && tu.userId === user?.id)
    );

    if (typing) {
      filteredTypingUsers.push({
        roomId,
        userId: user?.id,
        userName: user?.name,
        timestamp: Date.now()
      });
    }

    localStorage.setItem('typingUsers', JSON.stringify(filteredTypingUsers));
  };

  // Send message
  const sendMessage = () => {
    if (!newMessage.trim() || !user) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      roomId,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      isAdmin: user.role === 'admin'
    };

    saveMessage(message);
    setNewMessage('');
    setIsTyping(false);
    updateTypingStatus(false);
    loadMessages();

    toast({
      title: "Message Sent",
      description: "Your message has been sent to the room.",
      className: "bg-success text-success-foreground"
    });
  };

  // Handle typing
  const handleTyping = (value: string) => {
    setNewMessage(value);
    
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      updateTypingStatus(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      updateTypingStatus(false);
    }, 2000);
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + 
             date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Calculate unread messages
  const calculateUnreadCount = () => {
    if (isOpen) {
      setUnreadCount(0);
      return;
    }
    
    const lastReadTime = localStorage.getItem(`lastRead_${roomId}_${user?.id}`) || '0';
    const unread = messages.filter(msg => 
      msg.userId !== user?.id && 
      new Date(msg.timestamp).getTime() > parseInt(lastReadTime)
    ).length;
    setUnreadCount(unread);
  };

  // Mark messages as read
  const markAsRead = () => {
    if (user) {
      localStorage.setItem(`lastRead_${roomId}_${user.id}`, Date.now().toString());
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(() => {
      loadMessages();
      loadTypingUsers();
    }, 1000); // Poll every second for real-time updates

    return () => clearInterval(interval);
  }, [roomId]);

  useEffect(() => {
    calculateUnreadCount();
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      markAsRead();
    }
  }, [messages, isOpen]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      updateTypingStatus(false);
    };
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={`relative ${variant === 'default' ? 'w-full' : ''}`}>
          <MessageCircle className="w-4 h-4 mr-2" />
          Chat
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5" />
              <span>{roomName} Chat</span>
            </div>
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Users className="w-3 h-3" />
              <span>{messages.filter((msg, index, arr) => 
                arr.findIndex(m => m.userId === msg.userId) === index
              ).length}</span>
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col min-h-0">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4 pb-4">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No messages yet</p>
                  <p className="text-sm">Start the conversation!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.userId === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.userId === user?.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs font-medium">
                          {message.userName}
                          {message.isAdmin && (
                            <Badge variant="secondary" className="ml-1 text-xs">Admin</Badge>
                          )}
                        </span>
                        <span className="text-xs opacity-70">
                          {formatTimestamp(message.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm">{message.message}</p>
                    </div>
                  </div>
                ))
              )}
              
              {/* Typing indicators */}
              {typingUsers.filter(tu => tu.userId !== user?.id).length > 0 && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-3 max-w-[80%]">
                    <p className="text-sm text-muted-foreground italic">
                      {typingUsers.filter(tu => tu.userId !== user?.id).map(tu => tu.userName).join(', ')} 
                      {typingUsers.filter(tu => tu.userId !== user?.id).length === 1 ? ' is' : ' are'} typing...
                    </p>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          <div className="border-t pt-4 mt-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => handleTyping(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                className="flex-1"
              />
              <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

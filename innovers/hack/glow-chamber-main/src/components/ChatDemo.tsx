import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import RoomChat from '@/components/RoomChat';
import { MessageCircle, Users, Clock } from 'lucide-react';

export default function ChatDemo() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Real-time Chat Demo</h1>
        <p className="text-muted-foreground">
          Test the real-time chat functionality for classroom rooms
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Demo Room 1 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Mathematics Class
            </CardTitle>
            <CardDescription>Advanced Calculus and Linear Algebra</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                5 members
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Active
              </span>
            </div>
            
            <RoomChat 
              roomId="demo-room-1" 
              roomName="Mathematics Class" 
              isAdmin={false}
            />
          </CardContent>
        </Card>

        {/* Demo Room 2 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Physics Lab
            </CardTitle>
            <CardDescription>Quantum Mechanics Study Group</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                3 members
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Active
              </span>
            </div>
            
            <RoomChat 
              roomId="demo-room-2" 
              roomName="Physics Lab" 
              isAdmin={true}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Chat Features</CardTitle>
          <CardDescription>
            Real-time messaging system for classroom collaboration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold">✨ Key Features</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-500">•</span>
                  <span><strong>Real-time messaging:</strong> Messages appear instantly for all room members</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span><strong>Typing indicators:</strong> See when others are typing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500">•</span>
                  <span><strong>Unread badges:</strong> Visual indicators for new messages</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500">•</span>
                  <span><strong>Admin badges:</strong> Distinguish admin messages</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">•</span>
                  <span><strong>Persistent storage:</strong> Messages saved locally</span>
                </li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold">🎯 How to Use</h3>
              <ol className="space-y-2 text-sm list-decimal list-inside">
                <li>Click the "Chat" button on any room card</li>
                <li>Type your message in the input field</li>
                <li>Press Enter or click Send to send</li>
                <li>See typing indicators when others are typing</li>
                <li>Unread message count shows on the chat button</li>
                <li>Messages are visible to all room members</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

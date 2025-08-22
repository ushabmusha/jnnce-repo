import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Mic, MicOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function VoiceAssistantDemo() {
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [content, setContent] = useState('This is a sample text. Click anywhere in this text area and then use the voice assistant to add text at that position.');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
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

  const toggleVoiceAssistant = () => {
    if (!recognition) {
      toast({
        title: "Voice Recognition Not Available",
        description: "Your browser doesn't support speech recognition.",
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
          const textBefore = content.substring(0, cursorPosition);
          const textAfter = content.substring(cursorPosition);
          
          // Insert the transcribed text at cursor position
          const newContent = textBefore + transcript + textAfter;
          setContent(newContent);
          
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

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Voice Assistant Demo
        </CardTitle>
        <CardDescription>
          Click in the text area to position your cursor, then use the voice button to add text at that position.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={toggleVoiceAssistant}
            className={isRecording ? "bg-red-500 text-white animate-pulse" : ""}
          >
            {isRecording ? <MicOff className="w-4 h-4 mr-2" /> : <MessageSquare className="w-4 h-4 mr-2" />}
            {isRecording ? 'Recording...' : 'Voice Assistant'}
          </Button>
          {recognition ? (
            <span className="text-sm text-green-600">✓ Voice recognition available</span>
          ) : (
            <span className="text-sm text-red-600">✗ Voice recognition not supported</span>
          )}
        </div>
        
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-40 p-4 border rounded-lg resize-none bg-background"
          placeholder="Click here to position your cursor, then use the Voice button to add text at that position..."
        />
        
        <div className="text-sm text-muted-foreground">
          <p><strong>Instructions:</strong></p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Click anywhere in the text area above to position your cursor</li>
            <li>Click the "Voice Assistant" button to start recording</li>
            <li>Speak clearly into your microphone</li>
            <li>The transcribed text will be inserted at your cursor position</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}

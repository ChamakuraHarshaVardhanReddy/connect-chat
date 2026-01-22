import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hash, MoreVertical, Phone, Video, Paperclip, Smile, Send, Image as ImageIcon, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getSocket } from '@/lib/socket';
import { messagesAPI, uploadAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Message {
  _id: string;
  content: string;
  sender: {
    _id: string;
    name: string;
    email: string;
    avatar: string;
  };
  createdAt: string;
  media?: {
    url: string;
    type: string;
    filename: string;
    size: number;
  } | null;
}

interface MessageAreaProps {
  chatId: string | null;
  chatType: 'channel' | 'dm';
  currentUser: { _id: string; name: string; avatar: string };
  chatInfo?: { name: string; members?: number } | null;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function MessageArea({ chatId, chatType, currentUser, chatInfo: propChatInfo }: MessageAreaProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatInfo, setChatInfo] = useState<{ name: string; members?: number } | null>(propChatInfo || null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Update chatInfo when prop changes
  useEffect(() => {
    if (propChatInfo) {
      setChatInfo(propChatInfo);
    }
  }, [propChatInfo]);

  // Fetch messages when chat changes
  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      setChatInfo(null);
      return;
    }

    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        let fetchedMessages: Message[] = [];
        
        if (chatType === 'channel') {
          fetchedMessages = await messagesAPI.getRoomMessages(chatId);
        } else {
          fetchedMessages = await messagesAPI.getDirectMessages(chatId);
        }

        setMessages(fetchedMessages);
        
        // Use prop chatInfo if available, otherwise set default
        if (propChatInfo) {
          setChatInfo(propChatInfo);
        } else {
          setChatInfo({ name: chatId });
        }
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to load messages',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();

    // Setup Socket.IO listeners
    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = (message: Message) => {
      // Check if message belongs to current chat
      // For rooms, we check if the message is for this roomId
      // For DMs, we check if the message is for this dmId
      setMessages((prev) => {
        // Avoid duplicates
        if (prev.some(m => m._id === message._id)) {
          return prev;
        }
        return [...prev, message];
      });
    };

    socket.on('new-message', handleNewMessage);
    socket.on('new-direct-message', handleNewMessage);

    // Join the room/DM
    if (chatType === 'channel') {
      socket.emit('join-room', chatId);
    }

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('new-direct-message', handleNewMessage);
      if (chatType === 'channel') {
        socket.emit('leave-room', chatId);
      }
    };
  }, [chatId, chatType, toast, propChatInfo]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !chatId) return;

    const socket = getSocket();
    if (!socket) {
      toast({
        title: 'Error',
        description: 'Not connected to server',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (chatType === 'channel') {
        socket.emit('send-message', {
          roomId: chatId,
          content: newMessage.trim(),
        });
      } else {
        // For DMs, we need the recipient ID - this should come from the chatId or be passed as a prop
        // For now, assuming chatId is the DM conversation ID
        socket.emit('send-direct-message', {
          dmId: chatId,
          content: newMessage.trim(),
        });
      }

      setNewMessage('');
      inputRef.current?.focus();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send message',
        variant: 'destructive',
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !chatId) return;

    try {
      const uploadResult = await uploadAPI.uploadFile(file);
      
      const socket = getSocket();
      if (!socket) {
        toast({
          title: 'Error',
          description: 'Not connected to server',
          variant: 'destructive',
        });
        return;
      }

      const media = {
        url: `${API_URL}${uploadResult.url}`,
        type: uploadResult.type,
        filename: uploadResult.filename,
        size: uploadResult.size,
      };

      if (chatType === 'channel') {
        socket.emit('send-message', {
          roomId: chatId,
          media,
        });
      } else {
        socket.emit('send-direct-message', {
          dmId: chatId,
          media,
        });
      }

      toast({
        title: 'Success',
        description: 'File uploaded successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload file',
        variant: 'destructive',
      });
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!chatId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Hash className="h-10 w-10 text-primary" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">Welcome to ChatFlow</h2>
          <p className="text-muted-foreground max-w-sm">
            Select a channel or start a conversation to begin chatting
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Chat Header */}
      <motion.header
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="h-16 px-4 flex items-center justify-between border-b border-border glass-strong"
      >
        <div className="flex items-center gap-3">
          {chatType === 'channel' ? (
            <>
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Hash className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold">{chatInfo?.name || 'Channel'}</h2>
                <p className="text-xs text-muted-foreground">{chatInfo?.members || 0} members</p>
              </div>
            </>
          ) : (
            <>
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {chatInfo?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-semibold">{chatInfo?.name || 'Direct Message'}</h2>
                <p className="text-xs text-online">Online</p>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
            <Users className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </motion.header>

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 p-4 scrollbar-thin">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-4 max-w-3xl mx-auto">
            <AnimatePresence initial={false}>
              {messages.map((message, index) => {
                const isOwn = message.sender._id === currentUser._id;
                const showAvatar = index === 0 || messages[index - 1]?.sender._id !== message.sender._id;
                return (
                  <motion.div
                    key={message._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
                  >
                    {!isOwn && showAvatar ? (
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={message.sender.avatar} />
                        <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                          {message.sender.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      !isOwn && <div className="w-8 shrink-0" />
                    )}
                    <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
                      {showAvatar && !isOwn && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{message.sender.name}</span>
                          <span className="text-xs text-muted-foreground">{formatTime(message.createdAt)}</span>
                        </div>
                      )}
                      <div
                        className={`px-4 py-2.5 ${
                          isOwn ? 'message-bubble-own' : 'message-bubble-other'
                        }`}
                      >
                        {message.media ? (
                          <div>
                            {message.media.type === 'image' ? (
                              <img
                                src={message.media.url}
                                alt={message.media.filename}
                                className="max-w-full h-auto rounded-lg mb-2"
                              />
                            ) : (
                              <a
                                href={message.media.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-primary hover:underline"
                              >
                                <Paperclip className="h-4 w-4" />
                                <span className="text-sm">{message.media.filename}</span>
                              </a>
                            )}
                            {message.content && <p className="text-sm leading-relaxed mt-2">{message.content}</p>}
                          </div>
                        ) : (
                          <p className="text-sm leading-relaxed">{message.content}</p>
                        )}
                      </div>
                      {isOwn && showAvatar && (
                        <p className="text-xs text-muted-foreground mt-1 text-right">{formatTime(message.createdAt)}</p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t border-border">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center gap-2 p-2 rounded-xl bg-card border border-border"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground shrink-0"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground shrink-0"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="h-5 w-5" />
            </Button>
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${chatType === 'channel' ? '#' : ''}${chatInfo?.name || ''}`}
              className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground"
            />
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground shrink-0">
              <Smile className="h-5 w-5" />
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              size="icon"
              className="h-9 w-9 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

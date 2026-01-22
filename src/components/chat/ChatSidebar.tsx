import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Hash, MessageCircle, Plus, Search, Settings, LogOut, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { roomsAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Room {
  _id: string;
  name: string;
  description: string;
  type: string;
  members: any[];
  lastMessage?: any;
}

interface DirectMessage {
  _id: string;
  participants: Array<{
    _id: string;
    name: string;
    avatar: string;
    online: boolean;
  }>;
  lastMessage?: any;
}

interface ChatSidebarProps {
  activeChat: string | null;
  onSelectChat: (id: string, type: 'channel' | 'dm', info?: { name: string; members?: number }) => void;
  onLogout: () => void;
  currentUser: { _id: string; name: string; avatar: string };
}

export function ChatSidebar({ activeChat, onSelectChat, onLogout, currentUser }: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedRooms = await roomsAPI.getAll();
        setRooms(fetchedRooms);
        
        // For now, we'll create a placeholder for DMs
        // In a full implementation, you'd have a separate API endpoint for DMs
        setDirectMessages([]);
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to load conversations',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateRoom = async () => {
    const name = prompt('Enter room name:');
    if (!name) return;

    try {
      const newRoom = await roomsAPI.create(name);
      setRooms([...rooms, newRoom]);
      toast({
        title: 'Success',
        description: 'Room created successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create room',
        variant: 'destructive',
      });
    }
  };

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-[280px] h-full bg-sidebar flex flex-col border-r border-sidebar-border"
    >
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-display text-xl font-bold gradient-text">ChatFlow</h1>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-sidebar-accent border-sidebar-border focus:ring-primary/50"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 scrollbar-thin">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="h-6 w-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Channels */}
            <div className="p-3">
              <div className="flex items-center justify-between mb-2 px-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Channels</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 text-muted-foreground hover:text-foreground"
                  onClick={handleCreateRoom}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <div className="space-y-0.5">
                {filteredRooms.map((room) => (
                  <motion.button
                    key={room._id}
                    onClick={() => onSelectChat(room._id, 'channel', { name: room.name, members: room.members?.length || 0 })}
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors ${
                      activeChat === room._id
                        ? 'bg-sidebar-accent text-sidebar-foreground'
                        : 'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                    }`}
                  >
                    <Hash className="h-4 w-4 shrink-0" />
                    <span className="truncate text-sm">{room.name}</span>
                  </motion.button>
                ))}
                {filteredRooms.length === 0 && (
                  <p className="text-xs text-muted-foreground px-2 py-1.5">No rooms found</p>
                )}
              </div>
            </div>

            {/* Direct Messages */}
            <div className="p-3 pt-0">
              <div className="flex items-center justify-between mb-2 px-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Direct Messages</span>
                <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-foreground">
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <div className="space-y-0.5">
                {directMessages.map((dm) => {
                  const otherParticipant = dm.participants.find(p => p._id !== currentUser._id);
                  if (!otherParticipant) return null;
                  
                  return (
                    <motion.button
                      key={dm._id}
                      onClick={() => onSelectChat(dm._id, 'dm', { name: otherParticipant.name })}
                      whileHover={{ x: 2 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full flex items-center gap-2 px-2 py-2 rounded-md transition-colors ${
                        activeChat === dm._id
                          ? 'bg-sidebar-accent text-sidebar-foreground'
                          : 'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                      }`}
                    >
                      <div className="relative shrink-0">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={otherParticipant.avatar} />
                          <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                            {otherParticipant.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-sidebar ${
                          otherParticipant.online ? 'bg-online' : 'bg-offline'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium truncate">{otherParticipant.name}</span>
                        </div>
                        {dm.lastMessage && (
                          <p className="text-xs text-muted-foreground truncate">
                            {dm.lastMessage.content || 'Media'}
                          </p>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
                {directMessages.length === 0 && (
                  <p className="text-xs text-muted-foreground px-2 py-1.5">No direct messages</p>
                )}
              </div>
            </div>
          </>
        )}
      </ScrollArea>

      {/* User Profile */}
      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-sidebar-accent/50">
          <div className="relative">
            <Avatar className="h-9 w-9">
              <AvatarImage src={currentUser.avatar} />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {currentUser.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-sidebar bg-online" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{currentUser.name}</p>
            <p className="text-xs text-muted-foreground">Online</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onLogout}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.aside>
  );
}

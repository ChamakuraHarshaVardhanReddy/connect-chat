import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { MessageArea } from '@/components/chat/MessageArea';
import { MobileSidebar } from '@/components/chat/MobileSidebar';
import { authAPI } from '@/lib/api';
import { initSocket, disconnectSocket } from '@/lib/socket';
import { useToast } from '@/hooks/use-toast';

export default function Chat() {
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [chatType, setChatType] = useState<'channel' | 'dm'>('channel');
  const [chatInfo, setChatInfo] = useState<{ name: string; members?: number } | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ _id: string; name: string; avatar: string } | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/auth');
        return;
      }

      try {
        const user = await authAPI.getCurrentUser();
        setCurrentUser(user);
        
        // Initialize Socket.IO connection
        initSocket(token);
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/auth');
      }
    };

    checkAuth();

    return () => {
      disconnectSocket();
    };
  }, [navigate]);

  const handleSelectChat = (id: string, type: 'channel' | 'dm', info?: { name: string; members?: number }) => {
    setActiveChat(id);
    setChatType(type);
    setChatInfo(info || null);
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      disconnectSocket();
      toast({ title: 'Signed out', description: 'You have been logged out successfully.' });
      navigate('/auth');
    } catch (error) {
      disconnectSocket();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/auth');
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        {currentUser && (
          <ChatSidebar
            activeChat={activeChat}
            onSelectChat={handleSelectChat}
            onLogout={handleLogout}
            currentUser={currentUser}
          />
        )}
      </div>

      {/* Mobile Sidebar */}
      {currentUser && (
        <MobileSidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          activeChat={activeChat}
          onSelectChat={handleSelectChat}
          onLogout={handleLogout}
          currentUser={currentUser}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="md:hidden h-14 px-4 flex items-center gap-3 border-b border-border bg-card">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileSidebarOpen(true)}
            className="h-9 w-9"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-display text-lg font-bold gradient-text">ChatFlow</span>
        </div>

        {/* Message Area */}
        {currentUser && (
          <MessageArea
            chatId={activeChat}
            chatType={chatType}
            currentUser={currentUser}
            chatInfo={chatInfo}
          />
        )}
      </div>
    </div>
  );
}

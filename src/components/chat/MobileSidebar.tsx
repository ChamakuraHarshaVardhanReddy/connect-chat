import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatSidebar } from './ChatSidebar';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeChat: string | null;
  onSelectChat: (id: string, type: 'channel' | 'dm', info?: { name: string; members?: number }) => void;
  onLogout: () => void;
  currentUser: { _id: string; name: string; avatar: string };
}

export function MobileSidebar({
  isOpen,
  onClose,
  activeChat,
  onSelectChat,
  onLogout,
  currentUser,
}: MobileSidebarProps) {
  const handleSelectChat = (id: string, type: 'channel' | 'dm', info?: { name: string; members?: number }) => {
    onSelectChat(id, type, info);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />
          {/* Sidebar */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-y-0 left-0 z-50 md:hidden"
          >
            <div className="relative h-full">
              <ChatSidebar
                activeChat={activeChat}
                onSelectChat={handleSelectChat}
                onLogout={onLogout}
                currentUser={currentUser}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="absolute top-3 right-3 h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

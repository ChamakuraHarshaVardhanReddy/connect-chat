import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle, ArrowRight, Zap, Shield, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: Zap,
    title: 'Real-time Messaging',
    description: 'Instant message delivery with WebSocket technology',
  },
  {
    icon: Users,
    title: 'Team Channels',
    description: 'Create public and private channels for your team',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'End-to-end encryption for all your conversations',
  },
];

export default function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/chat');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--gradient-dark)' }}>
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 container mx-auto px-4 py-6"
      >
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold gradient-text">ChatFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/auth')} className="text-muted-foreground hover:text-foreground">
              Sign In
            </Button>
            <Button onClick={() => navigate('/auth')} className="bg-primary text-primary-foreground hover:bg-primary/90">
              Get Started
            </Button>
          </div>
        </nav>
      </motion.header>

      {/* Hero Section */}
      <main className="relative z-10 container mx-auto px-4 pt-20 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
          >
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm text-primary font-medium">Real-time communication platform</span>
          </motion.div>

          <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight mb-6">
            Chat with your team
            <br />
            <span className="gradient-text">in real-time</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            A modern messaging platform designed for teams. Create channels, share files,
            and collaborate seamlessly with real-time communication.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              size="lg"
              onClick={() => navigate('/auth')}
              className="h-14 px-8 bg-primary text-primary-foreground hover:bg-primary/90 font-medium text-lg"
            >
              Start Chatting Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-8 border-border text-foreground hover:bg-card font-medium text-lg"
            >
              Watch Demo
            </Button>
          </motion.div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-32 grid md:grid-cols-3 gap-6 max-w-5xl mx-auto"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
              className="glass rounded-2xl p-6 hover:bg-card/80 transition-colors"
            >
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Preview Window */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="mt-20 relative max-w-5xl mx-auto"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none h-full" />
          <div className="rounded-2xl overflow-hidden border border-border glass-strong">
            <div className="h-10 bg-card border-b border-border flex items-center gap-2 px-4">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-destructive/60" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
                <div className="h-3 w-3 rounded-full bg-online/60" />
              </div>
            </div>
            <div className="h-[400px] bg-card/50 flex">
              <div className="w-[200px] bg-sidebar border-r border-border p-4">
                <div className="space-y-3">
                  {['# general', '# random', '# design'].map((channel) => (
                    <div key={channel} className="h-6 flex items-center gap-2 text-sm text-muted-foreground">
                      {channel}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-1 p-6 flex flex-col justify-end">
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/20" />
                    <div className="bg-card rounded-2xl rounded-bl-md px-4 py-2 max-w-xs">
                      <p className="text-sm">Hey team! The new features are live 🎉</p>
                    </div>
                  </div>
                  <div className="flex gap-3 flex-row-reverse">
                    <div className="message-bubble-own px-4 py-2 max-w-xs">
                      <p className="text-sm">Awesome! Let me check them out</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

import { motion } from 'framer-motion';
import { ShieldAlert, FileQuestion, ServerCrash, Lock, ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';

interface ErrorPageProps {
  code?: '403' | '404' | '500' | 'CLOSED' | 'LOCKED';
  title?: string;
  message?: string;
}

export function ErrorPage({ code = '404', title, message }: ErrorPageProps) {
  const [, navigate] = useLocation();

  const errorConfig = {
    '403': {
      icon: ShieldAlert,
      color: 'text-red-400',
      borderColor: 'border-red-500/30',
      bgColor: 'bg-red-500/10',
      defaultTitle: '403 - Access Forbidden',
      defaultMessage: 'You do not have permission to access this protected area. Admin authentication required.',
    },
    '404': {
      icon: FileQuestion,
      color: 'text-cyan-400',
      borderColor: 'border-cyan-500/30',
      bgColor: 'bg-cyan-500/10',
      defaultTitle: '404 - Page Not Found',
      defaultMessage: 'The page or resource you are looking for does not exist or has been moved.',
    },
    '500': {
      icon: ServerCrash,
      color: 'text-amber-400',
      borderColor: 'border-amber-500/30',
      bgColor: 'bg-amber-500/10',
      defaultTitle: '500 - Internal Server Error',
      defaultMessage: 'An unexpected server error occurred. Our team has been notified.',
    },
    CLOSED: {
      icon: Lock,
      color: 'text-purple-400',
      borderColor: 'border-purple-500/30',
      bgColor: 'bg-purple-500/10',
      defaultTitle: 'Registration Closed',
      defaultMessage: 'Maximum number of teams has been reached for the AI Agent Challenge.',
    },
    LOCKED: {
      icon: Lock,
      color: 'text-amber-400',
      borderColor: 'border-amber-500/30',
      bgColor: 'bg-amber-500/10',
      defaultTitle: 'Problem Statement Locked',
      defaultMessage: 'Please wait for the organizers to release the problem statement.',
    },
  };

  const current = errorConfig[code] || errorConfig['404'];
  const Icon = current.icon;

  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center container">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full text-center"
      >
        <div className={`glass-card p-10 md:p-14 glow-border space-y-6 ${current.borderColor}`}>
          <div className={`w-20 h-20 rounded-full ${current.bgColor} flex items-center justify-center mx-auto border ${current.borderColor}`}>
            <Icon className={`w-10 h-10 ${current.color}`} />
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold">{title || current.defaultTitle}</h1>
            <p className="text-lg text-foreground/80 leading-relaxed max-w-lg mx-auto">
              {message || current.defaultMessage}
            </p>
          </div>

          <div className="pt-4 flex justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              className="btn-primary inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Home
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

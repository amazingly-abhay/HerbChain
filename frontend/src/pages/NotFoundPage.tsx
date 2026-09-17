import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, SearchX } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-herb-cream flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6 max-w-md"
      >
        <div className="relative w-32 h-32 mx-auto">
          <motion.div 
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity,
              ease: "easeInOut" 
            }}
            className="absolute inset-0 flex items-center justify-center text-herb-green-600 opacity-20"
          >
            <Leaf size={120} />
          </motion.div>
          <div className="absolute inset-0 flex items-center justify-center text-gray-800">
            <SearchX size={64} />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-gray-900">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800">Page Not Found</h2>
        <p className="text-gray-600">
          Oops! The leaf you are looking for seems to have blown away in the wind.
        </p>

        <Button onClick={() => navigate('/')} size="lg" className="mt-8">
          Return Home
        </Button>
      </motion.div>
    </div>
  );
}

import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const AgentProgram = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 text-center">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Partner Program</h1>
      <p className="text-xl text-gray-600 dark:text-gray-400 max-w-lg mb-8">
        We are currently refining our global partner program. Check back soon for updates on how to launch DealPass in your city.
      </p>
      <Link to="/">
        <Button size="lg">Return Home</Button>
      </Link>
    </div>
  );
};

export default AgentProgram;
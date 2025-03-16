'use client';

import React from 'react';
import TSXRendererApp from '@/components/tsx-renderer/TSXRendererApp';

// TSX Renderer Page Component
const TSXRendererPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-4 pb-8">
      <TSXRendererApp />
    </div>
  );
};

export default TSXRendererPage; 
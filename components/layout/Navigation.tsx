'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navigation: React.FC = () => {
  const pathname = usePathname();
  
  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          SVG Slide Editor
        </Link>
        
        <div className="flex gap-6">
          <Link 
            href="/" 
            className={`py-1 ${pathname === '/' ? 'border-b-2 border-purple-500' : 'hover:text-gray-300'}`}
          >
            Main Editor
          </Link>
          <Link 
            href="/svg-viewer" 
            className={`py-1 ${pathname === '/svg-viewer' ? 'border-b-2 border-purple-500' : 'hover:text-gray-300'}`}
          >
            SVG Viewer
          </Link>
          <Link 
            href="/tsx-renderer" 
            className={`py-1 ${pathname === '/tsx-renderer' ? 'border-b-2 border-purple-500' : 'hover:text-gray-300'}`}
          >
            TSX Renderer
          </Link>
          <Link 
            href="/markdown-editor" 
            className={`py-1 ${pathname === '/markdown-editor' ? 'border-b-2 border-purple-500' : 'hover:text-gray-300'}`}
          >
            Markdown Editor
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 
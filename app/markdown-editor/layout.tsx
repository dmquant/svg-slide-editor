import Link from 'next/link';
import React from 'react';

export default function MarkdownEditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="bg-white border-b px-4 py-2 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="font-semibold text-lg mr-4">
            SVG Slide Editor
          </Link>
          
          <nav className="flex space-x-4">
            <Link href="/" className="text-sm text-gray-700 hover:text-gray-900">
              Main Editor
            </Link>
            <Link href="/svg-viewer" className="text-sm text-gray-700 hover:text-gray-900">
              SVG Viewer
            </Link>
            <Link href="/tsx-renderer" className="text-sm text-gray-700 hover:text-gray-900">
              TSX Renderer
            </Link>
            <Link href="/markdown-editor" className="text-sm text-blue-600 font-medium">
              Markdown Editor
            </Link>
          </nav>
        </div>
      </header>
      {children}
    </>
  );
} 
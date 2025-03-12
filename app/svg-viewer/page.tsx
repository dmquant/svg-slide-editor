'use client';

import React from 'react';
import SVGImportViewer from '@/components/svg-editor/SVGImportViewer';

export default function SVGViewerPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <SVGImportViewer />
    </div>
  );
} 
"use client";

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Hide sidebar and topbar for full-screen pages like customer-display
  if (pathname === '/customer-display') {
    return <>{children}</>;
  }

  return (
    <div className="layout-container" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f6f9', position: 'relative' }}>
      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <div className={isSidebarOpen ? "sidebar-container open" : "sidebar-container"}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, width: '100%' }}>
        <Topbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main style={{ flex: 1, padding: '1rem', overflowX: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}

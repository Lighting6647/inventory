"use client";

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="layout-container" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f6f9', position: 'relative' }}>
      <style jsx global>{`
        .dpos-sidebar-drawer {
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          z-index: 1000;
          transition: transform 0.3s ease;
        }
        @media (max-width: 1023px) {
          .dpos-sidebar-drawer {
            transform: translateX(${isSidebarOpen ? '0' : '-100%'});
          }
          .dpos-backdrop {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 999;
          }
        }
        @media (min-width: 1024px) {
          .dpos-sidebar-drawer {
            position: sticky;
            transform: none !important;
          }
          .dpos-backdrop {
            display: none;
          }
        }
      `}</style>

      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div 
          className="dpos-backdrop" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <div className="dpos-sidebar-drawer">
        <Sidebar />
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

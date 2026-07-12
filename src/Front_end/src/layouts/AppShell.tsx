/**
 * AppShell.tsx
 * ─────────────────────────────────────────────────────────────
 * Global application shell — Stripe/Linear style fixed layout:
 *
 *  ┌─────────────────────────────────────────────────────┐
 *  │  NAVBAR  (fixed, h-[64px], z-50, full-width)        │
 *  ├──────────┬──────────────────────────────────────────┤
 *  │ SIDEBAR  │  MAIN CONTENT                            │
 *  │ (fixed,  │  (margin-left: 260px,                    │
 *  │  260px,  │   padding-top: 64px)                     │
 *  │  top:64) │                                          │
 *  └──────────┴──────────────────────────────────────────┘
 *
 * Usage:
 *   <AppShell sidebar={<MySidebar />}>
 *     <Outlet />  (or any page content)
 *   </AppShell>
 */
import React from 'react';
import { Outlet } from 'react-router-dom';

interface AppShellProps {
  /** Sidebar content (nav links, logo, user info, etc.) */
  sidebar: React.ReactNode;
  /** Override sidebar width (default 260px) */
  sidebarWidth?: number;
  /** Theme class applied on outermost wrapper (e.g. 'theme-owner') */
  themeClass?: string;
  /** Children OR use <Outlet /> if wrapping routes */
  children?: React.ReactNode;
}

const AppShell: React.FC<AppShellProps> = ({
  sidebar,
  sidebarWidth = 260,
  themeClass = '',
  children,
}) => {
  return (
    <div className={`app-shell ${themeClass}`} style={{ minHeight: '100vh', background: 'var(--lw-bg-primary, #F8F7F4)' }}>

      {/* ── SIDEBAR ──────────────────────────────────────────
          Fixed, positioned below the global navbar (top: 64px)
          Width: 260px (configurable via sidebarWidth prop)
      ─────────────────────────────────────────────────────── */}
      <aside
        className="app-sidebar"
        style={{
          position: 'fixed',
          top: '64px',
          left: 0,
          bottom: 0,
          width: `${sidebarWidth}px`,
          background: 'var(--lw-sidebar-bg, #ffffff)',
          borderRight: '1px solid var(--lw-border, #e5e7eb)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          overflowX: 'hidden',
          zIndex: 40,
          // Custom scrollbar — only sidebar nav area scrolls
          scrollbarWidth: 'thin',
          scrollbarColor: '#CBD5E1 transparent',
        }}
      >
        {sidebar}
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────────────────
          Offset from left by sidebar width, offset from top by navbar
      ─────────────────────────────────────────────────────── */}
      <main
        className="app-main"
        style={{
          marginLeft: `${sidebarWidth}px`,
          paddingTop: '64px',
          minHeight: '100vh',
          width: `calc(100% - ${sidebarWidth}px)`,
          background: 'var(--lw-bg-primary, #F8F7F4)',
          boxSizing: 'border-box',
        }}
      >
        <div
          className="app-main-inner"
          style={{
            padding: '24px 32px',
            minHeight: 'calc(100vh - 64px)',
          }}
        >
          {children ?? <Outlet />}
        </div>
      </main>
    </div>
  );
};

export default AppShell;

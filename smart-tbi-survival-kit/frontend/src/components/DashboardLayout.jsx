import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

/**
 * DashboardLayout — Shared layout for patient and doctor portals.
 * Renders a collapsible sidebar on the left and page content on the right.
 */
const DashboardLayout = ({ role }) => {
  return (
    <div className="flex min-h-screen bg-dark">
      <Sidebar role={role} />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;

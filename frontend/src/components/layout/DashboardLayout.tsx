import React from 'react';
import { Header } from '../dashboard/Header';
import { Sidebar, ActiveTab } from '../dashboard/Sidebar';
import { User } from '../../types';

interface DashboardLayoutProps {
  user: User | null;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onLogout: () => void;
  onOpenCompose: () => void;
  onRefresh: () => void;
  refreshing: boolean;
  scheduledCount: number;
  sentCount: number;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  user,
  activeTab,
  onSelectTab,
  onLogout,
  onOpenCompose,
  onRefresh,
  refreshing,
  scheduledCount,
  sentCount,
  children,
}) => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100">
      <Header
        user={user}
        onLogout={onLogout}
        onOpenCompose={onOpenCompose}
        onRefresh={onRefresh}
        refreshing={refreshing}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={onSelectTab}
          scheduledCount={scheduledCount}
          sentCount={sentCount}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
};

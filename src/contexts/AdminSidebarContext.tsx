import { createContext, useContext } from 'react';
import type { PropsWithChildren } from 'react';

type AdminSidebarContextValue = {
  openSidebar: () => void;
};

const AdminSidebarContext = createContext<AdminSidebarContextValue | null>(null);

type AdminSidebarProviderProps = PropsWithChildren<{
  openSidebar: () => void;
}>;

export const AdminSidebarProvider = ({ openSidebar, children }: AdminSidebarProviderProps) => (
  <AdminSidebarContext.Provider value={{ openSidebar }}>
    {children}
  </AdminSidebarContext.Provider>
);

export const useAdminSidebar = () => useContext(AdminSidebarContext);

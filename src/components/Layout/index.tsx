import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, className = '' }) => {
  return (
    <div className={`h-screen bg-gray-100 ${className}`}>
      {children}
    </div>
  );
};

export const Sidebar: React.FC<LayoutProps> = ({ children, className = '' }) => {
  return (
    <div className={`w-80 bg-white border-r border-gray-200 flex flex-col h-full ${className}`}>
      {children}
    </div>
  );
};

export const MainContent: React.FC<LayoutProps> = ({ children, className = '' }) => {
  return (
    <div className={`flex-1 flex flex-col h-full ${className}`}>
      {children}
    </div>
  );
};

export const Header: React.FC<LayoutProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-whatsapp-green text-white px-5 py-4 flex items-center justify-between border-b border-gray-200 ${className}`}>
      {children}
    </div>
  );
};

export const Content: React.FC<LayoutProps> = ({ children, className = '' }) => {
  return (
    <div className={`flex-1 overflow-hidden flex flex-col ${className}`}>
      {children}
    </div>
  );
};

export const Footer: React.FC<LayoutProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-whatsapp-gray-light px-5 py-3 border-t border-gray-200 ${className}`}>
      {children}
    </div>
  );
};

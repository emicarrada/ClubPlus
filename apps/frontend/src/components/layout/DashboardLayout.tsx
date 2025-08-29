import { Home, LogOut, Menu, User, X } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    {
      href: '/dashboard',
      icon: Home,
      label: 'Dashboard',
    },
    {
      href: '/profile',
      icon: User,
      label: 'Perfil',
    },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div
          className='fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden'
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
      `}
      >
        <div className='flex items-center justify-between h-16 px-4 border-b border-gray-200'>
          <h1 className='text-xl font-bold text-primary font-code'>Club+</h1>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className='lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100'
          >
            <X size={20} />
          </button>
        </div>

        <nav className='mt-8 px-4'>
          <ul className='space-y-2'>
            {menuItems.map(item => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={`
                      flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors
                      ${
                        isActive
                          ? 'bg-red-50 text-primary border-r-2 border-primary'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <Icon size={20} className='mr-3' />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className='mt-8 pt-8 border-t border-gray-200'>
            <Button
              variant='ghost'
              className='w-full justify-start text-gray-600 hover:text-gray-900'
              onClick={handleLogout}
            >
              <LogOut size={20} className='mr-3' />
              Cerrar Sesión
            </Button>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className='lg:pl-64'>
        {/* Top header */}
        <header className='bg-white shadow-sm border-b border-gray-200'>
          <div className='flex items-center justify-between h-16 px-4'>
            <button
              onClick={() => setIsSidebarOpen(true)}
              className='lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100'
            >
              <Menu size={20} />
            </button>

            <div className='flex items-center space-x-4'>
              <span className='text-sm text-gray-500'>
                Bienvenido, <span className='font-medium text-gray-900'>{user?.email}</span>
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className='flex-1'>
          <div className='py-6'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

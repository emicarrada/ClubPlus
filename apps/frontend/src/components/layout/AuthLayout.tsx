import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className='min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
      <div className='sm:mx-auto sm:w-full sm:max-w-md'>
        <div className='text-center'>
          <div className='flex justify-center mb-4'>
            <img src='/logos/club-plus-logo.png' alt='Club+ Logo' className='h-16 w-auto' />
          </div>
          <h1 className='text-3xl font-bold text-primary font-code'>Club+</h1>
          <p className='mt-2 text-sm text-gray-600'>Suscripciones digitales compartidas</p>
        </div>
      </div>

      <div className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'>
        <div className='bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10'>{children}</div>
      </div>

      <div className='mt-8 text-center'>
        <p className='text-xs text-gray-500'>© 2024 Club+. Todos los derechos reservados.</p>
      </div>
    </div>
  );
};

export default AuthLayout;

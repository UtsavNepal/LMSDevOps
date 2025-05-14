import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './presentation/component/Nabar';

const AppLayout: React.FC = () => {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen w-full overflow-hidden">
      <Navbar />
      <main className="flex-grow lg:ml-[222px] p-4 md:p-6 bg-gray-100 min-h-[calc(100vh-4rem)]">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
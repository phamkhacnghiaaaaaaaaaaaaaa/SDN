import React from 'react';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
  return (
    <>
        <div>
            Navbar
        </div>

        <main>
            <Outlet/>
        </main>

        <div>
            Footer
        </div>
    </>
  )
}

export default MainLayout;
import React from 'react'
import './index.css';
import Sidebar from './components/Sidebar.jsx'
import Navbar from './components/Navbar.jsx';
import { BrowserRouter, Outlet } from 'react-router-dom';
import { useStateContext } from './contexts/ContextProvider.jsx';
import { useSelector } from 'react-redux';
import BottomNavigation from './components/BottomNavigation.jsx';

const Layout = ({ children }) => {
  const { activeMenu } = useStateContext();
  const { isLoggedIn } = useSelector((state) => {
    return state.auth;
  });
  return (
    <div>
      <BrowserRouter>
        <div className='flex flex-col relative'>

          {/* Header */}
          <div
            className=' navbar fixed m-0 bg-white h-16 w-full transition-all delay-150 duration-200 ease-in'>
            <div className="fixed md:static  w-full m-0">
              <Navbar />
            </div>
          </div>

          {/* Sidebar */}
          <div className={` ${activeMenu ? 'w-80' : 'w-16'} pt-16 px-2 fixed z-50 sidebar border-r-1 bg-white transition-all delay-100 ease-in duration-200 text-nowrap hidden md:block lg:block xl:block`}>
          {isLoggedIn && <Sidebar />}
          </div>

          {/* Main */}
          <div
            className={`${isLoggedIn ? 'ml-0 md:ml-16 lg:ml-16 xl:ml-20' : 'ml-0'} my-14 min-w-screen min-h-screen p-3 bg-gray-50`}
          >
            {children}
          </div>
          {/* Bottom Navigation */}
          <div className="block md:hidden lg:hidden xl:hidden"> 
          {isLoggedIn && <BottomNavigation />}
          </div>
        </div>
      </BrowserRouter>
    </div>
  )
}

export default Layout;
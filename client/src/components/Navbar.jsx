import React, { useEffect } from 'react'
import { AiOutlineMenu, AiOutlineClose } from 'react-icons/ai';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import logo from '../asset/logo.webp';
import { BsChatLeft } from "react-icons/bs";
import { RiNotification3Line } from "react-icons/ri";
import { MdKeyboardArrowDown } from "react-icons/md";
import { MdOutlineLogout, MdLogin, } from "react-icons/md";
import profile from '../asset/profile.webp';
import { useStateContext } from '../contexts/ContextProvider.jsx';
import { useNavigate } from 'react-router-dom';
import { Badge } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice.js';
import { CgProfile } from 'react-icons/cg'
// import logo from '../asset/logo.png';
axios.defaults.withCredentials = true;

const NavbarButton = ({ customFunc, icon, color, dotColor }) => (
  <button type='button' onClick={customFunc} style={{ color }}
    className='relative text-xl rounded-full p-2 hover:bg-light-gray'>
    <span style={{ background: dotColor }}
      className='absolute inline-flex rounded-full h-2 w-2 top-2' />
    {icon}
  </button>
);


const Navbar = () => {

  const {
    activeMenu,
    setActiveMenu,
    screenSize,
    setScreenSize } = useStateContext();

  useEffect(() => {
    const handleResize = () => setScreenSize(window.innerWidth);
    window.addEventListener('resize', handleResize);
    handleResize();
    console.log(window.innerWidth)
    return () => window.removeEventListener('resize', handleResize);
  }, [])

  const navigate = useNavigate();
  const { isLoggedIn, user } = useSelector((state) => {
    return state.auth;
  });

  const dispatch = useDispatch();
  const logOut = async () => {
    try {
      const response = await axios.post('/api/v1/user/logout');
      toast.success(response.data.message);
      dispatch(logout());
      navigate('/login');
      console.log(response.data);
    } catch (error) {
      toast.error(error.message);
    }
  };
  const profile = () => {
    navigate('/profile');
  }

  return (
    <div className='flex justify-between align-center py-2 px-6 relative w-full'>
      <div className='flex gap-4'>
        {isLoggedIn &&
          <button
            type='button'
            onClick={() => setActiveMenu((prevActiveMenu) => !prevActiveMenu)}
            style={{ color: 'blue' }}
            className='text-xl rounded-full self-center -ml-5 mr-4 hover:bg-light-gray transition-all delay-150 duration-150 ease-in hidden md:block lg:block xl:block'>
            {activeMenu ? <AiOutlineClose /> : <AiOutlineMenu />}
          </button>
        }
        <img
          src={logo}
          alt="logo"
          className='w-fit h-10 '
        />
        <span className='text-sm md:text-lg lg:text-xl uppercase transition-all delay-100 duration-300 ease-in items-center flex font-extrabold ml-1 text-slate-900' onClick={() =>navigate('/dashboard')}>
          Bhuvi Manager
        </span>
      </div>

      <div className="flex items-center">
        {isLoggedIn && (
          <>
            <div className='flex p-2'>
              <Badge
                count="0"
                onClick={() => { navigate('/message'); }}
                size="small"
                className="text-gray">
                <button type='button'
                  onClick={() => navigate('/message')}
                  style={{ color: 'blue' }}
                  className='text-xl rounded-full hover:bg-light-gray'>
                  <RiNotification3Line size={20} className="text-lg lg:text-xl" />
                </button>
              </Badge>
            </div>
            <NavbarButton
              customFunc={profile}
              color='blue'
              icon={<CgProfile size={20} />} />
          </>
        )}
        {isLoggedIn ? (
          <NavbarButton
            customFunc={logOut}
            color='blue'
            icon={<MdOutlineLogout />} />
        ) : (
          <NavbarButton
            customFunc={() => navigate('/login')}
            color='blue'
            icon={<MdLogin />} />
        )}
      </div>
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  )
}

export default Navbar
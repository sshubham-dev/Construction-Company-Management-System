import React, { useEffect } from "react";
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai";
import toast from "react-hot-toast";
import axios from "axios";
import logo from "../asset/logo.png";
import { MdOutlineLogout, MdLogin } from "react-icons/md";
import { useStateContext } from "../contexts/ContextProvider.jsx";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../features/auth/authSlice.js";
import { CgProfile } from "react-icons/cg";
import { FiMenu } from "react-icons/fi";
import Notification from "./Notification.jsx";

axios.defaults.withCredentials = true;

const NavbarButton = ({ customFunc, icon, color, dotColor }) => (
  <button
    type="button"
    onClick={customFunc}
    style={{ color }}
    className="relative text-xl rounded-full p-2 hover:bg-light-gray"
  >
    <span
      style={{ background: dotColor }}
      className="absolute inline-flex rounded-full h-2 w-2 top-2"
    />
    {icon}
  </button>
);

const Navbar = ({ title, onMenuClick }) => {
  // const { activeMenu, setActiveMenu, setScreenSize } = useStateContext();

  const navigate = useNavigate();
  const { isLoggedIn, user } = useSelector((state) => {
    return state.auth;
  });

  const dispatch = useDispatch();
  const logOut = async () => {
    try {
      const response = await axios.post("/api/v1/user/logout");
      toast.success(response.data.message);
      dispatch(logout());
      navigate("/login");
      console.log(response.data);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 bg-white shadow z-40 ${isLoggedIn ? 'xl:ml-16' : 'ml-0'}`}>
      <div className="flex items-center justify-between px-4 h-14">
        {isLoggedIn &&
        <div className="flex items-center space-x-4">
          <button
            className="lg:hidden p-1 rounded hover:bg-gray-100"
            onClick={onMenuClick}
          >
            <FiMenu size={24} />
          </button>
          {/* <span className="font-bold text-lg text-center hidden sm:block">BhuviManager</span> */}
        </div>}
        <h1 className=" font-semibold lg:text-lg text-black">BhuviManager</h1>

        {/* <div className="flex gap-4">
          {isLoggedIn && (
            <button
              type="button"
              onClick={() => setActiveMenu((prevActiveMenu) => !prevActiveMenu)}
              style={{ color: "blue" }}
              className="text-xl rounded-full self-center -ml-5 mr-4 hover:bg-light-gray transition-all delay-150 duration-150 ease-in hidden md:block lg:block xl:block"
            >
              {activeMenu ? <AiOutlineClose /> : <AiOutlineMenu />}
            </button>
          )}
          <img src={logo} alt="logo" className="w-fit h-12 " />
          <span
            className="text-sm md:text-lg lg:text-xl uppercase transition-all delay-100 duration-300 ease-in items-center flex font-extrabold text-slate-900"
            onClick={() => navigate("/dashboard")}
          >
            Bhuvi Manager
          </span>
        </div> */}

        <div className="flex items-center mr-4 gap-1">
          {isLoggedIn && (
            <>
              <div className="p-2">
                <Notification />
              </div>
              {/* <NavbarButton
                customFunc={profile}
                color="blue"
                icon={<CgProfile size={20} />}
              /> */}
            </>
          )}
          {isLoggedIn ? (
            <NavbarButton
              customFunc={logOut}
              color="blue"
              icon={<MdOutlineLogout />}
            />
          ) : (
            <NavbarButton
              customFunc={() => navigate("/login")}
              color="blue"
              icon={<MdLogin />}
            />
          )}
        </div>
     
      </div>
    </header>
  );
};

export default Navbar;

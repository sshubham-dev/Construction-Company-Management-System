import { useState, useEffect } from "react";
import "./index.css";
import Sidebar from "./components/Sidebar.jsx";
import Navbar from "./components/Navbar.jsx";
import { BrowserRouter } from "react-router-dom";
import { useStateContext } from "./contexts/ContextProvider.jsx";
import { useSelector } from "react-redux";
import BottomNavigation from "./components/BottomNavigation.jsx";
import NewYearExperience from "./pages/NewYearExperience.jsx";

const Layout = ({ children }) => {
  const { activeMenu } = useStateContext();
  const { isLoggedIn, user } = useSelector((state) => {
    return state.auth;
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true); // default expanded on desktop

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarExpanded(false);
    }
  }, []);

  const handleSidebarToggle = () => {
    if (window.innerWidth >= 1024) {
      setSidebarExpanded((prev) => !prev);
    } else {
      setSidebarOpen(true);
    }
  };
  return (
    <div>
      <BrowserRouter>
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar */}
          {isLoggedIn && (
            <Sidebar
            isOpen={sidebarOpen}
            expanded={sidebarExpanded}
            onClose={() => setSidebarOpen(false)}
            onToggleExpand={handleSidebarToggle}
            />
          )}

          {/* Main area */}
          <div className="flex flex-1 flex-col min-w-0">
            {/* Navbar */}
            <Navbar onMenuClick={handleSidebarToggle} />

            {/* Page Content */}
            <main
              className={`flex-1 w-full mt-14 ${isLoggedIn ? "mb-14" : "mb-0"} lg:mb-0 p-4 overflow-y-auto min-w-0 bg-gradient-to-br from-[#eeffda] to-white`}
            >
          {isLoggedIn && <NewYearExperience user={user} />}
              {children}
            </main>

            {/* Bottom Nav for Mobile */}
            {isLoggedIn && <BottomNavigation />}
          </div>
        </div>
      </BrowserRouter>
    </div>
  );
};

export default Layout;

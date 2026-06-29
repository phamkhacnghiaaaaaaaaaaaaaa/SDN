import React from "react";
import { Link, Outlet } from "react-router-dom";
import { House, Search, ShoppingCart, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";

import logo from "../assets/react.svg";

const MainLayout = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="">
        <div className=" flex justify-between items-center pt-10 pb-10 border-b-primary-hover border-bg max-w-7xl mx-auto px-4">
          <div className="flex gap-1 items-center text-2xl ">
            <img src={logo} />
            <div>Library SDN302</div>
          </div>
          <div className="relative flex items-center ">
            <div className="absolute z-100 pl-1">
              <Search className="text-black size-5" />
            </div>
            <input
              className="bg-white text-black border-radius-sm pl-7 h-8 w-100"
              placeholder="Search"
            />
          </div>
          <div className="flex gap-2 items-center text-[12px]">
            <div className="hover:text-primary flex gap-1 items-center">
              <House /> <Link to="/">Homepage</Link>
            </div>
            <div> | </div>
            <div className="flex gap-1 items-center">
              <User />{" "}
              <Link className="hover:text-primary" to="/login">
                Log in
              </Link>{" "}
              {" / "}
              {!isAuthenticated ? (
                <Link className="hover:text-primary" to="/signup">
                  Sign up
                </Link>
              ) : (
                <Link to="/profile">Profile</Link>
              )}
            </div>
            <div> | </div>
            <div className="relative ">
              <div className="bg-error w-4 rounded-2xl h-4 flex justify-center items-center absolute left-4 bottom-4">
                0
              </div>
              <Link to="/rental">
                <ShoppingCart className="hover:text-primary" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Outlet />
        </div>
      </main>
      <footer>
        <div className="max-w-7xl mx-auto px-6 py-4">Footer</div>
      </footer>
    </div>
  );
};

export default MainLayout;

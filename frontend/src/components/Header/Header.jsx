import React, { useState, useRef, useEffect, useContext } from "react";
import Logo from "./../../assets/images/logo3.png";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { BiMenu } from "react-icons/bi";
import { IoClose } from "react-icons/io5";

const Header = () => {
  const headerRef = useRef(null);
  const navigate = useNavigate();
  const { user, dispatch, role } = useContext(AuthContext);
  const [isMenuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    handleMenuToggle();
    navigate("/home");
    toast.info("Logged Out");
  };

  useEffect(() => {
    let lastScrollTop = window.pageYOffset;
    const header = headerRef.current;

    const handleWheel = (event) => {
      const currentScrollTop = window.pageYOffset;

      if (event.deltaY > 0) {
        // Scrolling down
        header.classList.add("hidden");
      } else {
        // Scrolling up
        header.classList.remove("hidden");
      }

      lastScrollTop = currentScrollTop;
    };

    window.addEventListener("wheel", handleWheel);

    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, []);

  const handleMenuToggle = () => {
    setMenuOpen(!isMenuOpen);
  };

  // Button styles
  const primaryButton = "px-6 py-2.5 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors duration-200 shadow-md hover:shadow-lg font-medium";
  const secondaryButton = "px-6 py-2.5 text-pink-600 hover:bg-pink-50 rounded-lg transition-colors duration-200 font-medium";
  const usernameStyle = "text-[18px] font-semibold text-pink-600 rounded hover:text-pink-700 cursor-pointer";

  return (
    <header ref={headerRef} className="transition-all shadow-md duration-300">
      <nav className="container mx-auto px-5 flex justify-between items-center py-2">
        {role === "admin" ? (
          <div className="h-8 md:h-12 md:hidden">
            <img src={Logo} alt="" className="h-full" />
          </div>
        ) : (
          <div className="h-8 md:h-12">
            <Link to={"/"}>
              <img src={Logo} alt="" className="h-full" />
            </Link>
          </div>
        )}

        <div className="flex gap-2 md:hidden">
          {user ? (
            <div className="flex gap-3 items-center">
              <Link
                className={usernameStyle}
                to={role === "user" && "/my-account"}
              >
                {user.username}
              </Link>
            </div>
          ) : null}
          <BiMenu
            className="w-8 h-8 cursor-pointer"
            onClick={handleMenuToggle}
          />
        </div>

        {isMenuOpen && (
          <div className="md:hidden fixed text-center top-0 h-screen right-0 w-2/3 bg-gray-100 duration-300 p-4 shadow-md z-40">
            <IoClose
              className="w-8 h-8 cursor-pointer absolute top-4 right-0 mr-6 text-gray-600 hover:text-black"
              onClick={handleMenuToggle}
            />
            <ul className="flex flex-col item-center h-full justify-center gap-10">
              {role !== "admin" && (
                <>
                  <Link to="/home" onClick={handleMenuToggle}>
                    Home
                  </Link>
                  <Link to="/tours" onClick={handleMenuToggle}>
                    Tours
                  </Link>
                  <Link to="/about" onClick={handleMenuToggle}>
                    Gallery
                  </Link>
                  <Link to="/contact" onClick={handleMenuToggle}>
                    Contact
                  </Link>
                </>
              )}
              {role === "admin" && (
                <>
                  <Link to="/" onClick={handleMenuToggle}>
                    Home
                  </Link>
                  <Link to="/all-booking" onClick={handleMenuToggle}>
                    Bookings
                  </Link>
                  <Link to="/all-tours" onClick={handleMenuToggle}>
                    Tours
                  </Link>
                  <Link to="/create" onClick={handleMenuToggle}>
                    Create
                  </Link>
                </>
              )}
              {user ? (
                <button
                  onClick={handleLogout}
                  className={primaryButton}
                >
                  Logout
                </button>
              ) : null}
              {user ? null : (
                <div className="flex items-center justify-center gap-4">
                  <Link to="/login" onClick={handleMenuToggle}>
                    <button className={secondaryButton}>
                      Login
                    </button>
                  </Link>
                  <Link to="/register" onClick={handleMenuToggle}>
                    <button className={primaryButton}>
                      Register
                    </button>
                  </Link>
                </div>
              )}
            </ul>
          </div>
        )}

        {role === "admin" ? (
          <ul className="md:flex hidden space-x-8">
            <Link to="/" className="hover:text-pink-600 transition-colors duration-200">
              Home
            </Link>
            <Link to="/all-booking" className="hover:text-pink-600 transition-colors duration-200">
              Bookings
            </Link>
            <Link to="/all-tours" className="hover:text-pink-600 transition-colors duration-200">
              Tours
            </Link>
            <Link to="/create" className="hover:text-pink-600 transition-colors duration-200">
              Create
            </Link>
          </ul>
        ) : (
          <ul className="md:flex hidden space-x-4">
            <Link to="/home" className="hover:text-pink-600 transition-colors duration-200">
              Home
            </Link>
            <Link to="/tours" className="hover:text-pink-600 transition-colors duration-200">
              Tours
            </Link>
            <Link to="/about" className="hover:text-pink-600 transition-colors duration-200">
              Gallery
            </Link>
            <Link to="/contact" className="hover:text-pink-600 transition-colors duration-200">
              Contact
            </Link>
          </ul>
        )}

        <div className="md:flex hidden items-center space-x-4">
          {user ? (
            <div className="flex gap-3 items-center">
              <Link
                className={usernameStyle}
                to={role === "user" && "/my-account"}
              >
                {user.username}
              </Link>
              <button
                onClick={handleLogout}
                className={primaryButton}
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/login">
                <button className={secondaryButton}>
                  Login
                </button>
              </Link>
              <Link to="/register">
                <button className={primaryButton}>
                  Register
                </button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
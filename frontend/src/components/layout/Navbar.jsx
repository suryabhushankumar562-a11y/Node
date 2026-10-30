import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FiMenu, FiX, FiUser, FiHeart, FiMoon, FiSun } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { logoutUser } from '../../features/auth/authSlice';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/services', label: 'Services' },
  { to: '/therapists', label: 'Therapists' },
  { to: '/membership', label: 'Membership' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/blogs', label: 'Blogs' },
  { to: '/contact', label: 'Contact' },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-luxe-dark/90 backdrop-blur-md shadow-sm">
      <nav className="container-luxe flex items-center justify-between h-20">
        <Link to="/" className="text-2xl font-display font-bold text-luxe-gold">
          Luxe<span className="text-luxe-dark dark:text-luxe-cream"> Spa</span>
        </Link>

        <ul className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `text-sm font-medium tracking-wide transition-colors ${
                    isActive ? 'text-luxe-gold' : 'hover:text-luxe-gold'
                  }`
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-4">
          <button onClick={() => setDark(!dark)} aria-label="Toggle dark mode" className="text-xl">
            {dark ? <FiSun /> : <FiMoon />}
          </button>

          {isAuthenticated ? (
            <>
              <Link to="/dashboard/wishlist" className="text-xl hidden sm:inline-block">
                <FiHeart />
              </Link>
              <Link
                to={
                  user?.role === 'admin'
                    ? '/admin/dashboard'
                    : user?.role === 'therapist'
                    ? '/therapist/dashboard'
                    : user?.role === 'receptionist'
                    ? '/receptionist/dashboard'
                    : '/dashboard'
                }
                className="btn-outline !py-2 !px-4 text-sm hidden sm:inline-flex items-center gap-2"
              >
                <FiUser /> {user?.name?.split(' ')[0]}
              </Link>
              <button onClick={() => dispatch(logoutUser())} className="text-sm hidden sm:inline">
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-primary !py-2 !px-5 text-sm hidden sm:inline-flex">
              Login / Sign up
            </Link>
          )}

          <button className="lg:hidden text-2xl" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden bg-white dark:bg-luxe-dark overflow-hidden"
          >
            <ul className="flex flex-col gap-4 p-6">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <NavLink to={link.to} onClick={() => setOpen(false)} className="text-base font-medium">
                    {link.label}
                  </NavLink>
                </li>
              ))}
              {!isAuthenticated && (
                <Link to="/login" className="btn-primary text-center" onClick={() => setOpen(false)}>
                  Login / Sign up
                </Link>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;

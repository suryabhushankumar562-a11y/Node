import { Outlet, NavLink, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../features/auth/authSlice';

const menus = {
  customer: [
    { to: '/dashboard', label: 'Overview', end: true },
    { to: '/dashboard/bookings', label: 'My Bookings' },
    { to: '/dashboard/invoices', label: 'Invoices' },
    { to: '/dashboard/wishlist', label: 'Wishlist' },
    { to: '/dashboard/membership', label: 'Membership' },
    { to: '/dashboard/coupons', label: 'Coupons' },
    { to: '/dashboard/addresses', label: 'Addresses' },
    { to: '/dashboard/notifications', label: 'Notifications' },
    { to: '/dashboard/profile', label: 'Profile' },
  ],
  admin: [
    { to: '/admin/dashboard', label: 'Analytics', end: true },
    { to: '/admin/bookings', label: 'Bookings' },
    { to: '/admin/services', label: 'Services' },
    { to: '/admin/therapists', label: 'Therapists' },
    { to: '/admin/receptionists', label: 'Receptionists' },
    { to: '/admin/users', label: 'Users' },
    { to: '/admin/memberships', label: 'Memberships' },
    { to: '/admin/coupons', label: 'Coupons' },
    { to: '/admin/reviews', label: 'Reviews' },
    { to: '/admin/blogs', label: 'Blogs' },
    { to: '/admin/gallery', label: 'Gallery' },
    { to: '/admin/reports', label: 'Reports' },
    { to: '/admin/settings', label: 'Settings' },
  ],
  therapist: [
    { to: '/therapist/dashboard', label: 'Overview', end: true },
    { to: '/therapist/bookings', label: 'Assigned Bookings' },
    { to: '/therapist/availability', label: 'Availability' },
    { to: '/therapist/leaves', label: 'Leaves' },
    { to: '/therapist/profile', label: 'Profile' },
  ],
  receptionist: [
    { to: '/receptionist/dashboard', label: 'Overview', end: true },
    { to: '/receptionist/bookings', label: 'All Bookings' },
    { to: '/receptionist/customers', label: 'Customers' },
  ],
};

const DashboardLayout = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const items = menus[user?.role] || menus.customer;

  return (
    <div className="min-h-screen flex bg-luxe-cream/40 dark:bg-luxe-dark">
      <aside className="w-64 hidden md:flex flex-col bg-white dark:bg-neutral-900 shadow-sm">
        <Link to="/" className="text-xl font-display font-bold text-luxe-gold p-6 border-b border-black/5">
          Luxe Spa
        </Link>
        <nav className="flex-1 p-4 space-y-1">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-luxe-gold text-white' : 'hover:bg-luxe-gold/10'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={() => dispatch(logoutUser())}
          className="m-4 text-sm text-left px-4 py-2.5 rounded-lg hover:bg-red-50 text-red-600"
        >
          Logout
        </button>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white dark:bg-neutral-900 shadow-sm flex items-center justify-between px-6">
          <h1 className="font-display text-lg capitalize">{user?.role} Dashboard</h1>
          <span className="text-sm text-neutral-500">{user?.name}</span>
        </header>
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

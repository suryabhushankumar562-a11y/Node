import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import PublicLayout from './components/layout/PublicLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import PageStub from './components/common/PageStub';

import Home from './pages/public/Home';
import Services from './pages/public/Services';
import ServiceDetail from './pages/public/ServiceDetail';
import NotFound from './pages/public/NotFound';
import Unauthorized from './pages/public/Unauthorized';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

import Checkout from './pages/customer/Checkout';
import CustomerOverview from './pages/customer/CustomerOverview';
import MyBookings from './pages/customer/MyBookings';

import AdminOverview from './pages/admin/AdminOverview';

import { fetchCurrentUser, setAccessToken } from './features/auth/authSlice';

function App() {
  const dispatch = useDispatch();
  const { accessToken } = useSelector((state) => state.auth);

  // On app load, attempt a silent refresh so a persisted session works
  // across browser restarts even though the access token itself isn't persisted.
  useEffect(() => {
    if (accessToken) {
      dispatch(fetchCurrentUser());
    } else {
      dispatch(setAccessToken(null));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Routes>
      {/* Public site */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/:slug" element={<ServiceDetail />} />
        <Route path="/therapists" element={<PageStub title="Our Therapists" />} />
        <Route path="/membership" element={<PageStub title="Membership Plans" />} />
        <Route path="/gallery" element={<PageStub title="Gallery" />} />
        <Route path="/blogs" element={<PageStub title="Blogs" />} />
        <Route path="/faqs" element={<PageStub title="FAQs" />} />
        <Route path="/contact" element={<PageStub title="Contact Us" />} />
        <Route path="/about" element={<PageStub title="About Us" />} />
        <Route path="/terms" element={<PageStub title="Terms & Conditions" />} />
        <Route path="/privacy" element={<PageStub title="Privacy Policy" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<PageStub title="Forgot Password" />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Checkout requires auth but keeps the public nav */}
        <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
          <Route path="/booking/checkout" element={<Checkout />} />
        </Route>
      </Route>

      {/* Customer dashboard */}
      <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<CustomerOverview />} />
          <Route path="bookings" element={<MyBookings />} />
          <Route path="invoices" element={<PageStub title="Invoices" />} />
          <Route path="wishlist" element={<PageStub title="Wishlist" />} />
          <Route path="membership" element={<PageStub title="Membership" />} />
          <Route path="coupons" element={<PageStub title="Coupons" />} />
          <Route path="addresses" element={<PageStub title="Addresses" />} />
          <Route path="notifications" element={<PageStub title="Notifications" />} />
          <Route path="profile" element={<PageStub title="Profile" />} />
        </Route>
      </Route>

      {/* Admin dashboard */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin" element={<DashboardLayout />}>
          <Route path="dashboard" element={<AdminOverview />} />
          <Route path="bookings" element={<PageStub title="All Bookings" />} />
          <Route path="services" element={<PageStub title="Manage Services" />} />
          <Route path="therapists" element={<PageStub title="Manage Therapists" />} />
          <Route path="receptionists" element={<PageStub title="Manage Receptionists" />} />
          <Route path="users" element={<PageStub title="Manage Users" />} />
          <Route path="memberships" element={<PageStub title="Membership Plans" />} />
          <Route path="coupons" element={<PageStub title="Coupons & Offers" />} />
          <Route path="reviews" element={<PageStub title="Reviews Moderation" />} />
          <Route path="blogs" element={<PageStub title="Manage Blogs" />} />
          <Route path="gallery" element={<PageStub title="Manage Gallery" />} />
          <Route path="reports" element={<PageStub title="Reports" />} />
          <Route path="settings" element={<PageStub title="Website Settings" />} />
        </Route>
      </Route>

      {/* Therapist dashboard */}
      <Route element={<ProtectedRoute allowedRoles={['therapist']} />}>
        <Route path="/therapist" element={<DashboardLayout />}>
          <Route path="dashboard" element={<PageStub title="Therapist Overview" />} />
          <Route path="bookings" element={<PageStub title="Assigned Bookings" />} />
          <Route path="availability" element={<PageStub title="Availability" />} />
          <Route path="leaves" element={<PageStub title="Leaves" />} />
          <Route path="profile" element={<PageStub title="Therapist Profile" />} />
        </Route>
      </Route>

      {/* Receptionist dashboard */}
      <Route element={<ProtectedRoute allowedRoles={['receptionist']} />}>
        <Route path="/receptionist" element={<DashboardLayout />}>
          <Route path="dashboard" element={<PageStub title="Receptionist Overview" />} />
          <Route path="bookings" element={<PageStub title="All Bookings" />} />
          <Route path="customers" element={<PageStub title="Customers" />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;

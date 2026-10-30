import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { loginUser } from '../../features/auth/authSlice';

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, status } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const onSubmit = (data) => dispatch(loginUser(data));

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-luxe-cream/40 dark:bg-luxe-dark py-16">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-2xl font-display mb-2">Welcome Back</h1>
        <p className="text-sm text-neutral-500 mb-8">Log in to manage your bookings and membership.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              className="mt-1 w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-luxe-gold"
              {...register('email', { required: 'Email is required' })}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              className="mt-1 w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-luxe-gold"
              {...register('password', { required: 'Password is required' })}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <div className="flex justify-end text-sm">
            <Link to="/forgot-password" className="text-luxe-gold">Forgot password?</Link>
          </div>

          <button type="submit" disabled={status === 'loading'} className="btn-primary w-full">
            {status === 'loading' ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center text-sm mt-6">
          Don&apos;t have an account? <Link to="/register" className="text-luxe-gold font-medium">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

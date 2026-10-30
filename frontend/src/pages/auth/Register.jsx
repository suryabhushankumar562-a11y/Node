import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { registerUser } from '../../features/auth/authSlice';

const Register = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, status } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const onSubmit = (data) => dispatch(registerUser(data));

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-luxe-cream/40 dark:bg-luxe-dark py-16">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-2xl font-display mb-2">Create Your Account</h1>
        <p className="text-sm text-neutral-500 mb-8">Join Luxe Spa and start your wellness journey.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="text-sm font-medium">Full Name</label>
            <input
              className="mt-1 w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-luxe-gold"
              {...register('name', { required: 'Name is required' })}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

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
            <label className="text-sm font-medium">Phone</label>
            <input
              className="mt-1 w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-luxe-gold"
              {...register('phone', {
                required: 'Phone is required',
                pattern: { value: /^[0-9]{10}$/, message: 'Enter a valid 10-digit number' },
              })}
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              className="mt-1 w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-luxe-gold"
              {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium">Confirm Password</label>
            <input
              type="password"
              className="mt-1 w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-luxe-gold"
              {...register('confirmPassword', {
                validate: (value) => value === watch('password') || 'Passwords do not match',
              })}
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <button type="submit" disabled={status === 'loading'} className="btn-primary w-full">
            {status === 'loading' ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm mt-6">
          Already have an account? <Link to="/login" className="text-luxe-gold font-medium">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchMyBookings } from '../../features/booking/bookingSlice';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  'in-progress': 'bg-indigo-100 text-indigo-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  rescheduled: 'bg-purple-100 text-purple-700',
};

const CustomerOverview = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { myBookings } = useSelector((state) => state.booking);

  useEffect(() => {
    dispatch(fetchMyBookings({ limit: 5 }));
  }, [dispatch]);

  return (
    <div>
      <div className="grid sm:grid-cols-3 gap-6 mb-10">
        <div className="card p-6">
          <p className="text-sm text-neutral-500">Membership</p>
          <p className="text-xl font-semibold capitalize mt-1">{user?.membership?.plan || 'None'}</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-neutral-500">Reward Points</p>
          <p className="text-xl font-semibold mt-1">{user?.membership?.rewardPoints || 0}</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-neutral-500">Total Bookings</p>
          <p className="text-xl font-semibold mt-1">{myBookings.length}</p>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-display text-lg">Recent Bookings</h3>
          <Link to="/dashboard/bookings" className="text-sm text-luxe-gold">View all</Link>
        </div>
        <div className="space-y-3">
          {myBookings.map((b) => (
            <div key={b._id} className="flex items-center justify-between border-b last:border-0 pb-3">
              <div>
                <p className="font-medium">{b.service?.title}</p>
                <p className="text-xs text-neutral-500">{new Date(b.date).toDateString()} • {b.startTime}</p>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full capitalize ${statusColors[b.status]}`}>
                {b.status}
              </span>
            </div>
          ))}
          {!myBookings.length && <p className="text-sm text-neutral-500">No bookings yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default CustomerOverview;

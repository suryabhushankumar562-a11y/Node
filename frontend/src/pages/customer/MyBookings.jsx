import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyBookings, cancelBooking } from '../../features/booking/bookingSlice';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  'in-progress': 'bg-indigo-100 text-indigo-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  rescheduled: 'bg-purple-100 text-purple-700',
};

const MyBookings = () => {
  const dispatch = useDispatch();
  const { myBookings } = useSelector((state) => state.booking);

  useEffect(() => {
    dispatch(fetchMyBookings());
  }, [dispatch]);

  const handleCancel = (id) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      dispatch(cancelBooking({ id, reason: 'Customer requested cancellation' }));
    }
  };

  return (
    <div className="card p-6">
      <h1 className="text-xl font-display mb-6">My Bookings</h1>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-neutral-500 border-b">
              <th className="pb-3">Booking Code</th>
              <th className="pb-3">Service</th>
              <th className="pb-3">Date & Time</th>
              <th className="pb-3">Amount</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {myBookings.map((b) => (
              <tr key={b._id} className="border-b last:border-0">
                <td className="py-3 font-medium">{b.bookingCode}</td>
                <td className="py-3">{b.service?.title}</td>
                <td className="py-3">{new Date(b.date).toDateString()} • {b.startTime}</td>
                <td className="py-3">₹{b.priceDetails?.totalAmount}</td>
                <td className="py-3">
                  <span className={`text-xs px-3 py-1 rounded-full capitalize ${statusColors[b.status]}`}>
                    {b.status}
                  </span>
                </td>
                <td className="py-3">
                  {['pending', 'confirmed'].includes(b.status) && (
                    <button onClick={() => handleCancel(b._id)} className="text-red-600 text-xs">
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!myBookings.length && <p className="text-center text-neutral-500 py-10">No bookings found.</p>}
      </div>
    </div>
  );
};

export default MyBookings;

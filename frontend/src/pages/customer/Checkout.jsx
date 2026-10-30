import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { createBooking, clearDraft } from '../../features/booking/bookingSlice';
import api from '../../utils/api';

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const Checkout = () => {
  const { draft } = useSelector((state) => state.booking);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();
  const [couponCode, setCouponCode] = useState('');
  const [processing, setProcessing] = useState(false);

  const onSubmit = async (formData) => {
    if (!draft.serviceId) return toast.error('Booking details missing, please start again');
    setProcessing(true);
    try {
      const result = await dispatch(
        createBooking({
          serviceId: draft.serviceId,
          therapistId: draft.therapistId,
          date: draft.date,
          startTime: draft.startTime,
          address: formData,
          couponCode: couponCode || undefined,
        })
      ).unwrap();

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Unable to load payment gateway. Check your connection.');
        return;
      }

      const options = {
        key: result.razorpayKeyId,
        amount: result.razorpayOrder.amount,
        currency: result.razorpayOrder.currency,
        name: 'Luxe Spa & Wellness',
        description: 'Spa Booking Payment',
        order_id: result.razorpayOrder.id,
        prefill: { name: user?.name, email: user?.email, contact: user?.phone },
        theme: { color: '#B08D57' },
        handler: async (response) => {
          try {
            await api.post('/bookings/verify-payment', {
              bookingId: result.booking._id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success('Payment successful! Booking confirmed.');
            dispatch(clearDraft());
            navigate('/dashboard/bookings');
          } catch {
            toast.error('Payment verification failed');
          }
        },
        modal: { ondismiss: () => toast('Payment cancelled') },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      // errors already toasted by slice
    } finally {
      setProcessing(false);
    }
  };

  if (!draft.serviceId) {
    return (
      <div className="container-luxe py-24 text-center">
        <p className="text-neutral-500">No booking in progress. Please select a service first.</p>
      </div>
    );
  }

  return (
    <div className="container-luxe py-16 max-w-2xl">
      <h1 className="text-2xl font-display mb-8">Complete Your Booking</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-4">
        <h3 className="font-medium">Service Address</h3>
        <input placeholder="Address Line 1" className="w-full border rounded-lg px-4 py-2.5" {...register('line1', { required: true })} />
        <input placeholder="Address Line 2 (optional)" className="w-full border rounded-lg px-4 py-2.5" {...register('line2')} />
        <div className="grid grid-cols-2 gap-4">
          <input placeholder="City" className="border rounded-lg px-4 py-2.5" {...register('city', { required: true })} />
          <input placeholder="State" className="border rounded-lg px-4 py-2.5" {...register('state', { required: true })} />
        </div>
        <input placeholder="Pincode" className="w-full border rounded-lg px-4 py-2.5" {...register('pincode', { required: true })} />

        <h3 className="font-medium pt-4">Have a Coupon?</h3>
        <input
          placeholder="Enter coupon code"
          className="w-full border rounded-lg px-4 py-2.5 uppercase"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
        />

        <button type="submit" disabled={processing} className="btn-primary w-full mt-4">
          {processing ? 'Processing...' : 'Pay & Confirm Booking'}
        </button>
        <p className="text-xs text-center text-neutral-400">Payments are securely processed via Razorpay (Sandbox Mode)</p>
      </form>
    </div>
  );
};

export default Checkout;

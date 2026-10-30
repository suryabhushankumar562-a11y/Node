import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiClock, FiStar, FiCheck } from 'react-icons/fi';
import { fetchServiceBySlug } from '../../features/services/servicesSlice';
import { setDraft } from '../../features/booking/bookingSlice';
import toast from 'react-hot-toast';

const timeSlots = ['09:00', '10:30', '12:00', '14:00', '15:30', '17:00', '18:30'];

const ServiceDetail = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current: service } = useSelector((state) => state.services);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [therapistId, setTherapistId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  useEffect(() => {
    dispatch(fetchServiceBySlug(slug));
  }, [dispatch, slug]);

  if (!service) return <div className="container-luxe py-24 text-center">Loading service...</div>;

  const handleProceed = () => {
    if (!isAuthenticated) return navigate('/login');
    if (!therapistId || !date || !time) return toast.error('Please select therapist, date and time');
    dispatch(setDraft({ serviceId: service._id, therapistId, date, startTime: time }));
    navigate('/booking/checkout');
  };

  return (
    <div className="container-luxe py-16 grid lg:grid-cols-3 gap-12">
      <div className="lg:col-span-2">
        <img
          src={service.images?.[0]?.url || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1000'}
          alt={service.title}
          className="w-full h-96 object-cover rounded-2xl mb-8"
        />
        <h1 className="text-3xl font-display mb-3">{service.title}</h1>
        <div className="flex items-center gap-4 text-sm text-neutral-500 mb-6">
          <span className="flex items-center gap-1"><FiClock /> {service.durationMinutes} min</span>
          <span className="flex items-center gap-1"><FiStar className="text-luxe-gold" /> {service.ratingsAverage?.toFixed(1) || 'New'} ({service.ratingsCount} reviews)</span>
        </div>
        <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed mb-8">{service.description}</p>

        {service.benefits?.length > 0 && (
          <div>
            <h3 className="font-display text-xl mb-4">Benefits</h3>
            <ul className="grid grid-cols-2 gap-3">
              {service.benefits.map((b) => (
                <li key={b} className="flex items-center gap-2 text-sm">
                  <FiCheck className="text-luxe-gold" /> {b}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <aside className="card p-6 h-fit sticky top-24">
        <p className="text-2xl font-semibold mb-1">
          ₹{service.discountPrice > 0 ? service.discountPrice : service.price}
        </p>
        <p className="text-sm text-neutral-500 mb-6">Inclusive of applicable taxes at checkout</p>

        <label className="text-sm font-medium">Select Therapist</label>
        <select
          className="w-full border rounded-lg px-4 py-2.5 mt-1 mb-4"
          value={therapistId}
          onChange={(e) => setTherapistId(e.target.value)}
        >
          <option value="">Choose a therapist</option>
          {service.availableTherapists?.map((t) => (
            <option key={t._id} value={t._id}>{t.user?.name}</option>
          ))}
        </select>

        <label className="text-sm font-medium">Select Date</label>
        <input
          type="date"
          min={new Date().toISOString().split('T')[0]}
          className="w-full border rounded-lg px-4 py-2.5 mt-1 mb-4"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <label className="text-sm font-medium">Select Time</label>
        <div className="grid grid-cols-3 gap-2 mt-1 mb-6">
          {timeSlots.map((slot) => (
            <button
              key={slot}
              onClick={() => setTime(slot)}
              className={`text-xs py-2 rounded-lg border ${time === slot ? 'bg-luxe-gold text-white border-luxe-gold' : ''}`}
            >
              {slot}
            </button>
          ))}
        </div>

        <button onClick={handleProceed} className="btn-primary w-full">
          Proceed to Book
        </button>
      </aside>
    </div>
  );
};

export default ServiceDetail;

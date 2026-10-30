import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiCheck } from 'react-icons/fi';

import { fetchServices } from '../../features/services/servicesSlice';
import ServiceCard from '../../components/common/ServiceCard';
import { ServiceCardSkeleton } from '../../components/ui/Skeleton';

const Home = () => {
  const dispatch = useDispatch();
  const { list, status } = useSelector((state) => state.services);

  useEffect(() => {
    dispatch(fetchServices({ featured: true, limit: 4 }));
  }, [dispatch]);

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[85vh] flex items-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1600"
          alt="Luxury spa"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-luxe-dark/80 via-luxe-dark/50 to-transparent" />
        <div className="container-luxe relative z-10 text-white">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="uppercase tracking-[0.3em] text-luxe-gold text-sm mb-4"
          >
            Luxury Wellness Redefined
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl font-display font-bold max-w-2xl leading-tight"
          >
            Restore Your Body. Renew Your Mind.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 max-w-lg text-white/80"
          >
            Book premium spa therapies with expert therapists at your convenience.
            Doorstep or in-spa, your serenity is one click away.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-10 flex gap-4"
          >
            <Link to="/services" className="btn-primary flex items-center gap-2">
              Book a Session <FiArrowRight />
            </Link>
            <Link to="/membership" className="btn-outline !text-white !border-white hover:!text-luxe-dark">
              View Memberships
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured services */}
      <section className="container-luxe py-24">
        <div className="text-center max-w-xl mx-auto mb-14">
          <p className="uppercase tracking-[0.3em] text-luxe-gold text-xs mb-3">Signature Therapies</p>
          <h2 className="text-3xl font-display">Featured Services</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {status === 'loading'
            ? Array.from({ length: 4 }).map((_, i) => <ServiceCardSkeleton key={i} />)
            : list.map((service) => <ServiceCard key={service._id} service={service} />)}
        </div>
        <div className="text-center mt-12">
          <Link to="/services" className="btn-outline">
            Explore All Services
          </Link>
        </div>
      </section>

      {/* Why choose us */}
      <section className="bg-luxe-cream dark:bg-neutral-900 py-24">
        <div className="container-luxe grid md:grid-cols-2 gap-16 items-center">
          <img
            src="https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800"
            alt="Spa therapy"
            className="rounded-2xl shadow-xl"
          />
          <div>
            <p className="uppercase tracking-[0.3em] text-luxe-gold text-xs mb-3">Why Luxe Spa</p>
            <h2 className="text-3xl font-display mb-6">A Sanctuary Built Around You</h2>
            <ul className="space-y-4">
              {[
                'Certified & background-verified therapists',
                'Transparent pricing, zero hidden charges',
                'Flexible reschedule & cancellation',
                'Exclusive membership rewards & offers',
              ].map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <FiCheck className="text-luxe-gold mt-1 flex-shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

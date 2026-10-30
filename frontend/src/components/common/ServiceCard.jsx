import { Link } from 'react-router-dom';
import { FiClock, FiStar } from 'react-icons/fi';
import { motion } from 'framer-motion';

const ServiceCard = ({ service }) => {
  const price = service.discountPrice > 0 ? service.discountPrice : service.price;

  return (
    <motion.div whileHover={{ y: -6 }} className="card group">
      <Link to={`/services/${service.slug}`}>
        <div className="relative h-52 overflow-hidden">
          <img
            src={service.images?.[0]?.url || 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600'}
            alt={service.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {service.discountPrice > 0 && (
            <span className="absolute top-3 left-3 bg-luxe-gold text-white text-xs px-3 py-1 rounded-full">
              Save ₹{service.price - service.discountPrice}
            </span>
          )}
        </div>
        <div className="p-5">
          <h3 className="font-display text-lg mb-1 truncate">{service.title}</h3>
          <div className="flex items-center gap-3 text-sm text-neutral-500 mb-3">
            <span className="flex items-center gap-1">
              <FiClock /> {service.durationMinutes} min
            </span>
            <span className="flex items-center gap-1">
              <FiStar className="text-luxe-gold" /> {service.ratingsAverage?.toFixed(1) || 'New'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-lg">
              ₹{price}
              {service.discountPrice > 0 && (
                <span className="text-sm text-neutral-400 line-through ml-2">₹{service.price}</span>
              )}
            </span>
            <span className="btn-outline !py-1.5 !px-4 text-xs">Book Now</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ServiceCard;

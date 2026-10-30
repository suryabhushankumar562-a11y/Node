import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiSearch } from 'react-icons/fi';
import { fetchServices } from '../../features/services/servicesSlice';
import ServiceCard from '../../components/common/ServiceCard';
import { ServiceCardSkeleton } from '../../components/ui/Skeleton';

const Services = () => {
  const dispatch = useDispatch();
  const { list, pagination, status } = useSelector((state) => state.services);
  const [filters, setFilters] = useState({ search: '', sort: '', page: 1, limit: 9 });

  useEffect(() => {
    const timeout = setTimeout(() => dispatch(fetchServices(filters)), 300);
    return () => clearTimeout(timeout);
  }, [dispatch, filters]);

  return (
    <div className="container-luxe py-16">
      <div className="text-center max-w-xl mx-auto mb-12">
        <p className="uppercase tracking-[0.3em] text-luxe-gold text-xs mb-3">Our Menu</p>
        <h1 className="text-3xl font-display">All Spa Services</h1>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-10 justify-between">
        <div className="relative w-full sm:w-80">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            placeholder="Search services..."
            className="w-full border rounded-full pl-11 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-luxe-gold"
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))}
          />
        </div>
        <select
          className="border rounded-full px-4 py-2.5 focus:outline-none"
          value={filters.sort}
          onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value, page: 1 }))}
        >
          <option value="">Sort by</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
          <option value="popular">Most Popular</option>
          <option value="newest">Newest</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {status === 'loading'
          ? Array.from({ length: 9 }).map((_, i) => <ServiceCardSkeleton key={i} />)
          : list.map((service) => <ServiceCard key={service._id} service={service} />)}
      </div>

      {!list.length && status !== 'loading' && (
        <p className="text-center text-neutral-500 py-16">No services found matching your criteria.</p>
      )}

      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-14">
          {Array.from({ length: pagination.pages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setFilters((f) => ({ ...f, page: i + 1 }))}
              className={`w-10 h-10 rounded-full text-sm ${
                pagination.page === i + 1 ? 'bg-luxe-gold text-white' : 'border'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Services;

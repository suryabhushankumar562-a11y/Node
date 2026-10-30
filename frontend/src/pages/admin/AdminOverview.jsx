import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { fetchDashboardStats, fetchRevenueReport } from '../../features/admin/adminSlice';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const StatCard = ({ label, value }) => (
  <div className="card p-6">
    <p className="text-sm text-neutral-500">{label}</p>
    <p className="text-2xl font-semibold mt-1">{value}</p>
  </div>
);

const AdminOverview = () => {
  const dispatch = useDispatch();
  const { stats, revenueReport } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchRevenueReport('daily'));
  }, [dispatch]);

  const chartData = {
    labels: revenueReport.map((r) => r._id),
    datasets: [
      {
        label: 'Revenue (₹)',
        data: revenueReport.map((r) => r.revenue),
        borderColor: '#B08D57',
        backgroundColor: 'rgba(176, 141, 87, 0.15)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  return (
    <div className="space-y-8">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Customers" value={stats?.totalUsers ?? '—'} />
        <StatCard label="Total Therapists" value={stats?.totalTherapists ?? '—'} />
        <StatCard label="Total Bookings" value={stats?.totalBookings ?? '—'} />
        <StatCard label="Total Revenue" value={`₹${stats?.totalRevenue ?? 0}`} />
      </div>

      <div className="card p-6">
        <h3 className="font-display text-lg mb-4">Revenue Trend</h3>
        {revenueReport.length ? <Line data={chartData} /> : <p className="text-sm text-neutral-500">No revenue data yet.</p>}
      </div>
    </div>
  );
};

export default AdminOverview;

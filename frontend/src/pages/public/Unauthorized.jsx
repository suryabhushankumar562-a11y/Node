import { Link } from 'react-router-dom';

const Unauthorized = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center text-center">
    <h1 className="text-4xl font-display mb-4">Access Denied</h1>
    <p className="text-neutral-500 mb-6">You don't have permission to view this page.</p>
    <Link to="/" className="btn-primary">Back to Home</Link>
  </div>
);

export default Unauthorized;

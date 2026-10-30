import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center text-center">
    <h1 className="text-6xl font-display text-luxe-gold mb-4">404</h1>
    <p className="text-neutral-500 mb-6">The page you're looking for doesn't exist.</p>
    <Link to="/" className="btn-primary">Back to Home</Link>
  </div>
);

export default NotFound;

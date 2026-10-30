const Skeleton = ({ className = 'h-4 w-full' }) => <div className={`skeleton ${className}`} />;

export const ServiceCardSkeleton = () => (
  <div className="card p-4">
    <Skeleton className="h-48 w-full mb-4" />
    <Skeleton className="h-5 w-3/4 mb-2" />
    <Skeleton className="h-4 w-1/2 mb-4" />
    <Skeleton className="h-10 w-full" />
  </div>
);

export default Skeleton;

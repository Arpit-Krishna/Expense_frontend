import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="card mx-auto max-w-md text-center">
      <p className="text-4xl">🧭</p>
      <h1 className="mt-2 text-xl font-bold">Page not found</h1>
      <Link to="/" className="btn btn-primary mt-4">Go to dashboard</Link>
    </div>
  );
}

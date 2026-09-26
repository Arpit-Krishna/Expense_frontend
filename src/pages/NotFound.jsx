import { Compass } from '../lib/icons';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-xl bg-subtle text-muted"><Compass size={28} /></span>
      <h1 className="page-title mt-6">Page not found</h1>
      <p className="mt-2 text-muted">That link does not lead anywhere in Expensify.</p>
      <Link to="/" className="btn btn-primary mt-6">Go to dashboard</Link>
    </div>
  );
}

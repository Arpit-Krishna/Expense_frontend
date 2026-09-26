import { Component } from 'react';
import { isChunkError, reloadForNewBuild } from '../lib/chunkReload';
import { ArrowsClockwise, WarningCircle } from '../lib/icons';

/** Shows a way out instead of a blank page when something on a page throws. */
export default class ErrorBoundary extends Component {
  state = { error: null, stack: '' };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    this.setState({ stack: (info?.componentStack || '').trim().split('\n').slice(0, 6).join('\n') });
    if (isChunkError(error)) reloadForNewBuild();
    console.error(error);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    const update = isChunkError(error);
    return (
      <div role="alert" className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-xl bg-bad-soft text-bad"><WarningCircle size={28} /></span>
        <h1 className="page-title mt-6 text-4xl sm:text-4xl">{update ? 'Expensify was updated' : 'This page hit a problem'}</h1>
        <p className="mt-2 text-muted">
          {update ? 'Reload to get the latest version.' : 'Your data is safe. Reload the page, or go back to the dashboard.'}
        </p>
        <div className="mt-6 flex gap-3">
          <button className="btn btn-primary" onClick={() => window.location.reload()}><ArrowsClockwise size={15} /> Reload</button>
          {!update && <a href="/" className="btn btn-secondary">Dashboard</a>}
        </div>
        {!update && (
          <details className="mt-8 w-full text-left text-xs text-muted">
            <summary className="cursor-pointer text-center">Technical details</summary>
            <pre className="mt-3 max-h-60 overflow-auto whitespace-pre-wrap rounded-md border border-line bg-surface p-3 font-mono text-[11px] text-ink-soft">
              {`${error?.name || 'Error'}: ${error?.message || error}\n${window.location.pathname}\n${this.state.stack}`}
            </pre>
          </details>
        )}
      </div>
    );
  }
}

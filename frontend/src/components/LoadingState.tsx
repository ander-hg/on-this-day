export function LoadingState() {
  return (
    <div className="status-state" role="status" aria-live="polite">
      <span className="status-state__spinner" aria-hidden="true" />
      <p>Loading today&rsquo;s historical events&hellip;</p>
    </div>
  );
}

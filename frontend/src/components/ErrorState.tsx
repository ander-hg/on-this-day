interface ErrorStateProps {
  message: string;
}

export function ErrorState({ message }: ErrorStateProps) {
  return (
    <div className="status-state status-state--error" role="alert">
      <p>Something went wrong: {message}</p>
    </div>
  );
}

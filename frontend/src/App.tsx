import { Attribution } from "./components/Attribution";
import { EmptyState } from "./components/EmptyState";
import { ErrorState } from "./components/ErrorState";
import { EventList } from "./components/EventList";
import { LoadingState } from "./components/LoadingState";
import { TodayCard } from "./components/TodayCard";
import { useTodayEvents } from "./hooks/useTodayEvents";

function App() {
  const state = useTodayEvents();

  return (
    <div className="app">
      <header className="app__header">
        <h1>On This Day</h1>
        <p className="app__subtitle">Historical events from Wikipedia, for today&rsquo;s date.</p>
      </header>
      <main className="app__main">
        {state.status === "loading" && <LoadingState />}
        {state.status === "error" && <ErrorState message={state.message} />}
        {state.status === "empty" && <EmptyState />}
        {state.status === "success" && (
          <>
            <TodayCard event={state.data.featured} />
            <EventList events={state.data.events} />
          </>
        )}
      </main>
      <Attribution />
    </div>
  );
}

export default App;

import type { TodayEvent } from "../api/types";

interface EventListProps {
  events: TodayEvent[];
}

export function EventList({ events }: EventListProps) {
  if (events.length === 0) return null;

  return (
    <section className="event-list" aria-labelledby="event-list-heading">
      <h3 id="event-list-heading" className="event-list__heading">
        More events on this day
      </h3>
      <ul className="event-list__items">
        {events.map((event, index) => (
          <li key={`${String(index)}-${String(event.year)}`} className="event-list__item">
            <span className="event-list__year">{event.year}</span>
            <span className="event-list__text">
              {event.text}
              {event.wiki_url && (
                <>
                  {" "}
                  <a href={event.wiki_url} target="_blank" rel="noreferrer">
                    ({event.page_title ?? "source"})
                  </a>
                </>
              )}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

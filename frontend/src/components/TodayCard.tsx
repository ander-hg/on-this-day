import type { TodayEvent } from "../api/types";

interface TodayCardProps {
  event: TodayEvent;
}

export function TodayCard({ event }: TodayCardProps) {
  return (
    <article className="today-card">
      {event.thumbnail_url && (
        <img
          className="today-card__image"
          src={event.thumbnail_url}
          alt={event.page_title ? `Photograph related to ${event.page_title}` : ""}
        />
      )}
      <div className="today-card__body">
        <p className="today-card__year">{event.year}</p>
        <h2 className="today-card__text">{event.text}</h2>
        {event.extract && <p className="today-card__extract">{event.extract}</p>}
        {event.wiki_url && (
          <a
            className="today-card__link"
            href={event.wiki_url}
            target="_blank"
            rel="noreferrer"
          >
            Read more on Wikipedia
          </a>
        )}
      </div>
    </article>
  );
}

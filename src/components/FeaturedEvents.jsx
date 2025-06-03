import React from 'react';
import EventCard from '../components/EventCard';
import './FeaturedEvents.css';

function FeaturedEvents({ events }) {
  if (!events) {
    return <p>Loading events...</p>;
  }

  if (events.length === 0) {
    return <p>No events found.</p>;
  }

  return (
    <div className="events-grid" id="event-card">
      {events.slice(3).map(event => (
        <EventCard key={event.eventID} event={event} />
      ))}
    </div>
  );
}

export default FeaturedEvents;

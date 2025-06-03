import React from 'react';
import EventCard from '../components/EventCard';
import './UpcomingEvents.css';

function UpcomingEvents({ events }) {
  if (!events) {
    return <p>Loading events...</p>;
  }

  if (events.length === 0) {
    return <p>No events found.</p>;
  }

  // Get today's date (without time part)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Filter upcoming events and sort by date ascending
  const upcomingEvents = events
    .filter(event => {
      const eventDate = new Date(event.eventDate);
      return eventDate >= today;
    })
    .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))
    .slice(0, 3);

  if (upcomingEvents.length === 0) {
    return <p>No upcoming events found.</p>;
  }

  return (
    <div className="events-grid">
      {upcomingEvents.map(event => (
        <EventCard key={event.eventID} event={event} />
      ))}
    </div>
  );
}

export default UpcomingEvents;

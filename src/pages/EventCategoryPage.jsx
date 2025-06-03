import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import EventCard from '../components/EventCard';
import './EventCategoryPage.css';

function EventCategoryPage() {
  const { category } = useParams(); // e.g., 'music'
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/events')
      .then(res => res.json())
      .then(data => {
        setEvents(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching events:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading events...</p>;

  // Normalize category name (e.g., 'Music' for matching)
  const normalizedCategory = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();

  // Filter events by category or show all if category is 'all'
  const filteredEvents = normalizedCategory === 'All'
    ? events
    : events.filter(event => event.eventType === normalizedCategory);

  if (filteredEvents.length === 0) return <p>No events found in category: {normalizedCategory}</p>;

    return (
        <>
            <div className="title-with-arrow">
            <a href="/" className="back-arrow">&#8592;  </a>
            <h1>   {normalizedCategory}</h1>
            </div>

            <div className="events-grid">
            {filteredEvents.map(event => (
                <EventCard key={event.eventID} event={event} />
            ))}
            </div>
        </>
    );
}

export default EventCategoryPage;

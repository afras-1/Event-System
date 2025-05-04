import React, { useEffect, useState } from 'react';
import Categories from '../components/Categories';
import UpcomingEvents from '../components/UpcomingEvents';
import FeaturedEvents from '../components/FeaturedEvents';
import './Home.css';
import EventCard from '../components/EventCard';
import CreateAccountButton from '../components/CreateEventButton';

function Home() {
  const [dbEvents, setDbEvents] = useState([]);
  const [loadingDbEvents, setLoadingDbEvents] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/events')
      .then(res => res.json())
      .then(data => {
        console.log('Fetched DB events:', data);
        setDbEvents(data);
        setLoadingDbEvents(false);
      })
      .catch(err => {
        console.error('Error fetching events from DB:', err);
        setLoadingDbEvents(false);
      });
  }, []);

  const allEvents = [
    { id: 1, title: 'Tech Conference 2025', date: '2025-06-10', location: 'Sydney', price: '$99' },
    { id: 2, title: 'Startup Pitch Night', date: '2025-07-03', location: 'Melbourne', price: 'Free' },
    { id: 3, title: 'Wine & Art Expo', date: '2025-08-15', location: 'Brisbane', price: '$49' },
    { id: 4, title: 'React Developers Meetup', date: '2025-09-05', location: 'Online', price: 'Free' },
    { id: 5, title: 'AI & Machine Learning Expo', date: '2025-10-15', location: 'Sydney', price: '$120' },
    { id: 6, title: 'Blockchain Summit 2025', date: '2025-11-20', location: 'Melbourne', price: '$80' },
  ];

  return (
    <div className="home-page">
      <Categories />
      <UpcomingEvents />
      <FeaturedEvents />

      <section className="events-section">
        <h2 className="section-heading">Upcoming Events</h2>
        <div className="events-grid">
          {allEvents.slice(0, 3).map(event => (
            <EventCard key={event.id} {...event} />
          ))}
        </div>
      </section>

      <section className="events-section">
        <h2 className="section-heading">Featured Events</h2>
        <div className="events-grid">
          {allEvents.slice(3).map(event => (
            <EventCard key={event.id} {...event} />
          ))}
        </div>
      </section>


      <section className="events-section">
        <h2 className="section-heading">Test DB Events</h2>
        {loadingDbEvents ? (
          <p>Loading events from DB...</p>
        ) : dbEvents.length === 0 ? (
          <p>No events found in DB.</p>
        ) : (
          <ul>
            {dbEvents.map(event => (
              <li key={event.eventID}>
                {event.eventName} on {event.eventDate} at {event.venueID}
              </li>
            ))}
          </ul>
        )}
       
      </section>  
      <CreateAccountButton />
    </div>
  );
}

export default Home;

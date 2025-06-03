import React, { useEffect, useState } from 'react';
import Categories from '../components/Categories';
import UpcomingEvents from '../components/UpcomingEvents';
import FeaturedEvents from '../components/FeaturedEvents';
import './Home.css';

function Home() {
  const [dbEvents, setDbEvents] = useState([]);
  const [loadingDbEvents, setLoadingDbEvents] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetch('http://localhost:5000/events')
      .then(res => res.json())
      .then(data => {
        setDbEvents(data);
        setLoadingDbEvents(false);
      })
      .catch(err => {
        console.error('Error fetching events from DB:', err.message || err);
        setLoadingDbEvents(false);
      });
  }, []);

  const filteredEvents = selectedCategory === 'All' 
    ? dbEvents 
    : dbEvents.filter(event => event.eventType === selectedCategory);

  return (
    <div className="home-page" data-testid="home-page">
      <Categories onSelect={setSelectedCategory} data-testid="categories" />

      <section className="events-section" data-testid="upcoming-section">
        <h2 className="section-heading">
            Upcoming Events
        </h2>
        <div className="events-grid" data-testid="upcoming-grid">
          <UpcomingEvents events={filteredEvents} data-testid="upcoming-events" />
        </div>
      </section>

      <section className="events-section" data-testid="featured-section">
        <h2 className="section-heading">
            Featured Events
        </h2>
        <div className="events-grid" data-testid="featured-grid">
          <FeaturedEvents events={filteredEvents} data-testid="featured-events" />
        </div>
      </section>
    </div>
  );
}

export default Home;

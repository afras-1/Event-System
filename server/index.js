const express = require('express');
const cors = require('cors');
const db = require('./database');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Get all events with venue names
app.get('/events', (req, res) => {
  try {
    const query = `
      SELECT 
        Event.eventID,
        Event.eventName,
        Event.eventType,
        Event.eventDate,
        Event.venueID,
        Venue.venueName,
        Event.eventDesc,
        Event.eventTime,
        Event.performer,
        Event.banner,
        Event.organiserID
      FROM Event
      LEFT JOIN Venue ON Event.venueID = Venue.venueID
    `;
    const rows = db.prepare(query).all();
    res.json(rows);
  } catch (err) {
    console.error('Error fetching events:', err.message);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get single event by ID (for EventDetails.jsx)
app.get('/events/:id', (req, res) => {
  const eventId = req.params.id;

  try {
    const query = `
      SELECT 
        Event.eventID,
        Event.eventName,
        Event.eventType,
        Event.eventDate,
        Event.venueID,
        Venue.venueName,
        Event.eventDesc,
        Event.eventTime,
        Event.performer,
        Event.banner,
        Event.organiserID
      FROM Event
      LEFT JOIN Venue ON Event.venueID = Venue.venueID
      WHERE Event.eventID = ?
    `;
    const row = db.prepare(query).get(eventId);

    if (!row) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(row);
  } catch (err) {
    console.error('Error fetching event by ID:', err.message);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// Get all users
app.get('/users', (req, res) => {
  try {
    const query = `
      SELECT 
        User.username,
        User.password,
        User.userType,
        User.email,
        User.address,
        User.phone
      FROM User
    `;
    const rows = db.prepare(query).all();
    res.json(rows);
  } catch (err) {
    console.error('Error fetching users:', err.message);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

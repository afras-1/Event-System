const express = require('express');
const cors = require('cors');
const db = require('./database');
const app = express();
const PORT = 5000;
const purchaseRouter = require('./routes/purchase');
const confirmationRoute = require('./routes/confirmation');


app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));

app.use(express.json());

app.use('/purchase', purchaseRouter);
app.use('/confirmation', confirmationRoute);

app.get('/venues', (req, res) => {
  try {
    const query = `
      SELECT
        Venue.venueID,
        Venue.venueName,
        Venue.capacity,
        Venue.venueImage
      FROM Venue
    `;
    const rows = db.prepare(query).all();
    res.json(rows);
  } catch (err) {
    console.error('Error fetching venues:', err.message);
    res.status(500).json({ error: 'Failed to fetch venues' });
  }
});

app.get('/events/type/:eventType', (req, res) => {
  try {
    const eventType = req.params.eventType;

    const query = `
      SELECT 
        Event.eventID,
        Event.eventName,
        Event.eventType,
        Event.eventDate,
        Event.eventTime,
        Venue.venueName,
        Event.banner
      FROM Event
      LEFT JOIN Venue ON Event.venueID = Venue.venueID
      WHERE Event.eventType = ?
    `;
    const rows = db.prepare(query).all(eventType);

    for (const event of rows) {
      if (event.banner) {
        const base64Banner = Buffer.from(event.banner).toString('base64');
        event.banner = `data:image/png;base64,${base64Banner}`;
      }
    }

    res.json(rows);
  } catch (err) {
    console.error('Error fetching events by type:', err.message);
    res.status(500).json({ error: 'Failed to fetch events by type' });
  }
});


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

app.post('/events', (req, res) => {
  try {
    const {
      eventName,
      eventType,
      eventDate,
      venueID,
      eventDesc,
      eventTime,
      performer,
      banner,
      organiserID
    } = req.body;

    const query = `
      INSERT INTO Event (
        eventName, eventType, eventDate, venueID, eventDesc, eventTime, performer, banner, organiserID
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const result = db.prepare(query).run(
      eventName, eventType, eventDate, venueID, eventDesc, eventTime, performer, banner, organiserID
    );
    res.status(201).json({ eventID: result.lastInsertRowid });
  } catch (err) {
    console.error('Error creating event:', err.message);
    res.status(500).json({ error: 'Failed to create event' });
  }
});


app.get('/events/:id', (req, res) => {
  try {
    const eventId = req.params.id;

    const row = db.prepare('SELECT venueImage FROM Venue WHERE venueID = ?').get('V001');

    const eventQuery = `
      SELECT 
        Event.eventID,
        Event.eventName,
        Event.eventType,
        Event.eventDate,
        Event.venueID,
        Venue.venueName,
        Venue.venueImage,
        Event.eventDesc,
        Event.eventTime,
        Event.performer,
        Event.banner,
        Event.organiserID
      FROM Event
      LEFT JOIN Venue ON Event.venueID = Venue.venueID
      WHERE Event.eventID = ?
    `;
    const event = db.prepare(eventQuery).get(eventId);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    //convert venueImage BLOB to base64
    if (event.venueImage) {
      const base64VenueImage = Buffer.from(event.venueImage).toString('base64');
      event.venueImage = `data:image/png;base64,${base64VenueImage}`;
    }

    //convert banner BLOB to base64
    if (event.banner) {
      const base64Banner = Buffer.from(event.banner).toString('base64');
      event.banner = `data:image/png;base64,${base64Banner}`;
    }

    // Get ticket options for this event
    const ticketQuery = `
      SELECT ticketType, price, quantity
      FROM TicketOption
      WHERE eventID = ?
    `;

    const ticketRows = db.prepare(ticketQuery).all(eventId);

    // Convert ticket options into an object like { general: 30, vip: 100, ... }
    const ticketOptions = {};
    for (const row of ticketRows) {
      ticketOptions[row.ticketType.toLowerCase()] = row.price;
    }

    // Attach to event
    event.ticketOptions = ticketOptions;

    res.json(event);
  } catch (err) {
    console.error('Error fetching event by ID:', err.message);
  }
});


/*app.get('/events/:id', (req, res) => {
  try {
    const eventId = req.params.id;
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
});*/

app.get('/events/organiser/:organiser', (req, res) => {
  try {
    const organiserId = req.params.organiser;
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
      WHERE Event.organiserID = ?
    `;
    const rows = db.prepare(query).all(organiserId);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching events by organiser:', err.message);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

app.post('/events', (req, res) => {
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


app.put('/events/:id', (req, res) => {
  try {
    const eventId = req.params.id;
    const {
      eventName,
      eventType,
      eventDate,
      venueID,
      eventDesc,
      eventTime,
      performer,
      banner,
      organiserID
    } = req.body;

    const query = `
      UPDATE Event SET
        eventName = ?,
        eventType = ?,
        eventDate = ?,
        venueID = ?,
        eventDesc = ?,
        eventTime = ?,
        performer = ?,
        banner = ?,
        organiserID = ?
      WHERE eventID = ?
    `;
    const result = db.prepare(query).run(
      eventName, eventType, eventDate, venueID, eventDesc, eventTime, performer, banner, organiserID, eventId
    );
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json({ message: 'Event updated successfully' });
  } catch (err) {
    console.error('Error updating event:', err.message);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

app.get('/ticketOptions', (req, res) => {
  try {
    const query = `
      SELECT 
        TicketOption.ticketOptionID,
        TicketOption.eventID,
        TicketOption.ticketType,
        TicketOption.price,
        TicketOption.quantity
      FROM TicketOption
    `;
    const rows = db.prepare(query).all();
    res.json(rows);
  } catch (err) {
    console.error('Error fetching ticket options:', err.message);
    res.status(500).json({ error: 'Failed to fetch ticket options' });
  }
});

app.get('/ticketOptions/:eventID', (req, res) => {
  try {
    const eventId = req.params.eventID;
    const query = `
      SELECT 
        TicketOption.ticketOptionID,
        TicketOption.eventID,
        TicketOption.ticketType,
        TicketOption.price,
        TicketOption.quantity
      FROM TicketOption
      WHERE eventID = ?
    `;
    const rows = db.prepare(query).all(eventId);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching ticket options for event:', err.message);
    res.status(500).json({ error: 'Failed to fetch ticket options' });
  }
});

app.post('/ticketOptions', (req, res) => {
  try {
    const { eventID, ticketType, price, quantity } = req.body;
    const query = `
      INSERT INTO TicketOption (eventID, ticketType, price, quantity)
      VALUES (?, ?, ?, ?)
    `;
    const result = db.prepare(query).run(eventID, ticketType, price, quantity);
    res.status(201).json({ ticketOptionID: result.lastInsertRowid });
  } catch (err) {
    console.error('Error creating ticket option:', err.message);
    res.status(500).json({ error: 'Failed to create ticket option' });
  }
});

app.put('/ticketOptions/:id', (req, res) => {
  try {
    const ticketOptionId = req.params.id;
    const { eventID, ticketType, price, quantity } = req.body;

    const query = `
      UPDATE TicketOption SET
        eventID = ?,
        ticketType = ?,
        price = ?,
        quantity = ?
      WHERE ticketOptionID = ?
    `;
    const result = db.prepare(query).run(eventID, ticketType, price, quantity, ticketOptionId);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Ticket option not found' });
    }
    res.json({ message: 'Ticket option updated successfully' });
  } catch (err) {
    console.error('Error updating ticket option:', err.message);
    res.status(500).json({ error: 'Failed to update ticket option' });
  }
});

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

app.get('/users/:username', (req, res) => {
  try {
    const username = req.params.username;
    const query = `
      SELECT
        User.username,
        User.password,
        User.userType,
        User.email,
        User.address,
        User.phone
      FROM User
      WHERE User.username = ?
    `;
    const row = db.prepare(query).get(username);
    if (!row) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(row);
  } catch (err) {
    console.error('Error fetching user by username:', err.message);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

app.post('/users', (req, res) => {
  try {
    const { username, password, userType, email, address, phone } = req.body;
    const query = `
      INSERT INTO User (username, password, userType, email, address, phone)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const result = db.prepare(query).run(username, password, userType, email, address, phone);
    res.status(201).json({ username: result.lastInsertRowid });
  } catch (err) {
    console.error('Error creating user:', err.message);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.put('/users/:username', (req, res) => {
  try {
    const oldUsername = req.params.username;
    const { username, userType, email, address, phone } = req.body;

    const query = `
      UPDATE User SET
        username = ?,
        userType = ?,
        email = ?,
        address = ?,
        phone = ?
      WHERE username = ?
    `;
    const result = db.prepare(query).run(username, userType, email, address, phone, oldUsername);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User updated successfully' });
  } catch (err) {
    console.error('Error updating user:', err.message);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

app.post('/organisers/', (req, res) => {
  try {
    const { username, organisationName } = req.body;

    const query = `
      INSERT INTO Organiser (username, organisationName)
      VALUES (?, ?)
    `;
    const result = db.prepare(query).run(username, organisationName);
    res.status(201).json({ message: 'Organiser created successfully', organiserID: result.lastInsertRowid });
  } catch (err) {
    console.error('Error creating organiser:', err.message);
    res.status(500).json({ error: 'Failed to create organiser' });
  }
});

app.put('/passwords/:username', (req, res) => {
  try {
    const username = req.params.username;
    const { password } = req.body;

    const query = `
      UPDATE User SET
        password = ?
      WHERE username = ?
    `;
    const result = db.prepare(query).run(password, username);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Error updating user password:', err.message);
    res.status(500).json({ error: 'Failed to update user password' });
  }
});

app.get('/tickets/:username', (req, res) => {
  try {
    const username = req.params.username;
    const query = `
      SELECT 
        Ticket.ticketID,
        Ticket.eventID,
        Ticket.ticketType,
        Event.eventName,
        Event.eventDate
      FROM Ticket
      LEFT JOIN Event ON Ticket.eventID = Event.eventID
      WHERE Ticket.username = ?
    `;
    const rows = db.prepare(query).all(username);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching tickets for user:', err.message);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

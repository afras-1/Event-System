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

//routes for ticket purchasing
app.use('/purchase', purchaseRouter);
app.use('/confirmation', confirmationRoute);

//get venues
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

//deleting ticket options
app.delete('/ticketOptions/:ticketOptionID', (req, res) => {
  const ticketOptionID = req.params.ticketOptionID;

  try {
    const stmt = db.prepare('DELETE FROM TicketOption WHERE ticketOptionID = ?');
    const result = stmt.run(ticketOptionID);

    if (result.changes > 0) {
      res.status(200).send({ message: 'Ticket option deleted successfully.' });
    } else {
      res.status(404).send({ error: 'Ticket option not found.' });
    }
  } catch (err) {
    console.error('Error deleting ticket option:', err.message);
    res.status(500).send({ error: 'Internal server error.' });
  }
});

//refunding tickets
app.delete('/tickets/:ticketID', (req, res) => {
  const ticketID = req.params.ticketID;

  try {
    //fetch ticket details before deleting
    const ticket = db.prepare(`
      SELECT eventID, ticketType
      FROM Ticket
      WHERE ticketID = ?
    `).get(ticketID);

    if (!ticket) {
      return res.status(404).send({ error: 'Ticket not found.' });
    }

    //increase available quantity in TicketOption
    const updateQuantity = db.prepare(`
      UPDATE TicketOption
      SET quantity = quantity + 1
      WHERE eventID = ? AND ticketType = ?
    `);
    updateQuantity.run(ticket.eventID, ticket.ticketType);

    //delete from EventTransaction
    const deleteTransaction = db.prepare(`
      DELETE FROM EventTransaction
      WHERE ticketID = ?
    `);
    deleteTransaction.run(ticketID);

    //delete from Ticket
    const deleteTicket = db.prepare(`
      DELETE FROM Ticket
      WHERE ticketID = ?
    `);
    const info = deleteTicket.run(ticketID);

    if (info.changes > 0) {
      res.status(200).send({ message: 'Ticket refunded successfully.' });
    } else {
      res.status(404).send({ error: 'Ticket not found.' });
    }
  } catch (error) {
    console.error('Error processing refund:', error.message);
    res.status(500).send({ error: 'Internal server error.' });
  }
});

//getting events by type for categories component
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

//get events for homepage
app.get('/events', (req, res) => {
  try {
    const query = `
      SELECT 
        event.eventID,
        event.eventName,
        event.eventType,
        event.eventDate,
        event.venueID,
        venue.venueName,
        event.eventDesc,
        event.eventTime,
        event.performer,
        event.banner,
        event.organiserID,
        ticketPrices.minPrice,
        ticketPrices.maxPrice
      FROM Event event
      LEFT JOIN Venue venue ON event.venueID = venue.venueID
      LEFT JOIN (
        SELECT 
          eventID, 
          MIN(price) AS minPrice, 
          MAX(price) AS maxPrice
        FROM TicketOption
        GROUP BY eventID
      ) ticketPrices ON event.eventID = ticketPrices.eventID
    `;

    const rows = db.prepare(query).all();
    res.json(rows);
  } catch (err) {
    console.error('Error fetching events:', err.message);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});


//creating events
app.post('/events', (req, res) => {
  const { eventName, eventType, eventDate, eventTime, venueID, eventDesc, performer, organiserID } = req.body;

  try {
    const stmt = db.prepare(`
      INSERT INTO Event (eventName, eventType, eventDate, eventTime, venueID, eventDesc, performer, organiserID)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(eventName, eventType, eventDate, eventTime, venueID, eventDesc, performer, organiserID);

    res.status(201).json({ eventID: result.lastInsertRowid });
  } catch (err) {
    console.error('Error creating event:', err.message);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

//get events by id for their event page
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
        Event.organiserID,
        Organiser.organisationName
      FROM Event
      LEFT JOIN Venue ON Event.venueID = Venue.venueID
      LEFT JOIN Organiser ON Event.organiserID = Organiser.username
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

    //get ticket options for this event
    const ticketQuery = `
      SELECT ticketType, price, quantity
      FROM TicketOption
      WHERE eventID = ?
    `;

    const ticketRows = db.prepare(ticketQuery).all(eventId);

    //convert ticket options into an object like { general: 30, vip: 100, ... }
    const ticketOptions = {};
    for (const row of ticketRows) {
      ticketOptions[row.ticketType.toLowerCase()] = row.price;
    }

    //attach to event
    event.ticketOptions = ticketOptions;

    res.json(event);
  } catch (err) {
    console.error('Error fetching event by ID:', err.message);
  }
});

//get events based on organiser id for their account page
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

//get ticket options for event
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

//create ticket options
app.post('/ticketOptions', (req, res) => {
  const ticketOptions = req.body;

  if (!Array.isArray(ticketOptions)) {
    return res.status(400).json({ error: 'Expected an array of ticket options' });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO TicketOption (eventID, ticketType, price, quantity)
      VALUES (?, ?, ?, ?)
    `);

    const inserted = [];

    for (const option of ticketOptions) {
      if (!option.eventID || !option.ticketType || isNaN(option.price) || isNaN(option.quantity)) {
        continue;
      }

      const result = stmt.run(
        option.eventID,
        option.ticketType,
        option.price,
        option.quantity
      );

      inserted.push(result.lastInsertRowid);
    }

    res.status(201).json({ message: 'Ticket options inserted', inserted });
  } catch (err) {
    res.status(500).json({ error: 'Failed to insert ticket options' });
  }
});

//update ticket options for event
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

//update event
app.put('/events/:id', (req, res) => {
  const { eventName, eventType, eventDate, eventTime, venueID, eventDesc, performer, organiserID } = req.body;

  const stmt = db.prepare(`
    UPDATE Event SET
      eventName = ?,
      eventType = ?,
      eventDate = ?,
      eventTime = ?,
      venueID = ?,
      eventDesc = ?,
      performer = ?,
      organiserID = ?
    WHERE eventID = ?
  `);

stmt.run(eventName, eventType, eventDate, eventTime, venueID, eventDesc, performer, organiserID, eventID);
});

//delete event
app.delete('/events/:id', (req, res) => {
  const eventID = req.params.id;

  try {

    const deleteTransactions = db.prepare(`DELETE FROM EventTransaction WHERE ticketID IN (SELECT ticketID FROM Ticket WHERE eventID = ?)`);
    deleteTransactions.run(eventID);

    const deleteTickets = db.prepare(`DELETE FROM Ticket WHERE eventID = ?`);

    deleteTickets.run(eventID);

    const deleteTicketOptions = db.prepare(`DELETE FROM TicketOption WHERE eventID = ?`);
    deleteTicketOptions.run(eventID);

    const deleteEvent = db.prepare(`DELETE FROM Event WHERE eventID = ?`);
    const result = deleteEvent.run(eventID);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ message: 'Event and related tickets deleted' });
  } catch (err) {
    console.error('Error deleting event:', err.message);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

//get users for login
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

//get specific user info for account page
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

//register user
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

//edit user settings
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

//register organiser
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

//update user password
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

//get tickets by user
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

//get ticket info from transactions
app.get('/transactions/:ticketID', (req, res) => {
  try {
    const ticketID = req.params.ticketID;
    const query = `
      SELECT 
        EventTransaction.paymentID,
        EventTransaction.username,
        EventTransaction.ticketID,
        Ticket.ticketType,
        Ticket.eventID,
        Event.eventName,
        Event.eventDate,
        Event.eventTime,
        Venue.venueName
      FROM EventTransaction
      JOIN Ticket ON EventTransaction.ticketID = Ticket.ticketID
      JOIN Event ON Ticket.eventID = Event.eventID
      JOIN Venue ON Event.venueID = Venue.venueID
      WHERE Ticket.ticketID = ?
    `;
    const row = db.prepare(query).get(ticketID);
    if (!row) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json(row);
  } catch (err) {
    console.error('Error fetching transaction by ticket ID:', err.message);
    res.status(500).json({ error: 'Failed to fetch transaction' });
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

app.get('/events/:id', (req, res) => {
  const stmt = db.prepare('SELECT * FROM Event WHERE eventID = ?');
  const event = stmt.get(req.params.id);

  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }

  res.json(event);
});

app.get('/ticketOptions/byEvent/:eventID', (req, res) => {
  const stmt = db.prepare('SELECT * FROM TicketOption WHERE eventID = ?');
  const tickets = stmt.all(req.params.eventID);
  res.json(tickets);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

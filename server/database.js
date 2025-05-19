const Database = require('better-sqlite3');
const db = new Database('./eventDB.sqlite');

// Table creation statements
const tableStatements = [
  `CREATE TABLE IF NOT EXISTS User (
    username TEXT PRIMARY KEY,
    password TEXT,
    userType TEXT,
    email TEXT,
    address TEXT,
    phone TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS Organiser (
    username TEXT PRIMARY KEY,
    organisationName TEXT,
    FOREIGN KEY(username) REFERENCES User(username)
  )`,
  `CREATE TABLE IF NOT EXISTS Venue (
    venueID TEXT PRIMARY KEY,
    venueName TEXT,
    capacity INTEGER
  )`,
  `CREATE TABLE IF NOT EXISTS Event (
    eventID TEXT PRIMARY KEY,
    eventName TEXT,
    eventType TEXT,
    eventDate DATE,
    venueID TEXT,
    eventDesc TEXT,
    eventTime TIME,
    performer TEXT,
    banner BLOB,
    organiserID TEXT,
    FOREIGN KEY(venueID) REFERENCES Venue(venueID),
    FOREIGN KEY(organiserID) REFERENCES Organiser(username)
  )`,
  `CREATE TABLE IF NOT EXISTS Ticket (
    ticketID TEXT PRIMARY KEY,
    eventID TEXT,
    username TEXT,
    ticketType TEXT,
    FOREIGN KEY(eventID) REFERENCES Event(eventID),
    FOREIGN KEY(username) REFERENCES User(username)
  )`,
  `CREATE TABLE IF NOT EXISTS EventTransaction (
    paymentID TEXT PRIMARY KEY,
    username TEXT,
    ticketID TEXT,
    quantity INTEGER,
    FOREIGN KEY(username) REFERENCES User(username),
    FOREIGN KEY(ticketID) REFERENCES Ticket(ticketID)
  )`
];

// Run all table creation statements
for (const statement of tableStatements) {
  db.prepare(statement).run();
}

module.exports = db;

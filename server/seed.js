const db = require('./database');
const fs = require('fs');
const path = require('path');

// Clear tables in order respecting FK constraints
db.prepare('DELETE FROM EventTransaction').run();
db.prepare('DELETE FROM Ticket').run();
db.prepare('DELETE FROM TicketOption').run();
db.prepare('DELETE FROM Event').run();
db.prepare('DELETE FROM sqlite_sequence').run();
db.prepare('DELETE FROM Organiser').run();
db.prepare('DELETE FROM Venue').run();
db.prepare('DELETE FROM User').run();

// Insert venues
const venues = [
  { id: 'V001', name: 'Sydney Performance Hall', capacity: 300, image: 'venue1.png' },
  { id: 'V002', name: 'Melbourne Conference Hub', capacity: 50, image: 'venue2.png' },
  { id: 'V003', name: 'Brisbane Arts Center', capacity: 200, image: 'venue3.png' },
  { id: 'V004', name: 'Online Platform', capacity: 1000, image: 'venue4.png' },
  { id: 'V005', name: 'Adelaide Arts Centre', capacity: 300, image: 'venue5.png' },
  { id: 'V006', name: 'Melbourne Centre for Performing Arts', capacity: 70, image: 'venue6.png' },
];

const insertVenue = db.prepare(`
  INSERT INTO Venue (venueID, venueName, capacity, venueImage)
  VALUES (?, ?, ?, ?)
`);

for (const venue of venues) {
  const imagePath = path.join(__dirname, '..', 'src', 'assets', 'images', venue.image);
  const imageBuffer = fs.readFileSync(imagePath);
  insertVenue.run(venue.id, venue.name, venue.capacity, imageBuffer);
}

// Insert organisers
const organisers = [
  { username: 'organiser1', orgName: 'Tech Events Ltd' },
  { username: 'organiser2', orgName: 'Live Nation AU' },
  { username: 'organiser3', orgName: 'Comedy Central Booking' },
  { username: 'organiser4', orgName: 'EduConnect Conferences' },
  { username: 'organiser5', orgName: 'Family First Events' },
  { username: 'organiser6', orgName: 'Startup Spark' },
  { username: 'organiser7', orgName: 'Arts & Culture Hub' },
  { username: 'organiser8', orgName: 'Wellness & Community Co.' },
  { username: 'organiser9', orgName: 'NextGen Music Group' },
  { username: 'organiser10', orgName: 'Innovation Syndicate' },
];

const insertUser = db.prepare(`
  INSERT INTO User (username, password, userType, email, address, phone)
  VALUES (?, ?, 'Organiser', ?, ?, ?)
`);

const insertOrganiser = db.prepare(`
  INSERT INTO Organiser (username, organisationName)
  VALUES (?, ?)
`);

for (let i = 0; i < organisers.length; i++) {
  const { username, orgName } = organisers[i];
  insertUser.run(
    username,
    'pass123',
    `${username}@events.com`,
    `${i + 1} Event Blvd`,
    `04000000${i}`
  );
  insertOrganiser.run(username, orgName);
}

// Insert one guest user
db.prepare(`
  INSERT INTO User (username, password, userType, email, address, phone) 
  VALUES ('user1', 'pass123', 'Guest', 'guest1@example.com', '456 Elm St', '987654321')
`).run();

// Event insertion
const insertEvent = db.prepare(`
  INSERT INTO Event (
    eventName, eventType, eventDate, venueID, eventDesc, eventTime, performer, banner, organiserID
  ) VALUES (?, ?, ?, ?, ?, ?, ?, NULL, ?)
`);

function getDate(offset) {
  const baseDate = new Date(2025, 5, 1); // June 1, 2025
  baseDate.setDate(baseDate.getDate() + offset);
  return baseDate.toISOString().slice(0, 10);
}

function getRandomTime() {
  const hour = 9 + Math.floor(Math.random() * 13);
  const minute = Math.floor(Math.random() * 2) * 30;
  return `${hour.toString().padStart(2, '0')}:${minute === 0 ? '00' : '30'}`;
}

function getRandomOrganiser() {
  return organisers[Math.floor(Math.random() * organisers.length)].username;
}

const musicArtists = [
  'Taylor Swift', 'Coldplay', 'BTS', 'Ed Sheeran', 'Billie Eilish', 'The Weeknd', 
  'Adele', 'Imagine Dragons', 'Dua Lipa', 'Bruno Mars'
];

const techTopics = [
  'AI Revolution', 'Cybersecurity 2025', 'Blockchain Innovations', 'Quantum Computing',
  'Cloud Native Summit', 'IoT Expo', 'VR & AR Conference', 'DevOps Days', 'Big Data Forum', '5G Technology'
];

const comedians = [
  'Kevin Hart', 'Amy Schumer', 'Dave Chappelle', 'Tiffany Haddish', 'John Mulaney', 
  'Ali Wong', 'Bill Burr', 'Hasan Minhaj', 'Nikki Glaser', 'Jim Gaffigan'
];

const familyEvents = [
  'Magic Show Extravaganza', 'Kids Puppet Theater', 'Family Fun Fair', 'Outdoor Movie Night',
  'Children\'s Storytime', 'Zoo Adventure Day', 'Science for Kids', 'Family Yoga Session',
  'Art & Craft Workshop', 'Pancake Breakfast'
];

const freeEvents = [
  'Community Yoga', 'Open Mic Night', 'Local Art Gallery Tour', 'Book Club Meeting',
  'Charity Run Meetup', 'Free Coding Workshop', 'Environmental Awareness Talk', 
  'Gardening Club', 'Photography Walk', 'Meditation Session'
];

const events = [];
let eventCounter = 0;

function addEvent(name, type, dateOffset, venueID, desc, performer) {
  events.push({
    name,
    type,
    date: getDate(dateOffset),
    venueID,
    desc,
    time: getRandomTime(),
    performer,
    organiserID: getRandomOrganiser(),
  });
  eventCounter++;
}

// Music - 15 events
for(let i=0; i<15; i++) {
  const artist = musicArtists[i % musicArtists.length];
  const venue = venues[i % venues.length].id;
  addEvent(`${artist} Live in Concert`, 'Music', i, venue, `An amazing live performance by ${artist}.`, artist);
}

// Tech - 10 events
for(let i=0; i<10; i++) {
  const topic = techTopics[i % techTopics.length];
  const venue = venues[(i+3) % venues.length].id;
  addEvent(`${topic} Conference`, 'Tech', i+15, venue, `Explore the latest trends in ${topic.toLowerCase()}.`, '');
}

// Comedy - 10 events
for(let i=0; i<10; i++) {
  const comedian = comedians[i % comedians.length];
  const venue = venues[(i+1) % venues.length].id;
  addEvent(`${comedian} Stand-up Special`, 'Comedy', i+25, venue, `Laugh out loud with ${comedian}'s best jokes.`, comedian);
}

// Family - 10 events
for(let i=0; i<10; i++) {
  const eventName = familyEvents[i % familyEvents.length];
  const venue = venues[(i+4) % venues.length].id;
  addEvent(eventName, 'Family', i+35, venue, `Fun and engaging activities for the whole family.`, '');
}

// Free - 10 events
for(let i=0; i<10; i++) {
  const eventName = freeEvents[i % freeEvents.length];
  const venue = venues[(i+2) % venues.length].id;
  addEvent(eventName, 'Free', i+45, venue, `Join us for this free community event: ${eventName}.`, '');
}

// Insert all events
const eventIDs = [];

for (const e of events) {
  const info = insertEvent.run(e.name, e.type, e.date, e.venueID, e.desc, e.time, e.performer, e.organiserID);
  eventIDs.push(info.lastInsertRowid);
}

// Insert ticket options
const insertTicketOption = db.prepare(`
  INSERT INTO TicketOption (eventID, ticketType, price, quantity) VALUES (?, ?, ?, ?)
`);

for (let i=0; i<eventIDs.length; i++) {
  const eventID = eventIDs[i];
  const event = events[i];

  switch(event.type) {
    case 'Music':
      insertTicketOption.run(eventID, 'General Admission', 75.00, 150);
      insertTicketOption.run(eventID, 'VIP Package', 150.00, 30);
      insertTicketOption.run(eventID, 'Backstage Pass', 300.00, 10);
      break;
    case 'Tech':
      insertTicketOption.run(eventID, 'Standard Pass', 100.00, 200);
      insertTicketOption.run(eventID, 'Workshop Access', 250.00, 50);
      insertTicketOption.run(eventID, 'Student Discount', 50.00, 100);
      break;
    case 'Comedy':
      insertTicketOption.run(eventID, 'Regular Seat', 40.00, 120);
      insertTicketOption.run(eventID, 'Front Row', 70.00, 20);
      break;
    case 'Family':
      insertTicketOption.run(eventID, 'Child Ticket', 15.00, 100);
      insertTicketOption.run(eventID, 'Adult Ticket', 30.00, 100);
      insertTicketOption.run(eventID, 'Family Pack (2 adults + 2 children)', 80.00, 50);
      break;
    case 'Free':
      insertTicketOption.run(eventID, 'Free Entry', 0.00, 1000);
      break;
  }
}

console.log('Database seeded successfully.');

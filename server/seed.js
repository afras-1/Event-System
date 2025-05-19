const db = require('./database');

try {
  // Insert venues
  db.prepare(`INSERT INTO Venue (venueID, venueName, capacity) VALUES 
    ('V001', 'Sydney Conference Hall', 300),
    ('V002', 'Melbourne Startup Hub', 200),
    ('V003', 'Brisbane Arts Center', 150),
    ('V004', 'Online Platform', 1000),
    ('V005', 'Sydney Tech Arena', 500),
    ('V006', 'Melbourne Blockchain Venue', 250)`).run();

  // Insert organiser
  db.prepare(`INSERT INTO User (username, password, userType, email, address, phone) 
    VALUES ('organiser1', 'pass123', 'organiser', 'org1@example.com', '123 Main St', '123456789')`).run();

  db.prepare(`INSERT INTO Organiser (username, organisationName) 
    VALUES ('organiser1', 'Tech Events Ltd')`).run();

  // Insert events
  db.prepare(`INSERT INTO Event (
    eventID, eventName, eventType, eventDate, venueID, eventDesc, eventTime, performer, banner, organiserID
  ) VALUES 
    ('E001', 'Tech Conference 2025', 'Conference', '2025-06-10', 'V001', 'Annual tech conference.', '09:00', '', null, 'organiser1'),
    ('E002', 'Startup Pitch Night', 'Networking', '2025-07-03', 'V002', 'Startup networking event.', '18:00', '', null, 'organiser1'),
    ('E003', 'Wine & Art Expo', 'Expo', '2025-08-15', 'V003', 'Art and wine exhibition.', '11:00', '', null, 'organiser1'),
    ('E004', 'React Developers Meetup', 'Meetup', '2025-09-05', 'V004', 'React devs online meetup.', '17:00', '', null, 'organiser1'),
    ('E005', 'AI & Machine Learning Expo', 'Expo', '2025-10-15', 'V005', 'AI and ML innovations.', '10:00', '', null, 'organiser1'),
    ('E006', 'Blockchain Summit 2025', 'Summit', '2025-11-20', 'V006', 'Summit for blockchain tech.', '09:30', '', null, 'organiser1')`).run();

  console.log('Events inserted successfully.');
} catch (err) {
  console.error('Error seeding database:', err.message);
}


// CreateEvent.jsx - simplified, styled version of the event creation page
import React, { useState } from 'react';
import TicketOption from '../components/TicketOption';
import './CreateEvent.css';
import { useNavigate } from 'react-router-dom';

const CreateEvent = () => {
  const navigate = useNavigate();
  // State for basic event details
  const [formData, setFormData] = useState({
    eventName: '',
    performers: '',
    location: '',
  });

  // State for ticket options (initially one option)
  const [ticketOptions, setTicketOptions] = useState([
    { ticketOption: '', price: '', ticketCapacity: '' }
  ]);

  // Update general event form fields
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Update ticket option input fields
  const handleTicketChange = (index, name, value) => {
    const updated = [...ticketOptions];
    updated[index][name] = value;
    setTicketOptions(updated);
  };

  // Add a new ticket option section
  const addTicketOption = () => {
    setTicketOptions([...ticketOptions, { ticketOption: '', price: '', ticketCapacity: '' }]);
  };

  // Remove a ticket option by index
  const removeTicketOption = (indexToRemove) => {
    const updated = ticketOptions.filter((_, index) => index !== indexToRemove);
    setTicketOptions(updated);
  };

  // Submit the form (combine all inputs into one object and log it)
  const handleSubmit = (e) => {
    e.preventDefault();
    const completeData = {
      ...formData,
      ticketOptions: ticketOptions
    };
    console.log('Complete Event Submission:', completeData);
    // could send submission data to a backend API here

    navigate('/');
  };

  return (
    <div className="event-wrapper">
      <h1 className="title">Create New Event</h1>
      <form className="event-form" onSubmit={handleSubmit}>
        <input name="eventName" placeholder="Event Name" onChange={handleChange} />
        <input name="eventDescription" placeholder="Description" onChange={handleChange} />
        <input name="performers" placeholder="Performers" onChange={handleChange} />
        <input name="location" placeholder="Location" onChange={handleChange} />

        <h3>Ticket Options</h3>
        {ticketOptions.map((option, index) => (
          <TicketOption
            key={index}
            index={index}
            data={option}
            onChange={handleTicketChange}
            onRemove={removeTicketOption}
          />
        ))}

        <button type="button" onClick={addTicketOption} className="add-btn">+ Add Ticket Option</button>
        <button type="submit" className="submit-btn">Submit</button>
      </form>
    </div>
  );
};

export default CreateEvent;






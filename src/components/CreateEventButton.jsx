import { Link } from 'react-router-dom';


const CreatEventButton = () => {
  return (
    <Link to="/create" className="event-button-link">
      <button className="event-button">Create Event</button>
    </Link>
  );
};

export default CreatEventButton;
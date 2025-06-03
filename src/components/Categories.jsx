import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Categories.css';

function Categories() {
  const [active, setActive] = useState(null);
  const navigate = useNavigate();
  const categories = ['All', 'Music', 'Tech', 'Comedy', 'Family', 'Free'];

  const handleClick = (category) => {
    setActive(category);
    // Navigate to category page (lowercase path)
    navigate(`/events/type/${category.toLowerCase()}`);
  };

  return (
    <div className="category-bar">
      <div className="category-buttons">
        {categories.map(cat => (
          <button
            key={cat}
            className={`category-button ${active === cat ? 'active' : ''}`}
            onClick={() => handleClick(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Categories;

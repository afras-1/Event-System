import React, { useState } from 'react';
import './Categories.css';

function Categories({ onSelect }) {
  const [active, setActive] = useState(null);
  const categories = ['All', 'Music', 'Tech', 'Comedy', 'Family', 'Free'];

  const handleClick = (category) => {
    setActive(category);
    onSelect && onSelect(category); // optional callback
  };

  return (
    <div className="category-bar">
      <div className="category-buttons">
        {categories.map((cat) => (
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

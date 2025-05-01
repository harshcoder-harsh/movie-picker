import React from 'react';

const RandomPickerButton = ({ onPick }) => {
  return (
    <button onClick={onPick} className="picker-button">
      Pick a Random Movie
    </button>
  );
};

export default RandomPickerButton; 
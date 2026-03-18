import React from 'react';

interface KeypadProps {
  onNumberClick: (num: number) => void;
  disabled: boolean;
}

const Keypad: React.FC<KeypadProps> = ({ onNumberClick, disabled }) => {
  const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className="keypad">
      {nums.map(n => (
        <button 
          key={n} 
          className="key-btn" 
          onClick={() => onNumberClick(n)}
          disabled={disabled}
        >
          {n}
        </button>
      ))}
      <button 
        className="key-btn action-btn text-sm" 
        onClick={() => {}}
        disabled={disabled}
      >
        _
      </button>
    </div>
  );
};

export default Keypad;

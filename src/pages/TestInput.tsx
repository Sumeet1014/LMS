import React, { useState } from 'react';

export default function TestInput() {
  const [value, setValue] = useState('');

  return (
    <div style={{ padding: '50px' }}>
      <h1>Input Test - Most Basic</h1>
      
      <p>Current value: "{value}"</p>
      
      <input
        type="text"
        value={value}
        onChange={(e) => {
          console.log('Input changed to:', e.target.value);
          setValue(e.target.value);
        }}
        placeholder="Type here..."
        style={{
          fontSize: '20px',
          padding: '10px',
          border: '2px solid red',
          backgroundColor: 'yellow'
        }}
      />
      
      <br /><br />
      
      <textarea
        value={value}
        onChange={(e) => {
          console.log('Textarea changed to:', e.target.value);
          setValue(e.target.value);
        }}
        placeholder="Type in textarea..."
        rows={4}
        cols={50}
        style={{
          fontSize: '20px',
          border: '2px solid blue',
          backgroundColor: 'lightblue'
        }}
      />
      
      <br /><br />
      
      <button onClick={() => setValue('')} style={{ fontSize: '20px' }}>
        Clear
      </button>
    </div>
  );
}

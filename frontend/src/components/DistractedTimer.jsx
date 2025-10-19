import React from 'react';

const DistractedTimer = ({ distractedDuration }) => {
  const seconds = (distractedDuration / 1000).toFixed(1);

  return (
    <div className="my-4 p-4 border rounded shadow">
      <h2 className="font-bold text-lg">Distracted Time</h2>
      <p>{seconds} seconds</p>
    </div>
  );
};

export default DistractedTimer;

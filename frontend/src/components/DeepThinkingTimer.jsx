import React, { useState, useEffect } from 'react';

const DeepThinkingTimer = ({ isThinking, onStop }) => {
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!isThinking) return;

    const interval = setInterval(() => {
      setDuration(prev => prev + 1000); // update every second
    }, 1000);

    return () => clearInterval(interval);
  }, [isThinking]);

  const handleStop = () => {
    onStop(duration);
    setDuration(0);
  };

  if (!isThinking) return null;

  return (
    <div className="my-4 p-4 border rounded shadow">
      <h2 className="font-bold text-lg">Deep Thinking Timer</h2>
      <p>{(duration / 1000).toFixed(1)} seconds</p>
      <button
        className="mt-2 bg-green-500 text-white px-4 py-2 rounded"
        onClick={handleStop}
      >
        Stop
      </button>
    </div>
  );
};

export default DeepThinkingTimer;

import React from 'react';

const ThinkingPrompt = ({ onThinking, visible }) => {
  if (!visible) return null;

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded shadow-lg z-50">
      <p className="mb-4 text-lg font-semibold">Are you still there?</p>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
        onClick={onThinking}
      >
        Yes, I'm thinking
      </button>
    </div>
  );
};

export default ThinkingPrompt;

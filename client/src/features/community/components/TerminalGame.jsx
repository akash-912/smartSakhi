import React, { useState, useEffect } from 'react';

const TerminalGame = ({ onClose }) => {
  const funnyLines = [
  "engineering is the magical art of completing a six month syllabus in six hours before the exam",
  "my attendance is short so it is time to write a highly emotional medical application",
  "hostel maggi hits completely different when you are rethinking all your life choices at three am",
  "group projects one person does all the work the rest of us just say bhai aag laga di during the presentation",
  "the only streak i have is the number of times i promised myself i will study from day one next semester",
  "submitting the assignment one minute before the deadline is literally the most extreme sport i play",
  "viva examiner what is this me sir that is exactly what i was asking myself five minutes ago",
  "i dont need a proper sleep schedule i just need a massive miracle to pass this subject"
];

// To pick a random one when the component loads:
const [secretCode] = useState(funnyLines[Math.floor(Math.random() * funnyLines.length)]);
  const [input, setInput] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);

  const handleTyping = (e) => {
    const value = e.target.value;
    if (!startTime) setStartTime(Date.now());
    setInput(value);

    // Calculate Accuracy
    let correctChars = 0;
    for (let i = 0; i < value.length; i++) {
      if (value[i] === secretCode[i]) correctChars++;
    }
    const currentAccuracy = Math.floor((correctChars / value.length) * 100) || 100;
    setAccuracy(currentAccuracy);

    // Calculate WPM if finished
    if (value === secretCode) {
      const timeTakenMinutes = (Date.now() - startTime) / 60000;
      const words = secretCode.split(' ').length;
      setWpm(Math.floor(words / timeTakenMinutes));
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95 backdrop-blur-sm">
      <div className="w-3/4 max-w-3xl p-8 border border-green-500 rounded-lg shadow-[0_0_15px_rgba(34,197,94,0.3)] bg-gray-950 font-mono">
        <div className="flex justify-between mb-4 text-green-400">
          <span>root@smartsakhi:~# init_typing_test</span>
          <button onClick={onClose} className="hover:text-red-500">[ESC] to abort</button>
        </div>
        
        <p className="mb-6 text-xl text-gray-400">
          Type the following sequence to unlock the 'Keyboard Warrior' badge:
        </p>
        
        {/* The Target Text */}
        <div className="p-4 mb-4 text-2xl tracking-wider text-green-300 bg-gray-900 rounded select-none">
          {secretCode.split('').map((char, index) => {
            let color = 'text-gray-500'; // un-typed
            if (index < input.length) {
              color = input[index] === char ? 'text-green-400' : 'text-red-500 bg-red-900/30';
            }
            return <span key={index} className={color}>{char}</span>;
          })}
        </div>

        {/* The Input Field */}
        <input
          autoFocus
          type="text"
          value={input}
          onChange={handleTyping}
          className="w-full p-4 text-xl text-green-400 bg-transparent border-b-2 border-green-700 outline-none focus:border-green-400 caret-green-400"
          spellCheck="false"
          autoComplete="off"
        />

        {/* Live Stats */}
        <div className="flex gap-8 mt-6 text-green-500">
          <span>WPM: {wpm > 0 ? wpm : '--'}</span>
          <span>Accuracy: {accuracy}%</span>
          {wpm > 0 && accuracy >= 90 && (
            <span className="text-yellow-400 animate-pulse">🏆 BADGE UNLOCKED!</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TerminalGame;
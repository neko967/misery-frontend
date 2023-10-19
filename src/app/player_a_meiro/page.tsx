"use client"
import React, { useState, useEffect } from 'react';

type Position = {
  x: number;
  y: number;
};

export default function Page() {
  const [playerPosition, setPlayerPosition] = useState<Position>({ x: 0, y: 0 });
  const [isGameOver, setIsGameOver] = useState(false);
  const [isGameClear, setIsGameClear] = useState(false);

  useEffect(() => {
    // Move cursor to the starting position
    const startPosition = document.querySelector('[data-start]');
    if (startPosition) {
      startPosition.dispatchEvent(new MouseEvent('mousemove', {
        clientX: startPosition.getBoundingClientRect().left + 20,  // Center the cursor
        clientY: startPosition.getBoundingClientRect().top + 20,   // Center the cursor
        bubbles: true
      }));
    }
  }, []);


  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / 40);
    const y = Math.floor((e.clientY - rect.top) / 40);

    if (maze[y][x] === '#') {
      setIsGameOver(true);
    } else if (maze[y][x] === 'G') {
      setIsGameClear(true);
    } else {
      setPlayerPosition({ x, y });
    }
  };

  const maze = [
    ['S', ' ', ' ', ' ', '#', '#', '#', '#', '#'],
    ['#', ' ', '#', ' ', ' ', ' ', ' ', ' ', '#'],
    ['#', ' ', '#', '#', '#', '#', '#', ' ', '#'],
    ['#', ' ', '#', ' ', ' ', ' ', '#', ' ', '#'],
    ['#', ' ', '#', ' ', '#', ' ', '#', ' ', '#'],
    ['#', ' ', '#', ' ', '#', ' ', '#', ' ', '#'],
    ['#', ' ', '#', ' ', '#', ' ', ' ', ' ', '#'],
    ['#', ' ', ' ', ' ', '#', '#', '#', 'G', '#'],
    ['#', '#', '#', '#', '#', '#', '#', '#', '#']
  ];

  return (
    <main>
      <p>player_a_meiro</p>
      <p>X: {playerPosition.x}, Y: {playerPosition.y}</p>
      {isGameOver ? (
        <div style={{ fontSize: '24px', color: 'red' }}>ゲームオーバー</div>
      ) : isGameClear ? (
        <div style={{ fontSize: '24px', color: 'green' }}>ゲームクリア</div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(9, 40px)',
            cursor: 'none',
            gridGap: '0px'
          }}
          onMouseMove={handleMouseMove}
        >
          {maze.map((row, rowIndex) =>
            row.map((cell, cellIndex) => (
              <div
                key={`${rowIndex}-${cellIndex}`}
                data-start={cell === 'S' ? 'true' : undefined}
                style={{
                  boxSizing: 'border-box',
                  width: '40px',
                  height: '40px',
                  backgroundColor:
                    cell === '#' ? 'black' :
                    cell === 'S' ? 'green' :
                    cell === 'G' ? 'red' :
                    'white',
                  cursor: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="5" height="5" viewBox="0 0 2 2"><circle cx="1" cy="1" r="1" fill="black" /></svg>') 1 1, auto`
                }}
              ></div>
            ))
          )}
        </div>
      )}
    </main>
  );
}


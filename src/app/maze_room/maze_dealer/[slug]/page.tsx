"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from "next/image";
import localImage from "../../../../../public/horror_image.png";

type pointerPosition = {
  x: number;
  y: number;
};

export default function Dealer({ params }: { params: { slug: string } }) {
  const elements = 20;
  const keyImage = "/keyImage.png";
  const key1Position: number[] = [15,5];  //[縦,横]
  const key2Position: number[] = [6,5];
  const key3Position: number[] = [13,24];
  const door1Position: number[] = [12,7];
  const door2Position: number[] = [5,17];
  const door3Position: number[] = [14,23];
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const cellSize = Math.min(windowSize.width, windowSize.height) / elements;
  const [ws, setWs] = useState<WebSocket | null>(null);
  const router = useRouter();
  const [playerPosition, setPlayerPosition] = useState<pointerPosition>({ x: 0, y: 0 });
  const [isGameOver, setIsGameOver] = useState(false);
  const [resetButton, setResetButton] = useState(false);
  const [isGameClear, setIsGameClear] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [keys, setKeys] = useState({
    key1: false,
    key2: false,
    key3: false
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
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

  useEffect(() => {
    async function checkRoomExists() {
      const res = await fetch(`${process.env.NEXT_PUBLIC_HTTP_URL}/api/room-exists/${params.slug}`);
      const data = await res.json();

      if (!data.exists) {
        router.push('/maze_waiting_room');
      } else {
        const currentHost = window.location.host; // 例: localhost:3000
        const wsHost = currentHost.replace('3000', '8000');
        const websocketUrl = `ws://${wsHost}/ws/${params.slug}`;
        const websocket = new WebSocket(websocketUrl);
        setWs(websocket);

        websocket.onmessage = (event) => {
          if (event.data == "gameover") {
            setIsGameOver(true);
            playGameOverSound();
            const timer = setTimeout(() => {
              setResetButton(true);
            }, 3000);
            return () => clearTimeout(timer);
          } else if (event.data == "getkey1") {
            setKeys(prev => ({ ...prev, key1: true }));
            maze[door1Position[0]][door1Position[1]] = ' ';
          } else if (event.data == "getkey2") {
            setKeys(prev => ({ ...prev, key2: true }));
            maze[door2Position[0]][door2Position[1]] = ' ';
          } else if (event.data == "getkey3") {
            setKeys(prev => ({ ...prev, key3: true }));
            maze[door3Position[0]][door3Position[1]] = ' ';
          }
        };

        return () => {
          websocket.close();
        };
      }
    }

    checkRoomExists();
  }, [params.slug]);

  const playGameOverSound = () => {
    const sound = new Audio("/horror_sound.wav");
    sound.play();
  };

  const restartGame = () => {
    setIsGameOver(false);
    setResetButton(false);
    setIsGameStarted(false);
    setKeys({
      key1: false,
      key2: false,
      key3: false
    });
    // 他に初期化するべきステートや変数があればこちらに追加
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / cellSize);
    const y = Math.floor((e.clientY - rect.top) / cellSize);

    if (ws && ws.readyState === WebSocket.OPEN) {
      if (maze[y][x] === '#' || (y == door1Position[0] && x == door1Position[1] && !keys.key1)
                             || (y == door2Position[0] && x == door2Position[1] && !keys.key2)
                             || (y == door3Position[0] && x == door3Position[1] && !keys.key3)) {
        ws.send('gameover');
      } else if (maze[y][x] === 'G') {
        setIsGameClear(true);
      } else if (y === key1Position[0] && x === key1Position[1] && maze[y][x] === 'K') {
        ws.send('getkey1');
      } else if (y === key2Position[0] && x === key2Position[1] && maze[y][x] === 'K') {
        ws.send('getkey2');
      } else if (y === key3Position[0] && x === key3Position[1] && maze[y][x] === 'K') {
        ws.send('getkey3');
      } else {
        setPlayerPosition({ x, y });
      }
    }
  };

  const maze = [
    ['S', 'S', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', ' ', ' ', ' ', ' ', ' ', ' ', '#', '#', '#', '#'],
    ['#', ' ', '#', ' ', ' ', ' ', '#', ' ', ' ', ' ', ' ', ' ', '#', ' ', ' ', ' ', '#', '#', '#', '#', ' ', ' ', ' ', '#', '#'],
    ['#', ' ', '#', ' ', '#', ' ', '#', ' ', '#', '#', '#', ' ', '#', ' ', '#', '#', '#', '#', '#', '#', '#', '#', ' ', '#', '#'],
    ['#', ' ', ' ', ' ', '#', ' ', '#', ' ', '#', '#', '#', ' ', ' ', ' ', '#', '#', '#', '#', '#', '#', '#', '#', ' ', '#', '#'],
    ['#', ' ', '#', ' ', '#', ' ', ' ', ' ', '#', '#', '#', ' ', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', ' ', '#', '#'],
    ['#', ' ', '#', ' ', '#', '#', '#', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '*', ' ', ' ', ' ', ' ', ' ', ' ', '#'],
    ['#', ' ', '#', ' ', '#', 'K', ' ', ' ', '#', '#', ' ', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', ' ', '#', '#', '#'],
    ['#', ' ', '#', ' ', '#', '#', '#', '#', '#', '#', ' ', '#', '#', '#', '#', '#', '#', ' ', ' ', ' ', ' ', ' ', '#', '#', '#'],
    ['#', ' ', '#', ' ', '#', ' ', ' ', ' ', '#', '#', ' ', ' ', ' ', ' ', '#', '#', '#', ' ', '#', '#', '#', '#', '#', '#', '#'],
    ['#', ' ', '#', ' ', ' ', ' ', '#', ' ', '#', '#', '#', '#', '#', ' ', '#', '#', '#', ' ', ' ', ' ', ' ', ' ', '#', '#', '#'],
    ['#', ' ', '#', ' ', '#', ' ', '#', ' ', '#', '#', '#', ' ', ' ', ' ', '#', '#', '#', '#', '#', '#', '#', ' ', '#', '#', '#'],
    ['#', ' ', '#', ' ', '#', ' ', '#', ' ', '#', '#', '#', ' ', '#', '#', '#', '#', '#', ' ', ' ', ' ', ' ', ' ', '#', '#', '#'],
    ['#', ' ', '#', ' ', '#', ' ', ' ', '*', '#', '#', '#', ' ', '#', '#', '#', '#', '#', ' ', '#', '#', '#', '#', '#', '#', '#'],
    ['#', ' ', ' ', ' ', '#', '#', '#', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '#', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'K'],
    ['#', ' ', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '*', '#'],
    ['#', ' ', ' ', ' ', ' ', 'K', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', 'G', '#'],
    ['#', ' ', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
    ['#', ' ', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
    ['#', ' ', ' ', ' ', ' ', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
    ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
  ];

  return (
    <main>
      {!isGameStarted ? (
        // ゲームが開始されていない場合、スタートボタンを表示
        <button onClick={() => setIsGameStarted(true)}>スタート</button>
      ) :isGameOver ? (
        <div>
          <Image src={localImage} alt="ホラー" />
          {resetButton && 
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-5 rounded-lg shadow-lg">
              <button onClick={restartGame} className="bg-blue-500 text-white px-4 py-2 rounded">やり直し</button>
            </div>
          }
        </div>
      ) : isGameClear ? (
        <div style={{ fontSize: '24px', color: 'green' }}>ゲームクリア</div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${maze[0].length}, ${cellSize}px)`,
            cursor: 'none',
            gridGap: '0px',
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0
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
                    width: `${cellSize}px`,
                    height: `${cellSize}px`,
                    backgroundColor:
                        cell === '#' ? 'black' :
                        cell === 'S' ? 'green' :
                        cell === 'G' ? 'red' :
                        cell === 'K' ? (
                          rowIndex === key1Position[0] && cellIndex === key1Position[1] && keys.key1 ? 'white' :
                          rowIndex === key2Position[0] && cellIndex === key2Position[1] && keys.key2 ? 'white' :
                          rowIndex === key3Position[0] && cellIndex === key3Position[1] && keys.key3 ? 'white' : 'gold'
                        ) :
                        cell === '*' ? (
                          rowIndex === door1Position[0] && cellIndex === door1Position[1] && keys.key1 ? 'white' :
                          rowIndex === door2Position[0] && cellIndex === door2Position[1] && keys.key2 ? 'white' :
                          rowIndex === door3Position[0] && cellIndex === door3Position[1] && keys.key3 ? 'white' : 'silver'
                        ) :
                        'white',
                      cursor: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="5" height="5" viewBox="0 0 2 2"><circle cx="1" cy="1" r="1" fill="black" /></svg>') 1 1, auto`,
                      backgroundSize: 'cover',
                      backgroundImage: cell === 'K' ? rowIndex === key1Position[0] && cellIndex === key1Position[1] && !keys.key1 ? `url(${keyImage})` :
                                                      rowIndex === key2Position[0] && cellIndex === key2Position[1] && !keys.key2 ? `url(${keyImage})` :
                                                      rowIndex === key3Position[0] && cellIndex === key3Position[1] && !keys.key3 ? `url(${keyImage})` : undefined
                                                    : undefined
                }}
              ></div>
            ))
          )}
        </div>
      )}
    </main>
  );
}

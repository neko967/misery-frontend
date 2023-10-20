"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from "next/image";
import localImage from "../../../../../public/3.png";

type Position = {
  x: number;
  y: number;
};

export default function Dealer({ params }: { params: { slug: string } }) {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [message, setMessage] = useState('');
  const router = useRouter();
  const [playerPosition, setPlayerPosition] = useState<Position>({ x: 0, y: 0 });
  const [isGameOver, setIsGameOver] = useState(false);
  const [isGameClear, setIsGameClear] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [hasKey, setHasKey] = useState(false);

  // 音声を再生する関数
  const playGameOverSound = () => {
    const sound = new Audio("/aaaa.wav");
    sound.play();
  };

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
          }
          if (event.data == "haskey") {
            setHasKey(true);
          }
        };

        return () => {
          websocket.close();
        };
      }
    }

    checkRoomExists();
  }, [params.slug]);

  useEffect(() => {
    if (isGameOver && ws && ws.readyState === WebSocket.OPEN) {
      playGameOverSound();
    }
  }, [isGameOver]);

  const restartGame = () => {
    setIsGameOver(false);
    setIsGameStarted(false);
    setHasKey(false);
    // 他に初期化するべきステートや変数があればこちらに追加
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / 40);
    const y = Math.floor((e.clientY - rect.top) / 40);

    if (maze[y][x] === '#' || (maze[y][x] === '*' && !hasKey) ) {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send('gameover');
      }
    } else if (maze[y][x] === 'G') {
      setIsGameClear(true);
    } else if (maze[y][x] === 'K') {  // 2. プレイヤーがキーに当たった場合、hasKey を true に設定
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send('haskey');
      }
    } else {
      setPlayerPosition({ x, y });
    }
  };

  const maze = [
    ['S', ' ', ' ', ' ', '#', '#', '#', '#', '#', '#'],
    ['#', ' ', '#', ' ', ' ', ' ', ' ', ' ', '#', '#'],
    ['#', ' ', '#', '#', '#', '#', '#', ' ', '#', '#'],
    ['#', ' ', '#', ' ', ' ', ' ', '#', ' ', '#', '#'],
    ['#', ' ', '#', ' ', '#', ' ', '#', ' ', '#', '#'],
    ['#', ' ', '#', ' ', '#', ' ', '#', ' ', '#', '#'],
    ['#', ' ', '#', ' ', '#', ' ', ' ', ' ', '#', '#'],
    ['#', ' ', ' ', ' ', '#', '#', '#', ' ', ' ', 'K'],
    ['#', '#', '#', '#', '#', '#', '#', '#', '*', '#'],
    ['#', '#', '#', '#', '#', '#', '#', '#', 'G', '#'],
  ];

  return (
    <main>
      <p>player_a_meiro</p>
      <p>X: {playerPosition.x}, Y: {playerPosition.y}</p>

      {!isGameStarted ? (
        // ゲームが開始されていない場合、スタートボタンを表示
        <button onClick={() => setIsGameStarted(true)}>スタート</button>
      ) :isGameOver ? (
        <div>
          <Image src={localImage} alt="ホラー" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-5 rounded-lg shadow-lg">
            <button onClick={restartGame} className="bg-blue-500 text-white px-4 py-2 rounded">やり直し</button>
          </div>
        </div>
      ) : isGameClear ? (
        <div style={{ fontSize: '24px', color: 'green' }}>ゲームクリア</div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(10, 40px)',
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
                    cell === 'K' ? (hasKey ? 'white' : 'gold') :  // キーを取得した後は、キーの位置を白に
                    cell === '*' ? (hasKey ? 'white' : 'silver') :  // 3. キーを取得した場合、障害物 * が消えるように
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

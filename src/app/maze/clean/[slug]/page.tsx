'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from "next/image";
import localImage from "../../../../../public/horror_image.png";
import Link from 'next/link';
import { GetWindowSize } from "../../../../hooks/GetWindowSize";

type pointerPosition = {
  x: number;
  y: number;
};

export default function Dealer({ params }: { params: { slug: string } }) {
  const elements = 20;
  const doorImage = "/door.png";
  const brickImage = "/brick.png";
  const keyImage = "/keyImage.png";
  const keyPositions: number[][] = [[],[8,14],[9,7],[18,5]];  //[[空の配列],[key1縦,key1横],[key2縦,key2横],[key3縦,key3横]]
  const doorPositions: number[][] = [[],[4,23],[5,12],[2,1]]; //[[空の配列],[door1縦,door1横],[door2縦,door2横],[door3縦,door3横]]
  const { height, width } = GetWindowSize();
  const cellSize = Math.min(width, height) / elements;
  const [ws, setWs] = useState<WebSocket | null>(null);
  const router = useRouter();
  const [playerPosition, setPlayerPosition] = useState<pointerPosition>({ x: 0, y: 0 });
  const [isGameOver, setIsGameOver] = useState(false);
  const [resetButton, setResetButton] = useState(false);
  const [isGameClear, setIsGameClear] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [keys, setKeys] = useState({ key1: false, key2: false, key3: false });
  const wallPositions: number[][] = [[16,13]]; // 出現・消失する壁
  // const [wallPositions, setWallPositions] = useState<number[][]>([[16, 13]]);
  // 壁の表示/非表示を管理するstateを追加
  const [showWall, setShowWall] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setIsModalOpen(true);
  }, []);

  // モーダルを閉じる関数
  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_HTTP_URL}/api/room-exists/${params.slug}`);
      const data = await res.json();

      if (!data.exists) {
        router.push('/waiting_room');
      } else {
        const websocketUrl = `${process.env.NEXT_PUBLIC_BACKEND_WEBSOCKET_URL}/${params.slug}`;
        const websocket = new WebSocket(websocketUrl);
        setWs(websocket);

        websocket.onmessage = (event) => {
          if (event.data == "gameover") {
            setIsGameOver(true);
            //playGameOverSound();
            const timer = setTimeout(() => {
              setResetButton(true);
            }, 3000);
            return () => clearTimeout(timer);
          } else if (event.data == "getkey1") {
            setKeys(prev => ({ ...prev, key1: true }));
            maze[doorPositions[1][0]][doorPositions[1][1]] = ' ';
          } else if (event.data == "getkey2") {
            setKeys(prev => ({ ...prev, key2: true }));
            maze[doorPositions[2][0]][doorPositions[2][1]] = ' ';
          } else if (event.data == "getkey3") {
            setKeys(prev => ({ ...prev, key3: true }));
            maze[doorPositions[3][0]][doorPositions[3][1]] = ' ';
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
    setShowWall(false);
    setKeys({
      key1: false,
      key2: false,
      key3: false
    });
    // 他に初期化するべきステートや変数があればこちらに追加
  };

  // 壁を2秒間隔で出現・消失
  useEffect(() => {
    const interval = setInterval(() => {
      setShowWall(prev => !prev);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / cellSize);
    const y = Math.floor((e.clientY - rect.top) / cellSize);

    if (ws && ws.readyState === WebSocket.OPEN) {
      if (maze[y][x] === '#' || (y == doorPositions[1][0] && x == doorPositions[1][1] && !keys.key1)
                             || (y == doorPositions[2][0] && x == doorPositions[2][1] && !keys.key2)
                             || (y == doorPositions[3][0] && x == doorPositions[3][1] && !keys.key3)
                             || (maze[y][x] === 'W' && showWall)) {
        ws.send('gameover');
      } else if (maze[y][x] === 'G') {
        setIsGameClear(true);
      } else if (y === keyPositions[1][0] && x === keyPositions[1][1] && maze[y][x] === 'K') {
        ws.send('getkey1');
      } else if (y === keyPositions[2][0] && x === keyPositions[2][1] && maze[y][x] === 'K') {
        ws.send('getkey2');
      } else if (y === keyPositions[3][0] && x === keyPositions[3][1] && maze[y][x] === 'K') {
        ws.send('getkey3');
      } else {
        setPlayerPosition({ x, y });
      }
    }
  };

  const maze = [
    ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
    ['#', 'G', '#', '#', '#', '#', '#', '#', '#', '#', '#', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '#', '#', '#'],
    ['#', '*', '#', '#', '#', '#', '#', '#', '#', '#', '#', ' ', '#', '#', '#', '#', '#', ' ', '#', '#', '#', ' ', '#', '#', '#'],
    ['#', ' ', '#', '#', '#', '#', '#', '#', '#', ' ', ' ', ' ', '#', '#', ' ', ' ', ' ', ' ', '#', '#', '#', ' ', ' ', ' ', '#'],
    ['#', ' ', ' ', ' ', ' ', ' ', '#', '#', '#', ' ', '#', '#', '#', '#', ' ', '#', '#', '#', '#', '#', '#', '#', '#', '*', '#'],
    ['#', '#', '#', '#', '#', ' ', '#', '#', '#', ' ', '#', '#', '*', ' ', ' ', '#', '#', '#', '#', '#', '#', ' ', ' ', ' ', '#'],
    ['#', ' ', ' ', ' ', ' ', ' ', '#', ' ', ' ', ' ', '#', '#', ' ', '#', '#', '#', '#', '#', '#', '#', '#', ' ', '#', '#', '#'],
    ['#', ' ', '#', '#', '#', '#', '#', ' ', '#', '#', '#', '#', ' ', '#', '#', '#', '#', ' ', ' ', ' ', ' ', ' ', '#', '#', '#'],
    ['#', ' ', '#', '#', '#', '#', '#', ' ', '#', ' ', ' ', ' ', ' ', '#', 'K', '#', '#', ' ', '#', '#', '#', '#', '#', '#', '#'],
    ['#', ' ', '#', ' ', ' ', ' ', '#', '#', '#', ' ', '#', '#', '#', '#', ' ', '#', '#', ' ', ' ', ' ', ' ', ' ', '#', '#', '#'],
    ['#', ' ', '#', ' ', '#', ' ', '#', '#', '#', ' ', ' ', ' ', ' ', '#', ' ', '#', '#', '#', '#', '#', '#', ' ', '#', '#', '#'],
    ['#', ' ', '#', ' ', '#', ' ', '#', '#', '#', '#', '#', '#', ' ', '#', ' ', '#', '#', ' ', ' ', ' ', ' ', ' ', '#', '#', '#'],
    ['#', ' ', '#', ' ', '#', ' ', ' ', ' ', '#', '#', ' ', ' ', ' ', '#', ' ', ' ', '#', ' ', '#', '#', '#', '#', '#', '#', '#'],
    ['#', ' ', ' ', ' ', '#', '#', '#', ' ', '#', '#', ' ', '#', '#', '#', '#', ' ', '#', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '#'],
    ['#', ' ', '#', '#', '#', '#', '#', ' ', '#', ' ', ' ', '#', '#', '#', '#', ' ', '#', '#', '#', '#', '#', '#', '#', ' ', '#'],
    ['#', ' ', '#', '#', '#', '#', '#', ' ', '#', ' ', '#', '#', '#', ' ', ' ', ' ', ' ', ' ', '#', '#', '#', '#', '#', ' ', '#'],
    ['#', ' ', '#', '#', '#', '#', '#', ' ', ' ', ' ', '#', '#', '#', ' ', '#', '#', '#', ' ', '#', '#', '#', '#', '#', ' ', '#'],
    ['#', ' ', '#', '#', '#', '#', '#', '#', '#', '#', '#', 'S', 'S', 'S', 'S', 'S', '#', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '#'],
    ['#', ' ', ' ', ' ', ' ', 'K', '#', '#', '#', '#', '#', 'S', 'S', 'S', 'S', 'S', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
    ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
  ];

  wallPositions.forEach(([x, y]) => {
    maze[x][y] = 'W';
  });

  async function goEndingClean() {
    router.push(`/ending/clean/${params.slug}`);
  }

  return (
    <main>
      <div>
        height:{height} width:{width}
        <div>
      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <p>閉ざされた屋敷の扉を押し開けると、そこはもはやただの屋敷ではなかった。<br/>
              廊下は歪み、部屋は迷路と化し、二人の冒険者を待ち受ける。<br/>
              挑戦を開始するには、一歩を踏み出し、赤いゴールを目指し、壁に触れぬよう慎重に進まねばならない。<br/>
              しかし、一人の力では脱出の望みは薄い。絆と信頼を武器に、二人で協力し合ってこの屋敷からの脱出を目指そう。<br/>
              その先には、予想もしない真実が二人を待っているかもしれない。</p>
            <div className="text-right">
          <button className="btn" onClick={closeModal}>閉じる</button>
        </div>
      </div>
    </div>
      )}
    </div>
      </div>
      {!isGameStarted ? (
        // ゲームが開始されていない場合、スタートボタンを表示
        <button onClick={() => setIsGameStarted(true)}
        className="btn btn-error"
        style={{
          position: 'absolute',
          top: 18 * cellSize + 'px',
          left: 13 * cellSize + 'px',
        }}
        >スタート
          </button>
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
        <>
          <div style={{ fontSize: '24px', color: 'green' }}>ゲームクリア</div>
          <button onClick={goEndingClean}
                  className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-600 p-5 rounded-lg shadow-lg">
            エンディングへ
          </button>
        </>
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
                        cell === 'W' ? (showWall ? 'pink' : 'white') :
                        'white',
                    cursor: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="5" height="5" viewBox="0 0 2 2"><circle cx="1" cy="1" r="1" fill="black" /></svg>') 1 1, auto`,
                    backgroundSize: 'cover',
                    backgroundImage:
                        cell === '#' ? `url(${brickImage})` :
                        cell === 'K' ? (
                          rowIndex === keyPositions[1][0] && cellIndex === keyPositions[1][1] && !keys.key1 ? `url(${keyImage})` :
                          rowIndex === keyPositions[2][0] && cellIndex === keyPositions[2][1] && !keys.key2 ? `url(${keyImage})` :
                          rowIndex === keyPositions[3][0] && cellIndex === keyPositions[3][1] && !keys.key3 ? `url(${keyImage})` : undefined
                        ) :
                        cell === '*' ? (
                          rowIndex === doorPositions[1][0] && cellIndex === doorPositions[1][1] && !keys.key1 ? `url(${doorImage})` :
                          rowIndex === doorPositions[2][0] && cellIndex === doorPositions[2][1] && !keys.key2 ? `url(${doorImage})` :
                          rowIndex === doorPositions[3][0] && cellIndex === doorPositions[3][1] && !keys.key3 ? `url(${doorImage})` : undefined
                        ) :
                        undefined,
                }}
              ></div>
            ))
          )}
        </div>
      )}
    </main>
  );
}
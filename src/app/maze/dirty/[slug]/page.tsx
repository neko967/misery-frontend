"use client"
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
  const countDownImage = "/countDownImage.png";
  const keyPositions: number[][] = [[],[0,0],[6,2],[0,0],[1,6],[0,0],[14,29],[0,0],[2,19]];  //[[空の配列],[key1縦,key1横],[key2縦,key2横],[key3縦,key3横]]
  const doorPositions: number[][] = [[],[13,1],[0,0],[12,15],[0,0],[14,26],[0,0],[9,27],[0,0]]; //[[空の配列],[door1縦,door1横],[door2縦,door2横],[door3縦,door3横]]
  const { height, width } = GetWindowSize();
  const cellSize = Math.min(width, height) / elements;
  const [ws, setWs] = useState<WebSocket | null>(null);
  const router = useRouter();
  const [playerPosition, setPlayerPosition] = useState<pointerPosition>({ x: 0, y: 0 });
  const [isGameOver, setIsGameOver] = useState(false);
  const [resetButton, setResetButton] = useState(false);
  const [isGameClear, setIsGameClear] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [keys, setKeys] = useState({ key1: false, key2: false, key3: false, key4: false,
                                     key5: false, key6: false, key7: false, key8: false });
  const wallPositions: number[][] = [[6,1],[6,3],[7,2],[5,2],[4,6],[14,5],[3,12],[5,29],[2,26],[13,29]]; // 出現・消失する壁
  // const [wallPositions, setWallPositions] = useState<number[][]>([[16, 13]]);
  // 壁の表示/非表示を管理するstateを追加
  const [showWall, setShowWall] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(40); // 残り10秒からスタート
  const [isTimeAttackStarted, setIsTimeAttackStarted] = useState(false); // タイムアタックが開始されたかどうかを追跡
  const timeAttackPositions: number[][] = [[],[1,21],] // タイムアタック開始のppsition
  // リセットボタンの呼び出し関数
  const resetButtonTimer: any = () => {
    setTimeout(() => {
      setResetButton(true);
    }, 3000);
  }

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
            resetButtonTimer();
            return () => clearTimeout(resetButtonTimer);
          } else if (event.data == "timeAttack") {
            setIsTimeAttackStarted(true);
          } else if (event.data == "getkey1") {
            setKeys(prev => ({ ...prev, key1: true }));
            maze[doorPositions[1][0]][doorPositions[1][1]] = ' ';
          } else if (event.data == "getkey2") {
            setKeys(prev => ({ ...prev, key2: true }));
            maze[doorPositions[2][0]][doorPositions[2][1]] = ' ';
          } else if (event.data == "getkey3") {
            setKeys(prev => ({ ...prev, key3: true }));
            maze[doorPositions[3][0]][doorPositions[3][1]] = ' ';
          } else if (event.data == "getkey4") {
            setKeys(prev => ({ ...prev, key4: true }));
            maze[doorPositions[4][0]][doorPositions[4][1]] = ' ';
          } else if (event.data == "getkey5") {
            setKeys(prev => ({ ...prev, key5: true }));
            maze[doorPositions[5][0]][doorPositions[5][1]] = ' ';
          } else if (event.data == "getkey6") {
            setKeys(prev => ({ ...prev, key6: true }));
            maze[doorPositions[6][0]][doorPositions[6][1]] = ' ';
          } else if (event.data == "getkey7") {
            setKeys(prev => ({ ...prev, key7: true }));
            maze[doorPositions[7][0]][doorPositions[7][1]] = ' ';
          } else if (event.data == "getkey8") {
            setKeys(prev => ({ ...prev, key8: true }));
            maze[doorPositions[8][0]][doorPositions[8][1]] = ' ';
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
    setTimeLeft(40);
    setKeys({
      key1: false,
      key2: false,
      key3: false,
      key4: false,
      key5: false,
      key6: false,
      key7: false,
      key8: false,
    });
    // 他に初期化するべきステートや変数があればこちらに追加
  };

    useEffect(() => {
      if (isGameClear) {
        setIsTimeAttackStarted(false);
      }
    }, [isGameClear]);

    useEffect(() => {
      if (isGameOver) {
        setIsTimeAttackStarted(false);
      }
    }, [isGameOver]);
    
  // 壁を2秒間隔で出現・消失
    useEffect(() => {
      const interval = setInterval(() => {
        setShowWall(prev => !prev); 
      }, 2000);

      return () => clearInterval(interval);
    }, []);

  // タイムアタックのタイマーを実装
  useEffect(() => {
    let interval: any;
    if (isTimeAttackStarted && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000); // 1秒ごとに減らす
    } else if (timeLeft === 0) {
      // タイムアタック失敗
      setIsGameOver(true);
      setIsTimeAttackStarted(false); // タイマー停止
      resetButtonTimer();
    }
    return () => clearInterval(interval); // コンポーネントのアンマウント時にインターバルをクリア
  }, [isTimeAttackStarted, timeLeft]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / cellSize);
    const y = Math.floor((e.clientY - rect.top) / cellSize);

    if (ws && ws.readyState === WebSocket.OPEN) {
      if (maze[y][x] === '#' || (y == doorPositions[1][0] && x == doorPositions[1][1] && !keys.key1)
                             || (y == doorPositions[2][0] && x == doorPositions[2][1] && !keys.key2)
                             || (y == doorPositions[3][0] && x == doorPositions[3][1] && !keys.key3)
                             || (y == doorPositions[4][0] && x == doorPositions[4][1] && !keys.key4)
                             || (y == doorPositions[5][0] && x == doorPositions[5][1] && !keys.key5)
                             || (y == doorPositions[6][0] && x == doorPositions[6][1] && !keys.key6)
                             || (y == doorPositions[7][0] && x == doorPositions[7][1] && !keys.key7)
                             || (y == doorPositions[8][0] && x == doorPositions[8][1] && !keys.key8)
                             || (maze[y][x] === 'W' && showWall)) {
        ws.send('gameover');
      } else if (maze[y][x] === 'G') {
        setIsGameClear(true);
      } else if (y === timeAttackPositions[1][0] && x === timeAttackPositions[1][1] && maze[y][x] === 'E'){
        ws.send('timeAttack');
      } else if (y === keyPositions[1][0] && x === keyPositions[1][1] && maze[y][x] === 'K') {
        ws.send('getkey1');
      } else if (y === keyPositions[2][0] && x === keyPositions[2][1] && maze[y][x] === 'K') {
        ws.send('getkey2');
      } else if (y === keyPositions[3][0] && x === keyPositions[3][1] && maze[y][x] === 'K') {
        ws.send('getkey3');
      } else if (y === keyPositions[4][0] && x === keyPositions[4][1] && maze[y][x] === 'K') {
        ws.send('getkey4');
      } else if (y === keyPositions[5][0] && x === keyPositions[5][1] && maze[y][x] === 'K') {
        ws.send('getkey5');
      } else if (y === keyPositions[6][0] && x === keyPositions[6][1] && maze[y][x] === 'K') {
        ws.send('getkey6');
      } else if (y === keyPositions[7][0] && x === keyPositions[7][1] && maze[y][x] === 'K') {
        ws.send('getkey7');
      } else if (y === keyPositions[8][0] && x === keyPositions[8][1] && maze[y][x] === 'K') {
        ws.send('getkey8');
      } else {
        setPlayerPosition({ x, y });
      }
    }
  };
  const maze = [
//    0    1    2    3    4    5    6    7    8    9   10   11   12   13   14   15   16   17   18   19   20   21   22   23   24   25   26   27   28   29   30   31   32   33
    ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
    ['#', ' ', ' ', ' ', ' ', ' ', 'K', ' ', ' ', '#', '#', ' ', ' ', ' ', '#', '#', '#', '#', '#', '#', '#', 'E', ' ', ' ', '#', '#', ' ', '#', '#', 'G', '#'],
    ['#', ' ', '#', '#', '#', '#', '#', '#', ' ', '#', '#', ' ', ' ', ' ', '#', ' ', ' ', ' ', '#', 'K', ' ', ' ', '#', ' ', ' ', ' ', ' ', '#', '#', ' ', '#'],
    ['#', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '#', '#', '#', ' ', '#', '#', ' ', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', ' ', '#', '#', ' ', '#'],
    ['#', '#', '#', '#', '#', '#', ' ', '#', '#', '#', ' ', ' ', ' ', ' ', ' ', ' ', '#', '#', ' ', ' ', ' ', ' ', '#', '#', '#', '#', ' ', '#', '#', ' ', '#'],
    ['#', ' ', ' ', ' ', '#', '#', ' ', '#', '#', '#', ' ', '#', '#', '#', '#', '#', '#', '#', ' ', '#', '#', ' ', ' ', '#', '#', '#', ' ', '#', ' ', ' ', '#'],
    ['#', ' ', 'K', ' ', '#', '#', ' ', '#', '#', '#', ' ', '#', ' ', ' ', ' ', '#', '#', '#', ' ', '#', '#', '#', '#', '#', '#', '#', ' ', ' ', ' ', '#', '#'],
    ['#', ' ', ' ', ' ', '#', '#', ' ', '#', '#', '#', ' ', ' ', ' ', '#', ' ', '#', '#', '#', ' ', '#', ' ', ' ', ' ', ' ', '#', '#', '#', ' ', '#', '#', '#'],
    ['#', '#', '#', ' ', '#', '#', ' ', ' ', ' ', '#', ' ', '#', '#', '#', ' ', ' ', '#', '#', ' ', ' ', ' ', '#', '#', ' ', '#', '#', '#', ' ', '#', '#', '#'],
    ['#', ' ', ' ', ' ', '#', '#', '#', '#', ' ', '#', ' ', '#', '#', '#', '#', ' ', '#', '#', ' ', '#', '#', '#', ' ', ' ', ' ', ' ', ' ', '*', ' ', ' ', '#'],
    ['#', ' ', '#', '#', '#', '#', '#', '#', ' ', '#', ' ', '#', '#', '#', '#', ' ', '#', '#', '#', '#', '#', '#', ' ', '#', '#', '#', '#', ' ', '#', ' ', '#'],
    ['#', ' ', ' ', '#', '#', '#', ' ', '#', ' ', ' ', ' ', '#', '#', '#', '#', ' ', '#', '#', '#', '#', '#', '#', ' ', '#', '#', '#', ' ', ' ', '#', ' ', '#'],
    ['#', '#', ' ', '#', '#', ' ', ' ', '#', '#', '#', '#', '#', '#', '#', '#', '*', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '#', '#', '#', ' ', '#', '#', ' ', '#'],
    ['#', '*', ' ', '#', '#', ' ', '#', '#', '#', '#', ' ', '#', '#', '#', '#', ' ', '#', '#', '#', ' ', '#', '#', '#', '#', '#', '#', ' ', '#', '#', ' ', '#'],
    ['#', ' ', '#', '#', '#', ' ', ' ', ' ', '#', '#', ' ', '#', '#', '#', '#', ' ', '#', '#', '#', ' ', '#', '#', '#', '#', ' ', ' ', '*', '#', '#', 'K', '#'],
    ['#', ' ', '#', '#', '#', ' ', '#', ' ', '#', '#', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '#', ' ', ' ', '#', ' ', '#', ' ', ' ', '#'],
    ['#', ' ', ' ', '#', '#', ' ', '#', ' ', '#', '#', ' ', '#', '#', '#', '#', ' ', '#', '#', '#', '#', '#', ' ', '#', ' ', '#', '#', ' ', '#', ' ', '#', '#'],
    ['#', '#', ' ', '#', '#', ' ', '#', ' ', ' ', ' ', ' ', '#', '#', 'S', 'S', 'S', 'S', 'S', '#', '#', '#', ' ', ' ', ' ', '#', '#', ' ', ' ', ' ', '#', '#'],
    ['#', '#', ' ', ' ', ' ', ' ', '#', '#', '#', '#', '#', '#', '#', 'S', 'S', 'S', 'S', 'S', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
    ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
  ];

  wallPositions.forEach(([x, y]) => {
    maze[x][y] = 'W';
  });

  async function goEndingDirty() {
    router.push(`/ending/dirty/${params.slug}`);
  }

  return (
    <div
    className="h-screen w-full bg-cover flex justify-center items-center"
    style={{
      backgroundImage: isGameClear ? "url('/Gameclear.png')" : "url('/maze.png')" ,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}
  >
    <main>
      <div>
       
        <div>
      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <p>閉ざされた屋敷の扉を押し開けると、そこはもはやただの屋敷ではなかった。<br/>
              廊下は歪み、部屋は迷路と化し、二人の冒険者を待ち受ける。<br/>
              挑戦を開始するには、一歩を踏み出し、<span className="red-text">赤いゴールを目指し、壁に触れぬよう慎重に進まねばならない。</span><br/>
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
        >迷路を進む
        </button>
      ) :isGameOver ? (
        <div>
          <Image src={localImage} alt="ホラー" />
          {resetButton &&
            <div className="reset">
              <button onClick={restartGame} className="reset-button">再挑戦する</button>
            </div>
          }
        </div>
      ) : isGameClear ? (
        <>
          <div className="congratulation">congratulation!!</div>
          <button onClick={goEndingDirty}
                  className="exit">
            屋敷を出る
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
              // タイムアタック処理の関数を呼び出す
                // onMouseOver={() => handleMouseOver(rowIndex, cellIndex)}
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
                        cell === 'E' ? 'white' :
                        cell === 'W' ? (showWall ? 'pink' : 'white') :
                        'white',
                    cursor: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="5" height="5" viewBox="0 0 2 2"><circle cx="1" cy="1" r="1" fill="black" /></svg>') 1 1, auto`,
                    backgroundSize: 'cover',
                    backgroundImage:
                        cell === '#' ? `url(${brickImage})` :
                        cell === 'E' ? (
                          rowIndex === timeAttackPositions[1][0] && cellIndex === timeAttackPositions[1][1] && !isTimeAttackStarted ?`url(${countDownImage})` : undefined
                        ) :
                        cell === 'K' ? (
                          rowIndex === keyPositions[1][0] && cellIndex === keyPositions[1][1] && !keys.key1 ? `url(${keyImage})` :
                          rowIndex === keyPositions[2][0] && cellIndex === keyPositions[2][1] && !keys.key2 ? `url(${keyImage})` :
                          rowIndex === keyPositions[3][0] && cellIndex === keyPositions[3][1] && !keys.key3 ? `url(${keyImage})` :
                          rowIndex === keyPositions[4][0] && cellIndex === keyPositions[4][1] && !keys.key4 ? `url(${keyImage})` : 
                          rowIndex === keyPositions[5][0] && cellIndex === keyPositions[5][1] && !keys.key5 ? `url(${keyImage})` :
                          rowIndex === keyPositions[6][0] && cellIndex === keyPositions[6][1] && !keys.key6 ? `url(${keyImage})` :
                          rowIndex === keyPositions[7][0] && cellIndex === keyPositions[7][1] && !keys.key7 ? `url(${keyImage})` :
                          rowIndex === keyPositions[8][0] && cellIndex === keyPositions[8][1] && !keys.key8 ? `url(${keyImage})` : undefined
                        ) :
                        cell === '*' ? (
                          rowIndex === doorPositions[1][0] && cellIndex === doorPositions[1][1] && !keys.key1 ? `url(${doorImage})` :
                          rowIndex === doorPositions[2][0] && cellIndex === doorPositions[2][1] && !keys.key2 ? `url(${doorImage})` :
                          rowIndex === doorPositions[3][0] && cellIndex === doorPositions[3][1] && !keys.key3 ? `url(${doorImage})` :
                          rowIndex === doorPositions[4][0] && cellIndex === doorPositions[4][1] && !keys.key4 ? `url(${doorImage})` : 
                          rowIndex === doorPositions[5][0] && cellIndex === doorPositions[5][1] && !keys.key5 ? `url(${doorImage})` :
                          rowIndex === doorPositions[6][0] && cellIndex === doorPositions[6][1] && !keys.key6 ? `url(${doorImage})` :
                          rowIndex === doorPositions[7][0] && cellIndex === doorPositions[7][1] && !keys.key7 ? `url(${doorImage})` :
                          rowIndex === doorPositions[8][0] && cellIndex === doorPositions[8][1] && !keys.key8 ? `url(${doorImage})` : undefined
                        ) :
                        undefined,
                }}
              ></div>
            ))
          )}
          <div className="fixed top-4 right-4">
          <div className="bg-pink-500 text-white py-2 px-4 rounded shadow-lg">
          
          {!isGameOver && isTimeAttackStarted && <div>残り時間：{timeLeft}秒</div>}
          </div>
          </div>
        </div>
      )}
      
    </main>
    </div>
  );
}

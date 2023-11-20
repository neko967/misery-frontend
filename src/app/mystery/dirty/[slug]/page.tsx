'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from "next/image";
import { GetDirtyItem } from "./dirtyRoomItems";

// アイテム型定義
type Item = {
  id: number;
  name: string;
  imagePath?: string;
  positionClasses: string;
  width?: string; // 例: "w-32"
  height?: string; // 例: "h-32"
  additionalStyles?: React.CSSProperties;
  messages: {
    text: string;
    choices: {
      confirmText: string;
      cancelText: string;
    }| null;
  }[];
};

// メッセージコンポーネント
const Message = ({text}: {text: string}) => {
  return (
    <div className="flex items-center justify-center h-full text-white text-xl">{text}</div>
  )
}

// 選択肢コンポーネント  
const Choices = ({onConfirm, onCancel, options}: any) => {
  const confirmText = options?.confirmText;
  const cancelText = options?.cancelText || "戻る";

  return (
    <div className="flex flex-col space-y-4">
      <button className="px-4 text-white rounded" onClick={onConfirm}>{confirmText}</button>
      <button className="px-4 text-white rounded" onClick={onCancel}>{cancelText}</button>
    </div>
  )
}

//三角ボタンコンポーネント
const TriangleButton = ({ direction, handleClickTriangle }: any) => {
  const triangleClass = direction === 'left' ? 'triangle-left' : 'triangle-right';
  return (
    <div 
      className={`triangle-button ${triangleClass} triangle-button-position`}
      style={{ left: direction === 'left' ? '10px' : 'auto', right: direction === 'right' ? '10px' : 'auto' }}
      onClick={handleClickTriangle}
    ></div>
  );
};

export default function Home({ params }: { params: { slug: string } }) {
  const items: Item[] = GetDirtyItem();
  const [ws, setWs] = useState<WebSocket | null>(null);
  const router = useRouter();
  const [isCleanDoorOpen, setIsCleanDoorOpen] = useState(false);
  const [isDirtyDoorOpen, setIsDirtyDoorOpen] = useState(false);
  const [isBlueBoxBroken, setIsBlueBoxBroken] = useState(false);
  const [acquiredBlueBox, setAcquiredBlueBox] = useState(false);
  const [acquiredBear, setAcquiredBear] = useState(false);
  const [isBearCutted, setIsBearCutted] = useState(false);
  const [acquiredItems, setAcquiredItems] = useState<Item[]>([]); // 取得済みのアイテムを管理する状態
  const [currentItem, setCurrentItem] = useState<Item | null>(null); // 現在選択されているアイテムを管理する状態 毎回nullにリセット
  const [messageIndex, setMessageIndex] = useState<number>(0); // 現在のメッセージのインデックスを管理する状態
  const [isItemListVisible, setIsItemListVisible] = useState(false); // アイテムリストの表示・非表示を管理する状態
  const [selectedItem, setSelectedItem] = useState<Item | null>(null); // アイテムリストからアイテムを選択するときに使う
  const [putImageItem, setPutImageItem] = useState<Item | null>(null); // アイテムリストから画像付きのアイテムを置くときに使う
  const [backgroundImage, setBackgroundImage] = useState('/dirty_room.png');
  const [cleanIsReadyToAcceptItem, setCleanIsReadyToAcceptItem] = useState(false);
  const [dirtyIsReadyToAcceptItem, setDirtyIsReadyToAcceptItem] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [diaryCurrentTextIndex, setDiaryCurrentTextIndex] = useState(14);
  const [isGameOver, setIsGameOver] = useState(false);

  const storyTexts = [
    '部屋に入ると、ドアが勢いよく閉じた。',
    'ドアは不思議な力で固く閉じられ、もはや以前のように容易に開くことはない。',
    'そして、どこからともなく微かな笑い声が響く。それは、恐怖を誘う微笑か、それとも何かを示唆する手がかりか。',
    '探検者たちは急いで部屋の中を見渡し、脱出への糸口を探し始める。明白な道標はなく、ただ直感と推理のみが頼りだった。',
  ];

  const nextText = () => {
    setCurrentTextIndex((prevIndex) => prevIndex + 1);
  };

  const diaryTexts = [
    '5月3日',
    '毎日が同じ。窓から外の世界を眺めることしかできない。部屋の中はもう狭く感じる。',
    '壁には剥がれかけた壁紙が、昔の楽しかった日々を思い出させる。',
    '昨日の夜は、また食べるものがなかった。キッチンには食べ物があるはずだけど、ドアはいつも鍵がかかっている。',
    
    '5月10日',
    '今日は何も食べていない。お腹が空いて、空いて、もう考えることすらできない。',
    '壁には自分の落書きで埋め尽くされている。文字や絵で、自分の気持ちを表現するしかない。',
    '昔、母が作ってくれた温かい食事を思い出す。でも今は、ただの遠い記憶。部屋から出られる日は来るのだろうか。',
    
    '5月17日',
    '親が戻ってきた時、私は声を出して助けを求めた。でも、彼らは私の声を無視して、自分たちの祈りに没頭している。',
    '彼らの世界では、私はもう存在していないようだ。',
    '壁に新しい絵を描いた。自由を夢見る鳥の絵だ。',
    'いつか、この部屋から飛び立ち、自分の翼で大空を飛べる日が来ると信じている。',
  ];

  const nextTextDiary = () => {
    setDiaryCurrentTextIndex((prevIndex) => prevIndex + 1);
  };

  let message: string | undefined;
  let choicesOptions: { confirmText: string; cancelText: string } | null = null;

  // 現在選択されているアイテムがある場合、そのアイテムの特定のメッセージと選択肢を取得
  if (currentItem) {
    message = currentItem.messages[messageIndex]?.text;
    choicesOptions = currentItem.messages[messageIndex]?.choices;
  }

  // アイテムがクリックされた時の処理
  const handleClick = (item: Item) => {
    if (diaryCurrentTextIndex >= diaryTexts.length && currentTextIndex >= storyTexts.length && !putImageItem) {
      setCurrentItem(item);
      if ((selectedItem && selectedItem.name === "青いカギ") || (selectedItem && selectedItem.name === "赤いカギ")) {
        if (item.name === '青い箱' && !isBlueBoxBroken) {
          setMessageIndex(0);
        } else if (item.name === '青い箱' && isBlueBoxBroken && !acquiredBlueBox) {
          setMessageIndex(1);
        } else if (item.name === '青い箱' && isBlueBoxBroken && acquiredBlueBox ) {
          setMessageIndex(3);
        } else if (item.name === 'ドア') {
          setMessageIndex(3);
        } else if (item.name === 'ぬいぐるみ' && !acquiredBear) {
          setMessageIndex(0);
        } else if (item.name === 'ぬいぐるみ' && acquiredBear) {
          setMessageIndex(2);
        } else if (!acquiredItems.some(acquiredItem => acquiredItem.id === item.id)) {
          setMessageIndex(0); 
        }
      } else {
        if (item.name === '青い箱' && !isBlueBoxBroken) {
          setMessageIndex(0);
        } else if (item.name === '青い箱' && isBlueBoxBroken && !acquiredBlueBox) {
          setMessageIndex(1);
        } else if (item.name === '青い箱' && isBlueBoxBroken && acquiredBlueBox ) {
          setMessageIndex(3);
        } else if (item.name === 'ドア' && !isDirtyDoorOpen && !isCleanDoorOpen) {
          setMessageIndex(0);
        } else if (item.name === 'ドア' && isDirtyDoorOpen && !isCleanDoorOpen) {
          setMessageIndex(1);
        } else if (item.name === 'ドア' && isDirtyDoorOpen && isCleanDoorOpen) {
          setMessageIndex(2);
        } else if (item.name === 'ぬいぐるみ' && !acquiredBear) {
          setMessageIndex(0);
        } else if (item.name === 'ぬいぐるみ' && acquiredBear) {
          setMessageIndex(2);
        } else if (!acquiredItems.some(acquiredItem => acquiredItem.id === item.id)) {
          setMessageIndex(0); 
        }
      }
    }
  };

  // 選択肢の処理
  const handleConfirm = () => {
    if (currentItem && currentItem.name === 'ぬいぐるみ' && !acquiredBear) {
      setAcquiredItems([...acquiredItems, items[4]])
      setMessageIndex(prevIndex => prevIndex + 1);
      setAcquiredBear(true);
    } else if (currentItem && currentItem.name === '青い箱' && isBlueBoxBroken) {
      setAcquiredItems([...acquiredItems, currentItem]);
      setAcquiredBlueBox(true);
      setMessageIndex(prevIndex => prevIndex + 1);
    } else if (currentItem && currentItem.name === 'オルゴール') {
      playMusic('/misery.m4a')
      setCurrentItem(null);
    } else if (currentItem && currentItem.name === 'ドア') {
      router.push(`/maze/dirty/${params.slug}`);
    } else if (currentItem && currentItem.name === '日記') {
      setDiaryCurrentTextIndex(0);
      setCurrentItem(null);
    } else {
      if (currentItem) {
        setAcquiredItems([...acquiredItems, currentItem]);
      }
      setCurrentItem(null);
    }
  };

  // 選択肢拒否時の処理
  const handleCancel = () => {
    if (currentItem && currentItem.name === "はさみ" && messageIndex === 0) {
      setAcquiredItems([...acquiredItems, items[5]]);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send('dirtyIsReadyToAcceptItem');
      }
    } else if (currentItem && currentItem.name === "青いカギ" && messageIndex === 0) {
      setAcquiredItems([...acquiredItems, items[6]]);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send('dirtyIsReadyToAcceptItem');
      }
    } else if (currentItem && currentItem.name === "赤いカギ" && messageIndex === 0) {
      setAcquiredItems([...acquiredItems, items[7]]);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send('dirtyIsReadyToAcceptItem');
      }
    }
    setCurrentItem(null);
  };

  const handleItemSelect = (item: Item) => {
    if (item.imagePath) {
      if (putImageItem && putImageItem.id === item.id) {
        setPutImageItem(null); // 既に選択されているアイテムを再度クリックした場合、選択を解除
      } else {
        setPutImageItem(item); // それ以外の場合、アイテムを選択
      }
    } else {
      if (selectedItem && selectedItem.id === item.id) {
        setSelectedItem(null); // 既に選択されているアイテムを再度クリックした場合、選択を解除
      } else {
        setSelectedItem(item); // それ以外の場合、アイテムを選択
      }
    }
  };

  const switchBackgroundImage = (direction: any) => {
    if (direction === 'left') {
      setBackgroundImage('/dirty_room.png');
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send('dirtyIsNotReadyToAcceptItem');
      }
    } else {
      setBackgroundImage('/wall.png');
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send('dirtyIsReadyToAcceptItem');
      }
    }
  };

  const handleClickHole = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      if (selectedItem && selectedItem.name === 'はさみ' && cleanIsReadyToAcceptItem) {
        ws.send('sendScissorFromDirty');
        let result = acquiredItems.filter(function( item ) {
          return item.name !== 'はさみ';
        });
        setAcquiredItems(result);
        setCleanIsReadyToAcceptItem(false);
        setCurrentItem(items[5]);
        setMessageIndex(1);
      } else if (selectedItem && selectedItem.name === '青いカギ' && cleanIsReadyToAcceptItem) {
        ws.send('sendBlueKeyFromDirty');
        let result = acquiredItems.filter(function( item ) {
          return item.name !== '青いカギ';
        });
        setAcquiredItems(result);
        setCleanIsReadyToAcceptItem(false);
        setCurrentItem(items[6]);
        setMessageIndex(1);
      } else if (selectedItem && selectedItem.name === '赤いカギ' && cleanIsReadyToAcceptItem) {
        ws.send('sendRedKeyFromDirty');
        let result = acquiredItems.filter(function( item ) {
          return item.name !== '赤いカギ';
        });
        setAcquiredItems(result);
        setCleanIsReadyToAcceptItem(false);
        setCurrentItem(items[7]);
        setMessageIndex(1);
      }
    }
    setSelectedItem(null);
  };

  const handleClickItemImage = () => {
    if (putImageItem && putImageItem.name === "ぬいぐるみ" && selectedItem && selectedItem.name === "はさみ" && !isBearCutted) {
      setCurrentItem(items[4]);
      setMessageIndex(3);
      setAcquiredItems([...acquiredItems, items[6], items[7]]);
      setPutImageItem(null);
      setSelectedItem(null);
      setIsBearCutted(true);
    } else if (putImageItem && putImageItem.name === "青い箱" && selectedItem && selectedItem.name === "青いカギ" && !isCleanDoorOpen) {
      setCurrentItem(items[1]);
      setMessageIndex(5);
      setPutImageItem(null);
      setSelectedItem(null);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send('openCleanDoor');
      }
    }
  };

  const playMusic = (file: string) => {
    const audio = new Audio(file);
    audio.play();
  };

  useEffect(() => {
    async function checkRoomExists() {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_HTTP_URL}/api/room-exists/${params.slug}`);
      const data = await res.json();

      if (!data.exists) {
        router.push('/');
      } else {
        const websocketUrl = `${process.env.NEXT_PUBLIC_BACKEND_WEBSOCKET_URL}/${params.slug}`;
        const websocket = new WebSocket(websocketUrl);
        setWs(websocket);

        websocket.onmessage = (event) => {
          if (event.data == "openCleanDoor") {
            setIsCleanDoorOpen(true);
          } else if (event.data == "openDirtyDoor") {
            setIsDirtyDoorOpen(true);
          } else if (event.data == "breakBlueBox") {
            setCurrentItem(items[1]);
            setMessageIndex(4);
            setIsBlueBoxBroken(true);
          } else if (event.data == "sendScissorFromClean") {
            setCurrentItem(items[5]);
            setMessageIndex(0);
          } else if (event.data == "sendBlueKeyFromClean") {
            setCurrentItem(items[6]);
            setMessageIndex(0);
          } else if (event.data == "sendRedKeyFromClean") {
            setCurrentItem(items[7]);
            setMessageIndex(0);
          } else if (event.data == "cleanIsReadyToAcceptItem") {
            setCleanIsReadyToAcceptItem(true);
          } else if (event.data == "cleanIsNotReadyToAcceptItem") {
            setCleanIsReadyToAcceptItem(false);
          } else if (event.data == "mysteryGameOver") {
            setIsGameOver(true);
          }
        };

        return () => {
          websocket.close();
        };
      }
    }

    checkRoomExists();
  }, [params.slug]);

  //音
  const playGunSound = () => {
    const sound = new Audio("/se_gun_fire10.wav");
    sound.play();
  };

  useEffect (() => {
  if (isGameOver) {
    playGunSound();
  }
  },[isGameOver]);

  const reStartGame = () => {
    setIsCleanDoorOpen(false);
    setIsDirtyDoorOpen(false);
    setIsBlueBoxBroken(false);
    setAcquiredBlueBox(false);
    setAcquiredBear(false);
    setIsBearCutted(false);
    setAcquiredItems([]);
    setCurrentItem(null);
    setMessageIndex(0);
    setIsItemListVisible(false);
    setSelectedItem(null);
    setPutImageItem(null);
    setBackgroundImage('/dirty_room.png');
    setCleanIsReadyToAcceptItem(false);
    setCurrentTextIndex(4);
    setIsGameOver(false);
  }

  return (
    <div className="relative h-screen w-screen">
      {!isGameOver ?
        <div
          // 背景画像
          className="bg-contain bg-center bg-no-repeat bg-black absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%]"
          style={{ backgroundImage: `url(${backgroundImage})`,
                   width: `1300px`,
                   height: `700px`}}
        >
          {/* 条件に基づいて左の三角形ボタンを表示 */}
          {backgroundImage === '/wall.png' && (
            <>
              <button onClick={handleClickHole}
                      className="text-white absolute top-1/2 left-1/2 translate-x-[calc(-50%+10px)] translate-y-[calc(-50%)] w-36 h-36"
              >
  
              </button>
              {/* currentItemに値がある場合、以降のメッセージと選択を描画する */}
              {currentItem && (
                <>
                  <div className="fixed justify-center items-end bottom-4 left-0 right-0 flex">
                    <div className="mb-20 w-3/5 p-20 relative">
                      <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-600 bg-gray-800 bg-opacity-50">
                      {message && <Message text={message} />}
                      </div>
                    </div>
                  </div>
    
                  <div className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center">
                    <div className="relative w-1/5 p-14">
                      <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-600 bg-gray-800 bg-opacity-50 flex flex-col items-center justify-center">
                        <Choices
                          onConfirm={handleConfirm}
                          onCancel={handleCancel}  
                          options={choicesOptions} 
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
              <TriangleButton direction="left" handleClickTriangle={() => switchBackgroundImage('left')} />
            </>
          )}
  
          {/* 条件に基づいて右の三角形ボタンを表示 */}
          {backgroundImage === '/dirty_room.png' && (
            <>
              {/* アイテム配置 */}
              {items.map(item => (
                <div
                  key={item.id} 
                  onClick={() => handleClick(item)}
                  className={`text-white ${item.positionClasses} cursor-pointer ${item.width} ${item.height} flex justify-center items-center`}
                  style={item.additionalStyles}
                >
                  {item.name}
                </div>
              ))}
              {/* currentItemに値がある場合、以降のメッセージと選択を描画する */}
              {currentItem && (
                <>
                  <div className="fixed justify-center items-end bottom-4 left-0 right-0 flex">
                    <div className="mb-20 w-3/5 p-20 relative">
                      <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-600 bg-gray-800 bg-opacity-50">
                      {message && <Message text={message} />}
                    </div>
                  </div>
                  </div>
    
                  <div className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center">
                    <div className="relative w-1/5 p-14">
                      <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-600 bg-gray-800 bg-opacity-50 flex flex-col items-center justify-center">
                        <Choices
                          onConfirm={handleConfirm}
                          onCancel={handleCancel}  
                          options={choicesOptions} 
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
              <TriangleButton direction="right" handleClickTriangle={() => switchBackgroundImage('right')} />
            </>
          )}
          
          {/* 取得済みアイテム */}
          <div className="absolute top-0 right-8 text-white">
            <div className="bg-gray-800 bg-opacity-60 p-2 rounded-t-lg cursor-pointer hover:bg-opacity-70" onClick={() => setIsItemListVisible(!isItemListVisible)}>
              <span>
                アイテム一覧
              </span>
            </div>
            <div className="bg-gray bg-opacity-60 p-2 rounded-b-lg shadow-xl border-t border-gray-500">
              {acquiredItems.map(item => (
                <div key={item.id} 
                     className={`p-2 rounded-b-lg shadow-xl border-t ${((selectedItem && selectedItem.id === item.id) || (putImageItem && putImageItem.id ===item.id)) ? 'bg-red-600' : 'bg-gray-800 bg-opacity-60'}`} 
                     onClick={() => handleItemSelect(item)}
                >
                  {item.name}
                </div>
              ))}
            </div>
          </div>
          {/* アイテムリストから選んだアイテムが画像を表示するもの（ぬいぐるみ、箱）の場合、画像を表示する */}
          {putImageItem && putImageItem.imagePath && (
            <Image src={putImageItem.imagePath} 
                   alt={putImageItem.name}
                   width={1280} 
                   height={852}
                   className="absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] w-96 h-96 z-10 cursor-pointer"
                   priority
                   onClick={handleClickItemImage}
            />
          )}
          {/* Story Texts */}
          {currentTextIndex < storyTexts.length && (
            <div
              style={{
                position: 'absolute', // Keep this as absolute
                top: '50%', // Align top edge of element to the center of the screen vertically
                left: '50%', // Align left edge of element to the center of the screen horizontally
                transform: 'translate(-50%, -50%)', // Shift element to the left and up by 50% of its own width and height
                backgroundColor: 'rgba(0, 0, 0, 0.56)',
                color: 'white',
                padding: '20px',
                borderRadius: '10px',
                textAlign: 'center',
                width: '1000px', // You might want to ensure this width is responsive
                maxHeight: '80vh',
                overflowY: 'auto',
                zIndex: 1000,
              }}
            >
              <p style={{ margin: '10px', height: '20px' }}>{storyTexts[currentTextIndex]}</p>
              <div
                style={{
                  position: 'absolute',
                  right: '10px',
                  bottom: '10px',
                  cursor: 'pointer',
                  fontSize: '24px',
                  animation: 'bounce 1s infinite'
                }}
                onClick={nextText}
              >
                ▼
              </div>
            </div>
          )}
          {/* Diary Texts */}
          {diaryCurrentTextIndex < diaryTexts.length && (
            <div
              style={{
                position: 'absolute', // Keep this as absolute
                top: '50%', // Align top edge of element to the center of the screen vertically
                left: '50%', // Align left edge of element to the center of the screen horizontally
                transform: 'translate(-50%, -50%)', // Shift element to the left and up by 50% of its own width and height
                backgroundColor: 'rgba(0, 0, 0, 0.56)',
                color: 'white',
                padding: '20px',
                borderRadius: '10px',
                textAlign: 'center',
                width: '1000px', // You might want to ensure this width is responsive
                maxHeight: '80vh',
                overflowY: 'auto',
                zIndex: 1000,
              }}
            >
              <p style={{ margin: '10px', height: '20px' }}>{diaryTexts[diaryCurrentTextIndex]}</p>
              <div
                style={{
                  position: 'absolute',
                  right: '10px',
                  bottom: '10px',
                  cursor: 'pointer',
                  fontSize: '24px',
                  animation: 'bounce 1s infinite'
                }}
                onClick={nextTextDiary}
              >
                ▼
              </div>
            </div>
          )}
        </div>
      :
      <div className="bg-contain bg-center bg-no-repeat bg-black absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%]"
        style={{
          backgroundImage: `url(/mystery_gameover.png)`,
          width: `1300px`,
          height: `700px`
        }}>
          <p className="absolute bottom-20 left-20">Bad End: 仲間割れ</p>
          <button className="absolute bg-red-700 border-2 border-red-700 rounded-3xl shadow w-32 py-2.5 px-5 text-base left-1/2 bottom-20 translate-x-[-50%] hover:bg-red-400 hover:text-gray-200"
                  onClick={reStartGame}
          >
            リスタート
          </button>
      </div>
      }
    </div>
  )  
}  
  
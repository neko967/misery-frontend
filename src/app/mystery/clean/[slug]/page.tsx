'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from "next/image";

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
  const triangleClass = direction === 'right' ? 'triangle-right' : 'triangle-left';
  return (
    <div 
      className={`triangle-button ${triangleClass} triangle-button-position`}
      style={{ left: direction === 'left' ? '10px' : 'auto', right: direction === 'right' ? '10px' : 'auto' }}
      onClick={handleClickTriangle}
    ></div>
  );
};

export default function Home({ params }: { params: { slug: string } }) {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const router = useRouter();
  const [isCleanDoorOpen, setIsCleanDoorOpen] = useState(false);
  const [isDirtyDoorOpen, setIsDirtyDoorOpen] = useState(false);
  const [acquiredItems, setAcquiredItems] = useState<Item[]>([]); // 取得済みのアイテムを管理する状態
  const [currentItem, setCurrentItem] = useState<Item | null>(null); // 現在選択されているアイテムを管理する状態 毎回nullにリセット
  const [messageIndex, setMessageIndex] = useState<number>(0); // 現在のメッセージのインデックスを管理する状態
  const [isItemListVisible, setIsItemListVisible] = useState(false); // アイテムリストの表示・非表示を管理する状態
  const [selectedItem, setSelectedItem] = useState<Item | null>(null); // 選択中のアイテムを管理する状態
  const [backgroundImage, setBackgroundImage] = useState('/clean_room.png');

  // 配列にて、アイテム、メッセージ、選択肢等をオブジェクトの形で管理。
  const items: Item[] = [
    {
      id: 1,
      name: '本',
      positionClasses: "absolute top-1/2 left-1/2 translate-x-[calc(-50%+360px)] translate-y-[calc(-50%+350px)]",
      width: "w-64",
      height: "h-20",
      // コメントアウトで、クリック部分の色を消す
      additionalStyles: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
      messages: [
        {
          text: "本を開きますか？",
          choices: {
            confirmText: "開く",
            cancelText: "開かない"
          }
        },
        {
          text: "本の内容を読みますか？",
          choices: {
            confirmText: "読む",
            cancelText: "読まない"
          }
        },
      ]
    },
    {
      id: 2,
      name: '鍵',
      positionClasses: "absolute top-1/2 left-1/2 translate-x-[calc(-50%+480px)] translate-y-[calc(-50%+120px)]",
      width: "w-80",
      height: "h-16",
      // コメントアウトで、クリック部分の色を消す
      additionalStyles: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
      messages: [
        {
          text: "鍵を取得しますか？",
          choices: {
            confirmText: "取得する",
            cancelText: "取得しない"
          }
        }
      ]
    },
    {
      id: 3,
      name: '青い箱',
      imagePath: '/box_blue.png',
      positionClasses: "absolute top-1/2 left-1/2 translate-x-[calc(-50%+50px)] translate-y-[calc(-50%-120px)]",
      width: "w-20",
      height: "h-12",
      // コメントアウトで、クリック部分の色を消す
      additionalStyles: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
      messages: [
        {
          text: "青い箱を取得しますか？",
          choices: {
            confirmText: "取得する",
            cancelText: "取得しない"
          }
        }
      ]
    },
    {
      id: 4,
      name: 'ナイフ',
      positionClasses: "absolute top-1/2 left-1/2 translate-x-[calc(-50%+40px)] translate-y-[calc(-50%+80px)]",
      width: "w-44",
      height: "h-12",
      // コメントアウトで、クリック部分の色を消す
      additionalStyles: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
      messages: [
        {
          text: "ナイフを取得しますか？",
          choices: {
            confirmText: "取得する",
            cancelText: "取得しない"
          }
        }
      ]
    },
    {
      id: 5,
      name: '壁',
      positionClasses: "absolute top-1/2 left-1/2 translate-x-[calc(-50%-400px)] translate-y-[calc(-50%+80px)]",
      width: "w-28",
      height: "h-12",
      additionalStyles: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
      messages: [
        {
          text: "壁だ",
          choices: null
        },
        {
          text: "壁を破壊しますか？",
          choices: {
            confirmText: "破壊する",
            cancelText: "破壊しない"
          }
        }
      ]
    },
    {
      id: 6,
      name: '宝石',
      positionClasses: "absolute top-1/2 left-1/2 translate-x-[calc(-50%-400px)] translate-y-[calc(-50%-100px)]",
      width: "w-28",
      height: "h-12",
      additionalStyles: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
      messages: [
        {
          text: "宝石を取得しますか？",
          choices: {
            confirmText: "取得する",
            cancelText: "取得しない"
          }
        }
      ]
    }
  ];

  let message: string | undefined;
  let choicesOptions: { confirmText: string; cancelText: string } | null = null;

  // 現在選択されているアイテムがある場合、そのアイテムの特定のメッセージと選択肢を取得
  if (currentItem) {
    message = currentItem.messages[messageIndex]?.text;
    choicesOptions = currentItem.messages[messageIndex]?.choices;
  }

  // アイテムがクリックされた時の処理
  const handleClick = (item: Item) => {
    if (item.id === 5 && selectedItem && selectedItem.name === 'ナイフ') {
      setCurrentItem(item);
      setMessageIndex(1);
    } else if (item.id === 5) {
      setCurrentItem(item);
      setMessageIndex(0); 
    } else if (!acquiredItems.some(acquiredItem => acquiredItem.id === item.id)) {
      setCurrentItem(item);
      setMessageIndex(0); 
    }
  };

  // 選択肢の処理
  const handleConfirm = () => {
    if (currentItem?.id === 5) {
      let gem = items.find(item => item.id === 6);
      if (gem) {
        gem.additionalStyles = {}; // Show the gem
      }
      setCurrentItem(null);
    } else if (currentItem && messageIndex < currentItem.messages.length - 1) {
      setMessageIndex(prevIndex => prevIndex + 1);
    } else {
      if (currentItem) {
        setAcquiredItems([...acquiredItems, currentItem]);
      }
      setCurrentItem(null);
    }
  };

  // 選択肢拒否時の処理
  const handleCancel = () => {
    setCurrentItem(null);
  };

  const handleItemSelect = (item: Item) => {
    if (selectedItem && selectedItem.id === item.id) {
      setSelectedItem(null); // 既に選択されているアイテムを再度クリックした場合、選択を解除
    } else {
      setSelectedItem(item); // それ以外の場合、アイテムを選択
    }
  };

  const switchBackgroundImage = (direction: any) => {
    if (direction === 'left') {
      setBackgroundImage('/wall.png');
    } else {
      setBackgroundImage('/clean_room.png');
    }
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
          }
        };

        return () => {
          websocket.close();
        };
      }
    }

    checkRoomExists();
  }, [params.slug]);

  async function openDirtyDoor() {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send('openDirtyDoor');
    }
  }

  async function goMazeClean() {
    if (isDirtyDoorOpen) {
      router.push(`/maze/clean/${params.slug}`);
    } else {
      alert("相方を置いていくわけにはいかない！");
    }
  }

  return (
    <div className="relative h-screen w-screen">
      <div
        // 背景画像
        className="bg-contain bg-center bg-no-repeat bg-black absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%]"
        style={{ backgroundImage: `url(${backgroundImage})`,
                 width: `1400px`,
                 height: `750px`}}
      >
        {/* 条件に基づいて左の三角形ボタンを表示 */}
        {backgroundImage === '/clean_room.png' && (
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
  
            {/* ドア */}
            <button onClick={goMazeClean}
                    className="text-white absolute top-1/2 left-0 translate-x-[calc(-50%+40px)] translate-y-[calc(-50%+80px)] w-64 h-22"
            >
              ドア
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
        {backgroundImage === '/wall.png' && (
          <>
            <TriangleButton direction="right" handleClickTriangle={() => switchBackgroundImage('right')} />
          </>
        )}
        
        {/* 取得済みアイテム */}
        <div className="absolute top-2/5 right-0 text-white">
          <div className="bg-gray-800 bg-opacity-60 p-2 rounded-t-lg cursor-pointer hover:bg-opacity-70" onClick={() => setIsItemListVisible(!isItemListVisible)}>
            <span>
              アイテム一覧
              <span className="ml-2">
                {isItemListVisible ? '▲' : '▼'}
              </span>
            </span>
          </div>
          {isItemListVisible && (
          <div className="bg-gray bg-opacity-60 p-2 rounded-b-lg shadow-xl border-t border-gray-500">
            {acquiredItems.map(item => (
              <div key={item.id} 
                   className={`p-2 rounded-b-lg shadow-xl border-t ${selectedItem && selectedItem.id === item.id ? 'bg-red-600' : 'bg-gray-800 bg-opacity-60'}`} 
                   onClick={() => handleItemSelect(item)}
              >
                {item.name}
              </div>
            ))}
          </div>
          )}
        </div>
        {/* 選んだアイテムが画像を表示するもの（ぬいぐるみ、箱）の場合、画像を表示する */}
        {selectedItem && selectedItem.imagePath && (
          <Image src={selectedItem.imagePath} 
                 alt={selectedItem.name}
                 width={1280} 
                 height={852}
                 className="absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] w-1/4 h-2/4"
                 priority
          />
        )}
        {!isDirtyDoorOpen &&
          <button onClick={openDirtyDoor}
                  className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-600 p-5 rounded-lg shadow-lg">
            相手のドアの鍵を開ける
          </button>
        }
      </div>
    </div>
  );
}



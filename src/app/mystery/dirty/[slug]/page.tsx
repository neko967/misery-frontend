'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from "next/image";
import { GetWindowSize } from "../../../../hooks/GetWindowSize";

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

  const storyTexts = [
    '部屋に入ると、ドアが勢いよく閉じた。',
    'ドアは不思議な力で固く閉じられ、もはや以前のように容易に開くことはない。',
    'そして、どこからともなく微かな笑い声が響く。それは、恐怖を誘う微笑か、それとも何かを示唆する手がかりか。',
    '探検者たちは急いで部屋の中を見渡し、脱出への糸口を探し始める。明白な道標はなく、ただ直感と推理のみが頼りだった。',
  ];

  const nextText = () => {
    setCurrentTextIndex((prevIndex) => prevIndex + 1);
  };

  // 配列にて、アイテム、メッセージ、選択肢等をオブジェクトの形で管理。
  const items: Item[] = [
    {
      id: 1,
      name: '日記',
      positionClasses: "invisible absolute top-1/2 left-1/2 translate-x-[calc(-50%+360px)] translate-y-[calc(-50%+350px)]",
      width: "w-64",
      height: "h-20",
      // コメントアウトで、クリック部分の色を消す
      additionalStyles: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
      messages: [
        {
          text: "日記を開きますか？",
          choices: {
            confirmText: "開く",
            cancelText: "開かない"
          }
        },
        {
          text: "日記の内容を読みますか？",
          choices: {
            confirmText: "読む",
            cancelText: "読まない"
          }
        },
      ]
    },
    {
      id: 2,
      name: '青い箱',
      imagePath: '/box_blue.png',
      positionClasses: "absolute top-1/2 left-1/2 translate-x-[calc(-50%+90px)] translate-y-[calc(-50%+130px)] opacity-0",
      width: "w-20",
      height: "h-12",
      // コメントアウトで、クリック部分の色を消す
      additionalStyles: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
      messages: [
        {
          text: "ボロボロの鍵がかかっている...衝撃を加えれば壊れそうだ。",
          choices: null
        },
        {
          text: "鍵が壊れている...開けますか？",
          choices: {
            confirmText: "開ける",
            cancelText: "開けない"
          }
        },
        {
          text: "青い箱を手に入れた",
          choices: null
        },
        {
          text: "引き出しの中は空っぽだ。",
          choices: null
        },
        {
          text: "何かが砕け散る音がした。",
          choices: null
        },
        {
          text: "どこかでカギの開く音がした...",
          choices: null
        },
      ]
    },
    {
      id: 3,
      name: 'ドア',
      positionClasses: "absolute top-1/2 left-2/3 translate-x-[calc(-50%+120px)] translate-y-[calc(-50%)] w-36 h-96 opacity-0 text-white",
      width: "w-24",
      height: "h-12",
      // コメントアウトで、クリック部分の色を消す
      additionalStyles: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
      messages: [
        {
          text: "ドアは不思議な力で固く閉ざされている",
          choices: null
        },
        {
          text: "ドアが開いているが、もう一人を置いていくわけにはいかない...",
          choices: null
        },
        {
          text: "ドアが開いている。ここから抜け出せそうだ",
          choices: {
            confirmText: "出る",
            cancelText: "やめておく"
          }
        }
      ]
    },
    {
      id: 4,
      name: 'オルゴール',
      positionClasses: `absolute top-1/2 left-1/2 translate-x-[calc(-50%+90px)] translate-y-[calc(-50%+30px)] opacity-0`,
      width: "w-24",
      height: "h-12",
      // コメントアウトで、クリック部分の色を消す
      additionalStyles: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
      messages: [
        {
          text: "引き出しを開けた。オルゴールがある。鳴らしてみますか？",
          choices: {
            confirmText: "鳴らす",
            cancelText: "やめておく"
          }
        }
      ]
    },
    {
      id: 5,
      name: 'ぬいぐるみ',
      imagePath: '/stuffed_bear.png',
      positionClasses: "absolute top-1/2 left-1/2 translate-x-[calc(-50%-150px)] translate-y-[calc(-50%+200px)] -skew-y-12 opacity-0",
      width: "w-64",
      height: "h-12",
      additionalStyles: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
      messages: [
        {
          text: "ベッドの下に何かある...手を伸ばして取りますか？",
          choices: {
            confirmText: "手を伸ばす",
            cancelText: "やめておく"
          }
        },
        {
          text: "ぬいぐるみを手に入れた",
          choices: null
        },
        {
          text: "ベッドの下にはもう何もない",
          choices: null
        },
        {
          text: "ぬいぐるみをハサミで切った。中からカギが2本出てきた",
          choices: null
        }
      ]
    },
    {
      id: 6,
      name: 'はさみ',
      positionClasses: "invisible",
      // コメントアウトで、クリック部分の色を消す
      additionalStyles: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
      messages: [
        {
          text: "はさみを受け取った",
          choices: null
        }
      ]
    },
    {
      id: 7,
      name: '青いカギ',
      positionClasses: "invisible",
      // コメントアウトで、クリック部分の色を消す
      messages: [
        {
          text: "青いカギを受け取った",
          choices: null,
        },
      ]
    },
    {
      id: 8,
      name: '赤いカギ',
      positionClasses: "invisible",
      // コメントアウトで、クリック部分の色を消す
      messages: [
        {
          text: "赤いカギを受け取った",
          choices: null,
        },
      ]
    },
    {
      id: 9,
      name: '窓',
      positionClasses: `absolute top-1/3 left-1/4 translate-x-[calc(-50%+90px)] translate-y-[calc(-50%+30px)] opacity-0`,
      width: "w-36",
      height: "h-64",
      // コメントアウトで、クリック部分の色を消す
      additionalStyles: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
      messages: [
        {
          text: "窓だ。月明かりに照らされている。",
          choices: null
        }
      ]
    },
    {
      id: 10,
      name: '絵画',
      positionClasses: `absolute top-1/3 left-1/2 translate-x-[calc(-50%+115px)] translate-y-[calc(-50%-35px)] opacity-0`,
      width: "w-36",
      height: "h-36",
      // コメントアウトで、クリック部分の色を消す
      additionalStyles: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
      messages: [
        {
          text: "変な絵だなぁ。",
          choices: null
        }
      ]
    },
    {
      id: 11,
      name: '蜘蛛の巣',
      positionClasses: `absolute top-1/3 left-1/3 translate-x-[calc(-50%+115px)] translate-y-[calc(-50%-35px)] opacity-0`,
      width: "w-36",
      height: "h-48",
      // コメントアウトで、クリック部分の色を消す
      additionalStyles: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
      messages: [
        {
          text: "蜘蛛の巣だ。ばっちぃ",
          choices: null
        }
      ]
    },
    {
      id: 12,
      name: '枕',
      positionClasses: `absolute top-1/2 left-1/2 translate-x-[calc(-50%-80px)] translate-y-[calc(-50%+80px)] opacity-0`,
      width: "w-36",
      height: "h-12",
      // コメントアウトで、クリック部分の色を消す
      additionalStyles: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
      messages: [
        {
          text: "枕だ。硬さはあまり好みじゃない。",
          choices: null
        }
      ]
    },
    {
      id: 13,
      name: '椅子',
      positionClasses: `absolute top-1/2 left-1/2 translate-x-[calc(-50%-80px)] translate-y-[calc(-50%+80px)]`,
      width: "w-36",
      height: "h-12",
      // コメントアウトで、クリック部分の色を消す
      additionalStyles: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
      messages: [
        {
          text: "椅子がある。一旦落ち着いてと。",
          choices: null
        }
      ]
    },
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
    if (item.name === '青い箱' && !isBlueBoxBroken) {
      setCurrentItem(item);
      setMessageIndex(0);
    } else if (item.name === '青い箱' && isBlueBoxBroken && !acquiredBlueBox) {
      setCurrentItem(item);
      setMessageIndex(1);
    } else if (item.name === '青い箱' && isBlueBoxBroken && acquiredBlueBox ) {
      setCurrentItem(item);
      setMessageIndex(3);
    } else if (item.name === 'ドア' && !isDirtyDoorOpen && !isCleanDoorOpen) {
      setCurrentItem(item);
      setMessageIndex(0);
    } else if (item.name === 'ドア' && isDirtyDoorOpen && !isCleanDoorOpen) {
      setCurrentItem(item);
      setMessageIndex(1);
    } else if (item.name === 'ドア' && isDirtyDoorOpen && isCleanDoorOpen) {
      setCurrentItem(item);
      setMessageIndex(2);
    } else if (item.name === 'ぬいぐるみ' && !acquiredBear) {
      setCurrentItem(item);
      setMessageIndex(0);
    } else if (item.name === 'ぬいぐるみ' && acquiredBear) {
      setCurrentItem(item);
      setMessageIndex(2);
    } else if (!acquiredItems.some(acquiredItem => acquiredItem.id === item.id)) {
      setCurrentItem(item);
      setMessageIndex(0); 
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
      } else if (selectedItem && selectedItem.name === '青いカギ' && cleanIsReadyToAcceptItem) {
        ws.send('sendBlueKeyFromDirty');
        let result = acquiredItems.filter(function( item ) {
          return item.name !== '青いカギ';
        });
        setAcquiredItems(result);
        setCleanIsReadyToAcceptItem(false);
      } else if (selectedItem && selectedItem.name === '赤いカギ' && cleanIsReadyToAcceptItem) {
        ws.send('sendRedKeyFromDirty');
        let result = acquiredItems.filter(function( item ) {
          return item.name !== '赤いカギ';
        });
        setAcquiredItems(result);
        setCleanIsReadyToAcceptItem(false);
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
            playGunSound();
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
          }
        };

        return () => {
          websocket.close();
        };
      }
    }

    checkRoomExists();
  }, [params.slug, selectedItem]);

  //音
  const playGunSound = () => {
    const sound = new Audio("/se_gun_fire10.wav");
    sound.play();
  };

  return (
    <div className="relative h-screen w-screen">
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
        <div className="absolute top-0 right-0 text-white">
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
                   className={`p-2 rounded-b-lg shadow-xl border-t ${((selectedItem && selectedItem.id === item.id) || (putImageItem && putImageItem.id ===item.id)) ? 'bg-red-600' : 'bg-gray-800 bg-opacity-60'}`} 
                   onClick={() => handleItemSelect(item)}
              >
                {item.name}
              </div>
            ))}
          </div>
          )}
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
        {/* Buttons */}
        {currentTextIndex >= storyTexts.length && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: 1000,
            }}
          >
          </div>
        )}
      </div>
    </div>
  )
}

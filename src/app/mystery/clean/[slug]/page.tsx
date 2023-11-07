'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from "next/image";

// アイテム型定義
type Item = {
  id: number;
  name: string;
  imagePath?: string;
  positionClasses?: string;
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

const PasswordButton = ({ value, onClick }: any) => (
  <button
    className="btn btn-square"
    onClick={() => onClick(value)}
  >
    {value}
  </button>
);

const PasswordDisplay = ({ password }: any) => (
  <div className="mt-2.5 text-5x1 text-yellow-200">
    {password}
  </div>
);

const ErrorMessage = ({ showError }: any) => (
  showError && <div style={{ color: 'red' }}>パスワードが違います</div>
);

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
    let triangleClass;
    switch (direction) {
      case 'left':
        triangleClass = 'triangle-left';
        break;
      case 'right':
        triangleClass = 'triangle-right';
        break;
      case 'down':
        triangleClass = 'triangle-down';
        break;
      default:
        triangleClass = '';
    }
    return (
      <div 
        className={`triangle-button ${triangleClass} triangle-button-position`}
        style={{
            left: direction === 'left' ? '10px' : 'auto',
            right: direction === 'right' ? '10px' : 'auto',
            bottom: direction === 'down' ? '10px' : 'auto',
            position: 'absolute',
            cursor: 'pointer',
            // 他の位置調整やスタイルの設定が必要な場合はここに追加
          }}
        onClick={handleClickTriangle}
      ></div>
    );
  };

export default function Home({ params }: { params: { slug: string } }) {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const router = useRouter();
  const [isCleanDoorOpen, setIsCleanDoorOpen] = useState(false);
  const [isDirtyDoorOpen, setIsDirtyDoorOpen] = useState(false);
  const [isRedBoxBroken, setIsRedBoxBroken] = useState(false);
  const [isBlueBoxBroken, setIsBlueBoxBroken] = useState(false);
  const [isPasswordBoxOpen, setIsPasswordBoxOpen] = useState(false);
  const [acquiredItems, setAcquiredItems] = useState<Item[]>([]); // 取得済みのアイテムを管理する状態
  const [acquiredRedBox, setAcquiredRedBox] = useState(false);
  const [acquiredScissors, setAcquiredScissors] = useState(false);
  const [currentItem, setCurrentItem] = useState<Item | null>(null); // 現在選択されているアイテムを管理する状態 毎回nullにリセット
  const [messageIndex, setMessageIndex] = useState<number>(0); // 現在のメッセージのインデックスを管理する状態
  const [isItemListVisible, setIsItemListVisible] = useState(false); // アイテムリストの表示・非表示を管理する状態
  const [selectedItem, setSelectedItem] = useState<Item | null>(null); // 選択中のアイテムを管理する状態
  const [putImageItem, setPutImageItem] = useState<Item | null>(null); // アイテムリストから画像付きのアイテムを置くときに使う
  const [backgroundImage, setBackgroundImage] = useState('/clean_room.png');
  const [showPasswordButtons, setShowPasswordButtons] = useState<boolean>(false); //ここからパスワード付きの箱
  const [password, setPassword] = useState<string>('');
  const [passwordAttempted, setPasswordAttempted] = useState<boolean>(false);
  const correctSequence: string = '7305*7'; // 正しいパスワード
  const [showError, setShowError] = useState<boolean>(false); //ここまでパスワード付きの箱

  // 配列にて、アイテム、メッセージ、選択肢等をオブジェクトの形で管理。
  const items: Item[] = [
    {
      id: 1,
      name: '日記',
      positionClasses: "absolute top-1/2 left-1/2 translate-x-[calc(-50%+360px)] translate-y-[calc(-50%+350px)]",
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
      name: '赤い箱',
      imagePath: '/box_red.png',
      positionClasses: "absolute top-2/3 left-1/4 translate-x-[calc(-50%+110px)] translate-y-[calc(-50%+10px)]",
      width: "w-12",
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
          text: "赤い箱を手に入れた",
          choices: null
        },
        {
          text: "引き出しの中は空っぽだ。",
          choices: null
        },
        {
          text: "ボロボロの鍵は砕け散った。",
          choices: null
        },
        {
          text: "鍵はすでに壊れている。",
          choices: null
        }
      ]
    },
    {
      id: 3,
      name: 'ドア',
      positionClasses: "absolute top-1/2 left-1/3 translate-x-[calc(-50%-130px)] translate-y-[calc(-50%+60px)] w-30 h-96 opacity-0 text-white",
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
      name: 'パスワード付きの箱',
      imagePath: '/passwordbox.png',
      positionClasses: "absolute top-1/2 left-1/2 translate-x-[calc(-50%-35px)] translate-y-[calc(-50%+195px)] opacity-0",
      width: "w-32",
      height: "h-16",
      // コメントアウトで、クリック部分の色を消す
      additionalStyles: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
      messages: [
        {
          text: "大きな箱だ。パスワードがかけられている。",
          choices: {
            confirmText: "見てみる",
            cancelText: "やめておく"
          }
        },
        {
          text: "大きな箱だ。すでに開いている。",
          choices: null
        }
      ]
    },
    {
      id: 5,
      name: '銃',
      positionClasses: "invisible",
      messages: [
        {
          text: "箱が開いた。銃を手に入れた",
          choices: null
        },
        {
          text: "壁の穴に銃口を当てた。向こうの部屋の様子はよくわからない。",
          choices: null
        }
      ]
    },
    {
      id: 6,
      name: 'はさみ',
      positionClasses: "absolute top-1/2 left-2/3 translate-x-[calc(-50%-25px)] translate-y-[calc(-50%+160px)] opacity-0",
      width: "w-36",
      height: "h-16",
      // コメントアウトで、クリック部分の色を消す
      additionalStyles: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
      messages: [
        {
          text: "ベッドの上にはさみがある。拾いますか？",
          choices: {
            confirmText: "拾う",
            cancelText: "拾わない"
          }
        },
        {
          text: "はさみを手に入れた",
          choices: null
        },
        {
          text: "ベッドの上には何もない",
          choices: null
        }
      ]
    },
  ];
  
  // 配列にて、アイテム、メッセージ、選択肢等をオブジェクトの形で管理。
  const dirtyRoomItems: Item[] = [
    {
      id: 1,
      name: '青い箱',
      positionClasses: "absolute top-1/2 left-1/2 translate-x-[calc(-50%+90px)] translate-y-[calc(-50%+130px)]",
      width: "w-20",
      height: "h-12",
      // コメントアウトで、クリック部分の色を消す
      additionalStyles: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
      messages: [
        {
          text: "何かが砕け散る音がした。",
          choices: null
        }
      ]
    },
    {
      id: 2,
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
    setCurrentItem(item);
    if (item.name === '赤い箱' && !isRedBoxBroken && !selectedItem) {
      setMessageIndex(0);
    } else if (item.name === '赤い箱' && isRedBoxBroken && !selectedItem && !acquiredRedBox) {
      setMessageIndex(1);
    } else if (item.name === '赤い箱' && isRedBoxBroken && !selectedItem && acquiredRedBox) {
      setMessageIndex(3);
    } else if (item.name === '赤い箱' && !isRedBoxBroken && selectedItem && selectedItem.name === "銃") {
      setIsRedBoxBroken(true);
      setMessageIndex(4);
    } else if (item.name === '赤い箱' && isRedBoxBroken && selectedItem && selectedItem.name === "銃") {
      setMessageIndex(5);
    } else if (item.name === 'パスワード付きの箱' && !isPasswordBoxOpen) {
      setMessageIndex(0);
    } else if (item.name === 'パスワード付きの箱' && isPasswordBoxOpen) {
      setMessageIndex(1);
    } else if (item.name === 'ドア' && !isCleanDoorOpen && !isDirtyDoorOpen) {
      setMessageIndex(0);
    } else if (item.name === 'ドア' && isCleanDoorOpen && !isDirtyDoorOpen) {
      setMessageIndex(1);
    } else if (item.name === 'ドア' && isCleanDoorOpen && isDirtyDoorOpen) {
      setMessageIndex(2);
    } else if (item.name === 'はさみ' && !acquiredScissors) {
      setMessageIndex(0);
    } else if (item.name === 'はさみ' && acquiredScissors) {
      setMessageIndex(2);
    } else if (!acquiredItems.some(acquiredItem => acquiredItem.id === item.id)) {
      setMessageIndex(0);
    }
  };

  // 銃でアイテムを撃った時の処理
  const handleShootItem = (dirtyRoomItem: Item) => {
    setCurrentItem(dirtyRoomItem);
    if (dirtyRoomItem.name === '青い箱' && !isBlueBoxBroken) {
      setMessageIndex(0);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send('breakBlueBox');
      }
    } else if (dirtyRoomItem.name === '青い箱' && isBlueBoxBroken) {
      setMessageIndex(1);
    } else if (!acquiredItems.some(acquiredItem => acquiredItem.id === dirtyRoomItem.id)) {
      setMessageIndex(0);
    }
  };

  // 選択肢の処理
  const handleConfirm = () => {
    if (currentItem && currentItem.name === 'パスワード付きの箱') {
      setShowPasswordButtons(true)
      setCurrentItem(null);
    } else if (currentItem && currentItem.name === 'はさみ') {
      setAcquiredItems([...acquiredItems, currentItem])
      setMessageIndex(prevIndex => prevIndex + 1);
      setAcquiredScissors(true);
    } else if (currentItem && currentItem.name === 'ドア') {
      router.push(`/maze/dirty/${params.slug}`);
    } else if (currentItem && currentItem.name === '赤い箱' && isRedBoxBroken) {
      if (currentItem) {
        setAcquiredItems([...acquiredItems, currentItem]);
      }
      setAcquiredRedBox(true);
      setMessageIndex(2);
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
    if (direction === 'left' || direction === 'down') {
      setBackgroundImage('/wall.png');
    } else {
      setBackgroundImage('/clean_room.png');
    }
  };

  const handleClickHole = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      if (selectedItem && selectedItem.name === '銃' && backgroundImage != '/dark.png') {
        setBackgroundImage('/dark.png');
        setCurrentItem(items[4]);
        setMessageIndex(1);
      } else if (selectedItem && selectedItem.name === 'はさみ') {
        ws.send('sendScissorFromCleanToDirty');
      }
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
          } else if (event.data == "breakBlueBox") {
            setIsBlueBoxBroken(true)
          } else if (event.data == "sendScissorFromDirtyToClean") {
            if (items[5]) {
              setAcquiredItems([...acquiredItems, items[5]]);
            }
          } else if (event.data == "sendScissorFromCleanToDirty") {
            if (selectedItem && selectedItem.name === 'はさみ') {
              let result = acquiredItems.filter(function( item ) {
                return item.name !== 'はさみ';
              });
              setAcquiredItems(result);
            }
          }
        };

        return () => {
          websocket.close();
        };
      }
    }

    checkRoomExists();
  }, [params.slug, selectedItem]);

  async function openDirtyDoor() {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send('openDirtyDoor');
    }
  }

  ///ここからパスワード付きの箱の挙動
  useEffect(() => {
    if (showError) {
      const timer = setTimeout(() => {
        setShowError(false);
        setPassword(''); // パスワードをリセット
        setPasswordAttempted(false); // 試行状態をリセット
        setShowPasswordButtons(true); // ボタンを再表示
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showError]);

  const playPasswordMusic = (file: string): void => {
    const audio = new Audio(file);
    audio.play();
  };

  const handleButtonClick = (key: string): void => {
    if (password.length < 6) {
      playPasswordMusic(`/sound${key}.m4a`);
      setPassword((prev: string) => prev + key); // パスワードに文字を追加
    }
  };

  const checkPassword = (): void => {
    setPasswordAttempted(true); // パスワードの試行状態を true に設定
    if (password === correctSequence) {
      // パスワードが正しい場合
      setShowPasswordButtons(false);
      setShowError(false); // エラーメッセージが表示されていれば消去
      setAcquiredItems([...acquiredItems, items[4]]);
      setCurrentItem(items[4]);
      setMessageIndex(0);
      setIsPasswordBoxOpen(true);
    } else {
      setShowError(true); // エラーを表示
    }
  };

  // パスワードの送信をハンドルする
  const handleSubmit = (): void => {
    checkPassword();
  };

  // 箱が開いたかどうかの状態は、passwordAttempted とパスワードが正しいかで判断する
  const isUnlocked: boolean = passwordAttempted && password === correctSequence;
  const passwordKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '＃'];

  //音
  const playGunSound = () => {
  if (!currentItem) {
    const sound = new Audio("/se_gun_fire10.wav");
    sound.play();
  }};

  return (
    <div className="relative h-screen w-screen">
      <div
        // 背景画像
        className={`bg-contain bg-center bg-no-repeat bg-black absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%]
                    ${selectedItem && selectedItem.name === "銃" ? 'cursor-crosshair' : undefined}`}
        style={{ backgroundImage: `url(${backgroundImage})`,
                 width: `1400px`,
                 height: `750px`}}
        onClick={() => `${selectedItem && selectedItem.name === "銃" ? playGunSound() : undefined}`}
      >
        {/* 条件に基づいて左の三角形ボタンを表示 */}
        {backgroundImage === '/clean_room.png' && (
          <>
            {/* アイテム配置 */}
            {items.map(item => (
              <div
                key={item.id} 
                onClick={() => handleClick(item)}
                className={`text-white ${item.positionClasses} ${selectedItem && selectedItem.name === "銃" ? 'cursor-crosshair' : 'cursor-pointer'} ${item.width} ${item.height} flex justify-center items-center`}
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
            {showPasswordButtons && (
              <>
                <div className="relative flex flex-col items-center justify-center min-h-screen">
                  <div className="z-50 text-center text-white text-3x1">
                    <div className="bg-black bg-opacity-50 mt-5 grid grid-cols-3 gap-8 text-white">
                      {passwordKeys.map((key) => (
                        <PasswordButton key={key} value={key} onClick={handleButtonClick} />
                      ))}
                    </div>
                    <div style={{ marginTop: '30px' , marginBottom: '40px'}}>
                      <PasswordDisplay password={password} />
                      {/* passwordAttempted が false の場合のみ「確認」ボタンを表示 */}
                      {!passwordAttempted && (
                      <button
                        className="btn btn-neutral border-none cursor-pointer text-center text-x1"
                        onClick={handleSubmit}>
                        確認
                      </button>
                      )}
                      <ErrorMessage showError={showError} />
                    </div>
                  </div>
                </div>
              </>
            )}
            <TriangleButton direction="left" handleClickTriangle={() => switchBackgroundImage('left')} />
          </>
        )}
  
        {/* 壁の穴を表示しているとき */}
        {backgroundImage === '/wall.png' && (
          <>
            <button onClick={handleClickHole}
                    className="text-white absolute top-1/2 left-1/2 translate-x-[calc(-50%+10px)] translate-y-[calc(-50%)] w-36 h-36"
            >
              壁の穴
            </button>
            <TriangleButton direction="right" handleClickTriangle={() => switchBackgroundImage('right')} />
          </>
        )}
        {/* 暗闇を表示しているとき */}
        {backgroundImage === '/dark.png' && (
        <>
          <div className="h-screen w-screen cursor-crosshair"
               onClick={playGunSound}
          >
            {/* アイテム配置 */}
            {dirtyRoomItems.map(dirtyRoomItem => (
              <div
                key={dirtyRoomItem.id} 
                onClick={() => handleShootItem(dirtyRoomItem)}
                className={`text-white ${dirtyRoomItem.positionClasses} ${dirtyRoomItem.width} ${dirtyRoomItem.height} flex justify-center items-center`}
                style={dirtyRoomItem.additionalStyles}
              >
                {dirtyRoomItem.name}
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
          </div>
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
            <TriangleButton direction="down" handleClickTriangle={() => switchBackgroundImage('down')} />
          </div>
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



'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from "next/image";
import { GetCleanItem } from "./cleanRoomItems";
import { GetDirtyItem } from "./dirtyRoomItems";

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
  const items: Item[] = GetCleanItem();
  const dirtyRoomItems: Item[] = GetDirtyItem();
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
  const correctSequence: string = '3542'; // 正しいパスワード
  const [showError, setShowError] = useState<boolean>(false); //ここまでパスワード付きの箱
  const [cleanIsReadyToAcceptItem, setCleanIsReadyToAcceptItem] = useState(false);
  const [dirtyIsReadyToAcceptItem, setDirtyIsReadyToAcceptItem] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [diaryCurrentTextIndex, setDiaryCurrentTextIndex] = useState(12);
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
    '3月28日',
    '今日、私たちの幸せな家庭が崩れ始めた。宴会で出会った人が、私に信じられない話をした。',
    '夫が浮気をしているというのだ。最初は信じられなかったが、疑念は心の中で大きくなり、家族の平和を脅かし始めた。',
    
    '4月11日',
    '夫との関係は悪化の一途を辿り、ついに私たちは離婚訴訟に至った。',
    '私は裁判で勝つためには、質素な生活を送らなければならないとアドバイスされた。これが私と子供たちにとって最善の策だと信じている。',

    '4月30日',
    '娘の体重が増えると、療育費が減ると聞いた。だから、彼女には厳しい食事制限を課している。',
    '部屋に閉じ込めて、食事を減らしているのは彼女のためだと信じている。',
    
    '5月20日',
    '娘は弱っている。彼女の部屋からは、もはや元気な声は聞こえない。',
    '私はただ、このすべてが終わり、私たちが再び平和な生活を取り戻せることを願っている。私の決断は正しいのだろうか。',
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
      if (selectedItem && selectedItem.name === "銃") {
        if (item.name === '赤い箱' && !isRedBoxBroken) {
          setIsRedBoxBroken(true);
          setMessageIndex(4);
        } else if (item.name === '赤い箱' && isRedBoxBroken) {
          setMessageIndex(5);
        } else if (item.name === '日記') {
          setMessageIndex(1);
        } else if (item.name === 'ドア') {
          setMessageIndex(3);
        } else if (item.name === 'パスワード付きの箱') {
          setMessageIndex(2);
        } else if (item.name === 'はさみ') {
          setMessageIndex(5);
        } else if (item.name === '窓' || item.name === '絵画' || item.name === '本' || item.name === '左カーテン' || item.name === '右カーテン') {
          setMessageIndex(1);
        }
      } else if ((selectedItem && selectedItem.name === "青いカギ") || (selectedItem && selectedItem.name === "赤いカギ")){
        if (item.name === '赤い箱' && !isRedBoxBroken) {
          setMessageIndex(0);
        } else if (item.name === '赤い箱' && isRedBoxBroken && !acquiredRedBox) {
          setMessageIndex(1);
        } else if (item.name === '赤い箱' && isRedBoxBroken && acquiredRedBox) {
          setMessageIndex(3);
        } else if (item.name === 'パスワード付きの箱' && !isPasswordBoxOpen) {
          setMessageIndex(0);
        } else if (item.name === 'パスワード付きの箱' && isPasswordBoxOpen) {
          setMessageIndex(1);
        } else if (item.name === 'ドア') {
          setMessageIndex(4);
        } else if (item.name === 'はさみ') {
          setMessageIndex(2);
        } else if (!acquiredItems.some(acquiredItem => acquiredItem.id === item.id)) {
          setMessageIndex(0);
        }
      } else {
        if (item.name === '赤い箱' && !isRedBoxBroken) {
          setMessageIndex(0);
        } else if (item.name === '赤い箱' && isRedBoxBroken && !acquiredRedBox) {
          setMessageIndex(1);
        } else if (item.name === '赤い箱' && isRedBoxBroken && acquiredRedBox) {
          setMessageIndex(3);
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
      }
    }
  };

  // 銃でアイテムを撃った時の処理
  const handleShootItem = (dirtyRoomItem: Item) => {
    setCurrentItem(dirtyRoomItem);
    setMessageIndex(0);
    if (dirtyRoomItem.name === '青い箱' && !isBlueBoxBroken) {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send('breakBlueBox');
      }
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
      router.push(`/maze/clean/${params.slug}`);
    } else if (currentItem && currentItem.name === '赤い箱' && isRedBoxBroken) {
      if (currentItem) {
        setAcquiredItems([...acquiredItems, currentItem]);
      }
      setAcquiredRedBox(true);
      setMessageIndex(2);
    } else if (currentItem && currentItem.name === '日記') {
      setDiaryCurrentTextIndex(0);
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
    if (currentItem && currentItem.name === "はさみ" && messageIndex === 3) {
      setAcquiredItems([...acquiredItems, items[5]]);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send('cleanIsReadyToAcceptItem');
      }
    } else if (currentItem && currentItem.name === "青いカギ" && messageIndex === 0) {
      setAcquiredItems([...acquiredItems, items[6]]);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send('cleanIsReadyToAcceptItem');
      }
    } else if (currentItem && currentItem.name === "赤いカギ" && messageIndex === 0) {
      setAcquiredItems([...acquiredItems, items[7]]);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send('cleanIsReadyToAcceptItem');
      }
    }
    setShowPasswordButtons(false)
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
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send('cleanIsReadyToAcceptItem');
      }
    } else {
      setBackgroundImage('/clean_room.png');
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send('cleanIsNotReadyToAcceptItem');
      }
    }
  };

  //銃口を相手の部屋に向けている時、相手が穴の前にいるかどうかで背景が変わる。
  useEffect(() => {
    if (dirtyIsReadyToAcceptItem && backgroundImage === '/dark.png') {
      setBackgroundImage('/black_background.png');
    } else if (!dirtyIsReadyToAcceptItem && backgroundImage === '/black_background.png') {
      setBackgroundImage('/dark.png');
    }
  }, [dirtyIsReadyToAcceptItem, backgroundImage]);

  //アイテムの受け渡しや、銃口を穴に向ける
  const handleClickHole = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      if (selectedItem && selectedItem.name === '銃' && !dirtyIsReadyToAcceptItem) {
        setBackgroundImage('/dark.png');
        setCurrentItem(items[4]);
        setMessageIndex(1);
      } else if (selectedItem && selectedItem.name === '銃' && dirtyIsReadyToAcceptItem) {
        setBackgroundImage('/black_background.png');
        setCurrentItem(items[4]);
        setMessageIndex(2);
      } else if (selectedItem && selectedItem.name === 'はさみ' && dirtyIsReadyToAcceptItem) {
        ws.send('sendScissorFromClean');
        let result = acquiredItems.filter(function (item) {
          return item.name !== 'はさみ';
        });
        setAcquiredItems(result);
        setDirtyIsReadyToAcceptItem(false);
        setCurrentItem(items[5]);
        setMessageIndex(4);
        setSelectedItem(null);
      } else if (selectedItem && selectedItem.name === '青いカギ' && dirtyIsReadyToAcceptItem) {
        ws.send('sendBlueKeyFromClean');
        let result = acquiredItems.filter(function (item) {
          return item.name !== '青いカギ';
        });
        setAcquiredItems(result);
        setDirtyIsReadyToAcceptItem(false);
        setCurrentItem(items[6]);
        setMessageIndex(1);
        setSelectedItem(null);
      } else if (selectedItem && selectedItem.name === '赤いカギ' && dirtyIsReadyToAcceptItem) {
        ws.send('sendRedKeyFromClean');
        let result = acquiredItems.filter(function (item) {
          return item.name !== '赤いカギ';
        });
        setAcquiredItems(result);
        setDirtyIsReadyToAcceptItem(false);
        setCurrentItem(items[7]);
        setMessageIndex(1);
        setSelectedItem(null);
      }
    }
  };

  const handleClickItemImage = () => {
    if (putImageItem && putImageItem.name === "赤い箱" && selectedItem && selectedItem.name === "赤いカギ" && !isDirtyDoorOpen) {
      setCurrentItem(items[1]);
      setMessageIndex(6);
      setPutImageItem(null);
      setSelectedItem(null);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send('openDirtyDoor');
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
          } else if (event.data == "sendScissorFromDirty") {
            setCurrentItem(items[5]);
            setMessageIndex(3);
          } else if (event.data == "sendBlueKeyFromDirty") {
            setCurrentItem(items[6]);
            setMessageIndex(0);
          } else if (event.data == "sendRedKeyFromDirty") {
            setCurrentItem(items[7]);
            setMessageIndex(0);
          } else if (event.data == "dirtyIsReadyToAcceptItem") {
            setDirtyIsReadyToAcceptItem(true);
          } else if (event.data == "dirtyIsNotReadyToAcceptItem") {
            setDirtyIsReadyToAcceptItem(false);
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
    playPasswordMusic(`/sound${key}.m4a`);
    setPassword((prev: string) => {
      // パスワードが4文字を超える場合は、最初の文字を削除して新しいキーを追加する
      const updatedPassword = prev.length >= 4 ? prev.substring(1) + key : prev + key;
      return updatedPassword;
    });
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
  const passwordKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  //音
  const playGunSound = () => {
    const sound = new Audio("/se_gun_fire10.wav");
    sound.play();
  };

  useEffect(() => {
    if (selectedItem && selectedItem.name === "銃" 
                     && diaryCurrentTextIndex >= diaryTexts.length
                     && currentItem
                     && currentItem.name !== "銃") {
      playGunSound();
    }
  }, [selectedItem, diaryCurrentTextIndex, diaryTexts, currentItem]);

  const handleGameOver = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send('mysteryGameOver');
    }
  };

  const reStartGame = () => {
    setIsCleanDoorOpen(false);
    setIsDirtyDoorOpen(false);
    setIsRedBoxBroken(false);
    setIsBlueBoxBroken(false);
    setIsPasswordBoxOpen(false);
    setAcquiredItems([]);
    setAcquiredRedBox(false);
    setAcquiredScissors(false);
    setCurrentItem(null);
    setMessageIndex(0);
    setIsItemListVisible(false);
    setSelectedItem(null);
    setPutImageItem(null);
    setBackgroundImage('/clean_room.png');
    setShowPasswordButtons(false);
    setPassword('');
    setPasswordAttempted(false);
    setShowError(false);
    setDirtyIsReadyToAcceptItem(false);
    setCurrentTextIndex(4);
    setIsGameOver(false);
  }

  useEffect(() => {
    router.prefetch(`/maze/clean/${params.slug}`);
    console.log(`/maze/clean/${params.slug}をprefetchしました。`)
  }, [])

  return (
    <div className="relative h-screen w-screen bg-black">
      {!isGameOver ?
        <div
          // 背景画像
          className={`bg-contain bg-center bg-no-repeat bg-black absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%]
                      ${selectedItem && selectedItem.name === "銃" ? 'cursor-crosshair' : undefined}`}
          style={{
            backgroundImage: `url(${backgroundImage})`,
            width: `1300px`,
            height: `700px`
          }}
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
                      <div style={{ marginTop: '30px', marginBottom: '40px' }}>
                        <PasswordDisplay password={password} />
                        {/* passwordAttempted が false の場合のみ「確認」ボタンを表示 */}
                        {!passwordAttempted && (
                          <button
                            className="btn btn-neutral border-none cursor-pointer text-center text-x1"
                            onClick={handleSubmit}>
                            確認
                          </button>
                        )}
                        <button
                          className="btn btn-warning border-none cursor-pointer text-center text-xl ml-4"
                          onClick={handleCancel}>
                          やめる
                        </button>
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
              <TriangleButton direction="right" handleClickTriangle={() => switchBackgroundImage('right')} />
            </>
          )}
          {/* 暗闇を表示しているとき */}
          {backgroundImage === '/dark.png' && (
            <>
              <div className="h-screen w-screen cursor-crosshair"
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
              {!currentItem &&
                <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
                  <TriangleButton direction="down" handleClickTriangle={() => switchBackgroundImage('down')} />
                </div>
              } 
            </>
          )}
          {backgroundImage === '/black_background.png' && (
            <>
              <button className={`bg-black h-full w-full ${selectedItem && selectedItem.name === "銃" ? 'cursor-crosshair' : 'cursor-pointer'}`}
                      onClick={handleGameOver}
              >
              </button>
              <>
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
              </>
              {!currentItem &&
                <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
                  <TriangleButton direction="down" handleClickTriangle={() => switchBackgroundImage('down')} />
                </div>
              }
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
                    className={`p-2 rounded-b-lg shadow-xl border-t ${((selectedItem && selectedItem.id === item.id) || (putImageItem && putImageItem.id === item.id)) ? 'bg-red-600' : 'bg-gray-800 bg-opacity-60'}`}
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
          <div className="absolute bottom-20 left-20 text-xl">
            <p className="end-title text-white">Bad End: 仲間割れ</p>
          </div>
          <button className="absolute bg-red-700 border-2 border-red-700 rounded-3xl shadow w-32 py-2.5 px-5 text-base left-1/2 bottom-20 translate-x-[-50%] text-white hover:bg-red-400 hover:text-gray-200"
                  onClick={reStartGame}
          >
            リスタート
          </button>
      </div>
      }
    </div>
  )  
}  
  
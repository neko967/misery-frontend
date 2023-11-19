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

  // 配列にて、アイテム、メッセージ、選択肢等をオブジェクトの形で管理。
  const items: Item[] = [
    {
      id: 1,
      name: '日記',
      positionClasses: "absolute top-3/4 left-3/4 translate-x-[calc(-50%-40px)] translate-y-[calc(-50%+100px)] opacity-0",
      width: "w-32",
      height: "h-16",
      // コメントアウトで、クリック部分の色を消す
      additionalStyles: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
      messages: [
        {
          text: "誰かの日記が落ちている。読みますか？",
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
      positionClasses: "absolute top-2/3 left-1/4 translate-x-[calc(-50%+110px)] translate-y-[calc(-50%+30px)] opacity-0",
      width: "w-12",
      height: "h-20",
      // コメントアウトで、クリック部分の色を消す
      additionalStyles: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
      messages: [
        {
          text: "棚にボロボロの鍵がかかっている...衝撃を加えれば壊れそうだ。",
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
      positionClasses: "absolute top-1/2 left-1/3 translate-x-[calc(-50%-130px)] translate-y-[calc(-50%+60px)] w-30 h-96 opacity-0 text-white",
      width: "w-24",
      height: "h-12",
      // コメントアウトで、クリック部分の色を消す
      additionalStyles: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
      messages: [
        {
          text: "ドアは不思議な力で固く閉ざされている。",
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
          text: "壁の穴に銃口を当てた。向こうの部屋の様子がうっすらと見える。",
          choices: null
        },
        {
          text: "壁の穴に銃口を当てた。何かが邪魔で向こうの部屋がよく見えない。",
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
        },
        {
          text: "はさみを受け取った",
          choices: null
        },
        {
          text: "はさみを渡した",
          choices: null
        },
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
        {
          text: "青いカギを渡した",
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
        {
          text: "赤いカギを渡した",
          choices: null,
        },
      ]
    },
    {
      id: 9,
      name: '窓',
      positionClasses: "absolute top-1/2 left-1/2 translate-x-[calc(-50%-40px)] translate-y-[calc(-50%-40px)] opacity-0 text-white",
      width: "w-36",
      height: "h-72",
      // コメントアウトで、クリック部分の色を消す
      additionalStyles: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
      messages: [
        {
          text: "窓だ。月明かりに見惚れてしまう",
          choices: null
        },
      ]
    },
    {
      id: 10,
      name: '絵画',
      positionClasses: "absolute top-1/2 left-3/4 translate-x-[calc(-50%-20px)] translate-y-[calc(-50%-80px)] -skew-y-12 opacity-0",
      width: "w-36",
      height: "h-36",
      // コメントアウトで、クリック部分の色を消す
      additionalStyles: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
      messages: [
        {
          text: "大きな絵が飾られている。立派だ。",
          choices: null
        },
      ]
    },
    {
      id: 11,
      name: '本',
      positionClasses: "absolute top-3/4 left-1/3 translate-x-[calc(-50%+50px)] translate-y-[calc(-50%+80px)] opacity-0",
      width: "w-16",
      height: "h-12",
      // コメントアウトで、クリック部分の色を消す
      additionalStyles: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
      messages: [
        {
          text: "本に何か書かれている。【3XXX】",
          choices: null
        },
      ]
    },
    {
      id: 12,
      name: '左カーテン',
      positionClasses: "absolute top-1/2 left-1/2 translate-x-[calc(-50%-160px)] translate-y-[calc(-50%-100px)] opacity-0",
      width: "w-24",
      height: "h-64",
      // コメントアウトで、クリック部分の色を消す
      additionalStyles: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
      messages: [
        {
          text: "重厚なカーテンだ。とても重そう。",
          choices: null
        },
      ]
    },
    {
      id: 13,
      name: '右カーテン',
      positionClasses: "absolute top-1/2 left-1/2 translate-x-[calc(-50%+70px)] translate-y-[calc(-50%-100px)] opacity-0",
      width: "w-24",
      height: "h-64",
      // コメントアウトで、クリック部分の色を消す
      additionalStyles: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
      messages: [
        {
          text: "重厚なカーテンだ。とても重そう。",
          choices: null
        },
      ]
    },
  ];
  
  // 配列にて、アイテム、メッセージ、選択肢等をオブジェクトの形で管理。
  const dirtyRoomItems: Item[] = [
    {
      id: 1,
      name: '青い箱',
      positionClasses: "absolute top-1/2 left-1/2 translate-x-[calc(-50%+90px)] translate-y-[calc(-50%+130px)] opacity-0",
      width: "w-36",
      height: "h-16",
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
          text: "木製の何かに当たる音がした。",
          choices: null
        }
      ]
    },
    {
      id: 3,
      name: 'ベッド',
      positionClasses: "absolute top-1/2 left-1/2 translate-x-[calc(-50%-150px)] translate-y-[calc(-50%+100px)] -skew-y-12 opacity-0",
      width: "w-64",
      height: "h-24",
      additionalStyles: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
      messages: [
        {
          text: "柔らかい何かに当たる音がした。",
          choices: null
        },
      ]
    },
    {
      id: 4,
      name: '枕',
      positionClasses: `absolute top-1/2 left-1/2 translate-x-[calc(-50%-80px)] translate-y-[calc(-50%+80px)] opacity-0`,
      width: "w-36",
      height: "h-12",
      // コメントアウトで、クリック部分の色を消す
      additionalStyles: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
      messages: [
        {
          text: "ボスっという音がした",
          choices: null
        }
      ]
    },
    {
      id: 5,
      name: '窓',
      positionClasses: `absolute top-1/3 left-1/4 translate-x-[calc(-50%+90px)] translate-y-[calc(-50%+30px)] opacity-0`,
      width: "w-36",
      height: "h-64",
      // コメントアウトで、クリック部分の色を消す
      additionalStyles: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
      messages: [
        {
          text: "ガラスの割れる音がした",
          choices: null
        }
      ]
    },
    {
      id: 6,
      name: '椅子',
      positionClasses: `absolute top-2/3 left-1/4 translate-x-[calc(-50%-90px)] translate-y-[calc(-50%+60px)] opacity-0`,
      width: "w-48",
      height: "h-24",
      // コメントアウトで、クリック部分の色を消す
      additionalStyles: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
      messages: [
        {
          text: "木製の何かに当たった。落ち着かない。",
          choices: null
        }
      ]
    },
    {
      id: 7,
      name: '時計',
      positionClasses: `absolute top-1/4 left-1/4 translate-x-[calc(-50%-100px)] translate-y-[calc(-50%+40px)] opacity-0`,
      width: "w-28",
      height: "h-36",
      // コメントアウトで、クリック部分の色を消す
      additionalStyles: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
      messages: [
        {
          text: "何かに当たった。時が止まった気がした。",
          choices: null
        }
      ]
    },
    {
      id: 8,
      name: '絵画',
      positionClasses: `absolute top-1/3 left-1/2 translate-x-[calc(-50%+115px)] translate-y-[calc(-50%-35px)] opacity-0`,
      width: "w-36",
      height: "h-36",
      // コメントアウトで、クリック部分の色を消す
      additionalStyles: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
      messages: [
        {
          text: "何か変なものに当たった気がする。",
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
  }, [dirtyIsReadyToAcceptItem]);

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
    if (!currentItem) {
      const sound = new Audio("/se_gun_fire10.wav");
      sound.play();
    }
  };

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

  return (
    <div className="relative h-screen w-screen">
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
          onClick={() => `${selectedItem && selectedItem.name === "銃" && backgroundImage !== '/wall.png' ? playGunSound() : undefined}`}
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
                    className={`p-2 rounded-b-lg shadow-xl border-t ${((selectedItem && selectedItem.id === item.id) || (putImageItem && putImageItem.id === item.id)) ? 'bg-red-600' : 'bg-gray-800 bg-opacity-60'}`}
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
            Restart
          </button>
      </div>
      }
    </div>
  )  
}  
  
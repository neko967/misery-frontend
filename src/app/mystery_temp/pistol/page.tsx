'use client'

import { useState } from 'react';
import Link from 'next/link';

// アイテム型定義
type Item = {
  id: number;
  name: string;
  positionClasses: string;
  width?: string; // 例: "w-32"
  height?: string; // 例: "h-32"
  additionalStyles?: React.CSSProperties;
  messages: {
    text: string;
    choices: {
      confirmText: string;
      cancelText: string;
    };
  }[];
};
//音


//三角ボタンコンポーネント
const TriangleButton = ({ direction, onClick }) => {
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
        onClick={onClick}
      ></div>
    );
  };

// メッセージコンポーネント
const Message = ({text}: {text: string}) => {
  return (
    <div className="text-white text-xl">{text}</div>
  )
}
//音
const playGameOverSound = () => {
    const sound = new Audio("/se_gun_fire10.wav");
    sound.play();
};
// 選択肢コンポーネント  
const Choices = ({onConfirm, onCancel, options}: any) => { //関数内での内容を返す = return
  const confirmText = options?.confirmText || '取得する';
  const cancelText = options?.cancelText || '取得しない';

  return (
    <div>
      <button onClick={onConfirm}>{confirmText}</button>
      <button onClick={onCancel}>{cancelText}</button>
    </div>
  )
}

export default function Home() {
  const switchToWallFromDark = () => {
        setBackgroundImage('/wall.png');
        setDarkMode(false);  // 真っ暗なモードを無効にする
      };
      
      
  const items: Item[] = [ //Itemタイプの配列を用いてオブジェクトの作成??
    {
      id: 1,
      name: '本',
      positionClasses: "absolute left-50 top-10",
      
      width: "w-32",
      height: "h-32",
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
      positionClasses: "absolute left-20 top-40",
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
      name: '地図',
      positionClasses: "absolute left-10 top-30",
      messages: [
        {
          text: "地図を取得しますか？",
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
      positionClasses: "absolute left-20",
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
  ];
  const switchBackgroundImage = (direction) => {
    if (direction === 'left') {
      setBackgroundImage('/dirty_house2.png');
    } else {
      setBackgroundImage('/wall.png');
    }
  };
  
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [acquiredItems, setAcquiredItems] = useState<Item[]>([]);
  const [currentItem, setCurrentItem] = useState<Item | null>(null);
  const [messageIndex, setMessageIndex] = useState<number>(0);
  const [backgroundImage, setBackgroundImage] = useState('/dirty_house2.png');
  const [messageText, setMessageText] = useState('');
  // アイテムリストの表示・非表示を管理する状態
  const [isItemListVisible, setIsItemListVisible] = useState(false);
  const isDarkBackground = backgroundImage === '/dark.png';
  const [darkMode, setDarkMode] = useState(false); // 真っ暗な背景表示用の状態
  const [showModal, setShowModal] = useState(false);


  let message: string | undefined;
  let choicesOptions = {};

  if (currentItem) {
    message = currentItem.messages[messageIndex]?.text;
    choicesOptions = currentItem.messages[messageIndex]?.choices;
  }
  
<body className={darkMode ? "custom-cursor" : ""}></body>
  const handleClick = (item: Item) => {
    document.body.classList.add('custom-cursor');

    // 500ms後にクラスを除去
    setTimeout(() => {
      document.body.classList.remove('custom-cursor');
    }, 500); 
  }

  const targetArea = { x: 200, y: 100, width: 50, height: 50 }; // これらの値は適宜調整

  const handleBackgroundClick = (e) => {
    const element = e.currentTarget;
    const elementWidth = element.offsetWidth;
    const elementHeight = element.offsetHeight;

    const centerX = elementWidth / 2;
    const centerY = elementHeight / 2;
    const range = 50; // 中央のクリックを判定する範囲

    // 要素内でのクリック位置を計算
    const clickX = e.clientX - element.getBoundingClientRect().left;
    const clickY = e.clientY - element.getBoundingClientRect().top;

    if (backgroundImage === '/dark.png') {
        const customCenterX = 200;  // 例: 水平方向のカスタム中心点
        const customCenterY = 300;  // 例: 垂直方向のカスタム中心点
        const customRange = 50;
        // '/dark.png'の場合、中央部分をクリックしたかチェック
        if (clickX > customCenterX - customRange && clickX < customCenterX + customRange && 
            clickY > customCenterY - customRange && clickY < customCenterY + customRange) {
            console.log("Clicked inside the center area in dark mode");
            setShowModal(true);
            setMessageText("どこかで何かが壊れたようだ...");
        }
    } else if (backgroundImage === '/wall.png') {
        // '/wall.png'の場合も同様のチェック
        if (clickX > centerX - range && clickX < centerX + range && 
            clickY > centerY - range && clickY < centerY + range) {
            console.log("Clicked inside the center area");
            setBackgroundImage('/dark.png');
            setShowModal(true);
            setMessageText("向こう側の部屋が見える...");
        }
    }
};

//モ-ダルのスタイル設定
const divStyle = {
    backgroundColor: '#1c1c1c',
    padding: '100px',
    borderRadius: '5px',
    color: '#ffffff',
    fontSize: '10px',
    fontFamily: 'sans-serif',
    position: 'absolute', // 絶対位置指定
    top: '82%',           // 上端から画面の60%の位置に
    left: '52%',   
    transform: 'translate(-50%, -50%)', // 中心位置に調整
    width: '50%',
    display: 'flex',       // Flexboxを使用
    justifyContent: 'center', // 水平方向の中央揃え
    alignItems: 'center',  // 垂直方向の中央揃え
    textAlign: 'center',  
};
 
    
  const switchToWall = () => {
    setBackgroundImage('/wall.png');
    setDarkMode(false);  // 真っ暗なモードを無効にする
  };

  const handleConfirm = () => {
    if (currentItem && messageIndex < currentItem.messages.length - 1) {
      setMessageIndex(prevIndex => prevIndex + 1);
    } else {
      if (currentItem) {
        setAcquiredItems([...acquiredItems, currentItem]);
      }
      setCurrentItem(null);
    }
  };

  //カーソルの定義
  const customCursorStyle = {
    cursor: `url('/custom-cursor.png'), auto`, // カスタムカーソルのパス
  };

  const handleCancel = () => {
    setCurrentItem(null);
  };

  return (
    <div
      className={`h-screen w-full bg-contain bg-center bg-no-repeat ${isDarkBackground ? 'custom-cursor' : ''}`}
      style={{ backgroundImage: `url('${backgroundImage}')` }}
      onClick={handleBackgroundClick}
    >

   
            
    
    {isModalVisible && (
  <div className="modal cursor-pointer">
    <div 
      className="modal-box relative bg-black text-white w-1/2 h-1/2 flex items-center justify-center rounded-lg"
      style={{top: '25%', left: '25%'}}
    >
      <p>ここにメッセージなどモーダルの中身を入力する</p>
      <button 
        className="btn btn-sm btn-circle absolute right-2 top-2"
        onClick={(e) => setIsModalVisible(false)}
      >
        ✕
      </button>
    </div>
  </div>
)}


        {/* dark.png の背景の時、画面下部中央に下向きの三角ボタンを表示 */}
        {backgroundImage === '/dark.png' && (
       <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
        <TriangleButton direction="down" onClick={() => {switchToWall()}}
         />
       </div>
      )}

      {/* dark.png の背景の時、画面下部中央に下向きの三角ボタンを表示 */}
      {backgroundImage === '/dark.png' && (
       <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
        <TriangleButton direction="down" onClick={() => {switchToWall()}}
         />
       </div>
      )}

{/*音の配置dark,png */}音
{backgroundImage === '/dark.png' && ( 
<div style={{ 
        backgroundImage: 'url(/dark.png)', 
        height: '100vh', 
        width: '100vw' ,
        
      }}
      onClick={playGameOverSound}
    ></div>
)}
      {/* 条件に基づいて左の三角形ボタンを表示 */}
      {backgroundImage === '/wall.png' && (
        <div>
        <TriangleButton direction="left" onClick={() => switchBackgroundImage('left')} />
        <div 
            style={{ 
              position: 'absolute', 
              left: '50%', 
              top: '50%', 
              width: '50px', 
              height: '50px', 
              transform: 'translate(-50%, -50%)',
              cursor: 'pointer'
            }}
            onClick={handleBackgroundClick}
          ></div>
        </div>
      )}

      {/* 条件に基づいて右の三角形ボタンを表示 */}
      {backgroundImage === '/dirty_house2.png' && (
        <TriangleButton direction="right" onClick={() => switchBackgroundImage('right')} />
      )}

     
   
         
      
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

      {/* 取得済みアイテム */}
      <div className="absolute right-0 translate-y-1/2 text-white">
        <div onClick={() => setIsItemListVisible(!isItemListVisible)}>
          アイテム一覧:
          {isItemListVisible && acquiredItems.map(item => (
            <div key={item.id}>{item.name}</div>
          ))}
        </div>
      </div>

      {/* ドア */}
      <Link href={acquiredItems.length === items.length ? "dirty" : "#"}>
        <div className="text-white">ドア</div>
      </Link>

       {/* モ-ダル表示 */}
       {backgroundImage === '/dark.png' && showModal && (
        <div style={divStyle}>
          {messageText && <Message text={messageText} />}
          </div>
      )}

      {currentItem && (
        <>
          <div className="flex justify-center items-end h-screen">
            <div className="mb-8 w-4/5 bg-gray-800 opacity-90 px-6 py-4 rounded-lg shadow-lg">
              {message && <Message text={message} />}
            </div>
          </div>
         
          <div className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center text-white">
            <Choices
              onConfirm={handleConfirm}
              onCancel={handleCancel}  
              options={choicesOptions} 
            />
          </div>
            
        </>
      )}
        
    </div>
  );
}
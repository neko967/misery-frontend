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

//三角ボタンコンポーネント
const TriangleButton = ({ direction, onClick }) => {
    const triangleClass = direction === 'left' ? 'triangle-left' : 'triangle-right';
    return (
      <div 
        className={`triangle-button ${triangleClass} triangle-button-position`}
        style={{ left: direction === 'left' ? '10px' : 'auto', right: direction === 'right' ? '10px' : 'auto' }}
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

// 選択肢コンポーネント  
const Choices = ({onConfirm, onCancel, options}: any) => {
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
  const items: Item[] = [
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
      setBackgroundImage('/dirty_house.png');
    } else {
      setBackgroundImage('/wall.png');
    }
  };
  const [acquiredItems, setAcquiredItems] = useState<Item[]>([]);
  const [currentItem, setCurrentItem] = useState<Item | null>(null);
  const [messageIndex, setMessageIndex] = useState<number>(0);
  const [backgroundImage, setBackgroundImage] = useState('/dirty_house.png');
  // アイテムリストの表示・非表示を管理する状態
  const [isItemListVisible, setIsItemListVisible] = useState(false);

  let message: string | undefined;
  let choicesOptions = {};

  if (currentItem) {
    message = currentItem.messages[messageIndex]?.text;
    choicesOptions = currentItem.messages[messageIndex]?.choices;
  }

  const handleClick = (item: Item) => {
    if (!acquiredItems.some(acquiredItem => acquiredItem.id === item.id)) {
      setCurrentItem(item);
      setMessageIndex(0); // Reset message index when new item is clicked
    }
  };

  const handleBackgroundClick = (e) => {
    const elementWidth = e.currentTarget.offsetWidth;
    const clickX = e.clientX;
    if (clickX > elementWidth / 2) {
      setBackgroundImage('/wall.png');
    } else {
      setBackgroundImage('/dirty_house.png');
    }
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

  const handleCancel = () => {
    setCurrentItem(null);
  };

  return (
    <div
      className="h-screen w-full bg-contain bg-center bg-no-repeat"
      style={{ backgroundImage: `url('${backgroundImage}')` }}
    >
        {/* 条件に基づいて左の三角形ボタンを表示 */}
      {backgroundImage === '/wall.png' && (
        <TriangleButton direction="left" onClick={() => switchBackgroundImage('left')} />
      )}

      {/* 条件に基づいて右の三角形ボタンを表示 */}
      {backgroundImage === '/dirty_house.png' && (
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
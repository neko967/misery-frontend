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

// メッセージコンポーネント
const Message = ({text}: {text: string}) => {
  return (
    <div className="flex items-center justify-center h-full text-white text-xl">{text}</div>
  )
}

// 選択肢コンポーネント  
const Choices = ({onConfirm, onCancel, options}: any) => {
  const confirmText = options?.confirmText || '取得する';
  const cancelText = options?.cancelText || '取得しない';

  return (
    <div className="flex flex-col space-y-4">
      <button className="px-4 text-white rounded" onClick={onConfirm}>{confirmText}</button>
      <button className="px-4 text-white rounded" onClick={onCancel}>{cancelText}</button>
    </div>
  )
}

export default function Home() {
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
      name: '地図',
      positionClasses: "absolute top-1/2 left-1/2 translate-x-[calc(-50%+50px)] translate-y-[calc(-50%-120px)]",
      width: "w-20",
      height: "h-12",
      // コメントアウトで、クリック部分の色を消す
      additionalStyles: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
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
  ];

  const [acquiredItems, setAcquiredItems] = useState<Item[]>([]); // 取得済みのアイテムを管理する状態
  const [currentItem, setCurrentItem] = useState<Item | null>(null); // 現在選択されているアイテムを管理する状態 毎回nullにリセット
  const [messageIndex, setMessageIndex] = useState<number>(0); // 現在のメッセージのインデックスを管理する状態
  const [isItemListVisible, setIsItemListVisible] = useState(false); // アイテムリストの表示・非表示を管理する状態

  let message: string | undefined;
  let choicesOptions = {};

  // 現在選択されているアイテムがある場合、そのアイテムの特定のメッセージと選択肢を取得
  if (currentItem) {
    message = currentItem.messages[messageIndex]?.text;
    choicesOptions = currentItem.messages[messageIndex]?.choices;
  }

  // アイテムがクリックされた時の処理
  const handleClick = (item: Item) => {
    if (!acquiredItems.some(acquiredItem => acquiredItem.id === item.id)) {
      setCurrentItem(item);
      setMessageIndex(0); // Reset message index when new item is clicked
    }
  };

  // 選択肢の処理
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

  // 選択肢拒否時の処理
  const handleCancel = () => {
    setCurrentItem(null);
  };

  return (
    <div
      // 背景画像
      className="h-screen w-full bg-contain bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/dirty_house.png')" }}
    >
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
            <div key={item.id} className="border-b border-gray-600 p-1 hover:bg-gray-700 text-shadow-md">
              {item.name}
            </div>
          ))}
        </div>
        )}
      </div>

      {/* ドア */}
      <Link href={acquiredItems.length === items.length ? "dirty" : "#"}>
        <div className="text-white">ドア</div>
      </Link>

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
  );
}
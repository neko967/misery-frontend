'use client'

import { useState } from 'react';

type Background = {
  id: number;
  path: string;
  name: string;
};

type Item = {
  id: number;
  name: string;
  backgroundId: number;  // このアイテムが表示される背景のID
  position: {
    x: number; // 0~100の値で指定 
    y: number;
  },
  clickableArea: {
    width: number; // 0~100の値で指定
    height: number; 
  }
  messages?: ItemMessage[];
};

type ItemMessage = {
  text: string;
  choices?: {
    confirmText: string;
    cancelText?: string;
  };
};

const backgrounds: Background[] = [
  { id: 1, path: '/dirty_room.png', name: 'room1' },
  { id: 2, path: '/wall.png', name: 'room2' },
  { id: 3, path: '/horror_image.png', name: 'room3' },
];

export default function Home() {  // この部分を変更しました
  const [currentBackground, setCurrentBackground] = useState<Background>(backgrounds[0]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [showMessage, setShowMessage] = useState<boolean>(false);
  const [selectedMessageIndex, setSelectedMessageIndex] = useState<number>(0); // アイテムごとに複数のメッセージを持つ場合に使用する。
  const [acquiredItems, setAcquiredItems] = useState([]); // 取得済みのアイテムを管理するステート
  const [isItemListVisible, setIsItemListVisible] = useState(false); //アイテムリストの表示/非表示
  const [selectedItemList, setSelectedItemList] = useState<Item | null>(null);

  const changeBackground = (direction: "next" | "prev") => {
    const currentIndex = backgrounds.findIndex(bg => bg.id === currentBackground.id);
    if (direction === "next") {
      const nextIndex = (currentIndex + 1) % backgrounds.length;
      setCurrentBackground(backgrounds[nextIndex]);
    } else if (direction === "prev") {
      const prevIndex = (currentIndex - 1 + backgrounds.length) % backgrounds.length;
      setCurrentBackground(backgrounds[prevIndex]);
    }
  }

const items: Item[] = [
  { id: 1, name: 'ハサミ', backgroundId: 1,
    position: {
      x: 30, // 30%の位置
      y: 80  // 80%の位置
    },
    clickableArea: {
      width: 10, // 10%の幅
      height: 5   // 5%の高さ
    },
    messages: [
      {
      text: "ハサミがあります",
      choices: {
        confirmText: "拾う",
        cancelText: "拾わない"
      }
    }]
  },
  { id: 2, name: 'くまの人形', backgroundId: 1,
    position: {
      x: 50, // 30%の位置
      y: 80  // 80%の位置
    },
    clickableArea: {
      width: 10, // 10%の幅
      height: 5   // 5%の高さ
    },
    messages: [
      {
      text: "くまの人形が置いてある",
      choices: {
        confirmText: "拾う",
        cancelText: "拾わない"
      }
    }]
  },
  { id: 3, name: '鍵', backgroundId: 1,
    position: {
      x: 70, // 30%の位置
      y: 80  // 80%の位置
    },
    clickableArea: {
      width: 10, // 10%の幅
      height: 5   // 5%の高さ
    },
    messages: [
      {
      text: "これは鍵です。取得しますか？",
      choices: {
        confirmText: "取得する",
        cancelText: "取得しない"
      }
    }]
  },
  { id: 4, name: '銃', backgroundId: 1,
    position: {
      x: 85, // 30%の位置
      y: 50  // 80%の位置
    },
    clickableArea: {
      width: 10, // 10%の幅
      height: 5   // 5%の高さ
    },
    messages: [
      {
      text: "これは銃です。取得しますか？",
      choices: {
        confirmText: "取得する",
        cancelText: "取得しない"
      }
    }]
  },
  // 他のアイテム...
];

const gems: Item[] = [
  { id: 4, name: 'gem', backgroundId: 1, position: null, clickableArea: null, messages: [] }
];

const handleBackgroundClick = (e: any) => {
  const clickX = e.clientX - e.currentTarget.getBoundingClientRect().left;
  const clickY = e.clientY - e.currentTarget.getBoundingClientRect().top;

  // 現在の背景に関連するアイテムをフィルタリング
  const relevantItems = items.filter(item => item.backgroundId === currentBackground.id);

  for (let item of relevantItems) {
    const withinX = clickX > item.position.x && clickX < item.position.x + item.clickableArea.width;
    const withinY = clickY > item.position.y && clickY < item.position.y + item.clickableArea.height;
    
    if (withinX && withinY) {
      // アイテムがクリックされた時の処理
      console.log(`${item.name} was clicked!`);
      handleItemClick(item);
      return
    }
  }
}

const handleItemClick = (item: Item) => {
  setSelectedItem(item);

  // 既に取得しているアイテムかをチェック
  const isAlreadyAcquired = acquiredItems.some(acquiredItem => acquiredItem.id === item.id);
  
  if (isAlreadyAcquired) {
    // すでに取得しているアイテムの場合、その旨を通知
    console.log(`${item.name} is already acquired!`);
    // 他の処理（例: そのアイテムの特別なアクションやメッセージを表示する等）
  } else {
    setShowMessage(true);
  }
};

const handleConfirmChoice = () => {
  if (selectedItem) {
    // 取得済みアイテムリストに追加
    setAcquiredItems(prevItems => [...prevItems, selectedItem]);
    setShowMessage(false);
  }
};

function handleItemSelect(item: Item) {
  if (selectedItemList && selectedItemList.id === item.id) {
    // すでに選択されているアイテムを再度クリックした場合、選択を解除する
    setSelectedItemList(null);
  } else {
    setSelectedItemList(item);
  }
}



return (
  <div className="relative h-screen w-screen">
    {/* 背景の表示 */}
    <div 
      className="bg-cover bg-center bg-image relative w-full h-full"
      style={{ backgroundImage: `url(${currentBackground.path})` }}
      onClick={handleBackgroundClick}
    >
      {/* 現在の背景に関連するアイテムを表示 */}
      {items
        .filter(item => item.backgroundId === currentBackground.id)
        .map(item => (
          <div 
            key={item.id}
            className="absolute cursor-pointer bg-red-500 opacity-50" 
            style={{
              left: `${item.position.x}%`,
              top: `${item.position.y}%`,
              width: `${item.clickableArea.width}%`,
              height: `${item.clickableArea.height}%`,
            }}
            onClick={() => handleItemClick(item)}
          ></div>
        ))
      }
    </div>
    
    {/* 取得済みアイテムリストの表示 */}
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
            <div
              className={`p-2 rounded-b-lg shadow-xl border-t ${selectedItemList && selectedItemList.id === item.id ? 'bg-red-600' : 'bg-gray-800 bg-opacity-60'}`}
              onClick={() => handleItemSelect(item)}
            >
              {item.name}
            </div>
          ))}
        </div>
      )}
    </div>

    {/* 背景を切り替えるための矢印ボタン */}
    <button className="absolute top-2 left-2" onClick={() => changeBackground("prev")}>←</button>
    <button className="absolute top-2 right-2" onClick={() => changeBackground("next")}>→</button>
    
    {/* メッセージの表示 */}
    {showMessage && selectedItem && selectedItem.messages && (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4">
    <p>{selectedItem.messages[selectedMessageIndex]?.text}</p>
      {selectedItem.messages[selectedMessageIndex]?.choices && (
      <>
      <button onClick={handleConfirmChoice}>
        {selectedItem.messages[selectedMessageIndex]?.choices?.confirmText}
      </button>
      <button onClick={() => setShowMessage(false)}>
        {selectedItem.messages[selectedMessageIndex]?.choices?.cancelText}
      </button>
      </>
    )}
    </div>
    )}
</div>
);
}
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
    x: number;
    y: number;
  },
  clickableArea: {
    width: number;
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
  { id: 3, path: '/dark.png', name: 'room3' },
];

const Message = ({text}: {text: string}) => (
  <div className="fixed justify-center items-end bottom-4 left-0 right-0 flex">
    <div className="mb-20 w-3/5 p-20 relative">
      <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-600 bg-gray-800 bg-opacity-50">
      <div className="flex items-center justify-center h-full text-white text-xl">{text}</div>
      </div>
    </div>
  </div>
);

const Choices = ({ confirmText, cancelText, onConfirm, onCancel }) => (
  <div className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center">
    <div className="relative w-1/5 p-14">
      <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-600 bg-gray-800 bg-opacity-50 flex flex-col items-center justify-center">
        <div className="flex flex-col space-y-4">
          <button className="px-4 text-white rounded hover:bg-gray-700"
                  onClick={onConfirm}>
            {confirmText}
          </button>
          <button className="px-4 text-white rounded hover:bg-gray-700"
                  onClick={onCancel}>
            {cancelText}
          </button>
        </div>
      </div>
    </div>      
  </div>
);

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
  { id: 1, name: 'ハサミ', backgroundId: 2,
    position: {
      x: 400, // 30%の位置
      y: 80  // 80%の位置
    },
    clickableArea: {
      width: 100, // 10%の幅
      height: 50   // 5%の高さ
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
      x: 500, // 30%の位置
      y: 80  // 80%の位置
    },
    clickableArea: {
      width: 100, // 10%の幅
      height: 50   // 5%の高さ
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
      x: 700, // 30%の位置
      y: 80  // 80%の位置
    },
    clickableArea: {
      width: 100, // 10%の幅
      height: 50  // 5%の高さ
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
      x: 900, // 30%の位置
      y: 80  // 80%の位置
    },
    clickableArea: {
      width: 100, // 10%の幅
      height: 50   // 5%の高さ
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
      className="bg-contain bg-center bg-no-repeat bg-black absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%]"
      style={{ backgroundImage: `url(${currentBackground.path})`,
      width: `1400px`,
      height: `750px` }}
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
              left: `${item.position.x}px`,
              top: `${item.position.y}px`,
              width: `${item.clickableArea.width}px`,
              height: `${item.clickableArea.height}px`,
            }}
            onClick={() => handleItemClick(item)}
          >
            {item.name}
          </div>
        ))
      }
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
      <button className="absolute top right-2" onClick={() => changeBackground("next")}>→</button>
    
      {/* メッセージの表示 */}
      {showMessage && selectedItem && selectedItem.messages && (
        <>
          {selectedItem.messages[selectedMessageIndex] && (
            <Message text={selectedItem.messages[selectedMessageIndex].text} />
          )}
          
          {selectedItem.messages[selectedMessageIndex]?.choices && (
            <Choices
              confirmText={selectedItem.messages[selectedMessageIndex].choices.confirmText}
              cancelText={selectedItem.messages[selectedMessageIndex].choices.cancelText || 'キャンセル'}
              onConfirm={handleConfirmChoice}
              onCancel={() => setShowMessage(false)}
            />
          )}
        </>
      )}
  </div>    
</div>
);
}
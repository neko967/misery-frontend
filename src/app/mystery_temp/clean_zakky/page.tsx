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
  position: Position;
  clickableArea: ClickableArea;
};

const backgrounds: Background[] = [
  { id: 1, path: '/dirty_room.png', name: 'room1' },
  { id: 2, path: '/door.png', name: 'room2' },
  { id: 3, path: '/horror_image.png', name: 'room3' },
];

export default function Home() {  // この部分を変更しました
  const [currentBackground, setCurrentBackground] = useState<Background>(backgrounds[0]);

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
  { id: 1, name: 'book', backgroundId: 1, position: { x: 800, y: 200 },
    clickableArea: { width: 100, height: 100 } },
  { id: 2, name: 'blue_box', backgroundId: 2, position: { x: 500, y: 200 },
    clickableArea: { width: 100, height: 100 } },
  { id: 3, name: 'key', backgroundId: 1, position: { x: 100, y: 200 },
    clickableArea: { width: 100, height: 100 } },
  // 他のアイテム...
];

const handleBackgroundClick = (e) => {
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
      break;
    }
  }
}

return (
  <div className="relative h-screen w-screen">
    {/* 背景の表示 */}
    <div 
      className="bg-cover bg-no-repeat bg-center relative h-full w-full"
      style={{ backgroundImage: `url(${currentBackground.path})` }} // ここで背景画像を設定
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
          ></div>
        ))
      }
    </div>
    {/* 背景を切り替えるための矢印ボタン */}
    <button className="absolute top-2 left-2" onClick={() => changeBackground("prev")}>←</button>
    <button className="absolute top-2 right-2" onClick={() => changeBackground("next")}>→</button>
  </div>
);
}
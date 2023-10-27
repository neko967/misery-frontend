"use client"

import { useState } from 'react'
import Link from 'next/link'

// import gem1 from "../../../../../public/gems/gem_1.png"; 
// import gem2 from "../../../../../public/gems/gem_2.png";
// import gem3 from "../../../../../public/gems/gem_3.png";
type Item = {
  id: number;
  name: string;
  image: string;
};

const items = [
  {
    id: 1,
    name: 'ルビー', 
    image: "/gems/gem_1.png"
  },
  {
    id: 2,
    name: 'サファイア',
    image: "/gems/gem_2.png"
  },
  {
    id: 3,
    name: 'エメラルド', 
    image: "/gems/gem_3.png"
  }
]

export default function Home() {
  const [message, setMessage] = useState<string>(''); 
  const [acquiredItems, setAcquiredItems] = useState<number[]>([]);
  
  const [clickedItems, setClickedItems] = useState<number[]>([]);

  

  const handleClick = (item: Item) => {

    // すでにクリック済みなら処理しない
    if(clickedItems.includes(item.id)) {
      return;
    }
  
    // クリック済みに追加 
    setClickedItems(prev => [...prev, item.id]);
  
    // 取得処理
    setAcquiredItems(prev => [...prev, item.id]);
  
    setMessage('アイテムを取得しました!'); 
  
  }

  const acquiredItemsList = acquiredItems.map(id => {
    const item = items.find(i => i.id === id);
    if (item) {
        return <div key={item.id}>{item.name}</div>;
    }
    return null;
  }).filter(Boolean) as JSX.Element[];

  const isComplete: boolean = acquiredItems.length === items.length;

  return (
    <div
      className="h-screen w-full bg-cover"
      style={{ backgroundImage: "url('/background.png')" }}
    >

      <div>{message}</div>
      
      {items.map(item => (
        <img 
          src={item.image}
          onClick={() => {
            // handleClick関数をここで呼び出す
            handleClick(item); 
          }}
        />
      ))}

      <div className="items-list">
        取得アイテム一覧
        {acquiredItemsList}
      </div>

      {isComplete && (
        <div className="result">
          おめでとう!全てのアイテムを取得しました。
          <Link href="clean">結果ページへ</Link>  
        </div>
      )}

      <style jsx>{`
        .items-list {
        position: absolute;
        top: 0;
        right: 0;
        color: white;
        }

        .result {
          color: white;
        }
      `}</style>

    </div>
  )

}
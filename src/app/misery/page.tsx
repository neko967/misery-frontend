'use client';
import React, { useState, useEffect } from 'react';

export default function Home() {
const [currentTextIndex, setCurrentTextIndex] = useState(0);
const [currentTextIndexBook1, setCurrentTextIndexBook1] = useState(2);
const [currentTextIndexBook2, setCurrentTextIndexBook2] = useState(3);
const [currentTextIndexBook3, setCurrentTextIndexBook3] = useState(4);
const [ book1, setBook1 ] = useState(false);
const [ book2, setBook2 ] = useState(false);
const [ book3, setBook3 ] = useState(false);

const storyTexts = [
  'ミザリーの過去に招かれたという説明',
];

const storyTextsBook1 = [
  'Book1の内容',
  'Book1の内容2',
];

const storyTextsBook2 = [
  'Book2の内容',
  'Book2の内容2',
  'Book2の内容3',
];

const storyTextsBook3 = [
  'Book3の内容',
  'Book3の内容2',
  'Book3の内容3',
  'Book3の内容4',
];

const nextText = () => {
  // 最後のテキストを表示した後、もう一つインデックスを増やして
  if (currentTextIndex < storyTexts.length) {
    setCurrentTextIndex(currentTextIndex + 1);
  }
};

const handleClickBook1 = () => {
  setCurrentTextIndexBook1(0);
  setBook1(true);
};

const nextTextBook1 = () => {
  if (currentTextIndexBook1 < storyTextsBook1.length) {
    setCurrentTextIndexBook1(currentTextIndexBook1 + 1);
  }
};

const handleClickBook2 = () => {
  setCurrentTextIndexBook2(0);
  setBook2(true);
};

const nextTextBook2 = () => {
  if (currentTextIndexBook2 < storyTextsBook2.length) {
    setCurrentTextIndexBook2(currentTextIndexBook2 + 1);
  }
};

const handleClickBook3 = () => {
  setCurrentTextIndexBook3(0);
  setBook3(true);
};

const nextTextBook3 = () => {
  if (currentTextIndexBook3 < storyTextsBook3.length) {
    setCurrentTextIndexBook3(currentTextIndexBook3 + 1);
  }
};

return (
  <div
    className="relative h-screen w-full bg-cover"
    style={{ backgroundImage: "url('/misery_past.png')" }}
  >
    {currentTextIndex < storyTexts.length && (
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.56)', color: 'white', padding: '20px',
          borderRadius: '10px', textAlign: 'center', width: '1000px',
          maxHeight: '80vh', // 画面の高さの80%を最大に
          overflowY: 'auto', // 縦方向にスクロール可能に
          zIndex: 1000
        }}
      >
        <p style={{ margin: '10px', height: '20px' }}>{storyTexts[currentTextIndex]}</p>
        <div style={{ position: 'absolute', right: '10px', bottom: '10px', cursor: 'pointer', 
                      fontSize: '24px', animation: 'bounce 1s infinite' }}
             onClick={nextText}
        >
          ▼
        </div>
      </div>
    )}

    {currentTextIndexBook1 < storyTextsBook1.length && (
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.56)', color: 'white', padding: '20px',
          borderRadius: '10px', textAlign: 'center', width: '1000px',
          maxHeight: '80vh', // 画面の高さの80%を最大に
          overflowY: 'auto', // 縦方向にスクロール可能に
          zIndex: 1000
        }}
      >
        <p style={{ margin: '10px', height: '20px' }}>{storyTextsBook1[currentTextIndexBook1]}</p>
        <div style={{ position: 'absolute', right: '10px', bottom: '10px', cursor: 'pointer', 
                      fontSize: '24px', animation: 'bounce 1s infinite' }}
             onClick={nextTextBook1}
        >
          ▼
        </div>
      </div>
    )}

    {currentTextIndexBook2 < storyTextsBook2.length && (
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.56)', color: 'white', padding: '20px',
          borderRadius: '10px', textAlign: 'center', width: '1000px',
          maxHeight: '80vh', // 画面の高さの80%を最大に
          overflowY: 'auto', // 縦方向にスクロール可能に
          zIndex: 1000
        }}
      >
        <p style={{ margin: '10px', height: '20px' }}>{storyTextsBook2[currentTextIndexBook2]}</p>
        <div style={{ position: 'absolute', right: '10px', bottom: '10px', cursor: 'pointer', 
                      fontSize: '24px', animation: 'bounce 1s infinite' }}
             onClick={nextTextBook2}
        >
          ▼
        </div>
      </div>
    )}

    {currentTextIndexBook3 < storyTextsBook3.length && (
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.56)', color: 'white', padding: '20px',
          borderRadius: '10px', textAlign: 'center', width: '1000px',
          maxHeight: '80vh', // 画面の高さの80%を最大に
          overflowY: 'auto', // 縦方向にスクロール可能に
          zIndex: 1000
        }}
      >
        <p style={{ margin: '10px', height: '20px' }}>{storyTextsBook3[currentTextIndexBook3]}</p>
        <div style={{ position: 'absolute', right: '10px', bottom: '10px', cursor: 'pointer', 
                      fontSize: '24px', animation: 'bounce 1s infinite' }}
             onClick={nextTextBook3}
        >
          ▼
        </div>
      </div>
    )}

    {currentTextIndex === storyTexts.length && currentTextIndexBook1 === storyTextsBook1.length && 
     currentTextIndexBook2 === storyTextsBook2.length && currentTextIndexBook3 === storyTextsBook3.length && (
      <>
        <div
          className="absolute left-1/4 top-3/4 h-48 w-96 bg-cover hover:rotate-6 z-10 translate-x-[calc(-50%)] translate-y-[calc(-50%)]"
          style={{ backgroundImage: "url('/book2.png')"}}
          onClick={handleClickBook1}
        >
        </div>
        <div
          className="absolute left-1/2 top-3/4 h-48 w-96 bg-cover hover:rotate-6 z-10 translate-x-[calc(-50%)] translate-y-[calc(-50%)]"
          style={{ backgroundImage: "url('/book2.png')"}}
          onClick={handleClickBook2}
        >
        </div>
        <div
          className="absolute left-3/4 top-3/4 h-48 w-48 bg-cover hover:rotate-6 z-10 translate-x-[calc(-50%)] translate-y-[calc(-50%)]"
          style={{ backgroundImage: "url('/book.png')"}}
          onClick={handleClickBook3}
        >
        </div>
      </>
    )}
  </div>
);
}

'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  const storyTexts = [
    '洋館の複雑な迷路を抜け出し、二人はようやく安堵の息を吐く。その時、一人が迷路の中で拾った古びた新聞を取り出す。',
    '新聞の見出しには、「洋館で幼い子が餓死」という悲劇的な事件が報じられていた。',
    '「これは…」ともう一人が呟く。二人は洋館の迷路で遭遇した幻想のような少女のことを思い出す。',
    'もしかすると、この少女は新聞の報じる事件の犠牲者なのかもしれない。','そう考えると、彼らの心には深い哀れみと共感が湧き上がる。',
    '「彼女は私たちに何かを伝えたかったのかもしれないね」と一人が言う。彼らは、少女の謎を解明するための手がかりを探し始める。',
    '彼らの足取りは、新しい朝の光の中で決意に満ちていた。少女の声なき声を聞き、その悲劇に光を当てるために。',
    '洋館の謎を背負った二人は、未解決の疑問を手がかりに新たな物語を紡ぎ始める。',
    '彼らの旅は終わらず、ただ一つの結論に向かって進んでいく。',
    'それは、忘れ去られた魂が伝えたかった真実を、世に知らしめるための旅だった。',
  ];

  const nextText = () => {
    setCurrentTextIndex((prevIndex) => prevIndex + 1);
  };

  async function goCreditsTrue() {
    router.push(`/credits/true`);
  }

  return (
    <div
      className="h-screen w-full bg-cover flex justify-center items-center"
      style={{ backgroundImage: "url('/ending.png')" }}
    >
      {/* Story Texts */}
      {currentTextIndex < storyTexts.length && (
        <div
          style={{
            position: 'relative', // これにより、内部のabsolute要素をこのdivに対して相対的に配置できる
            backgroundColor: 'rgba(0, 0, 0, 0.56)',
            color: 'white',
            padding: '20px',
            borderRadius: '10px',
            textAlign: 'center',
            width: '1050px',
            maxHeight: '80vh',
            overflowY: 'auto',
          }}
        >
          <p style={{ margin: '10px', height: '20px' }}>{storyTexts[currentTextIndex]}</p>
          <div
            style={{
              position: 'absolute', // これで右下に固定する
              right: '10px', // 右端からの距離
              bottom: '10px', // 下端からの距離
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

      {/* Buttons */}
      {currentTextIndex >= storyTexts.length && (
        <button
          onClick={goCreditsTrue}
          className="end-button"
        >
          ▶▶ The End.
        </button>
      )}
    </div>
  );
}

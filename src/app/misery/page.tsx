'use client';
import React, { useState, useEffect } from 'react';

export default function Home() {
const [currentTextIndex, setCurrentTextIndex] = useState(0);
const [currentTextIndexBook1, setCurrentTextIndexBook1] = useState(12);
const [currentTextIndexBook2, setCurrentTextIndexBook2] = useState(11);
const [currentTextIndexBook3, setCurrentTextIndexBook3] = useState(12);
const [ book1, setBook1 ] = useState(false);
const [ book2, setBook2 ] = useState(false);
const [ book3, setBook3 ] = useState(false);

const storyTexts = [
  '突然、目の前の光景が変わり、見知らぬ部屋に立っていた。',
  '荒れた壁がかつての栄華を色褪せた色彩でささやき、窓から差し込む柔らかな光が、床に長い影を落とし、ベッドに座る幼い少女、ミザリーの姿を温かく照らしていた。',
  '彼女はただ窓を見つめているが、その透き通る瞳には何の焦点もなく、まるで外の世界から切り離されているかのようだった。',
  'ここはどうやらミザリーの部屋のようだ。やがて彼女はゆっくりと口を開く。',
  '「わたし、ここでずっと待ってたの。あなたに会えてうれしいな。」',
  '「ここにはね、秘密がいっぱいあるの。わたしと一緒に探してみない？」',
];

const storyTextsBook1 = [
  'かつて、エリザベス一家は幸福に満ちた生活を送っていた。',
  '彼らの居住する豪華な洋館は、彼らの温かい絆と幸せの象徴のようなものだった。',
  '壁に掛けられた家族の写真は、笑顔あふれる日々を物語っていた。',
  'しかし、ある晩の社交パーティが全てを変えた。',
  'エリザベスは、洗練された見知らぬ女性から夫の浮気についての噂を耳にした。',
  '初めは信じがたいと思いながらも、その言葉は彼女の心に深い疑念を植え付けた。',
  'その後の日々、家庭内の雰囲気は一変した。',
  'エリザベスは夫を疑い、夫は自身の無実を主張したが、彼らの関係は修復不可能なほどに崩れていった。',
  'やがて、彼らは離婚裁判に突入する。',
  '裁判に勝つため、エリザベスは弁護士からの助言に従い、生活を極端に切り詰めることにした。',
  '「質素な生活を送れば、裁判に有利になる」とのことだった。',
  'さらに、「子供が太っていると、療育費が減額される」というアドバイスに従い、娘ミザリーへの食事も厳しく制限した。',
];

const storyTextsBook2 = [
  'ミザリーの部屋の扉には重い鍵がかけられ、その小さな窓は彼女の孤独な世界への唯一の眺望となっていた。',
  'エリザベスは、壁に開けた小さな穴から、必要最小限の食事を娘に与えることを続けた。',
  '食事の量は日に日に減り、ミザリーの弱弱しい声はほとんど聞こえなくなっていった。',
  'エリザベス自身も、家族の生活を切り詰めてはいたが、その大部分は弁護士への支払いに消えていった。',
  '高額な法律相談料と裁判費用が家計を圧迫し、エリザベスはさらに節約を強いられた。',
  '彼女は、勝訴のためならどんな犠牲も払うべきだと自分を説得していた。',
  '洋館の中では、かつての暖かさや活気は影を潜め、代わりに静寂が支配していた。',
  'エリザベスは、裁判に勝利すればすべてが元通りになると信じていたが、その信念は徐々に彼女を孤独へと追い込んでいた。',
  '彼女は、裁判への執着と経済的な圧迫感の間で苦悩し、家族の絆よりも勝訴を優先してしまう。',
  '娘の部屋の前を通るたび、エリザベスはミザリーの存在を感じるものの、彼女の決断は変わらなかった。',
  '家族が以前共有していた幸福は、エリザベスの心の中で次第に遠くなっていった。',
];

const storyTextsBook3 = [
  'ミザリーの部屋から、とうとう声が聞こえなくなったある朝、エリザベスは重い心で鍵を開けた。',
  'そこには、静かに横たわるミザリーの姿があった。',
  '彼女の小さな体は、長い間の飢餓と孤独によって、生命を失っていた。',
  'エリザベスの心は、突如として冷たい現実に打ちのめされた。',
  'ミザリーの死は、すぐに地元の新聞に取り上げられた。',
  'エリザベス家の悲劇は、公然と報じられ、洋館は不幸な事件の舞台として、街の人々に語り継がれることとなった。',
  'エリザベス自身は、娘の死とその原因に対する深い罪悪感に苦しみながら、公の場から姿を消した。',
  '裁判に勝ったことなど、もはや何の意味も持たなかった。',
  '彼女は、最も大切なものを失った後の虚無感に満ちた日々を送ることとなる。',
  'かつての洋館は、閉ざされたままになった。',
  '壁に掛けられた家族の写真は、今や過去の幸せな時を嘲笑うかのように、寂しく空っぽの部屋に残されていた。',
  'エリザベスは、ミザリーの部屋を訪れることもなく、館の中で孤独に彷徨う幽霊のようになっていった。',
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

function TwitterIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24">
      <g>
        <path d="M14.258 10.152L23.176 0h-2.113l-7.747 8.813L7.133 0H0l9.352 13.328L0 23.973h2.113l8.176-9.309 6.531 9.309h7.133zm-2.895 3.293l-.949-1.328L2.875 1.56h3.246l6.086 8.523.945 1.328 7.91 11.078h-3.246zm0 0" fill="#FFF" />
      </g>
    </svg>
  );
}

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
          className="absolute left-1/4 top-3/4 h-48 w-72 bg-cover hover:rotate-6 z-10 translate-x-[calc(-50%)] translate-y-[calc(-50%)]"
          style={{ backgroundImage: "url('/book4.png')"}}
          onClick={handleClickBook1}
        >
        </div>
        <div
          className="absolute left-1/2 top-3/4 h-48 w-72 bg-cover hover:rotate-6 z-10 translate-x-[calc(-50%)] translate-y-[calc(-50%)]"
          style={{ backgroundImage: "url('/book4.png')"}}
          onClick={handleClickBook2}
        >
        </div>
        <div
          className="absolute left-3/4 top-3/4 h-48 w-72 bg-cover hover:rotate-6 z-10 translate-x-[calc(-50%)] translate-y-[calc(-50%)]"
          style={{ backgroundImage: "url('/book4.png')"}}
          onClick={handleClickBook3}
        >
        </div>
        <>
        {book1 && book2 && book3 &&
          <button className="icon"
                  onClick={() => {
                    const tweetOptions = [
                      "またね、ミザリー。",            
                    ];
                    const tweetText = tweetOptions[Math.floor(Math.random() * tweetOptions.length)];
                    const pageUrl = "https://misery-seven.vercel.app/";
                
                    // Twitter Intentでテキストと画像URLを含めてツイート
                    window.open(
                      `https://twitter.com/share?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(tweetText)}
                      &hashtags=MISERY`,
                      '_blank' 
                    ); 
                  }}
          >
            <TwitterIcon />  
          </button>
        }
        </>
      </>
    )}
  </div>
);
}

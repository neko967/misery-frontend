'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../../WaitingRoomButton.module.css';

function WaitingRoomButton() {
  return (
    <div className={styles.text}>
        <span style={{color: 'yellow'}}>⚠️</span>本アプリにはショックの強い表現が含まれています。
        <p>苦手な方や心臓の弱い方はご注意ください。</p>
    </div>
  );
}

export default function Home({ params }: { params: { slug: string } }) {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const router = useRouter();
  const [readyToPrologue, setReadyToPrologue] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const storyTexts = [
    'かつて華やかな宴が開かれたという洋館は、今や廃墟と化し、暗い影を村に落としていた。',
    '「ここには幽霊が出る」と囁かれ、人々の恐怖を煽る存在となって久しい。',
    'そんな洋館の扉を、勇気あるいは軽率な好奇心からか、肝試しに来た二人が静かに押し開ける。',
    '一歩、また一歩と踏み込むにつれ、彼らの周囲はしんと静まり返り、空気は冷たく、何かが彼らを見つめているような錯覚に陥る。',
    '彼らの任務は明確だ。洋館の最も奥深くに隠された証を手に入れ、無事に戻ってくること。',
    '肝試しのルールはシンプルだが、その道程は予測不可能な怪異が彼らを待ち受けており、二人の勇気と友情を試すだろう。',
    '果たして二人は、この洋館に囁かれる不可解な現象の真実に辿り着くことができるのか？',
    '二人で力を合わせ、恐怖に立ち向かい、洋館の謎を解き明かす旅が、今、始まる。'
  ];

  const nextText = () => {
    if (currentTextIndex < storyTexts.length) {
      setCurrentTextIndex(currentTextIndex + 1);
    }
  };

  useEffect(() => {
    async function checkRoomExists() {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_HTTP_URL}/api/room-exists/${params.slug}`);
      const data = await res.json();

      if (!data.exists) {
        router.push('/');
      } else {
        const websocketUrl = `${process.env.NEXT_PUBLIC_BACKEND_WEBSOCKET_URL}/${params.slug}`;
        const websocket = new WebSocket(websocketUrl);
        setWs(websocket);

        websocket.onmessage = (event) => {
          if (event.data == "readyToPrologue") {
            setReadyToPrologue(true);
          }
          if (event.data == "goPrologue") {
            router.push(`/prologue/host/${params.slug}`);
          }
        };

        return () => {
          websocket.close();
        };
      }
    }

    checkRoomExists();
  }, [params.slug]);

  async function goPrologue() {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send('goPrologue');
    }
  }

  return (
    <div
      className="h-screen w-full bg-cover bg-center"
      style={{ backgroundImage: "url('/Central.png')" }}
    >
      <div className="warning">※このゲームは、2人プレイ専用です。音を出してお楽しみください。</div>
      <p className="invite-text">この部屋の招待コード</p>
      <p className="invite-code" onClick={() => {
         navigator.clipboard.writeText(params.slug);
         setCopied(true);}}
      >
        {params.slug}
      </p>
      <p className="code-s">上記コードをクリックして相手に伝えてください</p>
      {copied && <p className="copy-message">コピーしました!</p>}
      {currentTextIndex < storyTexts.length && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.56)',
            color: 'white',
            padding: '20px',
            borderRadius: '10px',
            textAlign: 'center',
            width: '1000px',
            maxHeight: '80vh', // 画面の高さの80%を最大に
            overflowY: 'auto', // 縦方向にスクロール可能に
            zIndex: 1000
          }}
        >
          <p style={{ margin: '10px', height: '20px' }}>{storyTexts[currentTextIndex]}</p>
          <div
            style={{
              position: 'absolute',
              right: '10px',
              bottom: '10px',
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
      {currentTextIndex === storyTexts.length && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            maxWidth: '80%',
            zIndex: 1000
          }}
        >
          <WaitingRoomButton />
        </div>
      )}
      {readyToPrologue ? 
        <button onClick={goPrologue} className="game-start-host">
          GAME START
        </button>
      :
        <button className="game-start-host-wait">
          GAME START
        </button>
      }
    </div>
  );
}



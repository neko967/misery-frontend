'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home({ params }: { params: { slug: string } }) {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const router = useRouter();
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  const storyTexts = [
    '暗闇を切り裂いたのは、明かりの灯る窓へと急ぐ二人の足音だけだった。扉を抜けた瞬間、洋館からの脱出を意味する新鮮な空気が二人を包む。',
    '安堵の息を吐きながらも、心の片隅には、洋館で見た幻想のような一幕が残り続けていた。',
    '「あの女の子はなんだったのだろう？」',
    '探検を終えた安堵感に浸りつつも、二人の間には共有された未解決の疑問が浮かび上がる。彼らの背後で、そっと閉じる洋館の扉。',
    '脱出した二人は、朝焼けが空をわずかに染め始める中、静けさの中を歩みを進める。一件の冒険が幕を閉じたが、あの女の子の謎だけが、今も彼らの心に静かに残る。',
    'しかし、彼らは知っていた。あの洋館に隠された物語の断片を、もしかしたら決して全ては解き明かせないかもしれないと。',
    '手を取り合い、生きた証を探し求めた二人の旅は、新たな物語の始まりを予感させながら、早朝の薄明かりの中、静かにその幕を閉じるのだった。',
  ];

  const nextText = () => {
    setCurrentTextIndex((prevIndex) => prevIndex + 1);
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
        };

        return () => {
          websocket.close();
        };
      }
    }

    checkRoomExists();
  }, [params.slug]);

  async function goCreditsDirty() {
    router.push(`/credits/dirty/${params.slug}`);
  }
  
  useEffect(() => {
    router.prefetch(`/credits/dirty`);
  }, [])

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
          onClick={goCreditsDirty}
          className="end-button"
        >
          ▶▶ The End.
        </button>
      )}
    </div>
  );
}

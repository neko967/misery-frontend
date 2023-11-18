'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home({ params }: { params: { slug: string } }) {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const router = useRouter();

  function TwitterIcon() {
    return (
      <svg viewBox="0 0 24 24" width="24" height="24">
        <g>
          <path d="M14.258 10.152L23.176 0h-2.113l-7.747 8.813L7.133 0H0l9.352 13.328L0 23.973h2.113l8.176-9.309 6.531 9.309h7.133zm-2.895 3.293l-.949-1.328L2.875 1.56h3.246l6.086 8.523.945 1.328 7.91 11.078h-3.246zm0 0" fill="#FFF" />
        </g>
      </svg>
    );
  }

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

  return (
    <div
      className="h-screen w-full bg-cover"
      style={{ backgroundImage: "url('/credits.png')" }}
    >
      <div className="thanks-message">
        Thank You For Playing!!
      </div>
     
      {/* Twitterリンク */}
      <button className="icon"
              onClick={() => {
                const tweetOptions = [
                  "この館の残影に、闇よりも深い秘密が眠る。",
                  "彼らが挑む、過去の鎖を断ち切る試練。",
                  "生ける者に告ぐ、彼女の闇に踏み入るな。",
                  "彼女の呪縛は永遠なり、その呼び声に応える者は…。",
                  "亡霊少女の遊戯、その終わりなき螺旋。",
                  "破滅を招く少女、その影が映すは真か謎か。",
                  "彼らの運命は交錯し、一人の少女と邂逅する。",
                  "館は語る、千年の孤独を、少女の絶望を。",
                  "館に響くは、禁断の詠唱。",
                  "屋敷の門を開く者、永遠の闇に囚われん。",
                  "逃れがたき呪縛の館、あなたは真実を見つけ出せるか。",
                  "この洋館に響くは、悲劇のメロディー。彼女の声が導く、終焉のダンスへ。",
                  "閉ざされた扉の向こうに、彼女は不死の孤独を紡ぐ。",
                  "遺されし館の呪い、静寂が叫びに変わる時。",
                  "暗闇に浮かぶ一筋の光、それは彼女の怨嗟か、救済か。",
                  "彼女の名を呼ぶは、禁断を犯すこと。",
                  "二人が目撃する闇は、時を超えし絶望の追憶。",
                  "古の呪いが呼び覚ます、彼女の叫びを此処で聴け。",
                  "館にうごめく、絶望の鎮魂歌。",
                  "閉じ込められた過去が今、現実を織りなす枷となる。",
                  "彼女の悲鳴は、夜の帳を切り裂く禁断の調べ。",
                  
                  
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

      <div className="absolute bottom-20 left-20 text-xl">
        <p>Normal End: 少女の謎</p>
      </div>

      {/* トップページへのリンク */}
      <Link href="/"
        className="end-button">
        TOPページに戻る
      </Link>
    </div>
  );
}



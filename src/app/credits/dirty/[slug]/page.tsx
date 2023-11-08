'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TwitterIcon from '@mui/icons-material/Twitter';

export default function Home({ params }: { params: { slug: string } }) {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const router = useRouter();

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
      <div 
  className="thanks-message"
>
  Thank You For Playing!!
</div>
      {/* Twitterリンク */}
      {/* Twitterリンク */}
      <button className="icon"
      
        onClick={() => {
          const tweetText = "脱出成功したよ。遊んでくれてありがと👻 #Misery";
    
          // サイトのURL
          const url = window.location.origin;
      
          // ツイートに含める画像のURL
          const imageUrl = `${url}/img/tweet-image.png`; 
      
          // Twitter Intentで画像とテキストを含めてツイート
          window.open(
            `https://twitter.com/intent/tweet?text=${tweetText}&url=${url}&hashtags=Misery&media=${imageUrl}`,
             '_blank' 
           );
      
        }}
      >
          <TwitterIcon />  
      </button>

      {/* トップページへのリンク */}
      <Link href="/"
        className="end-button">
        トップページに戻る
      </Link>
    </div>
  );
}



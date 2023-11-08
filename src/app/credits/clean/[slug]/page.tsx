'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TwitterIcon from '@mui/icons-material/Twitter';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome' 
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { randomBytes } from 'crypto';

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





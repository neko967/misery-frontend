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
      {/* Twitterリンク */}
      <button className="absolute top-2/4 left-1/2 transform -translate-x1/2 -translate-y-1/2 bg-red-600 p-5 rounded-lg shadow-lg"
        onClick={() => {
        const tweetText = "Thankyou!!脱出成功したよ！遊んでくれてありがとう👻みんなもチャレンジしてみてね！#Misery"
        const url = window.location.origin;
            window.open(
              `https://twitter.com/intent/tweet?text=${tweetText}%0A%0A${url}`,
              '_blank'
            );
          }}
        >
          <TwitterIcon />
      </button>

      {/* トップページへのリンク */}
      <Link href="/"
        className="absolute top-3/4 left-1/2 transform -translate-x1/2 -translate-y-1/2 bg-red-600 p-5 rounded-lg shadow-lg">
        トップページに戻る
      </Link>
    </div>
  );
}



'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'

export default function Home({ params }: { params: { slug: string } }) {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const router = useRouter();
  const [readyToPrologue, setReadyToPrologue] = useState(false);

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
  async function goMysteryClean() {
    router.push(`/mystery/clean/${params.slug}`);
  }

  async function goMysteryDirty() {
    router.push(`/mystery/dirty/${params.slug}`);
  }

  return (
    <div
      className="h-screen w-full bg-cover"
      style={{ backgroundImage: "url('/background.png')" }}
    >
      <button onClick={goMysteryClean}
              className="absolute top-3/4 left-1/3 transform -translate-x-1/2 -translate-y-1/2 bg-red-600 p-5 rounded-lg shadow-lg">
        謎解き 綺麗な部屋に行く（作業用）
      </button>
      <button onClick={goMysteryDirty}
              className="absolute top-3/4 left-2/3 transform -translate-x-1/2 -translate-y-1/2 bg-red-600 p-5 rounded-lg shadow-lg">
        謎解き さびれた部屋に行く（作業用）
      </button>
      {readyToPrologue &&
        <button onClick={goPrologue}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-600 p-5 rounded-lg shadow-lg">
          ゲームスタート
        </button>
      }
      <p>コード：{params.slug}</p>
    </div>
  );
}



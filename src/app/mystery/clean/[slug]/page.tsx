'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home({ params }: { params: { slug: string } }) {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const router = useRouter();
  const [isCleanDoorOpen, setIsCleanDoorOpen] = useState(false);
  const [isDirtyDoorOpen, setIsDirtyDoorOpen] = useState(false);

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
          if (event.data == "openCleanDoor") {
            setIsCleanDoorOpen(true);
          } else if (event.data == "openDirtyDoor") {
            setIsDirtyDoorOpen(true);
          }
        };

        return () => {
          websocket.close();
        };
      }
    }

    checkRoomExists();
  }, [params.slug]);

  async function openDirtyDoor() {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send('openDirtyDoor');
    }
  }

  async function goMazeClean() {
    if (isDirtyDoorOpen) {
      router.push(`/maze/clean/${params.slug}`);
    } else {
      alert("相方を置いていくわけにはいかない！");
    }
  }

  return (
    <div
      className="h-screen w-full bg-cover"
      style={{ backgroundImage: "url('/background.png')" }}
    >
      {!isDirtyDoorOpen &&
        <button onClick={openDirtyDoor}
                className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-600 p-5 rounded-lg shadow-lg">
          相手のドアの鍵を開ける
        </button>
      }
      {isCleanDoorOpen &&
        <button onClick={goMazeClean}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-600 p-5 rounded-lg shadow-lg">
        部屋から出る
      </button>
      }
    </div>
  );
}



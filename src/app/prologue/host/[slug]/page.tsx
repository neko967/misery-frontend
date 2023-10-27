'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type RoomState = 'clean' | 'dirty';

export default function Home({ params }: { params: { slug: string } }) {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const router = useRouter();
  const [hostWhichRoom, setHostWhichRoom] = useState<RoomState>();
  const [guestWhichRoom, setGuestWhichRoom] = useState<RoomState>();

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
          if (event.data == "goMystery") {
            if (hostWhichRoom == 'clean') {
              router.push(`/mystery/clean/${params.slug}`);
            } else if (hostWhichRoom == 'dirty') {
              router.push(`/mystery/dirty/${params.slug}`);
            }
          } else if (event.data == "hostMysteryClean") {
            setHostWhichRoom('clean');
          } else if (event.data == "hostMysteryDirty") {
            setHostWhichRoom('dirty');
          } else if (event.data == "guestMysteryClean") {
            setGuestWhichRoom('clean');
          } else if (event.data == "guestMysteryDirty") {
            setGuestWhichRoom('dirty');
          }
        };

        return () => {
          websocket.close();
        };
      }
    }

    checkRoomExists();
  }, [params.slug, hostWhichRoom, guestWhichRoom]);

  async function clickMysteryClean() {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send('hostMysteryClean');
    }
  }

  async function clickMysteryDirty() {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send('hostMysteryDirty');
    }
  }

  async function goMystery() {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send('goMystery');
    }
  }

  return (
    <div
      className="h-screen w-full bg-cover"
      style={{ backgroundImage: "url('/background.png')" }}
    >
      <button onClick={clickMysteryClean}
              className="indicator absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-600 p-5 rounded-lg shadow-lg">
        <div>綺麗な部屋に入る</div>
        {hostWhichRoom == 'clean' &&
          <span className="indicator-item indicator-start badge badge-secondary"></span>
        }
        {guestWhichRoom == 'clean' &&
          <span className="indicator-item badge badge-primary"></span>
        }
      </button>
      <button onClick={clickMysteryDirty}
              className="indicator absolute top-2/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-600 p-5 rounded-lg shadow-lg">
        <div>さびれた部屋に入る</div>
        {hostWhichRoom == 'dirty' &&
          <span className="indicator-item indicator-start badge badge-secondary"></span>
        }
        {guestWhichRoom == 'dirty' &&
          <span className="indicator-item badge badge-primary"></span>
        }
      </button>
      {hostWhichRoom && guestWhichRoom && (hostWhichRoom != guestWhichRoom) &&
        <button onClick={goMystery}
                className="absolute top-3/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-600 p-5 rounded-lg shadow-lg">
          ゲームスタート
        </button>
      }
    </div>
  );
}



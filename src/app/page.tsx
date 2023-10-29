'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'

type Room = {
  name: string;
  id: number;
};

export default function Home() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const router = useRouter();

  async function createRoom() {
    var S="ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    var N=6
    const name = Array.from(Array(N)).map(()=>S[Math.floor(Math.random()*S.length)]).join('')
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_HTTP_URL}/api/create-room/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    const newRoom = await response.json();
    setRooms([...rooms, newRoom]);

    if (newRoom.name) {
      router.push(`/waiting_room/host/${newRoom.name}`);
    } else {
      console.error('Failed to get the room id from the response');
    }
  }

  async function joinRoom() {
    const name = prompt("部屋のコードを入力してください");
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_HTTP_URL}/api/join-room/${name}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (response.ok) {
      const data = await response.json();
      const roomName = data.name;
      alert("Successfully joined the room");
      router.push(`/waiting_room/guest/${roomName}`);
    } else {
      alert("Failed to join the room");
    }
  }

  return (
    <div
      className="h-screen w-full bg-cover"
      style={{ backgroundImage: "url('/background.png')" }}
    >
      {/* <Link href="/waiting_room"
            className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-600 p-5 rounded-lg shadow-lg">
        <button>ゲームを始める</button>
      </Link> */}
      <div className="absolute top-8 flex animate-flicker-5">
        <div className="font-horror2 ml-10 text-9xl">M</div><div className="font-horror1 text-9xl">ISE</div><div className="font-horror2 text-9xl">R</div><div className="font-horror4 text-9xl">Y</div>
      </div>
      {/* <button onClick={createRoom}
              className="btn glass">
        部屋を作る
      </button>
      <button onClick={joinRoom}
              className="btn glass">
        部屋に入る
      </button> */}
    </div>
  );
}



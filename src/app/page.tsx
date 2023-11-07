'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'
import { GetWindowSize } from "../hooks/GetWindowSize";

type Room = {
  name: string;
  id: number;
};

export default function Home() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const router = useRouter();
  const { height, width } = GetWindowSize();

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
      alert("部屋に入れました!");
      router.push(`/waiting_room/guest/${roomName}`);
    } else {
      alert("部屋が見つかりませんでした...");
    }
  }

  return (
    <div
      className="h-screen w-full bg-cover"
      style={{ backgroundImage: "url('/background.png')" }}
    >
      <div className="fixed top-8 flex animate-flicker-5">
        <div className="font-horror2 ml-10 text-9xl">M</div><div className="font-horror1 text-9xl">ISE</div><div className="font-horror2 text-9xl">R</div><div className="font-horror4 text-9xl">Y</div>
      </div>
      <div className="absolute right-10 bottom-10 gap-4 flex flex-col ">
        <button onClick={createRoom}
                className="font-horror2 ml-10 text-3xl">
        NEW GAME
        </button>
        <button onClick={joinRoom}
                className="font-horror2 ml-10 text-3xl">
        JOIN ROOM
        </button>
      </div>
      
    </div>
  );
}



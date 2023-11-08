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
    const name = prompt("招待コードを入力してください");
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
      <div className="relative ml-0">
      <div className="fixed top-[-30px] ml-10 flex animate-flicker-5 pt-0">
        <div className="font-horror2 ml-4  text-[min(20vw,130px)]">M</div>
        <div className="font-horror1 text-[min(20vw,130px)]">ISE</div>
        <div className="font-horror2 text-[min(20vw,130px)]">R</div>
        <div className="font-horror4 text-[min(20vw,130px)]">Y</div>
      </div>
      </div>
      <div className="absolute top-80 right-90 bottom-60 gap-4 flex flex-col ">
        <button onClick={createRoom}
                className="font-horror2 my-5 ml-10 mr-50  text-7xl">
        NEW GAME
        </button>
        <button onClick={joinRoom}
                className="font-horror2 ml-20 mr-10  text-7xl">
        JOIN ROOM
        </button>
      </div>
      
    </div>
  );
}



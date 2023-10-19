'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Room = {
  name: string;
  password: string;
  id: number;
};

export default function Home() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const router = useRouter();

  async function createRoom() {
    const name = prompt("Enter room name");
    const password = prompt("Enter room password");
    const response = await fetch(`${process.env.NEXT_PUBLIC_HTTP_URL}/api/create-room/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, password }),
    });
    const newRoom = await response.json();
    setRooms([...rooms, newRoom]);

    if (newRoom.name) {
      router.push(`/room/dealer/${newRoom.name}`);
    } else {
      console.error('Failed to get the room id from the response');
    }
  }

  async function joinRoom(id: number) {
    const password = prompt("パスワードを入力してください");
    const response = await fetch(`${process.env.NEXT_PUBLIC_HTTP_URL}/api/join-room/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (response.ok) {
      const data = await response.json();
      const roomName = data.name;
      alert("Successfully joined the room");
      router.push(`/room/player/${roomName}`);
    } else {
      alert("Failed to join the room");
    }
  }

  useEffect(() => {
    async function fetchRooms() {
      const response = await fetch(`${process.env.NEXT_PUBLIC_HTTP_URL}/api/list-rooms/`);
      if (!response.ok) {
        console.error('Failed to fetch rooms:', response.statusText);
        return;
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        console.error('Unexpected response data:', data);
        return;
      }
      setRooms(data);
    }

    fetchRooms();
  }, []);


  return (
    <div>
      <button onClick={createRoom}>部屋を作成する？</button>
      <ul>
        {rooms.map(room => (
          <li key={room.id}>
            {room.name} <button onClick={() => joinRoom(room.id)}>部屋に入る</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
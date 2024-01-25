'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Image from "next/image";
import localImage from "../../public/how_to_play.png";

type Room = {
  name: string;
  id: number;
};

export default function Home() {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
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
    const name = prompt("招待コードを入力してください");
    if (name === "MISERY") {
      alert("ようこそ...");
      router.push(`/misery`);
      return;
    }
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
        <div className="fixed ml-14 flex animate-flicker-5 pt-0">
          <div className="font-horror2 text-[min(20vw,50px)] md:text-[min(20vw,130px)] text-white">M</div>
          <div className="font-horror1 text-[min(20vw,50px)] md:text-[min(20vw,130px)] text-white">ISE</div>
          <div className="font-horror2 text-[min(20vw,50px)] md:text-[min(20vw,130px)] text-white">R</div>
          <div className="font-horror4 text-[min(20vw,50px)] md:text-[min(20vw,130px)] text-white">Y</div>
        </div>
      </div>
      <div className="absolute top-24 md:top-60 right-90 gap-4 flex flex-col ">
        <button onClick={createRoom}
                className="font-horror2 my-2.5 mx-10 text-3xl md:text-7xl text-white">
          NEW GAME
        </button>
        <button onClick={joinRoom}
                className="font-horror2 my-2.5 mx-10 text-3xl md:text-7xl text-white">
          JOIN ROOM
        </button>
        <div>
          <button onClick={handleOpen}
                  className="font-horror2 my-2.5 mx-10 text-3xl md:text-7xl text-white"
          >
            HOW TO PLAY
          </button>
          <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box className="absolute top-1/2 left-1/2 translate-x-[calc(-50%)] translate-y-[calc(-50%)] w-full sm:w-1/2 md:w-2/3 border-2 border-solid border-black shadow">
              <Image src={localImage} alt="HowToPlay"  />
            </Box>
          </Modal>
        </div>
      </div>
    </div>
  );
}



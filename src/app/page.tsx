import { useRouter } from 'next/navigation';
import Link from 'next/link'

export default function Home() {
  return (
    <div
      className="h-screen w-full bg-cover"
      style={{ backgroundImage: "url('/background.png')" }}
    >
      <Link href="/maze_waiting_room" className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-600 p-5 rounded-lg shadow-lg">
        <button>ゲームを始める</button>
      </Link>
    </div>
  );
}
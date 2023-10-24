import { useRouter } from 'next/navigation';
import Link from 'next/link'

export default function Home() {
  return (
    <div
      className="h-screen w-full bg-cover"
      style={{ backgroundImage: "url('/background.png')" }}
    >
      <Link href="/mystery/clean" className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-600 p-5 rounded-lg shadow-lg">
        <button>綺麗な部屋に入る</button>
      </Link>
      <Link href="/mystery/dirty" className="absolute top-2/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-600 p-5 rounded-lg shadow-lg">
        <button>さびれた部屋に入る</button>
      </Link>
    </div>
  );
}



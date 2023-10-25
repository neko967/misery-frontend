import { useRouter } from 'next/navigation';
import Link from 'next/link'

export default function Home() {
  return (
    <div
      className="h-screen w-full bg-cover"
      style={{ backgroundImage: "url('/background.png')" }}
    >
      <h1 className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-orange-600 p-5 rounded-lg shadow-lg">
        謎解きの作業場所 app/mystery_temp/clean/page.tsx
      </h1>
      <Link href="/maze/clean" className="absolute top-2/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-600 p-5 rounded-lg shadow-lg">
        <button>部屋から出る</button>
      </Link>
    </div>
  );
}



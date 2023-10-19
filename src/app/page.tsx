import { useRouter } from 'next/navigation';

export default function Home() {
  return (
    <div
      className="h-screen w-full bg-cover"
      style={{ backgroundImage: "url('/background.png')" }}
    >
      {/* その他のコンテンツ */}
    </div>
  );
}
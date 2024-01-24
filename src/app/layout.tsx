import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Analytics } from '@vercel/analytics/react'; //ここを追加
import GoogleAnalytics from '@/components/GoogleAnalytics'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://misery-seven.vercel.app/'),
  title: 'Misery | Horror Cooperative Escape Game',
	description: 'PCブラウザ専用のホラー協力型脱出ゲーム', 
	openGraph: {
		title: 'Misery | Horror Cooperative Escape Game',
		description: 'PCブラウザ専用のホラー協力型脱出ゲーム',
	},
	twitter: {
		title: 'Misery | Horror Cooperative Escape Game',
		description: 'PCブラウザ専用のホラー協力型脱出ゲーム',
		card: 'summary_large_image',
	},
};

export default function RootLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <html lang='en'>
	  <head>
		<GoogleAnalytics />
	  </head>
	  <body>{children}</body>
	</html>
  )
}

import Head from 'next/head';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Nādajaal</title>
      </Head>
      <div className="min-h-screen bg-gray-50 text-gray-900 p-6 font-serif" style={{ fontFamily: "'EB Garamond', serif" }}>
        <nav className="mb-6">
          <button onClick={() => router.push('/basics')} className="mr-4 px-4 py-2 bg-gray-200 rounded">
            Basics
          </button>
          <button onClick={() => router.push('/binaurals')} className="mr-4 px-4 py-2 bg-gray-200 rounded">
            Binaurals
          </button>
          <button onClick={() => router.push('/control-panel')} className="px-4 py-2 bg-gray-200 rounded">
            Control Panel
          </button>
        </nav>
        <h1 className="text-3xl font-bold">Welcome to Nādajaal</h1>
        <p className="mt-4">Explore the world of sound and visualization.</p>
      </div>
    </>
  );
}

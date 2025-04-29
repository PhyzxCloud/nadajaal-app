import { Button } from '@/components/ui/button';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  const navigateTo = (page: string) => {
    router.push(`/${page}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex items-center justify-center font-serif" style={{ fontFamily: "'EB Garamond', serif" }}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 max-w-4xl">
        <Button onClick={() => navigateTo('basics')} className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg shadow-md transition-colors">
          Basics
        </Button>
        <Button onClick={() => navigateTo('binaurals')} className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg shadow-md transition-colors">
          Binaurals
        </Button>
        <Button onClick={() => navigateTo('control-panel')} className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg shadow-md transition-colors">
          Tone Settings
        </Button>
      </div>
    </div>
  );
}

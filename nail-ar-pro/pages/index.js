import dynamic from 'next/dynamic';
import Head from 'next/head';

const NailTryOn = dynamic(() => import('../components/NailTryOn'), {
  ssr: false,
  loading: () => (
    <div style={{
      width: '100vw', height: '100dvh',
      background: '#0D0D1A',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 16,
    }}>
      <div className="spinner" />
      <p style={{ color: '#FFB3D1', fontSize: 14, letterSpacing: 1, textTransform: 'uppercase' }}>
        Loading AR Engine…
      </p>
    </div>
  ),
});

export default function Home() {
  return (
    <>
      <Head>
        <title>💅 NailAR Pro — AI Virtual Try-On</title>
        <meta name="description" content="Real-time AI-powered nail art virtual try-on using MediaPipe hand tracking. See how nail designs look on your hands instantly." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <NailTryOn />
    </>
  );
}

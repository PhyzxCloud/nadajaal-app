import '../styles/globals.css';
  import '../styles/tailwind.css'; // Import the generated CSS
  import type { AppProps } from 'next/app';

  function MyApp({ Component, pageProps }: AppProps) {
    return <Component {...pageProps} />;
  }

  export default MyApp;

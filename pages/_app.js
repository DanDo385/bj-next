// pages/_app.js

import GameProvider from "../context/GameProvider";
import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
  return (
    <GameProvider>
      <Component {...pageProps} />
    </GameProvider>
  );
}

export default MyApp;
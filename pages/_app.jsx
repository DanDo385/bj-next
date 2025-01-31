// pages/_app.js

import GameProvider from "../context/GameProvider";
import "../styles/globals.css";
import CardCount from "../components/CardCount";

function MyApp({ Component, pageProps }) {
  return (
    <GameProvider>
      <div className="relative min-h-screen">
        <CardCount />
        <Component {...pageProps} />
      </div>
    </GameProvider>
  );
}

export default MyApp;
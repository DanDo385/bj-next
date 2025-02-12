// pages/_app.js
// This is the main application wrapper component that provides global state and styling

import GameProvider from "../context/GameProvider";
import "../styles/globals.css";
import CardCount from "../components/CardCount";

/**
 * MyApp component that wraps the entire application
 * @param {Object} props - Component props
 * @param {React.Component} props.Component - The active page component
 * @param {Object} props.pageProps - Props passed to the page component
 * @returns {JSX.Element} Wrapped application with game context and layout
 */
function MyApp({ Component, pageProps }) {
  return (
    <GameProvider>
      {/* Main container with minimum full viewport height */}
      <div className="relative min-h-screen">
        {/* Card counting display component */}
        <CardCount />
        {/* Active page component with its props */}
        <Component {...pageProps} />
      </div>
    </GameProvider>
  );
}

export default MyApp;
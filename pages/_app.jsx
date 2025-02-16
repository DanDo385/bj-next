// pages/_app.js
// This is the main application wrapper component that provides styling

import "../styles/globals.css";

/**
 * MyApp component that wraps the entire application
 * @param {Object} props - Component props
 * @param {React.Component} props.Component - The active page component
 * @param {Object} props.pageProps - Props passed to the page component
 * @returns {JSX.Element} Wrapped application with layout
 */
function MyApp({ Component, pageProps }) {
  return (
    <div className="relative min-h-screen">
      {/* Active page component with its props */}
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;
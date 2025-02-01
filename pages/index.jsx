// pages/index.js

import GameBoard from '../components/GameBoard';
import CardCount from '../components/CardCount';

const Home = () => {
  return (
    <div className="min-h-screen bg-green-800 flex flex-col items-center">
      <div className="w-full flex justify-center mt-4">
        <CardCount />
      </div>
      <div className="flex-grow flex items-center justify-center">
        <GameBoard />
      </div>
    </div>
  );
};

export default Home;

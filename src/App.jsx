import React, { useState, useEffect, useCallback } from 'react';
import { Dices, Users, RotateCcw, Play } from 'lucide-react';

// Game configuration
const BOARD_SIZE = 100;
const SNAKES = {
  98: 28, 95: 24, 92: 51, 83: 19, 73: 1,
  69: 33, 64: 36, 59: 17, 52: 11, 48: 9
};

const LADDERS = {
  4: 56, 12: 50, 14: 55, 22: 58, 41: 79,
  54: 88, 63: 80, 70: 90, 80: 100
};

const PLAYER_COLORS = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B'];
const PLAYER_NAMES = ['Red', 'Blue', 'Green', 'Yellow'];

const SnakeLadderGame = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [numPlayers, setNumPlayers] = useState(2);
  const [playerTypes, setPlayerTypes] = useState(['human', 'human']);
  const [players, setPlayers] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [diceValue, setDiceValue] = useState(null);
  const [rolling, setRolling] = useState(false);
  const [winner, setWinner] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (gameStarted && playerTypes[currentPlayer] === 'cpu' && !winner && !rolling) {
      const timer = setTimeout(() => rollDice(), 1000);
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, gameStarted, winner, rolling, playerTypes]);

  const startGame = () => {
    const newPlayers = Array.from({ length: numPlayers }, (_, i) => ({
      id: i,
      name: PLAYER_NAMES[i],
      position: 0,
      color: PLAYER_COLORS[i],
      type: playerTypes[i]
    }));
    setPlayers(newPlayers);
    setCurrentPlayer(0);
    setDiceValue(null);
    setWinner(null);
    setMessage(`${PLAYER_NAMES[0]}'s turn`);
    setGameStarted(true);
  };

  const resetGame = () => {
    setGameStarted(false);
    setPlayers([]);
    setCurrentPlayer(0);
    setDiceValue(null);
    setWinner(null);
    setMessage('');
  };

  const rollDice = useCallback(() => {
    if (rolling || winner) return;
    
    setRolling(true);
    setMessage('Rolling...');
    
    let rolls = 0;
    const rollInterval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      rolls++;
      if (rolls >= 8) {
        clearInterval(rollInterval);
        const finalRoll = Math.floor(Math.random() * 6) + 1;
        setDiceValue(finalRoll);
        movePlayer(finalRoll);
      }
    }, 100);
  }, [rolling, winner, players, currentPlayer]);

  const movePlayer = (roll) => {
    const player = players[currentPlayer];
    let newPosition = player.position + roll;
    
    if (newPosition > BOARD_SIZE) {
      setMessage(`${player.name} needs exactly ${BOARD_SIZE - player.position} to win!`);
      setRolling(false);
      setTimeout(() => nextTurn(), 1500);
      return;
    }

    const updatedPlayers = [...players];
    updatedPlayers[currentPlayer] = { ...player, position: newPosition };
    setPlayers(updatedPlayers);

    setTimeout(() => {
      let finalPosition = newPosition;
      let moveMsg = `${player.name} rolled ${roll}`;

      if (SNAKES[newPosition]) {
        finalPosition = SNAKES[newPosition];
        moveMsg += ` 🐍 Snake! Slide to ${finalPosition}`;
      } else if (LADDERS[newPosition]) {
        finalPosition = LADDERS[newPosition];
        moveMsg += ` 🪜 Ladder! Climb to ${finalPosition}`;
      }

      const finalPlayers = [...updatedPlayers];
      finalPlayers[currentPlayer] = { ...player, position: finalPosition };
      setPlayers(finalPlayers);

      if (finalPosition === BOARD_SIZE) {
        setWinner(player);
        setMessage(`🎉 ${player.name} wins!`);
        setRolling(false);
      } else {
        setMessage(moveMsg);
        setRolling(false);
        setTimeout(() => nextTurn(), 1500);
      }
    }, 600);
  };

  const nextTurn = () => {
    if (winner) return;
    const next = (currentPlayer + 1) % numPlayers;
    setCurrentPlayer(next);
    setDiceValue(null);
    setMessage(`${PLAYER_NAMES[next]}'s turn`);
  };

  const handleKeyPress = useCallback((e) => {
    if (e.code === 'Space' && gameStarted && !winner && playerTypes[currentPlayer] === 'human') {
      e.preventDefault();
      rollDice();
    } else if (e.code === 'Enter' && !gameStarted) {
      startGame();
    }
  }, [gameStarted, winner, currentPlayer, playerTypes, rollDice]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const renderBoard = () => {
    const squares = [];
    for (let row = 9; row >= 0; row--) {
      for (let col = 0; col < 10; col++) {
        const num = row % 2 === 1 
          ? row * 10 + (10 - col)
          : row * 10 + col + 1;
        
        const isSnake = SNAKES[num];
        const isLadder = LADDERS[num];
        const playersHere = players.filter(p => p.position === num);

        squares.push(
          <div
            key={num}
            className={`relative flex flex-col items-center justify-center border border-gray-300 text-xs font-semibold
              ${isSnake ? 'bg-red-100' : isLadder ? 'bg-green-100' : num % 2 === 0 ? 'bg-blue-50' : 'bg-white'}
              ${num === BOARD_SIZE ? 'bg-yellow-200 text-lg' : ''}`}
            style={{ aspectRatio: '1' }}
          >
            <span className="absolute top-0.5 left-1 text-gray-600">{num}</span>
            {isSnake && (
              <div className="flex flex-col items-center">
                <span className="text-lg">🐍</span>
                <span className="text-xs text-red-700 font-bold">→{isSnake}</span>
              </div>
            )}
            {isLadder && (
              <div className="flex flex-col items-center">
                <span className="text-lg">🪜</span>
                <span className="text-xs text-green-700 font-bold">→{isLadder}</span>
              </div>
            )}
            {playersHere.length > 0 && (
              <div className="absolute bottom-1 flex gap-0.5">
                {playersHere.map(p => (
                  <div
                    key={p.id}
                    className="w-4 h-4 rounded-full border-2 border-white shadow"
                    style={{ backgroundColor: p.color }}
                    title={p.name}
                  />
                ))}
              </div>
            )}
          </div>
        );
      }
    }
    return squares;
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">🎲 Snake & Ladder</h1>
            <p className="text-gray-600">Classic board game for 2-4 players</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Players
              </label>
              <div className="flex gap-2">
                {[2, 3, 4].map(n => (
                  <button
                    key={n}
                    onClick={() => {
                      setNumPlayers(n);
                      setPlayerTypes(Array(n).fill('human'));
                    }}
                    className={`flex-1 py-3 rounded-lg font-semibold transition
                      ${numPlayers === n 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Player Types
              </label>
              {Array.from({ length: numPlayers }, (_, i) => (
                <div key={i} className="flex items-center gap-3 mb-2">
                  <div 
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: PLAYER_COLORS[i] }}
                  />
                  <span className="w-16 font-medium">{PLAYER_NAMES[i]}</span>
                  <select
                    value={playerTypes[i]}
                    onChange={(e) => {
                      const newTypes = [...playerTypes];
                      newTypes[i] = e.target.value;
                      setPlayerTypes(newTypes);
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="human">Human</option>
                    <option value="cpu">CPU</option>
                  </select>
                </div>
              ))}
            </div>

            <button
              onClick={startGame}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-2 shadow-lg"
            >
              <Play size={24} />
              Start Game (Press Enter)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 p-2 sm:p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-3 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">🎲 Snake & Ladder</h1>
            <button
              onClick={resetGame}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition"
            >
              <RotateCcw size={20} />
              New Game
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
            <div className="lg:col-span-3">
              <div className="grid grid-cols-10 gap-0.5 sm:gap-1 bg-gray-200 p-1 rounded-lg">
                {renderBoard()}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-4 rounded-xl">
                <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <Users size={20} />
                  Players
                </h3>
                {players.map((player, i) => (
                  <div
                    key={player.id}
                    className={`flex items-center gap-2 p-2 rounded-lg mb-2 transition
                      ${i === currentPlayer && !winner ? 'bg-white shadow-md ring-2 ring-blue-400' : 'bg-white/50'}`}
                  >
                    <div 
                      className="w-6 h-6 rounded-full flex-shrink-0"
                      style={{ backgroundColor: player.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{player.name}</div>
                      <div className="text-xs text-gray-600">Position: {player.position}</div>
                    </div>
                    {player.type === 'cpu' && (
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded">CPU</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="bg-white p-4 rounded-xl border-2 border-gray-200">
                <div className="text-center mb-4">
                  <div className={`inline-block p-6 rounded-2xl transition-all duration-300 ${rolling ? 'animate-bounce bg-gradient-to-br from-red-400 to-yellow-400' : 'bg-gradient-to-br from-blue-400 to-purple-400'}`}>
                    <Dices size={48} className="text-white" />
                    {diceValue && (
                      <div className="text-4xl font-bold text-white mt-2">{diceValue}</div>
                    )}
                  </div>
                </div>

                {!winner && playerTypes[currentPlayer] === 'human' && (
                  <button
                    onClick={rollDice}
                    disabled={rolling}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-xl transition"
                  >
                    {rolling ? 'Rolling...' : 'Roll Dice (Space)'}
                  </button>
                )}

                {playerTypes[currentPlayer] === 'cpu' && !winner && (
                  <div className="text-center text-gray-600 font-semibold">
                    CPU thinking...
                  </div>
                )}

                <div className="mt-4 text-center text-sm font-semibold text-gray-700 min-h-[3rem] flex items-center justify-center">
                  {message}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600">
            <p className="mb-1"><strong>Rules:</strong> Roll the dice to move. Land on a ladder to climb up, or a snake to slide down. First to reach 100 wins!</p>
            <p><strong>Controls:</strong> Press Space to roll (human players) | Enter to start new game</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SnakeLadderGame;
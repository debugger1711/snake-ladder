🎲 Snake & Ladder Game
A classic Snake & Ladder board game built with React and Tailwind CSS.
Features

2-4 players (human or CPU)
Classic 100-square board with 10 snakes and 9 ladders
Smooth animations and responsive design
Keyboard shortcuts (Space to roll, Enter to start)

Quick Start
bashnpm install react react-dom lucide-react
npm start
How to Play

Choose number of players (2-4) and set each as Human or CPU
Roll the dice to move forward
Climb ladders up, slide down snakes
First player to reach exactly square 100 wins

Controls

Space: Roll dice (human players)
Enter: Start new game

Customization
Edit snake and ladder positions in the code:
javascriptconst SNAKES = { 98: 28, 95: 24, ... };
const LADDERS = { 4: 56, 12: 50, ... };
Change player colors:
javascriptconst PLAYER_COLORS = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B'];
Tech Stack
React • Tailwind CSS • Lucide React

Enjoy! 🎮

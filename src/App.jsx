import { useState,useEffect } from "react";
import "./App.css";
const getRandomTile= ()=>{
  const tiles=[2,3,4,6,8];
  return tiles[Math.floor(Math.random()*tiles.length)];
};

const getNeighbors = (index) => {
  const neighbors = [];

  const row = Math.floor(index / 4);
  const col = index % 4;

  if (row > 0) neighbors.push(index - 4);     // up
  if (row < 3) neighbors.push(index + 4);     // down
  if (col > 0) neighbors.push(index - 1);     // left
  if (col < 3) neighbors.push(index + 1);     // right

  return neighbors;
};

const mergeTiles = (a, b) => {
  if (a === b) return null;

  if (a > b && a % b === 0) {
    const result = a / b;
    return result === 1 ? null : result;
  }

  if (b > a && b % a === 0) {
    const result = b / a;
    return result === 1 ? null : result;
  }

  return "no-merge";
};
// adding a game over function
const isGameOver = (grid) => {
  // if empty cell exists → not over
  if (grid.includes(null)) return false;

  // check possible merges
  for (let i = 0; i < 16; i++) {
    const neighbors = getNeighbors(i);

    for (let n of neighbors) {
      const a = grid[i];
      const b = grid[n];

      if (a === b) return false;
      if (a > b && a % b === 0) return false;
      if (b > a && b % a === 0) return false;
    }
  }

  return true;
};

function App() {
  const [grid, setGrid] = useState([
    2, 4, null, null,
    3, null, null, null,
    null, null, 6, null,
    null, null, null, 8
  ]);
  const[queue,setQueue]=useState([2,3,4]);
  const [keep,setKeep]=useState(null);
  const[trashCount,setTrashCount]=useState(3)
  const[score,setScore]=useState(0);
  const[bestScore,setBestScore]=useState(()=>{
    return Number(localStorage.getItem("bestScore"))||0;
  });
const [gameOver,setGameOver]=useState(false);

  useEffect(()=>{
    if(score> bestScore){
      setBestScore(score);
      localStorage.setItem("bestScore",score);
    }
  },[score]);

  const handleCellclick=(index)=> {
    if (grid[index]!==null) return;

    const newGrid = [...grid];
    const currentTile=queue[0];
    newGrid[index]=currentTile;
     const neighbors = getNeighbors(index);

  neighbors.forEach((nIndex) => {
    const neighborValue = newGrid[nIndex];
    const currentValue = newGrid[index];

    if (neighborValue !== null) {
      const result = mergeTiles(currentValue, neighborValue);

      if (result === null) {
        newGrid[index] = null;
        newGrid[nIndex] = null;
        setScore((prev)=>prev +1);
      } else if (result !== "no-merge") {
        newGrid[index] = result;
        newGrid[nIndex] = null;
        setScore((prev)=>prev + result);
      }
    }

  });
  const newQueue=[...queue.slice(1),getRandomTile()];
  setQueue(newQueue);
    
    setGrid(newGrid);
    if(isGameOver(newGrid)){
      setGameOver(true);
    }
  };

   const handleKeep = () => {
    if (queue.length === 0) return;

    const currentTile = queue[0];

    if (keep === null) {
      setKeep(currentTile);
      setQueue([...queue.slice(1), getRandomTile()]);
    } else {
      const newQueue = [keep, ...queue.slice(1)];
      setKeep(currentTile);
      setQueue(newQueue);
    }
  };
  const handleTrash=()=>{
    if (trashCount===0) return;
    const newQueue=[...queue.slice(1),getRandomTile()];
    setQueue(newQueue);
    setTrashCount(trashCount-1);
  };
  const handleRestart=()=>{
    setGrid([ 2, 4, null, null,
    3, null, null, null,
    null, null, 6, null,
    null, null, null, 8]);
  setQueue([2, 3, 4]);
  setKeep(null);
  setTrashCount(3);
  setScore(0);
  setGameOver(false);
  };


// render part 

  return (
     <div className="game-wrapper">

      {/* Background bubbles */}
      <div className="background">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>

      <h1 className="title">🐱 JUST DIVIDE</h1>

      <div className="game-area">

        
        <div className="board">
          <div className="score-bar">
            <div>LEVEL 1</div>
            <div>SCORE {score}</div>
          </div>

          <div className="grid">
            {grid.map((value, index) => (
              <div
                key={index}
                className={`cell ${value ? "tile-" + value : ""}`}
                onClick={() => handleCellclick(index)}
              >
                {value || ""}
              </div>
            ))}
          </div>
        </div>

        <div className="side-panel">
          <div className="keep-box" onClick={handleKeep}>
            {keep || "KEEP"}
          </div>

          <div className="queue-box">
            {queue.map((q, i) => (
              <div key={i} className="queue-tile">
                {q}
              </div>
            ))}
          </div>

          <div className="trash-box" onClick={handleTrash}>
            🗑️ x{trashCount}
          </div>
        </div>

      </div>
{gameOver&&(
  <div className="gameover-overlay">
    <div className="gameover-box">
      <h2>Game Over 😫</h2>
      <p>your score:{score}</p>
      <button onClick={handleRestart}>Restart</button>
    </div>
  </div>
)}

    </div>
    
  );
}

export default App;

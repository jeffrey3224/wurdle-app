import { generate } from "random-words";
import { useEffect, useState, useCallback } from "react";
import { FaDeleteLeft } from "react-icons/fa6";
import { AiOutlineEnter } from "react-icons/ai";
import { Flip, ToastContainer, toast } from "react-toastify";

type CellColor = "bg-green-500" | "bg-yellow-500" | "gray-200" | "zinc-800"

type Cell = {
  letter: string;
  color: CellColor;
  pendingColor?: CellColor;
}

const colorMap: Record<CellColor, string>={
  "bg-green-500": "bg-green-500",
  "bg-yellow-500": "bg-yellow-500",
  "gray-200": "bg-gray-200",
  "zinc-800": "bg-zinc-800 text-white",
}

export default function GameBoard() {
  const [rowLength, setRowLength] = useState<number>(5)
  const [randomWord, setRandomWord] = useState<string | null>("");
  const [board, setBoard] = useState<Cell[]>(
    Array.from({ length: 5 * rowLength }, () => ({ letter: "", color: "gray-200"}))
  )
  const [inputValue, setInputValue] = useState("")
  const [turn, setTurn] = useState(1);
  const [availableLetters, setAvailableLetters] = useState("qwertyuiopasdfghjklzxcvbnm".split("").map(l => ({
    letter: l,
    color: "text-black"})));
  const keyboardRows = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['enter', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'delete']
  ]
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(false);
  const [animatingRow, setAnimatingRow] = useState<number | null>(null);

  useEffect(() => {
    const newWord = generate({ minLength: rowLength, maxLength: rowLength });
    if (Array.isArray(newWord)) {
      setRandomWord(newWord.join(""));
    } else {
      setRandomWord(newWord);
    }
  }, [rowLength]);

  useEffect(() => {
    setBoard(Array.from({ length: 5 * rowLength }, () => ({ letter: "", color: "gray-200" })));
  }, [rowLength]);

  const position = (turn - 1) * rowLength

  useEffect(() => {
    if (gameOver) return;

    setBoard(prevBoard => {
      const newBoard = [...prevBoard];
  
      inputValue.split("").forEach((newLetter, index) => {
        newBoard[index + position] = {
          ...newBoard[index + position],
          letter: newLetter,  
        };
      });

      for (let i = inputValue.length; i < rowLength; i++) {
        newBoard[i + position] = {
          ...newBoard[i + position], 
          letter: ""
        }
      }
      return newBoard;
    });
  }, [inputValue, position, rowLength, gameOver]);

  const validateLetters = useCallback(() => {
    if (inputValue.length !== rowLength) 
      return toast(`Please enter a word with ${rowLength} letters.`);
    if (!randomWord) return;
  
    const isWinner = inputValue.toUpperCase() === randomWord.toUpperCase();
    const isLastTurn = turn === 5;
  
    if (isWinner) setWinner(true);
    if (isWinner || isLastTurn) setGameOver(true);

    const inputLetters = inputValue.toUpperCase().split("");
    const targetLetters = randomWord.toUpperCase().split("");
  
    setBoard(prevBoard => {
      const newBoard = [...prevBoard];
      const tempTarget = [...targetLetters];

      // green letters
      inputLetters.forEach((letter, index) => {
        const pos = position + index;
        if (letter === tempTarget[index]) {
          newBoard[pos] = { ...newBoard[pos], pendingColor: "bg-green-500" };
          tempTarget[index] = "";
        }
      });

      // yellow letters
      inputLetters.forEach((letter, index) => {
        const pos = position + index;
        if (!newBoard[pos].pendingColor && tempTarget.includes(letter)) {
          newBoard[pos] = { ...newBoard[pos], pendingColor: "bg-yellow-500" };
          tempTarget[tempTarget.indexOf(letter)] = "";
        }
      });

      // gray letters
      inputLetters.forEach((letter, index) => {
        const pos = position + index;
        if (!newBoard[pos].pendingColor) {
          newBoard[pos] = { ...newBoard[pos], pendingColor: "zinc-800" };
        }
      });

      return newBoard;
    });

    // update keyboard
    setAvailableLetters(prev =>
      prev.map(l => {
        const upperL = l.letter.toUpperCase();
        if (inputLetters.some((letter, idx) => letter === targetLetters[idx] && letter === upperL)) {
          return { ...l, color: "bg-green-500" };
        } else if (inputLetters.includes(upperL) && targetLetters.includes(upperL)) {
          return { ...l, color: "bg-yellow-500" };
        } else if (inputLetters.includes(upperL)) {
          return { ...l, color: "bg-zinc-800 text-white" };
        }
        return l;
      })
    );

    // animation indexing
    inputLetters.forEach((_, i) => {
      const revealIndex = position + i;
      setTimeout(() => {
        setBoard(prev =>
          prev.map((cell, idx) =>
            idx === revealIndex && cell.pendingColor
              ? { ...cell, color: cell.pendingColor, pendingColor: undefined }
              : cell
          )
        );
      }, i * 200 + 200);
    });

    setAnimatingRow(turn - 1);
    setTimeout(() => setAnimatingRow(null), rowLength * 300 + 100);
    setInputValue("");

    if (!isWinner && !isLastTurn) setTurn(turn + 1);
  }, [inputValue, position, randomWord, turn, rowLength]);

  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      if (gameOver) return;
      const key = e.key;
  
      if (/^[a-zA-Z]$/.test(key)) {
        setInputValue(prev => (prev.length < rowLength ? prev + key.toUpperCase() : prev));
      } else if (key === "Backspace") {
        setInputValue(prev => prev.slice(0, -1));
      } else if (key === "Enter") {
        validateLetters();
      }
    };
  
    window.addEventListener("keydown", handleKeys);
    return () => window.removeEventListener("keydown", handleKeys);
  }, [validateLetters, rowLength, gameOver]);

  // reset board
  const handleReset = () => {
    setRowLength(5);
    setGameOver(false);
    setInputValue("");
    setWinner(false);
    setTurn(1)
    setBoard(Array.from({ length: 5 * rowLength }, () => ({
      letter: "",
      color: "gray-200",
      pendingColor: undefined
    })));    
    setAvailableLetters("qwertyuiopasdfghjklzxcvbnm".split("").map(l => ({
      letter: l,
      color: "text-black"})));
    const newWord = generate({ minLength: 5, maxLength: 5});
    setRandomWord(Array.isArray(newWord) ? newWord.join("") : newWord);
  }

  return (
    <main>
      <ToastContainer 
        position="top-center"
        autoClose={5000} 
        hideProgressBar={true}
        newestOnTop={true}
        closeOnClick={true}
        theme="light"
        transition={Flip}
      />

      <div className={`w-full h-[100vh] flex flex-col items-center justify-center text-center space-y-2 absolute text-white text-4xl font-bold z-50 ${gameOver ? "final-overlay block" : "opacity-0 hidden"}`}>
          {gameOver 
            ? winner 
              ? <div>You win!</div>
              : <div>Game Over. The word was {randomWord}.</div> 
            : ""}
          <button onClick = {handleReset} className="border-2 border-white bg-white px-4 py-1 rounded-xl text-2xl text-black cursor-pointer">Replay</button>
      </div>
      <div className="w-full pt-5 flex items-center justify-center bg-zinc-800">
        <img src="/wurdle-new-full-2.svg" className="w-[15vw] max-w-[180px] min-w-[130px] mx-auto"/>
      </div>
      <div className="w-full h-10 bg-zinc-800 px-15 text-white text-lg items-center">
        <div className="w-full max-w-[600px] flex flex-row justify-between items-center h-full mx-auto">
          <div className="flex flex-row items-center">
              <h1 className="pr-2">Word Length: </h1>
              <select 
                value={rowLength}
                className="text-white"
                defaultValue={5}
                disabled={gameOver}
                onChange={e=>{
                  handleReset();
                  setRowLength(Number(e.target.value));
                }}>
                <option 
                  value={3}>3
                </option>
                <option
                  value={4}>4
                </option>
                <option 
                  value={5}>5
                </option>
                <option
                  value={6}>6
                </option>
                <option
                  value={7}>7
                </option>
              </select>
          </div>
          {`Turn: ${turn} / 5`}
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-2">
        <div className="flex flex-row justify-center mt-5">
          <div className="grid gap-2"
            style={{ gridTemplateColumns: `repeat(${rowLength}, minmax(0, 1fr))` }}>
            {board.map((cell, index) => {
              const cellWidth = `${Math.min(13, 100 / randomWord.length)}vw`;

              return (
              <div
                key={index}
                style = {{animationDelay: `${(index % rowLength) * .2}s`, width: cellWidth}}
                className={`border border-black w-${cellWidth} max-w-[70px] aspect-square text-4xl font-semibold flex items-center justify-center rounded-lg
                  ${animatingRow === Math.floor(index / rowLength) ? "animate-rotate" : ""}
                  ${colorMap[cell.color]}`}
              >
                {cell.letter.toUpperCase()}
              </div>)})}
          </div>
        </div>

        <div className="flex flex-col items-center mt-7">
          {keyboardRows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex">
              {row.map(letter => {
                const letterObj = availableLetters.find(l => l.letter === letter);

                const handleClick = () => {
                  if (letter === "enter") validateLetters();
                  else if (letter === "delete") setInputValue(prev => prev.slice(0, -1));
                  else setInputValue(prev => prev.length < rowLength ? prev + letter.toUpperCase() : prev);
                }

                return (
                  <button
                    key={letter}
                    value={letter}
                    onClick={handleClick}
                    disabled={gameOver || (letter !== "enter" && letter !== "delete" && inputValue.length >= rowLength)}
                    className={`w-[8vw] max-w-[45px] aspect-[4/5] border border-black rounded-lg shadow-xl m-[3px] py-2 flex items-center justify-center ${letterObj?.color || ''}`
                    }
                  >
                    {letter === "delete" ? <FaDeleteLeft size={16} /> : letter === "enter" ? <AiOutlineEnter size={16} /> : letter.toUpperCase()}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

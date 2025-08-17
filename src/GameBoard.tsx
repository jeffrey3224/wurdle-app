import { generate } from "random-words";
import { useEffect, useState } from "react";

type CellColor = "green-500" | "yellow-500" | "gray-200"

type Cell = {
  letter: string;
  color: CellColor;
  pendingColor?: CellColor;
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
  ['delete', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'enter']
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
  

  const validateLetters = () => {
    if (inputValue.length !== rowLength) {
      alert(`Please enter a guess that has ${rowLength} characters.`)
      return 
    }

    if (!randomWord) return;

    const isWinner = inputValue === randomWord;
    const isLastTurn = turn === 5;

    if (isWinner) setWinner(true)
    if (isWinner || isLastTurn) setGameOver(true)

    setBoard(prevBoard => {
      const newBoard = [...prevBoard];
      const randomWordArray = [...randomWord]
  
      {/* Checks if letter at index is a match*/}
      inputValue.split("").forEach((letter, index) => {
        if (letter === randomWordArray[index]) {
          newBoard[index + position] = {
            ...newBoard[index + position],
            letter,
            pendingColor: "green-500"
          };
          randomWordArray[index] = "";
        }
      });

        {/* if not a match, checks if included */}
       inputValue.split("").forEach((letter, index) => {
        if (
          letter !== randomWord[index] && randomWordArray.includes(letter)
        ) {
          newBoard[index + position] = {
            ...newBoard[index + position],
            letter,
            pendingColor: "yellow-500"
          };
          randomWordArray[randomWordArray.indexOf(letter)] = "";
        }
       })

       setAvailableLetters(prev =>
        prev.map(l => {
          if (inputValue.split("").some((letter, index) => letter === randomWord![index] && letter === l.letter)) {
            return { ...l, color: "bg-green-500" };
          } else if (inputValue.includes(l.letter) && randomWord!.includes(l.letter)) {
            return { ...l, color: "bg-yellow-500" };
          } else if (inputValue.includes(l.letter)) {
            return { ...l, color: "line-through bg-gray-500" };
          }
          return l;
        })
      );
      setTimeout(() => {
        setBoard(prev =>
          prev.map(cell =>
            cell.pendingColor
              ? { ...cell, color: cell.pendingColor, pendingColor: undefined }
              : cell
          )
        );
      }, 300);
      return newBoard;
    });

    setAnimatingRow(turn - 1);
    setTimeout(() => setAnimatingRow(null), rowLength * 250 + 600)
    setInputValue("")

    if (!isWinner && !isLastTurn) {
      setTurn(turn + 1)
    }
  };
  
  return (
    <main>
      <input 
        type="number"
        value={rowLength}
        min={3}
        max={7}
        disabled={gameOver}
        onChange={e=>setRowLength(Number(e.target.value))}
        className="border-2 border-black"
      />
      {`turn: ${turn} / 5`}
      <div className="flex flex-row justify-center">
        <div className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${rowLength}, minmax(0, 1fr))` }}>
        {board.map((cell, index) => {
          return (
            <div
            key={index}
            style = {{animationDelay: `${(index % rowLength) * .25}s`}}
            className={`border border-black w-[15vw] max-w-[70px] aspect-square text-5xl flex items-center justify-center rounded-lg ${animatingRow === Math.floor(index / rowLength) ? "animate-rotate" : ""} bg-${cell.color}`}
          >
            {cell.letter.toUpperCase()}
          </div>
          )
        })}
        </div>
      </div>
      <div className="flex flex-col items-center space-y-2 my-5">
        <input 
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value)
          }}
          className="border-black border w-[30vw] rounded-lg"
          autoFocus
          disabled={gameOver}
          maxLength={rowLength}
        />
        <button onClick={validateLetters} className="bg-black text-white rounded-lg p-1 w-[100px]">
          Check
        </button>
      </div>
      
      <div>
        {gameOver 
        ? winner 
        ? <div>You win!</div>
        : <div>Game Over. The word was {randomWord}.</div> 
        : ""}
      </div>
      <div className="flex flex-col items-center">
          {keyboardRows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex">
              {row.map(letter => {
                const letterObj = availableLetters.find(l => l.letter === letter);

                const handleClick = () => {
                  if (letter === "enter") {
                    validateLetters();
                  }

                  else if (letter === "delete") {
                    setInputValue(prev => prev.slice(0, -1))
                  }

                  else {
                    setInputValue(prev => prev.length < rowLength ? prev + letter.toLowerCase() : prev)
                  }
                }

                return (
                  <button
                    key={letter}
                    value={letter}
                    onClick={handleClick}
                    disabled={gameOver || (
                      letter !== "enter" &&
                      letter !== "delete" && 
                      inputValue.length >= rowLength
                    )}
                    className={(letter === "enter" || letter === "delete")
                      ? `px-2 border border-black rounded-lg shadow-xl m-1 ${letterObj?.color || ''}`
                      : `w-7 aspect-[2/3] border border-black rounded-lg shadow-xl m-1 ${letterObj?.color || ''}`
                    }
                  >
                    {letter.toUpperCase()}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
    </main>
  )
}
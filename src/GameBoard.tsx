import { generate } from "random-words";
import { useEffect, useState } from "react";

type CellColor = "green-500" | "yellow-500" | "gray-200"

type Cell = {
  letter: string;
  color: CellColor;
}

export default function GameBoard() {
  const [rowLength, setRowLength] = useState<number>(5)
  const [randomWord, setRandomWord] = useState<string | null>(null);
  const [board, setBoard] = useState<Cell[]>(
    Array.from({ length: 5 * rowLength }, () => ({ letter: "", color: "gray-200"}))
  )
  const [inputValue, setInputValue] = useState("")
  const [turn, setTurn] = useState(1);
  

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
    setBoard(prevBoard => {
      const newBoard = [...prevBoard];
  
      inputValue.split("").forEach((newLetter, index) => {
        newBoard[index + position] = {
          ...newBoard[index + position],
          letter: newLetter
        };
      });
  
      return newBoard;
    });
  }, [inputValue, position, rowLength]);
  

  const validateLetters = () => {
    if (inputValue.length !== rowLength) {
      alert(`Please enter a guess that has ${rowLength} characters.`)
      return 
    }
    setBoard(prevBoard => {
      const newBoard = [...prevBoard];
      const randomWordArray = [...randomWord]
  
      {/* Checks if letter at index is a match*/}
      inputValue.split("").forEach((letter, index) => {
        if (letter === randomWordArray[index]) {
          newBoard[index + position] = {
            ...newBoard[index + position],
            letter,
            color: "green-500"
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
            color: "yellow-500"
          };
          randomWordArray[randomWordArray.indexOf(letter)] = null;
        }
       })
      return newBoard;
    });
    setInputValue("")
    setTurn(turn + 1)
  };
  
  return (
    <div>
      <input 
        type="number"
        value={rowLength}
        min={3}
        max={7}
        onChange={e=>setRowLength(Number(e.target.value))}
        className="border-2 border-black"
      />
      {`turn: ${turn} / 5`}
      <div className={`grid grid-cols-${rowLength} space-y-5`}>
      {board.map((cell, index) => {
        return (
          <div
          key={index}
          className={`bg-${cell.color} border-2 border-black w-20 h-20`}
        >
          {cell.letter}
          
        </div>
        )
      })}
      </div>
      <input 
        type="text"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value)
        }}
        className="border-black border-2"
        autoFocus
        maxLength={rowLength}
      />
      <button onClick={validateLetters}>
        Check
      </button>
    </div>
  )
}
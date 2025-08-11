import { generate } from "random-words";
import { useEffect, useState} from "react";

export default function App() {
  const [board, setBoard] = useState(
    Array(25).fill({ letter: "", isMatch: false, included: false })
  );
  const [inputValue, setInputValue] = useState("");
  const [randomWord, setRandomWord] = useState("");
  const [turn, setTurn] = useState(1);
  const [result, setResult] = useState("");
  const [gameOver, setGameOver] = useState(false)
  

  useEffect(() => {
    const newWord = generate({ minLength: 5, maxLength: 5 });
    if (Array.isArray(newWord)) {
      setRandomWord(newWord.join(""));
    } else {
      setRandomWord(newWord);
    }
  }, []);

  const letterCount = {}

  const randomWordArray = [...randomWord]

  randomWordArray.forEach((char) => {
    letterCount[char] = (letterCount[char] || 0) + 1;
  })

  const keysSet = new Set(Object.keys(letterCount));

  const matchedItems = randomWordArray.filter(item => keysSet.has(item));

  const matchedCharLength = matchedItems.length;

  console.log(matchedCharLength); 
  console.log(letterCount)

  const validateLetter = () => {
    if (inputValue.length !== 5) {
      alert("Please enter a 5-letter word!")
      setInputValue("");
      return
    }

    const updatedBoard = [...board];
  
    inputValue.split("").forEach((letter, index) => {
      const position = index + (turn - 1) * 5;
      const isMatch = letter === randomWord[index];
      const included = randomWord.includes(letter) && !isMatch
      updatedBoard[position] = { letter, isMatch, included };

      console.log(position)
    });
  
    setBoard(updatedBoard);
    setTurn(turn + 1);
    setInputValue("")
  };
  
  useEffect(() => {
    if (turn === 6) {
      setResult("Game Over")
      setGameOver(true);
      return 
    }
  }, [turn])

  return (
    <>
      <h1 className={`${gameOver ? "block" : "block"}`}>{randomWord}</h1>
      <div className="grid grid-cols-5 gap-y-5 max-w-[500px]">
        {board.map(({ letter, isMatch, included }, index) => {
          const row = Math.floor(index / 5) + 1;
          const col = index % 5;

          const displayLetter = row === turn ? inputValue[col] || "" : letter ; 

          return (
          <div
            key={index}
            className={`w-20 h-20 border-2 border-black text-sm text-black ${
              isMatch
              ? "bg-green-500"
              : included
              ? "bg-yellow-500"
              : ""
            }`}
          >
            {displayLetter}
          </div>
          )
})}
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="border-2 border-black"
        disabled={gameOver}
      />
      <button onClick={validateLetter} disabled={gameOver}>Submit</button>
      {result}
    </>
  );
}

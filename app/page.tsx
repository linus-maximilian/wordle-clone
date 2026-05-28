"use client";

import { useState, useEffect, useCallback } from "react";

const WORDS = [
  "APFEL", "BAUER", "BERGE", "BUCHE", "DAMEN",
  "DICHT", "ECHTE", "EINIG", "FEUER", "FLUSS",
  "FRAGE", "GANZE", "GERNE", "HALLO", "HAUSE",
  "HEUTE", "JAHRE", "KLEID", "LEBEN", "LEISE",
  "MACHT", "MILDE", "NATUR", "OFFEN", "QUELL",
  "RAUCH", "REICH", "ROSEN", "RUHIG", "SAGEN",
  "SPIEL", "STARK", "TIERE", "TISCH", "VATER",
  "WAHRE", "WARTE", "WEISE", "WERDE", "WEISS",
  "WELLE", "WENIG", "WORTE", "ZEUGE",
];

const MAX_GUESSES = 6;
const WORD_LENGTH = 5;

type LetterStatus = "correct" | "present" | "absent" | "empty";

function evaluateGuess(guess: string, target: string): LetterStatus[] {
  const result: LetterStatus[] = Array(WORD_LENGTH).fill("absent");
  const targetChars = target.split("");

  guess.split("").forEach((ch, i) => {
    if (ch === targetChars[i]) {
      result[i] = "correct";
      targetChars[i] = "#";
    }
  });

  guess.split("").forEach((ch, i) => {
    if (result[i] === "correct") return;
    const idx = targetChars.indexOf(ch);
    if (idx !== -1) {
      result[i] = "present";
      targetChars[idx] = "#";
    }
  });

  return result;
}

export default function Home() {
  const [target, setTarget] = useState("");
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">("playing");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved === "true") setDarkMode(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    setTarget(WORDS[Math.floor(Math.random() * WORDS.length)]);
  }, []);

  const submitGuess = useCallback(() => {
    if (currentGuess.length !== WORD_LENGTH) return;
    const newGuesses = [...guesses, currentGuess];
    setGuesses(newGuesses);
    setCurrentGuess("");

    if (currentGuess === target) {
      setGameStatus("won");
    } else if (newGuesses.length >= MAX_GUESSES) {
      setGameStatus("lost");
    }
  }, [currentGuess, guesses, target]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameStatus !== "playing") return;
      if (e.key === "Enter") {
        submitGuess();
      } else if (e.key === "Backspace") {
        setCurrentGuess((prev) => prev.slice(0, -1));
      } else if (/^[a-zA-Z]$/.test(e.key) && currentGuess.length < WORD_LENGTH) {
        setCurrentGuess((prev) => prev + e.key.toUpperCase());
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentGuess, gameStatus, submitGuess]);

  const resetGame = () => {
    setTarget(WORDS[Math.floor(Math.random() * WORDS.length)]);
    setGuesses([]);
    setCurrentGuess("");
    setGameStatus("playing");
  };

  const getCellColor = (status: LetterStatus) => {
    switch (status) {
      case "correct":
        return "bg-green-500 text-white border-green-500";
      case "present":
        return "bg-yellow-500 text-white border-yellow-500";
      case "absent":
        return darkMode
          ? "bg-gray-700 text-white border-gray-700"
          : "bg-gray-500 text-white border-gray-500";
      default:
        return darkMode
          ? "bg-gray-900 text-white border-gray-600"
          : "bg-white text-black border-gray-300";
    }
  };

  return (
    <main
      className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors ${
        darkMode ? "bg-gray-900" : "bg-gray-100"
      }`}
    >
      <button
        onClick={() => setDarkMode(!darkMode)}
        className={`absolute top-4 right-4 p-3 rounded-full text-xl transition-colors ${
          darkMode
            ? "bg-gray-700 hover:bg-gray-600"
            : "bg-white hover:bg-gray-200 shadow"
        }`}
        aria-label="Modus umschalten"
      >
        {darkMode ? "☀️" : "🌙"}
      </button>

      <h1
        className={`text-4xl font-bold mb-8 ${
          darkMode ? "text-white" : "text-black"
        }`}
      >
        Wordle!!!
      </h1>

      <div className="grid gap-2 mb-8">
        {Array.from({ length: MAX_GUESSES }).map((_, rowIndex) => {
          const guess =
            guesses[rowIndex] ||
            (rowIndex === guesses.length ? currentGuess : "");
          const isSubmitted = rowIndex < guesses.length;
          const statuses = isSubmitted
            ? evaluateGuess(guesses[rowIndex], target)
            : [];
          return (
            <div key={rowIndex} className="flex gap-2">
              {Array.from({ length: WORD_LENGTH }).map((_, colIndex) => {
                const letter = guess[colIndex] || "";
                const status = isSubmitted ? statuses[colIndex] : "empty";
                return (
                  <div
                    key={colIndex}
                    className={`w-14 h-14 border-2 flex items-center justify-center text-2xl font-bold uppercase transition-colors ${getCellColor(
                      status
                    )}`}
                  >
                    {letter}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {gameStatus === "won" && (
        <div className="text-center">
          <p className="text-2xl font-bold text-green-500 mb-4">
            🎉 Gewonnen!
          </p>
          <button
            onClick={resetGame}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600"
          >
            Nochmal spielen
          </button>
        </div>
      )}

      {gameStatus === "lost" && (
        <div className="text-center">
          <p className="text-2xl font-bold text-red-500 mb-2">Verloren!</p>
          <p className={`mb-4 ${darkMode ? "text-white" : "text-black"}`}>
            Das Wort war: <span className="font-bold">{target}</span>
          </p>
          <button
            onClick={resetGame}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600"
          >
            Nochmal spielen
          </button>
        </div>
      )}

      {gameStatus === "playing" && (
        <p
          className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
        >
          Tipp ein 5-Buchstaben-Wort und drück Enter
        </p>
      )}
    </main>
  );
}
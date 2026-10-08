import { useEffect, useState } from "react";

const TYPING_SPEED = 90;
const DELETING_SPEED = 55;
const PAUSE_AFTER_WORD = 1200;
const START_DELAY = 600;

export function useTypingEffect(words) {
  const [text, setText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => setStarted(true), START_DELAY);
    return () => clearTimeout(startTimer);
  }, []);

  useEffect(() => {
    if (!started) return undefined;

    const currentWord = words[wordIndex % words.length];
    let timer;

    if (!isDeleting && text.length < currentWord.length) {
      timer = setTimeout(() => setText(currentWord.slice(0, text.length + 1)), TYPING_SPEED);
    } else if (!isDeleting && text.length === currentWord.length) {
      timer = setTimeout(() => setIsDeleting(true), PAUSE_AFTER_WORD);
    } else if (isDeleting && text.length > 0) {
      timer = setTimeout(() => setText(currentWord.slice(0, text.length - 1)), DELETING_SPEED);
    } else {
      timer = setTimeout(() => {
        setIsDeleting(false);
        setWordIndex((i) => (i + 1) % words.length);
      }, 350);
    }

    return () => clearTimeout(timer);
  }, [text, isDeleting, wordIndex, started, words]);

  return text;
}

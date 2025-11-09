import { TestStatus } from './TypingTest'; // Assuming this import is correct
import { useRef, useEffect, useState } from 'react';

interface WordDisplayProps {
  words: string[];
  currentWordIndex: number;
  currentCharIndex: number;
  typedChars: { [key: string]: string };
  status: TestStatus;
}

const WordDisplay = ({
  words,
  currentWordIndex,
  currentCharIndex,
  typedChars,
  status
}: WordDisplayProps) => {
  const [translateY, setTranslateY] = useState(0);
  const wordElementsRef = useRef(new Map<number, HTMLDivElement>());

  // Estimate line height: text-3xl (30px) * leading-relaxed (1.625) = ~49px
  // Plus gap-y-2 (8px) = ~57px. We'll use this to calculate scroll.
  const LINE_HEIGHT_ESTIMATE = 57;

  useEffect(() => {
    // On restart, currentWordIndex will be 0.
    // This will calculate targetTranslateY as (0 - 57) = -57.
    // Math.max(0, -57) is 0, so the scroll will be reset to 0, which is correct.
    const currentWordEl = wordElementsRef.current.get(currentWordIndex);
    if (!currentWordEl) return;

    const currentWordOffsetTop = currentWordEl.offsetTop;
    const targetTranslateY = currentWordOffsetTop - LINE_HEIGHT_ESTIMATE;

    setTranslateY(Math.max(0, targetTranslateY));

  }, [currentWordIndex]);

  // --- FIX ---
  // Removed the problematic useEffect that watched [words].
  // This was causing the scroll to reset when new words were added.
  // The logic in the [currentWordIndex] hook above is sufficient
  // to reset the scroll to 0 when currentWordIndex becomes 0.

  return (
    // Container is now fixed height, p-4, and overflow-hidden
    <div className="relative bg-card rounded-lg p-4 h-48 overflow-hidden">
      {/* This wrapper will be translated up and down */}
      <div
        className="flex flex-wrap gap-x-3 gap-y-2 text-3xl leading-relaxed transition-transform duration-150 ease-linear"
        style={{ transform: `translateY(-${translateY}px)` }}
      >
        {/* We map all words, no slicing! */}
        {words.map((word, wordIdx) => {
          const isCurrentWord = wordIdx === currentWordIndex;
          const isPastWord = wordIdx < currentWordIndex;

          return (
            <div
              key={wordIdx}
              // Add a ref to each word element
              ref={(el) => {
                if (el) wordElementsRef.current.set(wordIdx, el);
                else wordElementsRef.current.delete(wordIdx);
              }}
              className={`transition-opacity ${
                isPastWord ? 'opacity-30' : 'opacity-100'
              }`}
            >
              {word.split('').map((char, charIdx) => {
                const key = `${wordIdx}-${charIdx}`;
                const typed = typedChars[key];
                const isCurrent = isCurrentWord && charIdx === currentCharIndex;

                let className = 'word-char ';
                if (isCurrent && status === 'running') {
                  className += 'current ';
                }
                if (typed === 'correct') {
                  className += 'correct';
                } else if (typed === 'incorrect') {
                  className += 'incorrect';
                }

                return (
                  <span key={charIdx} className={className}>
                    {char}
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>
      {/* --- FIX ---
          Replaced CSS variables with hard-coded, high-contrast colors
          that will work without relying on external theme variables.
      */}
      <style>{`
        .word-char.current {
          position: relative;
        }
        .word-char.current::before {
          content: '';
          position: absolute;
          left: 0;
          bottom: 0;
          height: 100%;
          width: 2px;
          background-color: #3b82f6; /* Blue-500 */
          animation: blink 1s infinite;
        }
        .word-char.correct {
          color: #f9fafb; /* Gray-50 (White) */
        }
        .word-char.incorrect {
          color: #ef4444; /* Red-500 */
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default WordDisplay;
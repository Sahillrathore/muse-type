import { TestStatus } from './TypingTest';

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
  return (
    <div className="relative bg-card rounded-lg p-8 min-h-[200px] flex items-center">
      <div className="flex flex-wrap gap-x-3 gap-y-2 text-3xl leading-relaxed">
        {words.slice(0, 50).map((word, wordIdx) => {
          const isCurrentWord = wordIdx === currentWordIndex;
          const isPastWord = wordIdx < currentWordIndex;

          return (
            <div
              key={wordIdx}
              className={`transition-opacity ${
                isPastWord ? 'opacity-40' : 'opacity-100'
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
    </div>
  );
};

export default WordDisplay;

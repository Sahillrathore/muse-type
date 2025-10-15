import { useState, useEffect, useRef } from 'react';
import { generateWords } from '@/utils/wordGenerator';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TestResults from './TestResults';
import TimerSelector from './TimerSelector';
import WordDisplay from './WordDisplay';

export type TestStatus = 'idle' | 'running' | 'finished';

const TypingTest = () => {
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<TestStatus>('idle');
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedTime, setSelectedTime] = useState(30);
  const [correctChars, setCorrectChars] = useState(0);
  const [incorrectChars, setIncorrectChars] = useState(0);
  const [typedChars, setTypedChars] = useState<{ [key: string]: string }>({});
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setWords(generateWords(100));
  }, []);

  useEffect(() => {
    if (status === 'running' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && status === 'running') {
      setStatus('finished');
    }
  }, [timeLeft, status]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.focus();
    }
  }, []);

  const handleStart = () => {
    if (status === 'idle') {
      setStatus('running');
      inputRef.current?.focus();
    }
  };

  const handleRestart = () => {
    setWords(generateWords(100));
    setCurrentWordIndex(0);
    setCurrentCharIndex(0);
    setInput('');
    setStatus('idle');
    setTimeLeft(selectedTime);
    setCorrectChars(0);
    setIncorrectChars(0);
    setTypedChars({});
    inputRef.current?.focus();
  };

  const handleTimeChange = (time: number) => {
    setSelectedTime(time);
    setTimeLeft(time);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (status === 'finished') return;
    
    if (status === 'idle') {
      handleStart();
    }

    const currentWord = words[currentWordIndex];
    
    if (e.key === ' ') {
      e.preventDefault();
      
      if (input.length > 0) {
        // Move to next word
        setCurrentWordIndex(currentWordIndex + 1);
        setCurrentCharIndex(0);
        setInput('');
      }
      return;
    }

    if (e.key === 'Backspace') {
      if (input.length > 0) {
        const newInput = input.slice(0, -1);
        setInput(newInput);
        setCurrentCharIndex(Math.max(0, currentCharIndex - 1));
        
        // Remove the typed character from tracking
        const key = `${currentWordIndex}-${currentCharIndex - 1}`;
        const newTypedChars = { ...typedChars };
        delete newTypedChars[key];
        setTypedChars(newTypedChars);
      }
      return;
    }

    // Only handle printable characters
    if (e.key.length === 1) {
      const newInput = input + e.key;
      setInput(newInput);
      
      const isCorrect = currentWord[currentCharIndex] === e.key;
      const key = `${currentWordIndex}-${currentCharIndex}`;
      
      setTypedChars({
        ...typedChars,
        [key]: isCorrect ? 'correct' : 'incorrect'
      });

      if (isCorrect) {
        setCorrectChars(correctChars + 1);
      } else {
        setIncorrectChars(incorrectChars + 1);
      }
      
      setCurrentCharIndex(currentCharIndex + 1);
    }
  };

  const calculateWPM = () => {
    const timeElapsed = selectedTime - timeLeft;
    if (timeElapsed === 0) return 0;
    return Math.round((correctChars / 5) / (timeElapsed / 60));
  };

  const calculateAccuracy = () => {
    const total = correctChars + incorrectChars;
    if (total === 0) return 100;
    return Math.round((correctChars / total) * 100);
  };

  if (status === 'finished') {
    return (
      <TestResults
        wpm={calculateWPM()}
        accuracy={calculateAccuracy()}
        correctChars={correctChars}
        incorrectChars={incorrectChars}
        onRestart={handleRestart}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center justify-center min-h-screen px-4 py-8 focus:outline-none"
      tabIndex={0}
      onKeyDown={handleKeyPress}
    >
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <TimerSelector
            selectedTime={selectedTime}
            onTimeChange={handleTimeChange}
            disabled={status === 'running'}
          />
          
          <div className="flex items-center gap-6">
            <div className="text-4xl font-bold text-primary tabular-nums">
              {timeLeft}
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRestart}
              className="text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Live Stats */}
        {status === 'running' && (
          <div className="flex gap-8 text-sm text-muted-foreground">
            <div className="space-y-1">
              <div className="text-xs uppercase tracking-wider">WPM</div>
              <div className="text-2xl font-bold text-foreground tabular-nums">
                {calculateWPM()}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs uppercase tracking-wider">Accuracy</div>
              <div className="text-2xl font-bold text-foreground tabular-nums">
                {calculateAccuracy()}%
              </div>
            </div>
          </div>
        )}

        {/* Words Display */}
        <WordDisplay
          words={words}
          currentWordIndex={currentWordIndex}
          currentCharIndex={currentCharIndex}
          typedChars={typedChars}
          status={status}
        />

        {/* Hidden input */}
        <input
          ref={inputRef}
          type="text"
          className="typing-input"
          value={input}
          onChange={() => {}}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
        />

        {/* Instruction */}
        {status === 'idle' && (
          <div className="text-center text-muted-foreground text-sm animate-fade-in">
            Click here or start typing to begin the test
          </div>
        )}
      </div>
    </div>
  );
};

export default TypingTest;

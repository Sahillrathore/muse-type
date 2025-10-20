import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import DetailedAnalysis from './DetailedAnalysis';

interface KeystrokeData {
  timestamp: number;
  wpm: number;
  accuracy: number;
}

interface KeyAccuracy {
  key: string;
  correct: number;
  incorrect: number;
  accuracy: number;
}

interface TestResultsProps {
  wpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
  keystrokeData: KeystrokeData[];
  keyAccuracy: Map<string, KeyAccuracy>;
  onRestart: () => void;
}

const TestResults = ({
  wpm,
  accuracy,
  correctChars,
  incorrectChars,
  keystrokeData,
  keyAccuracy,
  onRestart
}: TestResultsProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8">
      <div className="w-full max-w-5xl space-y-8 text-center">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-muted-foreground">Test Analysis</h2>
          
          <div className="grid grid-cols-2 gap-8 mt-8">
            <div className="space-y-2">
              <div className="text-sm uppercase tracking-wider text-muted-foreground">WPM</div>
              <div className="text-6xl font-bold text-primary tabular-nums">
                {wpm}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm uppercase tracking-wider text-muted-foreground">Accuracy</div>
              <div className="text-6xl font-bold text-foreground tabular-nums">
                {accuracy}%
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mt-8 pt-8 border-t border-border">
            <div className="space-y-2">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Correct</div>
              <div className="text-2xl font-semibold text-success tabular-nums">
                {correctChars}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Incorrect</div>
              <div className="text-2xl font-semibold text-error tabular-nums">
                {incorrectChars}
              </div>
            </div>
          </div>
        </div>

        <Button
          onClick={onRestart}
          size="lg"
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <RotateCcw className="h-4 w-4" />
          Try Again
        </Button>

        <DetailedAnalysis 
          keystrokeData={keystrokeData}
          keyAccuracy={keyAccuracy}
        />
      </div>
    </div>
  );
};

export default TestResults;

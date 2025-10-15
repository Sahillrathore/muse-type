import { Button } from '@/components/ui/button';

interface TimerSelectorProps {
  selectedTime: number;
  onTimeChange: (time: number) => void;
  disabled?: boolean;
}

const TimerSelector = ({ selectedTime, onTimeChange, disabled }: TimerSelectorProps) => {
  const times = [15, 30, 60];

  return (
    <div className="flex gap-2">
      {times.map((time) => (
        <Button
          key={time}
          variant={selectedTime === time ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onTimeChange(time)}
          disabled={disabled}
          className={`
            font-mono text-sm
            ${selectedTime === time 
              ? 'bg-primary text-primary-foreground' 
              : 'text-muted-foreground hover:text-foreground'
            }
          `}
        >
          {time}
        </Button>
      ))}
    </div>
  );
};

export default TimerSelector;

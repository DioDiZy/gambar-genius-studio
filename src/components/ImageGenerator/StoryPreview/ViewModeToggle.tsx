
import { BookOpen, Bookmark } from "lucide-react";

interface ViewModeToggleProps {
  viewMode: 'single' | 'storyboard';
  onViewModeChange: (mode: 'single' | 'storyboard') => void;
}

export const ViewModeToggle = ({
  viewMode,
  onViewModeChange,
}: ViewModeToggleProps) => {
  return (
    <div className="flex space-x-1 bg-muted/30 p-1 rounded-md">
      <button 
        onClick={() => onViewModeChange('single')} 
        className={`p-1 rounded ${viewMode === 'single' ? 'bg-background' : ''}`}
        title="Tampilan tunggal"
      >
        <Bookmark className="h-4 w-4" />
      </button>
      <button 
        onClick={() => onViewModeChange('storyboard')} 
        className={`p-1 rounded ${viewMode === 'storyboard' ? 'bg-background' : ''}`}
        title="Tampilan storyboard"
      >
        <BookOpen className="h-4 w-4" />
      </button>
    </div>
  );
};

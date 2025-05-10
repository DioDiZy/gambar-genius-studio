
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface StoryTextAreaProps {
  story: string;
  onStoryChange: (value: string) => void;
  paragraphCount: number;
  isGenerating: boolean;
}

export const StoryTextArea = ({
  story,
  onStoryChange,
  paragraphCount,
  isGenerating
}: StoryTextAreaProps) => {
  return (
    <div className="space-y-2">
      <Label>Your Story</Label>
      <Textarea
        placeholder="Once upon a time in a distant land...\n\nAs the hero ventured deeper into the forest..."
        value={story}
        onChange={(e) => onStoryChange(e.target.value)}
        className="min-h-64 mb-4"
        disabled={isGenerating}
      />
      <p className="text-sm text-muted-foreground">
        {paragraphCount} paragraphs detected
      </p>
    </div>
  );
};


import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface StoryTextAreaProps {
  story: string;
  onStoryChange: (value: string) => void;
  paragraphCount: number;
  isGenerating: boolean;
  language?: string;
}

export const StoryTextArea = ({
  story,
  onStoryChange,
  paragraphCount,
  isGenerating,
  language = "english"
}: StoryTextAreaProps) => {
  const getPlaceholderByLanguage = () => {
    switch(language) {
      case "indonesian":
        return "Pada suatu hari di negeri yang jauh...\n\nSaat sang pahlawan melanjutkan perjalanannya ke dalam hutan...";
      case "spanish":
        return "Érase una vez en una tierra lejana...\n\nMientras el héroe se adentraba en el bosque...";
      case "french":
        return "Il était une fois dans un pays lointain...\n\nAlors que le héros s'aventurait plus profondément dans la forêt...";
      case "german":
        return "Es war einmal in einem fernen Land...\n\nAls der Held tiefer in den Wald vordrang...";
      case "chinese":
        return "很久很久以前，在一个遥远的国度...\n\n当英雄深入森林探险时...";
      case "japanese":
        return "むかしむかし、遠い国で...\n\n主人公が森の奥深くに冒険を続けると...";
      case "arabic":
        return "في يوم من الأيام في أرض بعيدة...\n\nبينما كان البطل يتعمق في الغابة...";
      case "english":
      default:
        return "Once upon a time in a distant land...\n\nAs the hero ventured deeper into the forest...";
    }
  };

  return (
    <div className="space-y-2">
      <Label>Your Story</Label>
      <Textarea
        placeholder={getPlaceholderByLanguage()}
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

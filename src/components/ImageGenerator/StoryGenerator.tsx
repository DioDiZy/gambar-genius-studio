
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Book } from "lucide-react";
import { useStoryGeneration } from "@/hooks/useStoryGeneration";
import { StoryInputOptions } from "./StoryInputOptions";
import { StoryTextArea } from "./StoryTextArea";
import { StoryGenerationButton } from "./StoryGenerationButton";

interface StoryGeneratorProps {
  onImagesGenerated: (urls: string[], prompts: string[]) => void;
  isGenerating: boolean;
  setIsGenerating: (value: boolean) => void;
}

export const StoryGenerator = ({ 
  onImagesGenerated, 
  isGenerating,
  setIsGenerating
}: StoryGeneratorProps) => {
  const [story, setStory] = useState("");
  const [paragraphSeparator, setParagraphSeparator] = useState("\n\n");
  const [style, setStyle] = useState("photorealistic");
  const [characterDescriptions, setCharacterDescriptions] = useState("");
  const [paragraphCount, setParagraphCount] = useState(0);
  
  const { handleGenerateImages, paragraphs } = useStoryGeneration({
    story,
    paragraphSeparator,
    style,
    characterDescriptions,
    isGenerating,
    setIsGenerating,
    onImagesGenerated
  });

  // Update paragraph count whenever story or separator changes
  useEffect(() => {
    setParagraphCount(paragraphs.length);
  }, [paragraphs]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Book className="h-5 w-5" />
          Story to Images
        </CardTitle>
        <CardDescription>
          Write a story and generate an image for each paragraph
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <StoryInputOptions
            paragraphSeparator={paragraphSeparator}
            onSeparatorChange={setParagraphSeparator}
            style={style}
            onStyleChange={setStyle}
            characterDescriptions={characterDescriptions}
            onCharacterDescriptionsChange={setCharacterDescriptions}
            isGenerating={isGenerating}
          />

          <Separator className="my-4" />

          <StoryTextArea
            story={story}
            onStoryChange={setStory}
            paragraphCount={paragraphCount}
            isGenerating={isGenerating}
          />

          <div className="flex items-center justify-end">
            <StoryGenerationButton
              onGenerate={handleGenerateImages}
              disabled={!story.trim()}
              isGenerating={isGenerating}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};


import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface StoryInputOptionsProps {
  paragraphSeparator: string;
  onSeparatorChange: (value: string) => void;
  style: string;
  onStyleChange: (value: string) => void;
  characterDescriptions: string;
  onCharacterDescriptionsChange: (value: string) => void;
  isGenerating: boolean;
}

export const StoryInputOptions = ({
  paragraphSeparator,
  onSeparatorChange,
  style,
  onStyleChange,
  characterDescriptions,
  onCharacterDescriptionsChange,
  isGenerating
}: StoryInputOptionsProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label>Paragraph Separator</Label>
        <Input 
          placeholder="Enter the separator between paragraphs"
          value={paragraphSeparator}
          onChange={(e) => onSeparatorChange(e.target.value)}
          className="mb-2"
          disabled={isGenerating}
        />
        <p className="text-xs text-muted-foreground">
          Default is double line break. Enter custom separators like "***" or "###" if needed.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Style</Label>
        <select 
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={style}
          onChange={(e) => onStyleChange(e.target.value)}
          disabled={isGenerating}
        >
          <option value="photorealistic">Photorealistic</option>
          <option value="digital-art">Digital Art</option>
          <option value="anime">Anime</option>
          <option value="3d-render">3D Render</option>
          <option value="oil-painting">Oil Painting</option>
        </select>
      </div>
      
      <div className="space-y-2">
        <Label>Character Descriptions</Label>
        <Textarea
          placeholder="Describe characters or consistent elements that should appear across all images. E.g.: 'Main character is a young woman with red hair named Alice. Her companion is an old bearded wizard named Merlin.'"
          value={characterDescriptions}
          onChange={(e) => onCharacterDescriptionsChange(e.target.value)}
          className="min-h-24"
          disabled={isGenerating}
        />
        <p className="text-xs text-muted-foreground">
          These descriptions will be applied to all generated images for consistency.
        </p>
      </div>
    </>
  );
};

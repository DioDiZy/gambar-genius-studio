
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PlusCircle, X } from "lucide-react";
import { CharacterDescription } from "@/types/story";
import { useLanguage } from "@/contexts/LanguageContext";

interface StoryInputOptionsProps {
  paragraphSeparator: string;
  onSeparatorChange: (value: string) => void;
  style: string;
  onStyleChange: (value: string) => void;
  characterDescriptions: string;
  onCharacterDescriptionsChange: (value: string) => void;
  isGenerating: boolean;
  characters: CharacterDescription[];
  onCharactersChange: (characters: CharacterDescription[]) => void;
}

export const StoryInputOptions = ({
  paragraphSeparator,
  onSeparatorChange,
  style,
  onStyleChange,
  characterDescriptions,
  onCharacterDescriptionsChange,
  isGenerating,
  characters,
  onCharactersChange,
}: StoryInputOptionsProps) => {
  const { t } = useLanguage();
  const [newCharacter, setNewCharacter] = useState<CharacterDescription>({ name: "", appearance: "" });

  const handleAddCharacter = () => {
    if (newCharacter.name.trim() && newCharacter.appearance.trim()) {
      onCharactersChange([...characters, newCharacter]);
      setNewCharacter({ name: "", appearance: "" });
    }
  };

  const handleRemoveCharacter = (index: number) => {
    const updatedCharacters = characters.filter((_, i) => i !== index);
    onCharactersChange(updatedCharacters);
  };

  return (
    <>
      <div className="space-y-2">
        <Label>{t("story.paragraphSeparator")}</Label>
        <Input 
          placeholder={t("story.paragraphSeparator")}
          value={paragraphSeparator}
          onChange={(e) => onSeparatorChange(e.target.value)}
          className="mb-2"
          disabled={isGenerating}
        />
        <p className="text-xs text-muted-foreground">
          {t("story.separatorHint")}
        </p>
      </div>

      <div className="space-y-2">
        <Label>{t("story.style")}</Label>
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
          <option value="watercolor">Watercolor</option>
          <option value="comic-book">Comic Book</option>
          <option value="storyboard-sketch">Storyboard Sketch</option>
        </select>
      </div>
      
      <div className="space-y-4">
        <Label>{t("story.characters")}</Label>
        <div className="space-y-4 rounded-md border border-input p-3 bg-muted/20">
          {characters.length > 0 ? (
            <div className="space-y-3">
              {characters.map((character, index) => (
                <div key={index} className="flex items-start space-x-2 p-2 rounded-md bg-background">
                  <div className="flex-grow">
                    <p className="font-medium">{character.name}</p>
                    <p className="text-xs text-muted-foreground">{character.appearance}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6" 
                    onClick={() => handleRemoveCharacter(index)} 
                    disabled={isGenerating}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic text-center py-2">
              {t("story.charactersHint")}
            </p>
          )}
          
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-1">
                <Input
                  placeholder={t("story.characterName")}
                  value={newCharacter.name}
                  onChange={(e) => setNewCharacter({...newCharacter, name: e.target.value})}
                  disabled={isGenerating}
                />
              </div>
              <div className="col-span-2">
                <div className="flex space-x-2">
                  <Input
                    placeholder={t("story.characterAppearance")}
                    value={newCharacter.appearance}
                    onChange={(e) => setNewCharacter({...newCharacter, appearance: e.target.value})}
                    disabled={isGenerating}
                  />
                  <Button 
                    size="icon" 
                    variant="outline" 
                    onClick={handleAddCharacter} 
                    disabled={isGenerating || !newCharacter.name.trim() || !newCharacter.appearance.trim()}
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {t("story.characterTip")}
            </p>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>{t("story.additionalLabel")}</Label>
          <Textarea
            placeholder={t("story.additionalPlaceholder")}
            value={characterDescriptions}
            onChange={(e) => onCharacterDescriptionsChange(e.target.value)}
            className="min-h-20"
            disabled={isGenerating}
          />
          <p className="text-xs text-muted-foreground">
            {t("story.additionalHint")}
          </p>
        </div>
      </div>
    </>
  );
};

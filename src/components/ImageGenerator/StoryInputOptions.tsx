import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PlusCircle, X } from "lucide-react";
import { CharacterDescription } from "@/types/story";

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
  language?: string;
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
  language = "english"
}: StoryInputOptionsProps) => {
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

  const getPlaceholdersByLanguage = () => {
    switch(language) {
      case "indonesian":
        return {
          separatorLabel: "Pemisah Paragraf",
          separatorPlaceholder: "Masukkan pemisah antar paragraf",
          separatorHint: "Default adalah jeda baris ganda. Masukkan pemisah kustom seperti \"***\" atau \"###\" jika diperlukan.",
          styleLabel: "Gaya",
          charactersLabel: "Karakter",
          charactersHint: "Belum ada karakter yang ditambahkan. Tambahkan karakter untuk konsistensi antar gambar.",
          characterName: "Nama karakter",
          characterAppearance: "Penampilan karakter",
          characterTip: "Tambahkan karakter utama dengan penampilan spesifik mereka untuk konsistensi antar gambar.",
          additionalLabel: "Instruksi Gambar Tambahan",
          additionalPlaceholder: "Tambahkan instruksi tambahan untuk pembuatan gambar (latar belakang, setting, suasana, pencahayaan, dll.)",
          additionalHint: "Instruksi ini akan diterapkan pada semua gambar yang dihasilkan untuk konsistensi."
        };
      case "spanish":
        return {
          separatorLabel: "Separador de Párrafos",
          separatorPlaceholder: "Ingrese el separador entre párrafos",
          separatorHint: "El valor predeterminado es doble salto de línea. Ingrese separadores personalizados como \"***\" o \"###\" si es necesario.",
          styleLabel: "Estilo",
          charactersLabel: "Personajes",
          charactersHint: "Aún no se han añadido personajes. Añada personajes para mantener la consistencia entre imágenes.",
          characterName: "Nombre del personaje",
          characterAppearance: "Apariencia del personaje",
          characterTip: "Añada personajes clave con sus apariencias específicas para mantener la consistencia entre imágenes.",
          additionalLabel: "Instrucciones Adicionales para Imágenes",
          additionalPlaceholder: "Añada instrucciones adicionales para la generación de imágenes (fondo, escenario, atmósfera, iluminación, etc.)",
          additionalHint: "Estas instrucciones se aplicarán a todas las imágenes generadas para mantener la consistencia."
        };
      case "french":
        return {
          separatorLabel: "Séparateur de Paragraphes",
          separatorPlaceholder: "Entrez le séparateur entre les paragraphes",
          separatorHint: "Par défaut, c'est un double saut de ligne. Entrez des séparateurs personnalisés comme \"***\" ou \"###\" si nécessaire.",
          styleLabel: "Style",
          charactersLabel: "Personnages",
          charactersHint: "Aucun personnage n'a encore été ajouté. Ajoutez des personnages pour la cohérence entre les images.",
          characterName: "Nom du personnage",
          characterAppearance: "Apparence du personnage",
          characterTip: "Ajoutez des personnages clés avec leurs apparences spécifiques pour la cohérence entre les images.",
          additionalLabel: "Instructions d'Image Supplémentaires",
          additionalPlaceholder: "Ajoutez des instructions supplémentaires pour la génération d'images (arrière-plan, décor, ambiance, éclairage, etc.)",
          additionalHint: "Ces instructions seront appliquées à toutes les images générées pour la cohérence."
        };
      case "german":
        return {
          separatorLabel: "Absatztrenner",
          separatorPlaceholder: "Geben Sie den Trenner zwischen Absätzen ein",
          separatorHint: "Standard ist ein doppelter Zeilenumbruch. Geben Sie bei Bedarf benutzerdefinierte Trenner wie \"***\" oder \"###\" ein.",
          styleLabel: "Stil",
          charactersLabel: "Charaktere",
          charactersHint: "Es wurden noch keine Charaktere hinzugefügt. Fügen Sie Charaktere für Konsistenz zwischen Bildern hinzu.",
          characterName: "Name des Charakters",
          characterAppearance: "Erscheinungsbild des Charakters",
          characterTip: "Fügen Sie Hauptcharaktere mit ihrem spezifischen Erscheinungsbild für Konsistenz zwischen Bildern hinzu.",
          additionalLabel: "Zusätzliche Bildanweisungen",
          additionalPlaceholder: "Fügen Sie zusätzliche Anweisungen für die Bilderstellung hinzu (Hintergrund, Umgebung, Atmosphäre, Beleuchtung usw.)",
          additionalHint: "Diese Anweisungen werden auf alle generierten Bilder für Konsistenz angewendet."
        };
      case "chinese":
        return {
          separatorLabel: "段落分隔符",
          separatorPlaceholder: "输入段落之间的分隔符",
          separatorHint: "默认为双换行符。如有需要，请输入自定义分隔符，如\"***\"或\"###\"。",
          styleLabel: "风格",
          charactersLabel: "角色",
          charactersHint: "尚未添加任何角色。添加角色以保持图像之间的一致性。",
          characterName: "角色名称",
          characterAppearance: "角色外观",
          characterTip: "添加关键角色及其特定外观，以保持图像之间的一致性。",
          additionalLabel: "额外图像说明",
          additionalPlaceholder: "为图像生成添加任何额外说明（背景、场景、氛围、光线等）",
          additionalHint: "这些说明将应用于所有生成的图像以保持一致性。"
        };
      case "japanese":
        return {
          separatorLabel: "段落区切り",
          separatorPlaceholder: "段落間の区切りを入力してください",
          separatorHint: "デフォルトは二重改行です。必要に応じて「***」や「###」などのカスタム区切りを入力してください。",
          styleLabel: "スタイル",
          charactersLabel: "キャラクター",
          charactersHint: "まだキャラクターが追加されていません。画像間の一貫性のためにキャラクターを追加してください。",
          characterName: "キャラクター名",
          characterAppearance: "キャラクターの外見",
          characterTip: "画像間の一貫性のために、主要キャラクターとその特定の外見を追加してください。",
          additionalLabel: "追加画像指示",
          additionalPlaceholder: "画像生成のための追加指示を入力してください（背景、設定、雰囲気、照明など）",
          additionalHint: "これらの指示は、一貫性のためにすべての生成画像に適用されます。"
        };
      case "arabic":
        return {
          separatorLabel: "فاصل الفقرات",
          separatorPlaceholder: "أدخل الفاصل بين الفقرات",
          separatorHint: "الافتراضي هو سطر فارغ مزدوج. أدخل فواصل مخصصة مثل \"***\" أو \"###\" إذا لزم الأمر.",
          styleLabel: "النمط",
          charactersLabel: "الشخصيات",
          charactersHint: "لم تتم إضافة أي شخصيات حتى الآن. أضف شخصيات للحصول على اتساق بين الصور.",
          characterName: "اسم الشخصية",
          characterAppearance: "مظهر الشخصية",
          characterTip: "أضف الشخصيات الرئيسية بمظهرها المحدد للحصول على اتساق بين الصور.",
          additionalLabel: "تعليمات إضافية للصورة",
          additionalPlaceholder: "أضف أي تعليمات إضافية لإنشاء الصورة (الخلفية، الإعداد، الأجواء، الإضاءة، إلخ.)",
          additionalHint: "سيتم تطبيق هذه التعليمات على جميع الصور المُنشأة للحفاظ على الاتساق."
        };
      case "english":
      default:
        return {
          separatorLabel: "Paragraph Separator",
          separatorPlaceholder: "Enter the separator between paragraphs",
          separatorHint: "Default is double line break. Enter custom separators like \"***\" or \"###\" if needed.",
          styleLabel: "Style",
          charactersLabel: "Characters",
          charactersHint: "No characters added yet. Add characters for consistency across images.",
          characterName: "Character name",
          characterAppearance: "Character appearance",
          characterTip: "Add key characters with their specific appearances for consistency across images.",
          additionalLabel: "Additional Image Instructions",
          additionalPlaceholder: "Add any additional instructions for image generation (background, setting, atmosphere, lighting, etc.)",
          additionalHint: "These instructions will be applied to all generated images for consistency."
        };
    }
  };

  const placeholders = getPlaceholdersByLanguage();

  return (
    <>
      <div className="space-y-2">
        <Label>{placeholders.separatorLabel}</Label>
        <Input 
          placeholder={placeholders.separatorPlaceholder}
          value={paragraphSeparator}
          onChange={(e) => onSeparatorChange(e.target.value)}
          className="mb-2"
          disabled={isGenerating}
        />
        <p className="text-xs text-muted-foreground">
          {placeholders.separatorHint}
        </p>
      </div>

      <div className="space-y-2">
        <Label>{placeholders.styleLabel}</Label>
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
        <Label>{placeholders.charactersLabel}</Label>
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
              {placeholders.charactersHint}
            </p>
          )}
          
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-1">
                <Input
                  placeholder={placeholders.characterName}
                  value={newCharacter.name}
                  onChange={(e) => setNewCharacter({...newCharacter, name: e.target.value})}
                  disabled={isGenerating}
                />
              </div>
              <div className="col-span-2">
                <div className="flex space-x-2">
                  <Input
                    placeholder={placeholders.characterAppearance}
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
              {placeholders.characterTip}
            </p>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>{placeholders.additionalLabel}</Label>
          <Textarea
            placeholder={placeholders.additionalPlaceholder}
            value={characterDescriptions}
            onChange={(e) => onCharacterDescriptionsChange(e.target.value)}
            className="min-h-20"
            disabled={isGenerating}
          />
          <p className="text-xs text-muted-foreground">
            {placeholders.additionalHint}
          </p>
        </div>
      </div>
    </>
  );
};

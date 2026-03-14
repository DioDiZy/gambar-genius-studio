import { useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PlusCircle, X, Upload, ImageIcon, Loader2 } from "lucide-react";
import { CharacterDescription } from "@/types/story";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  language = "indonesian",
}: StoryInputOptionsProps) => {
  const [newCharacter, setNewCharacter] = useState<CharacterDescription>({ name: "", appearance: "", referenceImages: [] });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadReferenceImage = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      const uploadedUrls: string[] = [...(newCharacter.referenceImages || [])];
      for (const file of Array.from(files)) {
        const ext = file.name.split('.').pop();
        const fileName = `ref-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { data, error } = await supabase.storage
          .from('character_references')
          .upload(fileName, file, { contentType: file.type, upsert: false });
        if (error) {
          console.error("Upload error:", error);
          toast.error(`Gagal mengupload ${file.name}`);
          continue;
        }
        const { data: urlData } = supabase.storage
          .from('character_references')
          .getPublicUrl(data.path);
        uploadedUrls.push(urlData.publicUrl);
      }
      setNewCharacter(prev => ({ ...prev, referenceImages: uploadedUrls }));
      toast.success(`${files.length} gambar referensi berhasil diupload`);
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Gagal mengupload gambar");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveRefImage = (index: number) => {
    setNewCharacter(prev => ({
      ...prev,
      referenceImages: (prev.referenceImages || []).filter((_, i) => i !== index)
    }));
  };

  const handleAddCharacter = () => {
    if (newCharacter.name.trim() && (newCharacter.appearance.trim() || (newCharacter.referenceImages && newCharacter.referenceImages.length > 0))) {
      onCharactersChange([...characters, newCharacter]);
      setNewCharacter({ name: "", appearance: "", referenceImages: [] });
    }
  };

  const handleRemoveCharacter = (index: number) => {
    const updatedCharacters = characters.filter((_, i) => i !== index);
    onCharactersChange(updatedCharacters);
  };

  return (
    <>
      <div className="space-y-2">
        <Label>Pemisah Paragraf</Label>
        <Input placeholder="Masukkan pemisah antar paragraf" value={paragraphSeparator} onChange={(e) => onSeparatorChange(e.target.value)} className="mb-2" disabled={isGenerating} />
        <p className="text-xs text-muted-foreground">Default adalah jeda baris ganda. Masukkan pemisah kustom seperti "***" atau "###" jika diperlukan.</p>
      </div>

      <div className="space-y-2">
        <Label>Gaya</Label>
        <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={style} onChange={(e) => onStyleChange(e.target.value)} disabled={isGenerating}>
          <option value="photorealistic">Fotorealistis</option>
          <option value="digital-art">Seni Digital</option>
          <option value="anime">Anime</option>
          <option value="3d-render">3D Render</option>
          <option value="oil-painting">Lukisan Minyak</option>
          <option value="watercolor">Cat Air</option>
          <option value="comic-book">Komik</option>
          <option value="storyboard-sketch">Sketsa Storyboard</option>
        </select>
      </div>

      <div className="space-y-4">
        <Label>Karakter</Label>
        <div className="space-y-4 rounded-md border border-input p-3 bg-muted/20">
          {characters.length > 0 ? (
            <div className="space-y-3">
              {characters.map((character, index) => (
                <div key={index} className="flex items-start space-x-2 p-2 rounded-md bg-background">
                  <div className="flex-grow">
                    <p className="font-medium">{character.name}</p>
                    {character.appearance && (
                      <p className="text-xs text-muted-foreground">{character.appearance}</p>
                    )}
                    {character.referenceImages && character.referenceImages.length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {character.referenceImages.map((img, imgIdx) => (
                          <img key={imgIdx} src={img} alt={`Ref ${character.name} ${imgIdx + 1}`} className="w-10 h-10 rounded object-cover border border-border" />
                        ))}
                        <span className="text-xs text-muted-foreground self-center ml-1">
                          {character.referenceImages.length} gambar referensi
                        </span>
                      </div>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => handleRemoveCharacter(index)} disabled={isGenerating}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic text-center py-2">
              Belum ada karakter. Tambahkan karakter untuk konsistensi antar gambar.
            </p>
          )}

          <div className="space-y-3 border-t border-border pt-3">
            <div className="grid grid-cols-1 gap-2">
              <Input
                placeholder="Nama karakter (untuk pemanggilan dalam cerita)"
                value={newCharacter.name}
                onChange={(e) => setNewCharacter({ ...newCharacter, name: e.target.value })}
                disabled={isGenerating}
              />
              <Textarea
                placeholder="Deskripsi penampilan karakter (opsional jika upload gambar referensi)"
                value={newCharacter.appearance}
                onChange={(e) => setNewCharacter({ ...newCharacter, appearance: e.target.value })}
                disabled={isGenerating}
                className="min-h-16"
              />
            </div>

            {/* Reference Image Upload */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Gambar Referensi Karakter</span>
              </div>

              {newCharacter.referenceImages && newCharacter.referenceImages.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {newCharacter.referenceImages.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img src={img} alt={`Ref ${idx + 1}`} className="w-16 h-16 rounded-md object-cover border border-border" />
                      <button
                        onClick={() => handleRemoveRefImage(idx)}
                        className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-4 h-4 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleUploadReferenceImage(e.target.files)}
                  disabled={isGenerating || isUploading}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isGenerating || isUploading}
                  className="text-xs"
                >
                  {isUploading ? (
                    <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Mengupload...</>
                  ) : (
                    <><Upload className="h-3 w-3 mr-1" /> Upload Gambar Referensi</>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Upload gambar karakter dari berbagai sudut pandang untuk konsistensi yang lebih baik. Semakin banyak sudut pandang, semakin konsisten hasilnya.
              </p>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={handleAddCharacter}
              disabled={isGenerating || !newCharacter.name.trim() || (!newCharacter.appearance.trim() && !(newCharacter.referenceImages && newCharacter.referenceImages.length > 0))}
              className="w-full"
            >
              <PlusCircle className="h-4 w-4 mr-1" /> Tambah Karakter
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Instruksi Gambar Tambahan</Label>
          <Textarea placeholder="Tambahkan instruksi tambahan untuk pembuatan gambar (latar belakang, setting, suasana, pencahayaan, dll.)" value={characterDescriptions} onChange={(e) => onCharacterDescriptionsChange(e.target.value)} className="min-h-20" disabled={isGenerating} />
          <p className="text-xs text-muted-foreground">Instruksi ini akan diterapkan pada semua gambar yang dihasilkan untuk konsistensi.</p>
        </div>
      </div>
    </>
  );
};

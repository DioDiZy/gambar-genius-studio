import { useState } from 'react';
import { StoryScene, createEmptyScene, DetailedCharacter } from '@/types/character';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Trash2, Edit2, Check, X, GripVertical, ChevronUp, ChevronDown, BookOpen, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface StoryFlowManagerProps {
  scenes: StoryScene[];
  characters: DetailedCharacter[];
  onChange: (scenes: StoryScene[]) => void;
}

const SCENE_FIELDS: [keyof StoryScene, string][] = [
  ['title', 'Judul scene'], ['summary', 'Ringkasan adegan'], ['location', 'Lokasi'],
  ['timeOfDay', 'Waktu kejadian'], ['mainAction', 'Aksi utama'], ['mainEmotion', 'Emosi utama'],
  ['importantDialogue', 'Dialog penting'], ['pageNarration', 'Narasi halaman'],
  ['sceneGoal', 'Tujuan scene'], ['prevConnection', 'Hubungan scene sebelumnya'],
  ['nextConnection', 'Hubungan scene berikutnya'], ['consistencyNotes', 'Catatan konsistensi'],
];

export function StoryFlowManager({ scenes, characters, onChange }: StoryFlowManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<StoryScene | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const sorted = [...scenes].sort((a, b) => a.order - b.order);

  const startEdit = (s: StoryScene) => { setEditingId(s.id); setDraft({ ...s, characterIds: [...s.characterIds] }); };
  const cancelEdit = () => { setEditingId(null); setDraft(null); };
  const saveEdit = () => {
    if (!draft) return;
    onChange(scenes.map(s => s.id === draft.id ? draft : s));
    cancelEdit();
    toast.success('Scene diperbarui');
  };

  const addScene = () => {
    const s = createEmptyScene(sorted.length + 1);
    onChange([...scenes, s]);
    startEdit(s);
  };

  const deleteScene = (id: string) => {
    const filtered = scenes.filter(s => s.id !== id);
    // re-order
    const reordered = filtered.sort((a, b) => a.order - b.order).map((s, i) => ({ ...s, order: i + 1 }));
    onChange(reordered);
    if (editingId === id) cancelEdit();
    toast.success('Scene dihapus');
  };

  const moveScene = (id: string, direction: 'up' | 'down') => {
    const idx = sorted.findIndex(s => s.id === id);
    if ((direction === 'up' && idx === 0) || (direction === 'down' && idx === sorted.length - 1)) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    const updated = [...sorted];
    [updated[idx], updated[swapIdx]] = [updated[swapIdx], updated[idx]];
    onChange(updated.map((s, i) => ({ ...s, order: i + 1 })));
  };

  const toggleCharacter = (charId: string) => {
    if (!draft) return;
    const ids = draft.characterIds.includes(charId)
      ? draft.characterIds.filter(id => id !== charId)
      : [...draft.characterIds, charId];
    setDraft({ ...draft, characterIds: ids });
  };

  const getWarnings = (scene: StoryScene): string[] => {
    const w: string[] = [];
    if (!scene.summary) w.push('Ringkasan adegan kosong');
    if (!scene.location) w.push('Lokasi kosong');
    if (!scene.mainAction) w.push('Aksi utama kosong');
    if (!scene.sceneGoal) w.push('Tujuan scene kosong');
    if (scene.characterIds.length === 0) w.push('Tidak ada karakter dipilih');
    scene.characterIds.forEach(cid => {
      if (!characters.find(c => c.id === cid)) w.push(`Karakter "${cid.slice(0, 8)}..." tidak ditemukan (Broken Reference)`);
    });
    return w;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen size={18} className="text-pink-500" />
          <h3 className="font-bold text-foreground">Alur Cerita</h3>
          <Badge variant="secondary" className="text-xs">{scenes.length} scene</Badge>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => setShowPreview(!showPreview)}>
            {showPreview ? 'Tutup Preview' : 'Preview Alur'}
          </Button>
          <Button size="sm" variant="outline" onClick={addScene} className="gap-1">
            <PlusCircle size={14} /> Tambah Scene
          </Button>
        </div>
      </div>

      {showPreview && sorted.length > 0 && (
        <div className="rounded-xl border bg-card/60 p-4 space-y-3">
          <h4 className="font-semibold text-sm">Preview Alur Cerita</h4>
          {sorted.map(s => (
            <div key={s.id} className="flex gap-3 text-sm">
              <Badge variant="outline" className="shrink-0">{s.order}</Badge>
              <div>
                <span className="font-medium">{s.title || 'Tanpa Judul'}</span>
                {s.summary && <span className="text-muted-foreground"> — {s.summary}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {scenes.length === 0 && (
        <p className="text-sm text-muted-foreground italic text-center py-6">Belum ada scene. Tambahkan scene untuk mengatur alur ceritamu.</p>
      )}

      <div className="space-y-2">
        {sorted.map(scene => {
          const isEditing = editingId === scene.id;
          const warnings = getWarnings(scene);
          const sceneChars = scene.characterIds.map(id => characters.find(c => c.id === id)).filter(Boolean);
          return (
            <div key={scene.id} className="border rounded-xl p-3 bg-card/60 space-y-2">
              <div className="flex items-center gap-2">
                <GripVertical size={14} className="text-muted-foreground" />
                <Badge variant="outline" className="text-xs">{scene.order}</Badge>
                <span className="font-semibold text-sm flex-1">{scene.title || 'Tanpa Judul'}</span>
                {warnings.length > 0 && (
                  <Badge variant="destructive" className="text-xs gap-1"><AlertTriangle size={10} />{warnings.length}</Badge>
                )}
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => moveScene(scene.id, 'up')}><ChevronUp size={14} /></Button>
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => moveScene(scene.id, 'down')}><ChevronDown size={14} /></Button>
                  {!isEditing && <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => startEdit(scene)}><Edit2 size={14} /></Button>}
                  <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => deleteScene(scene.id)}><Trash2 size={14} /></Button>
                </div>
              </div>

              {!isEditing && (
                <div className="text-xs text-muted-foreground space-y-1">
                  {scene.summary && <p>{scene.summary}</p>}
                  {sceneChars.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {sceneChars.map(c => c && <Badge key={c.id} variant="secondary" className="text-xs">{c.name}</Badge>)}
                    </div>
                  )}
                  {warnings.length > 0 && (
                    <div className="space-y-0.5 mt-1">
                      {warnings.map((w, i) => <p key={i} className="text-destructive text-xs">⚠ {w}</p>)}
                    </div>
                  )}
                </div>
              )}

              {isEditing && draft && (
                <div className="space-y-3 pt-2">
                  {SCENE_FIELDS.map(([field, label]) => (
                    <div key={field} className="space-y-1">
                      <Label className="text-xs">{label}</Label>
                      {field === 'summary' || field === 'importantDialogue' || field === 'pageNarration' || field === 'consistencyNotes' ? (
                        <Textarea value={(draft as any)[field] || ''} onChange={e => setDraft({ ...draft, [field]: e.target.value })} className="min-h-[50px] text-sm" placeholder={label} />
                      ) : (
                        <Input value={(draft as any)[field] || ''} onChange={e => setDraft({ ...draft, [field]: e.target.value })} className="text-sm" placeholder={label} />
                      )}
                    </div>
                  ))}

                  {/* Character selection */}
                  <div className="space-y-1">
                    <Label className="text-xs">Karakter yang muncul</Label>
                    {characters.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">Tambahkan karakter terlebih dahulu di tab Karakter.</p>
                    ) : (
                      <div className="flex gap-2 flex-wrap">
                        {characters.map(c => (
                          <Badge
                            key={c.id}
                            variant={draft.characterIds.includes(c.id) ? 'default' : 'outline'}
                            className="cursor-pointer text-xs"
                            onClick={() => toggleCharacter(c.id)}
                          >
                            {c.name || 'Tanpa Nama'}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button size="sm" onClick={saveEdit} className="gap-1"><Check size={14} /> Simpan</Button>
                    <Button size="sm" variant="ghost" onClick={cancelEdit} className="gap-1"><X size={14} /> Batal</Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
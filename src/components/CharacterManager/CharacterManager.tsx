import { useState } from 'react';
import { DetailedCharacter, createEmptyCharacter, generateCharacterPromptBlock } from '@/types/character';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PlusCircle, Trash2, Copy, Lock, Unlock, Edit2, Check, X, Users } from 'lucide-react';
import { toast } from 'sonner';

interface CharacterManagerProps {
  characters: DetailedCharacter[];
  onChange: (chars: DetailedCharacter[]) => void;
}

const FIELD_LABELS: Record<string, string> = {
  name: 'Nama', role: 'Peran', age: 'Usia', personality: 'Kepribadian',
  physicalTraits: 'Ciri fisik utama', hairStyle: 'Gaya rambut', hairColor: 'Warna rambut',
  eyeColor: 'Warna mata', bodyShape: 'Bentuk tubuh', mainOutfit: 'Pakaian utama',
  dominantColor: 'Warna dominan', typicalExpression: 'Ekspresi khas',
  signatureAccessory: 'Aksesori khas', relationships: 'Hubungan dengan karakter lain',
};

const LOCKABLE_FIELDS = ['name', 'age', 'physicalTraits', 'hairStyle', 'hairColor', 'eyeColor', 'bodyShape', 'mainOutfit', 'dominantColor', 'signatureAccessory'];

export function CharacterManager({ characters, onChange }: CharacterManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<DetailedCharacter | null>(null);

  const startEdit = (char: DetailedCharacter) => {
    setEditingId(char.id);
    setDraft({ ...char });
  };

  const cancelEdit = () => { setEditingId(null); setDraft(null); };

  const saveEdit = () => {
    if (!draft) return;
    onChange(characters.map(c => c.id === draft.id ? draft : c));
    setEditingId(null);
    setDraft(null);
    toast.success('Karakter diperbarui');
  };

  const addNew = () => {
    const c = createEmptyCharacter();
    onChange([...characters, c]);
    startEdit(c);
  };

  const deleteChar = (id: string) => {
    onChange(characters.filter(c => c.id !== id));
    if (editingId === id) cancelEdit();
    toast.success('Karakter dihapus');
  };

  const copyPrompt = (char: DetailedCharacter) => {
    const text = generateCharacterPromptBlock(char);
    navigator.clipboard.writeText(text);
    toast.success('Deskripsi karakter disalin ke clipboard');
  };

  const toggleLock = (field: string) => {
    if (!draft) return;
    const locked = draft.lockedFields.includes(field)
      ? draft.lockedFields.filter(f => f !== field)
      : [...draft.lockedFields, field];
    setDraft({ ...draft, lockedFields: locked });
  };

  const updateDraftField = (field: keyof DetailedCharacter, value: string) => {
    if (!draft) return;
    setDraft({ ...draft, [field]: value });
  };

  const renderField = (field: string, label: string) => {
    if (!draft) return null;
    const isLocked = draft.lockedFields.includes(field);
    const val = (draft as any)[field] || '';
    return (
      <div key={field} className="space-y-1">
        <div className="flex items-center gap-2">
          <Label className="text-xs">{label}</Label>
          {LOCKABLE_FIELDS.includes(field) && (
            <button onClick={() => toggleLock(field)} className="text-muted-foreground hover:text-foreground" title={isLocked ? 'Buka kunci' : 'Kunci agar tidak berubah'}>
              {isLocked ? <Lock size={12} className="text-orange-500" /> : <Unlock size={12} />}
            </button>
          )}
        </div>
        {field === 'personality' || field === 'physicalTraits' || field === 'relationships' ? (
          <Textarea value={val} onChange={e => updateDraftField(field as keyof DetailedCharacter, e.target.value)} className="min-h-[60px] text-sm" placeholder={label} />
        ) : (
          <Input value={val} onChange={e => updateDraftField(field as keyof DetailedCharacter, e.target.value)} className="text-sm" placeholder={label} />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-orange-500" />
          <h3 className="font-bold text-foreground">Karakter</h3>
          <Badge variant="secondary" className="text-xs">{characters.length}</Badge>
        </div>
        <Button size="sm" variant="outline" onClick={addNew} className="gap-1">
          <PlusCircle size={14} /> Tambah
        </Button>
      </div>

      {characters.length === 0 && (
        <p className="text-sm text-muted-foreground italic text-center py-6">Belum ada karakter. Tambahkan karakter untuk menjaga konsistensi visual.</p>
      )}

      <Accordion type="multiple" className="space-y-2">
        {characters.map(char => {
          const isEditing = editingId === char.id;
          const missing = Object.entries(FIELD_LABELS).filter(([k]) => !(char as any)[k]).length;
          return (
            <AccordionItem key={char.id} value={char.id} className="border rounded-xl px-3 bg-card/60">
              <AccordionTrigger className="py-2 hover:no-underline">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold">{char.name || 'Tanpa Nama'}</span>
                  {char.role && <Badge variant="outline" className="text-xs">{char.role}</Badge>}
                  {missing > 0 && <Badge variant="destructive" className="text-xs">{missing} data kosong</Badge>}
                  {char.lockedFields.length > 0 && <Lock size={12} className="text-orange-500" />}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-3">
                {isEditing && draft ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {Object.entries(FIELD_LABELS).map(([k, v]) => renderField(k, v))}
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" onClick={saveEdit} className="gap-1"><Check size={14} /> Simpan</Button>
                      <Button size="sm" variant="ghost" onClick={cancelEdit} className="gap-1"><X size={14} /> Batal</Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      {Object.entries(FIELD_LABELS).map(([k, v]) => {
                        const val = (char as any)[k];
                        return (
                          <div key={k}>
                            <span className="text-muted-foreground text-xs">{v}:</span>{' '}
                            <span className={val ? '' : 'text-destructive italic'}>{val || 'kosong'}</span>
                            {char.lockedFields.includes(k) && <Lock size={10} className="inline ml-1 text-orange-500" />}
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" onClick={() => startEdit(char)} className="gap-1"><Edit2 size={14} /> Edit</Button>
                      <Button size="sm" variant="outline" onClick={() => copyPrompt(char)} className="gap-1"><Copy size={14} /> Salin Deskripsi</Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteChar(char.id)} className="gap-1"><Trash2 size={14} /> Hapus</Button>
                    </div>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
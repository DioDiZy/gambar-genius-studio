import { DetailedCharacter, StoryScene, ConsistencyIssue } from '@/types/character';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, XCircle, Info, Download, Upload, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { useRef, useState } from 'react';

interface ConsistencyCheckerProps {
  characters: DetailedCharacter[];
  scenes: StoryScene[];
  onImport: (chars: DetailedCharacter[], scenes: StoryScene[]) => void;
  onReset: () => void;
}

function runChecks(characters: DetailedCharacter[], scenes: StoryScene[]): ConsistencyIssue[] {
  const issues: ConsistencyIssue[] = [];

  // Character checks
  characters.forEach(c => {
    if (!c.name) issues.push({ type: 'missing_data', target: 'Karakter', targetId: c.id, message: 'Nama karakter kosong', suggestion: 'Isi nama karakter.' });
    if (!c.physicalTraits) issues.push({ type: 'needs_attention', target: `Karakter "${c.name || '?'}"`, targetId: c.id, message: 'Ciri fisik utama kosong', suggestion: 'Tambahkan ciri fisik agar gambar konsisten.' });
    if (!c.mainOutfit) issues.push({ type: 'needs_attention', target: `Karakter "${c.name || '?'}"`, targetId: c.id, message: 'Pakaian utama kosong', suggestion: 'Tambahkan pakaian utama.' });
    if (!c.hairColor) issues.push({ type: 'needs_attention', target: `Karakter "${c.name || '?'}"`, targetId: c.id, message: 'Warna rambut kosong', suggestion: 'Tambahkan warna rambut.' });
    if (!c.eyeColor) issues.push({ type: 'needs_attention', target: `Karakter "${c.name || '?'}"`, targetId: c.id, message: 'Warna mata kosong', suggestion: 'Tambahkan warna mata.' });
  });

  // Scene checks
  scenes.forEach(s => {
    if (!s.title) issues.push({ type: 'missing_data', target: `Scene ${s.order}`, targetId: s.id, message: 'Judul scene kosong', suggestion: 'Tambahkan judul scene.' });
    if (!s.summary) issues.push({ type: 'missing_data', target: `Scene ${s.order}`, targetId: s.id, message: 'Ringkasan adegan kosong', suggestion: 'Tambahkan ringkasan.' });
    if (!s.location) issues.push({ type: 'needs_attention', target: `Scene ${s.order}`, targetId: s.id, message: 'Lokasi kosong', suggestion: 'Tambahkan lokasi agar gambar akurat.' });
    if (!s.mainAction) issues.push({ type: 'needs_attention', target: `Scene ${s.order}`, targetId: s.id, message: 'Aksi utama kosong', suggestion: 'Tambahkan aksi utama.' });
    if (!s.sceneGoal) issues.push({ type: 'needs_attention', target: `Scene ${s.order}`, targetId: s.id, message: 'Tujuan scene kosong', suggestion: 'Jelaskan tujuan scene.' });
    if (s.characterIds.length === 0) issues.push({ type: 'needs_attention', target: `Scene ${s.order}`, targetId: s.id, message: 'Tidak ada karakter dipilih', suggestion: 'Pilih karakter yang muncul.' });
    s.characterIds.forEach(cid => {
      if (!characters.find(c => c.id === cid)) {
        issues.push({ type: 'broken_reference', target: `Scene ${s.order}`, targetId: s.id, message: `Referensi karakter rusak (ID: ${cid.slice(0, 8)}...)`, suggestion: 'Hapus karakter ini dari scene atau tambahkan kembali.' });
      }
    });
  });

  // Flow continuity
  const sorted = [...scenes].sort((a, b) => a.order - b.order);
  for (let i = 1; i < sorted.length; i++) {
    if (!sorted[i].prevConnection) {
      issues.push({ type: 'needs_attention', target: `Scene ${sorted[i].order}`, targetId: sorted[i].id, message: 'Tidak ada hubungan dengan scene sebelumnya', suggestion: 'Jelaskan keterhubungan dengan scene sebelumnya.' });
    }
  }

  return issues;
}

const STATUS_ICON: Record<string, React.ReactNode> = {
  consistent: <CheckCircle size={14} className="text-green-500" />,
  needs_attention: <Info size={14} className="text-yellow-500" />,
  missing_data: <AlertTriangle size={14} className="text-orange-500" />,
  broken_reference: <XCircle size={14} className="text-destructive" />,
};

export function ConsistencyChecker({ characters, scenes, onImport, onReset }: ConsistencyCheckerProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [showReset, setShowReset] = useState(false);
  const issues = runChecks(characters, scenes);

  const exportData = () => {
    const data = { characters, scenes, exportedAt: new Date().toISOString(), version: 1 };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `story-data-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
    toast.success('Data berhasil diexport');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (!Array.isArray(data.characters) || !Array.isArray(data.scenes)) {
          toast.error('Format JSON tidak valid. Harus memiliki field "characters" dan "scenes".');
          return;
        }
        onImport(data.characters, data.scenes);
        toast.success('Data berhasil diimport');
      } catch {
        toast.error('Gagal membaca file JSON. Pastikan format valid.');
      }
    };
    reader.readAsText(file);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleReset = () => {
    onReset();
    setShowReset(false);
    toast.success('Semua data karakter dan alur telah direset');
  };

  const broken = issues.filter(i => i.type === 'broken_reference').length;
  const missing = issues.filter(i => i.type === 'missing_data').length;
  const attention = issues.filter(i => i.type === 'needs_attention').length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-bold text-foreground">Pengecekan Konsistensi</h3>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant="outline" onClick={exportData} className="gap-1"><Download size={14} /> Export JSON</Button>
          <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} className="gap-1"><Upload size={14} /> Import JSON</Button>
          <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          {!showReset ? (
            <Button size="sm" variant="destructive" onClick={() => setShowReset(true)} className="gap-1"><RotateCcw size={14} /> Reset</Button>
          ) : (
            <div className="flex gap-1">
              <Button size="sm" variant="destructive" onClick={handleReset}>Ya, Reset Semua</Button>
              <Button size="sm" variant="ghost" onClick={() => setShowReset(false)}>Batal</Button>
            </div>
          )}
        </div>
      </div>

      {/* Summary badges */}
      <div className="flex gap-2 flex-wrap">
        {issues.length === 0 ? (
          <Badge className="bg-green-100 text-green-700 gap-1"><CheckCircle size={12} /> Semua Konsisten</Badge>
        ) : (
          <>
            {broken > 0 && <Badge variant="destructive" className="gap-1"><XCircle size={12} /> {broken} Broken Reference</Badge>}
            {missing > 0 && <Badge className="bg-orange-100 text-orange-700 gap-1"><AlertTriangle size={12} /> {missing} Missing Data</Badge>}
            {attention > 0 && <Badge className="bg-yellow-100 text-yellow-700 gap-1"><Info size={12} /> {attention} Needs Attention</Badge>}
          </>
        )}
      </div>

      {/* Issue list */}
      {issues.length > 0 && (
        <div className="space-y-1 max-h-60 overflow-y-auto">
          {issues.map((issue, i) => (
            <div key={i} className="flex items-start gap-2 text-sm p-2 rounded-lg bg-muted/40">
              {STATUS_ICON[issue.type]}
              <div className="flex-1">
                <span className="font-medium">{issue.target}:</span> {issue.message}
                <p className="text-xs text-muted-foreground mt-0.5">💡 {issue.suggestion}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Autosave indicator */}
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        <CheckCircle size={10} className="text-green-500" /> Data otomatis tersimpan di browser (localStorage)
      </p>
    </div>
  );
}
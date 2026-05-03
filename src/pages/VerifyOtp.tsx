import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CustomButton } from "@/components/ui/custom-button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

const OTP_LENGTH = 6;

const VerifyOtp = () => {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const type = (searchParams.get("type") || "recovery") as "recovery" | "signup" | "email";

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    const next = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i];
    }
    setOtp(next);
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();
  };

  const handleSubmit = async () => {
    const token = otp.join("");
    if (token.length !== OTP_LENGTH) {
      toast({ title: "Kode tidak lengkap", description: "Masukkan 6 digit kode OTP.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.verifyOtp({ email, token, type });
      if (error) {
        toast({ title: "Verifikasi gagal", description: error.message, variant: "destructive" });
        return;
      }
      if (type === "recovery") {
        toast({ title: "Kode valid!", description: "Silakan buat password baru." });
        navigate("/reset-password");
      } else {
        toast({ title: "Verifikasi berhasil!", description: "Akun kamu sudah terverifikasi." });
        navigate("/dashboard");
      }
    } catch {
      toast({ title: "Error", description: "Terjadi kesalahan.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-orange-50 via-pink-50 to-sky-50 pt-24 pb-12">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-40px] top-28 h-36 w-36 rounded-full bg-pink-200/40 blur-2xl" />
        <div className="absolute right-[-30px] top-40 h-40 w-40 rounded-full bg-yellow-200/40 blur-2xl" />
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <div className="mx-auto max-w-md">
          <div className="relative">
            <Link to="/forgot-password" className="absolute -left-2 -top-2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-600 shadow-md transition-all hover:bg-orange-50 hover:text-orange-500">
              <ArrowLeft size={20} />
            </Link>

            <div className="rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.10)] backdrop-blur md:p-8">
              <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-[24px] bg-gradient-to-br from-violet-400 via-blue-400 to-cyan-400 text-3xl shadow-lg">🔢</div>
                <h2 className="text-2xl font-extrabold text-slate-800 md:text-3xl">Masukkan Kode OTP</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Kami telah mengirim kode 6 digit ke{" "}
                  <span className="font-semibold text-slate-700">{email || "email kamu"}</span>.
                </p>
              </div>

              <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    disabled={isSubmitting}
                    className="h-14 w-12 rounded-2xl border-2 border-slate-200 bg-white/90 text-center text-xl font-bold text-slate-800 shadow-sm transition-all focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200 disabled:opacity-50"
                  />
                ))}
              </div>

              <CustomButton
                variant="gradient"
                className="h-12 w-full rounded-2xl text-sm font-bold shadow-lg"
                disabled={isSubmitting || otp.join("").length !== OTP_LENGTH}
                onClick={handleSubmit}
              >
                {isSubmitting ? "Memverifikasi..." : "Verifikasi Kode"}
              </CustomButton>

              <div className="mt-6 text-center">
                <Link to="/signin" className="text-sm font-semibold text-orange-500 transition hover:text-orange-600 hover:underline">
                  Kembali ke halaman login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default VerifyOtp;
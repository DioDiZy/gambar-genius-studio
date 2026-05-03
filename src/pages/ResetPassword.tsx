import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CustomButton } from "@/components/ui/custom-button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const resetSchema = z.object({
  password: z.string().min(8, { message: "Password minimal 8 karakter" }),
  confirmPassword: z.string().min(8, { message: "Konfirmasi password minimal 8 karakter" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
});

type ResetValues = z.infer<typeof resetSchema>;

const ResetPassword = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  useEffect(() => {
    // Check for recovery session from URL hash
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get("type");
    
    if (type === "recovery") {
      setIsValidSession(true);
    }
    
    // Also check if user has a valid session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsValidSession(true);
      }
      setIsChecking(false);
    });
  }, []);

  const onSubmit = async (data: ResetValues) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: data.password });
      if (error) {
        toast({ title: "Gagal", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "Berhasil!", description: "Password berhasil diubah. Silakan login dengan password baru." });
      await supabase.auth.signOut();
      navigate("/signin");
    } catch {
      toast({ title: "Error", description: "Terjadi kesalahan.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isChecking) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 via-pink-50 to-sky-50">
        <p className="text-slate-600">Memverifikasi...</p>
      </main>
    );
  }

  if (!isValidSession) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 via-pink-50 to-sky-50">
        <div className="text-center space-y-4">
          <p className="text-slate-600">Link reset password tidak valid atau sudah kadaluarsa.</p>
          <CustomButton variant="gradient" onClick={() => navigate("/forgot-password")}>
            Minta Link Baru
          </CustomButton>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-orange-50 via-pink-50 to-sky-50 pt-24 pb-12">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-40px] top-28 h-36 w-36 rounded-full bg-pink-200/40 blur-2xl" />
        <div className="absolute right-[-30px] top-40 h-40 w-40 rounded-full bg-yellow-200/40 blur-2xl" />
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <div className="mx-auto max-w-md">
          <div className="rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.10)] backdrop-blur md:p-8">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-[24px] bg-gradient-to-br from-green-400 via-teal-400 to-blue-400 text-3xl shadow-lg">🔒</div>
              <h2 className="text-2xl font-extrabold text-slate-800 md:text-3xl">Reset Password</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">Masukkan password baru untuk akunmu.</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-slate-700">Password Baru</FormLabel>
                      <FormControl>
                        <Input placeholder="••••••••" {...field} type="password" disabled={isSubmitting} className="h-12 rounded-2xl border-slate-200 bg-white/90 px-4 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-orange-300" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-slate-700">Konfirmasi Password</FormLabel>
                      <FormControl>
                        <Input placeholder="••••••••" {...field} type="password" disabled={isSubmitting} className="h-12 rounded-2xl border-slate-200 bg-white/90 px-4 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-orange-300" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <CustomButton type="submit" variant="gradient" className="h-12 w-full rounded-2xl text-sm font-bold shadow-lg" disabled={isSubmitting}>
                  {isSubmitting ? "Menyimpan..." : "Simpan Password Baru"}
                </CustomButton>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ResetPassword;
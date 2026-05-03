import { useState } from "react";
import { Link } from "react-router-dom";
import { CustomButton } from "@/components/ui/custom-button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

const forgotSchema = z.object({
  email: z.string().email({ message: "Masukkan alamat email yang valid" }),
});

type ForgotValues = z.infer<typeof forgotSchema>;

const ForgotPassword = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const { toast } = useToast();

  const form = useForm<ForgotValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotValues) => {
    setIsSubmitting(true);
    try {
      // const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      //   redirectTo: `${window.location.origin}/verify-otp?email=${encodeURIComponent(data.email)}&type=recovery`,
      // });
      const siteUrl = import.meta.env.VITE_SITE_URL;

      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${siteUrl}/reset-password`,
      });
      if (error) {
        toast({ title: "Gagal", description: error.message, variant: "destructive" });
        return;
      }
      setSentEmail(data.email);
      setEmailSent(true);
      toast({ title: "Email terkirim!", description: "Cek email kamu untuk link reset password." });
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
            <Link to="/signin" className="absolute -left-2 -top-2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-600 shadow-md transition-all hover:bg-orange-50 hover:text-orange-500">
              <ArrowLeft size={20} />
            </Link>

            <div className="rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.10)] backdrop-blur md:p-8">
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-extrabold text-slate-800 md:text-3xl">Lupa Password?</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">Masukkan email akunmu, kami akan mengirimkan link untuk reset password.</p>
              </div>

              {emailSent ? (
                <div className="text-center space-y-4 py-4">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">✉️</div>
                  <h3 className="text-lg font-bold text-slate-800">Email Terkirim!</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Link reset password telah dikirim ke <span className="font-semibold">{sentEmail}</span>. Cek inbox atau folder spam kamu.
                  </p>
                  <Link to="/signin">
                    <CustomButton variant="gradient" className="h-12 w-full rounded-2xl text-sm font-bold shadow-lg mt-2">
                      Kembali ke Login
                    </CustomButton>
                  </Link>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-slate-700">Email</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="email@anda.com"
                              {...field}
                              type="email"
                              disabled={isSubmitting}
                              className="h-12 rounded-2xl border-slate-200 bg-white/90 px-4 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-orange-300"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <CustomButton type="submit" variant="gradient" className="h-12 w-full rounded-2xl text-sm font-bold shadow-lg" disabled={isSubmitting}>
                      {isSubmitting ? "Mengirim..." : "Kirim Link Reset"}
                    </CustomButton>
                  </form>
                </Form>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ForgotPassword;

import { Navbar } from "@/components/Navbar";
import { CustomButton } from "@/components/ui/custom-button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft } from "lucide-react";

const signUpSchema = z.object({
  name: z.string().min(2, { message: "Nama minimal 2 karakter" }),
  email: z.string().email({ message: "Masukkan alamat email yang valid" }),
  password: z.string().min(8, { message: "Kata sandi minimal 8 karakter" }),
  agreedToTerms: z.boolean().refine((val) => val === true, {
    message: "Anda harus menyetujui syarat dan kebijakan privasi",
  }),
});

type SignUpValues = z.infer<typeof signUpSchema>;

const SignUp = () => {
  const { signUp, user, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      agreedToTerms: false,
    },
  });

  const onSubmit = async (data: SignUpValues) => {
    setIsSubmitting(true);
    try {
      await signUp(data.email, data.password, data.name);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user && !isLoading) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <>
      <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-orange-50 via-pink-50 to-sky-50 pt-24 pb-12">
        {/* Decorative Background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[-40px] top-28 h-36 w-36 rounded-full bg-pink-200/40 blur-2xl" />
          <div className="absolute right-[-30px] top-40 h-40 w-40 rounded-full bg-yellow-200/40 blur-2xl" />
          <div className="absolute bottom-10 left-[10%] h-28 w-28 rounded-full bg-sky-200/40 blur-2xl" />
          <div className="absolute bottom-0 right-[12%] h-36 w-36 rounded-full bg-orange-200/40 blur-2xl" />

          <div className="absolute left-[8%] top-40 text-2xl opacity-70">🎨</div>
          <div className="absolute left-[14%] bottom-24 text-2xl opacity-70">🚀</div>
        </div>

        <div className="container relative z-10 mx-auto px-4">
          <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-[1.08fr_0.92fr]">
            {/* Left Content (Hidden on Mobile, same style as SignIn) */}
            <section className="order-2 lg:order-1 hidden md:flex">
              <div className="max-w-xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-pink-200 bg-white/80 px-4 py-2 text-sm font-semibold text-pink-500 shadow-sm backdrop-blur">
                  <span>🚀</span>
                  <span>Mulailah perjalanan kreatifmu</span>
                </div>

                <h1 className="text-4xl font-extrabold leading-tight text-slate-800 md:text-5xl">
                  Wujudkan imajinasimu
                  <span className="block bg-gradient-to-r from-violet-500 via-pink-500 to-orange-500 bg-clip-text text-transparent">menjadi kenyataan</span>
                </h1>

                <p className="mt-4 max-w-lg text-base leading-7 text-slate-600 md:text-lg">Bergabunglah dengan ribuan petualang lainnya. Buat cerita ajaib dan gambar unik hanya dengan kata-katamu.</p>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl border border-violet-100 bg-white/80 p-4 shadow-sm backdrop-blur">
                    <div className="mb-2 text-2xl">✨</div>
                    <h3 className="text-sm font-bold text-slate-800">Akses Gratis</h3>
                    <p className="mt-1 text-sm text-slate-600">Mulai petualanganmu tanpa biaya sepeserpun.</p>
                  </div>

                  <div className="rounded-3xl border border-orange-100 bg-white/80 p-4 shadow-sm backdrop-blur">
                    <div className="mb-2 text-2xl">⚡</div>
                    <h3 className="text-sm font-bold text-slate-800">Proses Cepat</h3>
                    <p className="mt-1 text-sm text-slate-600">Gambar ajaibmu jadi dalam hitungan detik.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Right Form Card */}
            <section className="order-1 lg:order-2">
              <div className="relative mx-auto max-w-md">
                {/* Back Button */}
                <Link
                  to="/"
                  className="absolute -left-2 -top-2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-600 shadow-md transition-all hover:scale-110 hover:bg-orange-50 hover:text-orange-500 active:scale-95 md:-left-4"
                >
                  <ArrowLeft size={20} />
                </Link>

                <div className="absolute -top-4 -right-3 rounded-full bg-sky-300 px-3 py-1 text-xs font-bold text-slate-800 shadow-md">Gratis! 🎁</div>

                <div className="rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.10)] backdrop-blur md:p-8">
                  <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-[24px] bg-gradient-to-br from-violet-400 via-pink-400 to-orange-400 text-3xl shadow-lg">📝</div>
                    <h2 className="text-2xl font-extrabold text-slate-800 md:text-3xl">Buat Akun Baru</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Daftar sekarang dan klaim <span className="font-semibold text-slate-700">Energi Ajaib</span> pertamamu.
                    </p>
                  </div>

                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-semibold text-slate-700">Nama Lengkap</FormLabel>
                            <FormControl>
                              <Input placeholder="Nama petualangmu" {...field} disabled={isSubmitting} className="h-12 rounded-2xl border-slate-200 bg-white/90 px-4 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-violet-300" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

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
                                className="h-12 rounded-2xl border-slate-200 bg-white/90 px-4 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-violet-300"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-semibold text-slate-700">Kata Sandi</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="••••••••"
                                {...field}
                                type="password"
                                disabled={isSubmitting}
                                className="h-12 rounded-2xl border-slate-200 bg-white/90 px-4 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-violet-300"
                              />
                            </FormControl>
                            <FormMessage className="text-[10px] opacity-70" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="agreedToTerms"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-2">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isSubmitting} className="mt-1 rounded-md border-slate-300 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500" />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-xs font-medium text-slate-500">
                                Saya menyetujui{" "}
                                <Link to="/terms" className="text-pink-500 hover:underline">
                                  Syarat
                                </Link>{" "}
                                &{" "}
                                <Link to="/privacy" className="text-pink-500 hover:underline">
                                  Privasi
                                </Link>
                              </FormLabel>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />

                      <CustomButton type="submit" variant="gradient" className="h-12 w-full rounded-2xl text-sm font-bold shadow-lg transition-transform active:scale-95" disabled={isSubmitting}>
                        {isSubmitting ? "Mendaftarkan..." : "Mulai Petualangan"}
                      </CustomButton>
                    </form>
                  </Form>

                  <div className="mt-6 text-center">
                    <p className="text-sm text-slate-500">
                      Sudah punya akun?{" "}
                      <Link to="/signin" className="font-semibold text-violet-600 transition hover:text-violet-700 hover:underline">
                        Masuk di sini
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
};

export default SignUp;

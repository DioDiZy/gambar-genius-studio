import { Navbar } from "@/components/Navbar";
import { CustomButton } from "@/components/ui/custom-button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const signInSchema = z.object({
  email: z.string().email({ message: "Masukkan alamat email yang valid" }),
  password: z.string().min(6, { message: "Kata sandi minimal 6 karakter" }),
});

type SignInValues = z.infer<typeof signInSchema>;

const SignIn = () => {
  const { signIn, user, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignInValues) => {
    setIsSubmitting(true);
    try {
      await signIn(data.email, data.password);
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

          <div className="absolute left-[8%] top-40 text-2xl opacity-70">✨</div>

          <div className="absolute left-[14%] bottom-24 text-2xl opacity-70">⭐</div>
          <div className="absolute right-[18%] bottom-20 text-2xl opacity-70">☁️</div>
        </div>

        <div className="container relative z-10 mx-auto px-4">
          <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-[1.08fr_0.92fr]">
            {/* Left Content */}
            <section className="order-2 lg:order-1 hidden md:flex">
              <div className="max-w-xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-4 py-2 text-sm font-semibold text-orange-500 shadow-sm backdrop-blur">
                  <span>✨</span>
                  <span>Masuk dan lanjutkan petualanganmu</span>
                </div>

                <h1 className="text-4xl font-extrabold leading-tight text-slate-800 md:text-5xl">
                  Kembali ke dunia cerita
                  <span className="block bg-gradient-to-r from-orange-500 via-pink-500 to-violet-500 bg-clip-text text-transparent">dan gambar ajaib</span>
                </h1>

                <p className="mt-4 max-w-lg text-base leading-7 text-slate-600 md:text-lg">Masuk untuk melanjutkan cerita, membuat gambar baru, dan melihat hasil imajinasi seru yang pernah kamu buat sebelumnya.</p>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-3xl border border-orange-100 bg-white/80 p-4 shadow-sm backdrop-blur">
                    <div className="mb-2 text-2xl">📖</div>
                    <h3 className="text-sm font-bold text-slate-800">Lanjutkan Cerita</h3>
                    <p className="mt-1 text-sm text-slate-600">Buka lagi cerita yang belum selesai.</p>
                  </div>

                  <div className="rounded-3xl border border-pink-100 bg-white/80 p-4 shadow-sm backdrop-blur">
                    <div className="mb-2 text-2xl">🎨</div>
                    <h3 className="text-sm font-bold text-slate-800">Buat Gambar Baru</h3>
                    <p className="mt-1 text-sm text-slate-600">Ubah ide menjadi ilustrasi seru.</p>
                  </div>

                  <div className="rounded-3xl border border-sky-100 bg-white/80 p-4 shadow-sm backdrop-blur">
                    <div className="mb-2 text-2xl">🌟</div>
                    <h3 className="text-sm font-bold text-slate-800">Simpan Karya</h3>
                    <p className="mt-1 text-sm text-slate-600">Lihat kembali hasil favoritmu.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Right Form Card */}
            <section className="order-1 lg:order-2">
              <div className="relative mx-auto max-w-md">
                <Link to="/" className="absolute -left-2 -top-2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-600 shadow-md transition-all hover:bg-orange-50 hover:text-orange-500 md:-left-4">
                  ←
                </Link>
                <div className="absolute -top-4 -right-3 rounded-full bg-yellow-300 px-3 py-1 text-xs font-bold text-slate-800 shadow-md">Halo lagi! 👋</div>

                <div className="rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.10)] backdrop-blur md:p-8">
                  <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-[24px] bg-gradient-to-br from-orange-400 via-pink-400 to-violet-400 text-3xl shadow-lg">🔐</div>

                    <h2 className="text-2xl font-extrabold text-slate-800 md:text-3xl">Selamat Datang Kembali</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Masuk ke akun <span className="font-semibold text-slate-700">PembuatGambar</span> untuk melanjutkan ceritamu.
                    </p>
                  </div>

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

                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center justify-between gap-3">
                              <FormLabel className="text-sm font-semibold text-slate-700">Kata Sandi</FormLabel>
                              <Link to="/forgot-password" className="text-xs font-medium text-pink-500 transition hover:text-pink-600 hover:underline">
                                Lupa kata sandi?
                              </Link>
                            </div>
                            <FormControl>
                              <Input
                                placeholder="••••••••"
                                {...field}
                                type="password"
                                disabled={isSubmitting}
                                className="h-12 rounded-2xl border-slate-200 bg-white/90 px-4 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-orange-300"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <CustomButton type="submit" variant="gradient" className="h-12 w-full rounded-2xl text-sm font-bold shadow-lg" disabled={isSubmitting}>
                        {isSubmitting ? "Sedang Masuk..." : "Masuk Sekarang"}
                      </CustomButton>
                    </form>
                  </Form>

                  <div className="mt-6 text-center">
                    <p className="text-sm text-slate-500">
                      Belum punya akun?{" "}
                      <Link to="/signup" className="font-semibold text-orange-500 transition hover:text-orange-600 hover:underline">
                        Daftar di sini
                      </Link>
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
                  <span className="rounded-full bg-white/80 px-3 py-1 shadow-sm">Aman</span>
                  <span className="rounded-full bg-white/80 px-3 py-1 shadow-sm">Mudah</span>
                  <span className="rounded-full bg-white/80 px-3 py-1 shadow-sm">Seru</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
};

export default SignIn;

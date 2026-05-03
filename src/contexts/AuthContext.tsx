
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase, SUPABASE_URL } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setIsLoading(true);
      console.log('Attempting to sign up with Supabase URL:', SUPABASE_URL);
      
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        console.error('Supabase signup error:', error);
        let errorMessage = error.message;
        if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Tidak dapat terhubung ke layanan autentikasi. Periksa koneksi internet Anda dan coba lagi.';
        } else if (error.message.includes('User already registered')) {
          errorMessage = 'Akun dengan email ini sudah ada. Silakan masuk.';
        }
        toast({ title: "Pendaftaran gagal", description: errorMessage, variant: "destructive" });
        throw error;
      }

      console.log('Sign up successful:', data);
      
      // If email confirmation is required, user won't have a session yet
      if (data.user && !data.session) {
        toast({ title: "Pendaftaran berhasil!", description: "Silakan cek email kamu untuk verifikasi akun sebelum login." });
        navigate("/signin");
        return;
      }
      
      toast({ title: "Pendaftaran berhasil", description: "Selamat datang di PembuatGambar!" });
      navigate("/dashboard");
    } catch (error) {
      console.error("Error signing up:", error);
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        toast({
          title: "Kesalahan Koneksi",
          description: "Tidak dapat terhubung ke layanan autentikasi. Periksa koneksi internet Anda atau coba nonaktifkan ekstensi browser yang mungkin memblokir permintaan.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log('Attempting to sign in with Supabase URL:', SUPABASE_URL);
      
      const { error, data } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        console.error('Supabase auth error:', error);
        let errorMessage = error.message;
        if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Tidak dapat terhubung ke layanan autentikasi. Periksa koneksi internet Anda dan coba lagi.';
        } else if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Email atau kata sandi salah. Periksa kredensial Anda dan coba lagi.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Silakan periksa email Anda dan klik tautan konfirmasi sebelum masuk.';
        }
        toast({ title: "Gagal masuk", description: errorMessage, variant: "destructive" });
        throw error;
      }

      // Block unverified email users
      if (data.user && !data.user.email_confirmed_at) {
        await supabase.auth.signOut();
        toast({
          title: "Email belum diverifikasi",
          description: "Silakan cek email kamu dan klik tautan verifikasi sebelum masuk.",
          variant: "destructive",
        });
        return;
      }

      console.log('Sign in successful:', data);
      toast({ title: "Berhasil masuk", description: "Selamat datang kembali di PembuatGambar!" });
      navigate("/dashboard");
    } catch (error) {
      console.error("Error signing in:", error);
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        toast({
          title: "Kesalahan Koneksi",
          description: "Tidak dapat terhubung ke layanan autentikasi. Periksa koneksi internet Anda atau coba nonaktifkan ekstensi browser yang mungkin memblokir permintaan.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      toast({ title: "Berhasil keluar", description: "Anda telah berhasil keluar." });
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({ title: "Kesalahan saat keluar", description: "Terjadi kesalahan saat keluar.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

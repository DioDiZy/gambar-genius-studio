
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
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

  // Helper function to check network connectivity
  const isOnline = () => {
    return navigator.onLine;
  };

  // Helper function to handle network errors
  const handleNetworkError = (error: any) => {
    console.error('Network error details:', error);
    
    if (!isOnline()) {
      toast({
        title: "No Internet Connection",
        description: "Please check your internet connection and try again.",
        variant: "destructive",
      });
      return;
    }

    // Check for specific fetch/network errors
    if (error.message?.toLowerCase().includes('fetch') || 
        error.name?.toLowerCase().includes('fetch') ||
        error.message?.toLowerCase().includes('network') ||
        error.message?.toLowerCase().includes('connection')) {
      toast({
        title: "Connection Error",
        description: "Unable to connect to the authentication service. Please try again in a moment.",
        variant: "destructive",
      });
      return;
    }

    // Generic error handling
    toast({
      title: "Authentication Error",
      description: error.message || "An unexpected error occurred. Please try again.",
      variant: "destructive",
    });
  };

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            if (!mounted) return;
            
            console.log('Auth state changed:', event, session);
            setSession(session);
            setUser(session?.user ?? null);
            setIsLoading(false);
          }
        );

        // Check for existing session with retry logic
        let retries = 3;
        while (retries > 0 && mounted) {
          try {
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (!mounted) return;
            
            if (error) {
              console.error('Error getting session:', error);
              if (retries === 1) {
                // Last retry failed
                setIsLoading(false);
                return;
              }
            } else {
              console.log('Initial session:', session);
              setSession(session);
              setUser(session?.user ?? null);
              setIsLoading(false);
              break;
            }
          } catch (err) {
            console.error('Session check attempt failed:', err);
            if (retries === 1) {
              setIsLoading(false);
            }
          }
          
          retries--;
          if (retries > 0) {
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }

        return () => {
          mounted = false;
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  // Sign up function with improved error handling
  const signUp = async (email: string, password: string, fullName: string) => {
    if (!isOnline()) {
      toast({
        title: "No Internet Connection",
        description: "Please check your internet connection and try again.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Attempting to sign up user:', email);
      
      const redirectUrl = `${window.location.origin}/dashboard`;
      
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        console.error('Sign up error:', error);
        handleNetworkError(error);
        return;
      }

      console.log('Sign up successful:', data);
      
      if (data.user && !data.user.email_confirmed_at) {
        toast({
          title: "Registration successful",
          description: "Please check your email to verify your account.",
        });
      } else {
        toast({
          title: "Registration successful",
          description: "Welcome to PembuatGambar! You are now logged in.",
        });
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("Error signing up:", error);
      handleNetworkError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Sign in function with improved error handling
  const signIn = async (email: string, password: string) => {
    if (!isOnline()) {
      toast({
        title: "No Internet Connection",
        description: "Please check your internet connection and try again.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Attempting to sign in user:', email);
      
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        handleNetworkError(error);
        return;
      }

      console.log('Sign in successful:', data);
      toast({
        title: "Sign in successful",
        description: "Welcome back to PembuatGambar!",
      });

      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error signing in:", error);
      handleNetworkError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      navigate("/");
    } catch (error: any) {
      console.error("Error signing out:", error);
      toast({
        title: "Error signing out",
        description: "An error occurred while signing out.",
        variant: "destructive",
      });
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


import { Navbar } from "@/components/Navbar";
import { CustomButton } from "@/components/ui/custom-button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Wifi, WifiOff } from "lucide-react";

// Validation schema
const signUpSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
  agreedToTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and privacy policy"
  }),
});

type SignUpValues = z.infer<typeof signUpSchema>;

const SignUp = () => {
  const { signUp, user, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Initialize form
  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      agreedToTerms: false,
    },
  });

  // Monitor network connectivity
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const onSubmit = async (data: SignUpValues) => {
    if (!isOnline) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('Form submitted with data:', { ...data, password: '[REDACTED]' });
      await signUp(data.email, data.password, data.name);
    } catch (error: any) {
      console.error('Registration error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If the user is already authenticated, redirect to the dashboard
  if (user && !isLoading) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <>
      <Navbar showAuth={false} />
      <div className="min-h-screen pt-24 pb-12 flex flex-col justify-center">
        <div className="container max-w-md mx-auto">
          <div className="bg-background border rounded-xl shadow-sm p-8">
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold">Create an Account</h1>
              <p className="text-sm text-muted-foreground mt-2">
                Start creating amazing AI-generated images today
              </p>
            </div>

            {!isOnline && (
              <Alert variant="destructive" className="mb-6">
                <WifiOff className="h-4 w-4" />
                <AlertDescription>
                  No internet connection detected. Please check your connection and try again.
                </AlertDescription>
              </Alert>
            )}

            {isOnline && (
              <div className="flex items-center gap-2 mb-4 text-sm text-green-600">
                <Wifi className="h-4 w-4" />
                <span>Connected</span>
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John Doe"
                          {...field}
                          disabled={isSubmitting || !isOnline}
                        />
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
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="your@email.com"
                          {...field}
                          type="email"
                          disabled={isSubmitting || !isOnline}
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
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="••••••••"
                          {...field}
                          type="password"
                          disabled={isSubmitting || !isOnline}
                        />
                      </FormControl>
                      <FormMessage className="text-xs">
                        Password must be at least 8 characters long
                      </FormMessage>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="agreedToTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-1">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isSubmitting || !isOnline}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm text-muted-foreground leading-none">
                          I agree to the{" "}
                          <Link to="/terms" className="text-primary hover:underline">
                            Terms of Service
                          </Link>{" "}
                          and{" "}
                          <Link to="/privacy" className="text-primary hover:underline">
                            Privacy Policy
                          </Link>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <CustomButton
                  type="submit"
                  variant="gradient"
                  className="w-full"
                  disabled={isSubmitting || !form.getValues().agreedToTerms || !isOnline}
                >
                  {isSubmitting ? "Creating Account..." : 
                   !isOnline ? "No Connection" : "Create Account"}
                </CustomButton>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/signin" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignUp;

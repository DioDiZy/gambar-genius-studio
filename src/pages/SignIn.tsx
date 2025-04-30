
import { Navbar } from "@/components/Navbar";
import { CustomButton } from "@/components/ui/custom-button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Link } from "react-router-dom";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Authentication would be implemented here
    console.log("Sign in attempt with:", email);
  };

  return (
    <>
      <Navbar showAuth={false} />
      <div className="min-h-screen pt-24 pb-12 flex flex-col justify-center">
        <div className="container max-w-md mx-auto">
          <div className="bg-background border rounded-xl shadow-sm p-8">
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold">Welcome Back</h1>
              <p className="text-sm text-muted-foreground mt-2">
                Sign in to your PembuatGambar account
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="text-sm font-medium block mb-1">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label htmlFor="password" className="text-sm font-medium">
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-xs text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <CustomButton
                  type="submit"
                  variant="gradient"
                  className="w-full"
                >
                  Sign In
                </CustomButton>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/signup" className="text-primary hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignIn;

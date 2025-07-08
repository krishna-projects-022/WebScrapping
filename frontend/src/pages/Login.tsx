import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Database, Mail, Key, Loader2, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient, register } from "@/lib/api";

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSignup = async (name: string, email: string, password: string) => {
    try {
      const data = await register({ name, email, password });
      if (!data || !data._id) {
        // If backend returns a message or error, show it
        if (data && data.error) {
          toast.error(data.error);
        } else {
          toast.error('Signup failed: Unexpected response from server.');
        }
        return false;
      }
      return true;
    } catch (error: any) {
      // Try to extract backend error message
      let message = error.message || 'Signup failed';
      if (error.response && error.response.error) {
        message = error.response.error;
      }
      console.error('Signup error:', error);
      toast.error(message);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignUp && password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (isSignUp && !name) {
      toast.error("Please enter your name");
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        // Handle signup
        const signupSuccess = await handleSignup(name, email, password);
        if (signupSuccess) {
          // After successful signup, switch to login mode and keep email
          toast.success("Account created successfully! Please login with your credentials.");
          setIsSignUp(false);
          // Keep the email filled, clear other fields
          setName("");
          setPassword("");
          setConfirmPassword("");
          // Email remains filled for convenience
        }
      } else {
        // Handle login
        const success = await login(email, password);
        if (success) {
          toast.success("Welcome back!");
          navigate("/dashboard");
        } else {
          toast.error("Invalid credentials. Please try again.");
        }
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-navy-teal p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-white rounded-lg shadow-lg">
              <Database className="h-8 w-8 text-navy-800" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">DataFlow Pro</h1>
          <p className="text-teal-100 text-lg">Automate. Enrich. Integrate.</p>
        </div>

        <Card className="shadow-2xl border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </CardTitle>
            <CardDescription className="text-center">
              {isSignUp 
                ? "Start automating your data workflows today" 
                : "Sign in to your DataFlow Pro account"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}

              {!isSignUp && (
                <div className="text-right">
                  <button 
                    type="button" 
                    className="text-sm text-accent hover:text-accent/80 font-medium"
                    disabled={isLoading}
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-navy-800 hover:bg-navy-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isSignUp ? "Creating Account..." : "Signing In..."}
                  </>
                ) : (
                  isSignUp ? "Create Account" : "Sign In"
                )}
              </Button>
            </form>

            <div className="mt-6">
              <Separator className="my-4" />
              <div className="text-center text-sm">
                {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-accent hover:text-accent/80 font-medium"
                  disabled={isLoading}
                >
                  {isSignUp ? "Sign in" : "Sign up"}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-teal-100 text-sm">
          <p>Professional data automation platform</p>
          <p className="mt-2 text-xs opacity-75">
            {isSignUp ? "Create an account to get started" : "Demo: Use any existing email/password to login"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Loader2 } from "lucide-react";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const callbackUrl = searchParams.get("callbackUrl") || "/admin/dashboard";
  const errorParam = searchParams.get("error");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError(result.error || "Invalid credentials");
      } else if (result?.ok) {
        console.log("Login successful, redirecting to:", callbackUrl);
        router.push(callbackUrl);
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white">Admin Login</CardTitle>
        <CardDescription className="text-slate-400">
          Enter your credentials to access the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Error Messages */}
        {(error || errorParam) && (
          <Alert className="mb-6 border-red-600/50 bg-red-950/20">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-400">
              {error || errorParam}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-slate-200">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
              required
            />
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-slate-200">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
              required
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 h-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
          <p className="text-sm text-slate-300 font-medium mb-2">Demo Credentials:</p>
          <p className="text-xs text-slate-400 mb-1">
            Email: <span className="text-slate-200 font-mono">admin@wisp.local</span>
          </p>
          <p className="text-xs text-slate-400">
            Password: <span className="text-slate-200 font-mono">demo1234</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">WISP</h1>
          <p className="text-slate-400">Management System</p>
        </div>

        {/* Login Card */}
        <Suspense fallback={
          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Loading...</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            </CardContent>
          </Card>
        }>
          <SignInForm />
        </Suspense>

        {/* Footer */}
        <p className="text-center text-slate-400 text-sm mt-6">
          WISP Management System v1.0
        </p>
      </div>
    </div>
  );
}

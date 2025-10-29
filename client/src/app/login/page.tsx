"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/lib/slices/authSlice";
import { LOGIN_MUTATION } from "../../graphql/mutations/auth";
import { useRouter } from "next/navigation";
import Link from "next/link"; // Add Link component for client-side navigation

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function LoginPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [formErrors, setFormErrors] = useState({ email: "", password: "" });
  const [login, { loading, error }] = useMutation(LOGIN_MUTATION);

  const validateForm = () => {
    const errors = {
      email: "",
      password: "",
    };
    let isValid = true;

    if (!form.email) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errors.email = "Email is invalid";
      isValid = false;
    }

    if (!form.password) {
      errors.password = "Password is required";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
    // Clear error when user starts typing
    setFormErrors((prev) => ({ ...prev, [id]: "" }));
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validateForm()) return;

  try {
    const { data } = await login({ 
      variables: form,
      onError: (error) => console.error("Login error:", error),
    });

    console.log("✅ Login mutation data:", data);

    if (data?.login) {
      dispatch(setCredentials(data.login));

     if (data.login.accessToken) {
    localStorage.setItem("authToken", data.login.accessToken);
    document.cookie = `authToken=${data.login.accessToken}; path=/; max-age=3600;`;
  }
   
  if (data.login.user) {
    localStorage.setItem("user", JSON.stringify(data.login.user));
  }

   window.dispatchEvent(new Event("storage"));
      // 🕐 Small delay for cookie sync
   router.push("/resume-tailor");
    }
  } catch (err) {
    console.error("Login failed:", err);
  }
};


  return (
    <div className="min-h-[calc(100vh-3.5rem-3rem)] flex items-center justify-center">
      <Card className="w-full max-w-md p-6">
        <div className="flex flex-col items-center mb-4">
          <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center text-xl font-bold">R</div>
          <h2 className="text-2xl font-bold mt-3">Welcome back</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back! Please login to your account.
          </p>
        </div>

        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="mt-1"
                aria-invalid={!!formErrors.email}
              />
              {formErrors.email && (
                <p className="text-destructive text-xs mt-1">{formErrors.email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="********"
                className="mt-1"
                aria-invalid={!!formErrors.password}
              />
              {formErrors.password && (
                <p className="text-destructive text-xs mt-1">{formErrors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="mt-2 w-full"
            >
              {loading ? "Logging in..." : "Login"}
            </Button>

            {error && (
              <p className="text-destructive text-sm mt-2 text-center">
                {error.message}
              </p>
            )}
          </form>
        </CardContent>

        <div className="my-3 flex items-center">
          <Separator className="flex-1" />
          <span className="px-2 text-xs text-gray-400">Or continue with</span>
          <Separator className="flex-1" />
        </div>

        {/* Neon Auth Google sign-in */}
        <Link href="/handler/sign-in" className="block">
          <Button variant="outline" className="w-full flex items-center justify-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>
        </Link>

        <p className="text-xs text-center text-muted-foreground mt-4">
          Don't have an account?{" "}
          <Link href="/signup" className="text-indigo-600 hover:underline">
            Create one
          </Link>
        </p>
      </Card>
    </div>
  );
}
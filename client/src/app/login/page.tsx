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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-6 shadow-lg">
        <div className="flex flex-col items-center mb-4">
          <img src="/logo.svg" alt="Logo" className="w-12 h-12" />
          <h2 className="text-2xl font-bold mt-3">AI Resume Tailor</h2>
          <p className="text-sm text-gray-500 mt-1">
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
                <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
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
                <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-indigo-600 text-white hover:bg-indigo-700"
            >
              {loading ? "Logging in..." : "Login"}
            </Button>

            {error && (
              <p className="text-red-500 text-sm mt-2 text-center">
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

        <p className="text-xs text-center text-gray-500 mt-4">
          Don't have an account?{" "}
          <Link href="/signup" className="text-indigo-600 hover:underline">
            Create one
          </Link>
        </p>
      </Card>
    </div>
  );
}
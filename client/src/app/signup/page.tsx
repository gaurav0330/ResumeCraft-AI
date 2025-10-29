'use client';

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { REGISTER_MUTATION } from "../../graphql/mutations/auth";

interface RegisterResponse {
  register: {
    id: string;
    email: string;
    username: string;
  }
}

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export default function SignUp() {
  const [registerUser, { loading, error }] = useMutation<RegisterResponse>(REGISTER_MUTATION);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });



  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = async () => {
    if (form.password !== form.confirm) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const { data } = await registerUser({
        variables: {
          email: form.email,
          password: form.password,
          username: form.name,
        },
      });

      if (data?.register) {
        alert("Signup successful! Please log in.");
        window.location.href = "/login";
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem-3rem)] flex items-center justify-center">
      <Card className="w-full max-w-md p-6">
        <h2 className="text-2xl font-bold text-center mb-2">Create account</h2>
        <p className="text-sm text-muted-foreground text-center mb-4">Join and start crafting the perfect resume.</p>

        <CardContent className="flex flex-col gap-3">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="John Doe"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="mt-1"
            />
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
            />
          </div>
          <div>
            <Label htmlFor="confirm">Confirm Password</Label>
            <Input
              id="confirm"
              type="password"
              value={form.confirm}
              onChange={handleChange}
              placeholder="********"
              className="mt-1"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-4 w-full"
          >
            {loading ? "Creating..." : "Sign Up"}
          </Button>

          {error && (
            <p className="text-destructive text-sm mt-2">{error.message}</p>
          )}
        </CardContent>

        <div className="my-3 flex items-center">
          <Separator className="flex-1" />
          <span className="px-2 text-xs text-gray-400">Or continue with</span>
          <Separator className="flex-1" />
        </div>

        {/* Neon Auth Google signup */}
        <Link href="/handler/sign-up" className="block">
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
          Already have an account?{" "}
          <a className="text-indigo-600 hover:underline" href="/login">
            Log in here
          </a>
        </p>
      </Card>
    </div>
  );
}

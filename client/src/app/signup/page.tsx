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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-2">
          Create Your Account
        </h2>
        <p className="text-sm text-gray-500 text-center mb-4">
          Join and start crafting the perfect resume.
        </p>

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
            className="mt-4 w-full bg-indigo-600 text-white hover:bg-indigo-700"
          >
            {loading ? "Creating..." : "Sign Up"}
          </Button>

          {error && (
            <p className="text-red-500 text-sm mt-2">{error.message}</p>
          )}
        </CardContent>

        <div className="my-3 flex items-center">
          <Separator className="flex-1" />
          <span className="px-2 text-xs text-gray-400">Or continue with</span>
          <Separator className="flex-1" />
        </div>

        <p className="text-xs text-center text-gray-500 mt-4">
          Already have an account?{" "}
          <a className="text-indigo-600 hover:underline" href="/login">
            Log in here
          </a>
        </p>
      </Card>
    </div>
  );
}

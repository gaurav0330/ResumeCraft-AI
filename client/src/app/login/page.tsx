'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-6 shadow-lg">
        <div className="flex flex-col items-center mb-4">
          <img src="/logo.svg" alt="Logo" className="w-12 h-12"/>
          <h2 className="text-2xl font-bold mt-3">AI Resume Tailor</h2>
          <p className="text-sm text-gray-500 mt-1">Welcome back! Please login to your account.</p>
        </div>
        <CardContent className="flex flex-col gap-3">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" placeholder="you@example.com" className="mt-1"/>
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="********" className="mt-1"/>
          </div>
          <div className="flex justify-between items-center mt-1">
            <Button variant="link" className="text-xs font-normal p-0" asChild>
              <a href="#">Forgot Password?</a>
            </Button>
          </div>
          <Button className="mt-2 w-full bg-indigo-600 text-white hover:bg-indigo-700">Login</Button>
        </CardContent>
        <div className="my-3 flex items-center">
          <Separator className="flex-1" />
          <span className="px-2 text-xs text-gray-400">Or continue with</span>
          <Separator className="flex-1" />
        </div>
        <p className="text-xs text-center text-gray-500 mt-4">
          Don’t have an account? <a className="text-indigo-600 hover:underline" href="/signup">Create one</a>
        </p>
      </Card>
    </div>
  );
}

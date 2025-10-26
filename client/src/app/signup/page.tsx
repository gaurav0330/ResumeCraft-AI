'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-2">Create Your Account</h2>
        <p className="text-sm text-gray-500 text-center mb-4">Join and start crafting the perfect resume.</p>
        <CardContent className="flex flex-col gap-3">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" type="text" placeholder="John Doe" className="mt-1"/>
          </div>
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" placeholder="you@example.com" className="mt-1"/>
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="********" className="mt-1"/>
          </div>
          <div>
            <Label htmlFor="confirm">Confirm Password</Label>
            <Input id="confirm" type="password" placeholder="********" className="mt-1"/>
          </div>
          <Button className="mt-4 w-full bg-indigo-600 text-white hover:bg-indigo-700">Sign Up</Button>
        </CardContent>
        <div className="my-3 flex items-center">
          <Separator className="flex-1" />
          <span className="px-2 text-xs text-gray-400">Or continue with</span>
          <Separator className="flex-1" />
        </div>
        <p className="text-xs text-center text-gray-500 mt-4">
          Already have an account? <a className="text-indigo-600 hover:underline" href="/login">Log in here</a>
        </p>
      </Card>
    </div>
  );
}

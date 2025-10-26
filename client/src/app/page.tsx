import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-gradient-to-b from-purple-50 to-white">
      <header className="w-full py-6 flex justify-between items-center px-8 bg-white/80 border-b">
        <div className="text-2xl font-bold text-purple-700">ResuAI</div>
        <nav className="flex gap-6 text-gray-700">
          <a href="#" className="hover:text-purple-600">
            How It Works
          </a>
          <a href="#" className="hover:text-purple-600">
            Features
          </a>
          <a href="#" className="hover:text-purple-600">
            Pricing
          </a>
          <Button variant="ghost" className="ml-4" asChild>
            <Link href="/login">Log In</Link>
          </Button>
          <Button className="ml-2 bg-purple-700 hover:bg-purple-800" asChild>
            <Link href="/signup">Start Now</Link>
          </Button>
        </nav>
      </header>

      <section className="flex flex-col items-center mt-16 px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center">
          Tailor Your Resume to <span className="text-purple-700">Any Job</span>{" "}
          in Seconds
        </h1>
        <p className="mt-6 text-lg text-center text-gray-600 max-w-xl">
          Upload your LaTeX resume and the job description. Our AI analyzes,
          optimizes, and aligns your experience with the role, ensuring you
          stand out.
        </p>
        <div className="flex gap-4 mt-8">
          <Button className="bg-purple-700 hover:bg-purple-800">
            Start Now
          </Button>
          <Button variant="outline">Learn More</Button>
        </div>
        {/* Screenshot or Graphic */}
        <Card className="mt-12 shadow-xl w-full max-w-3xl">
          <CardContent>
            <img
              src="/home-screenshot.png" // Change to your screenshot path
              alt="Resume dashboard preview"
              className="rounded-lg w-full object-cover"
            />
          </CardContent>
        </Card>
      </section>

      <section className="mt-24 py-12 w-full bg-white flex flex-col items-center">
        <h2 className="text-2xl font-semibold mb-4">
          A Simple Path to Your Dream Job
        </h2>
        <p className="text-gray-600 max-w-lg text-center">
          Our process is designed for speed and efficiency. Get a perfectly
          tailored resume in just three simple steps.
        </p>
      </section>
    </main>
  );
}

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useAuth } from "@/components/provider/AuthProviderWrapper";
import {
  Sparkles,
  FileText,
  Rocket,
  Upload,
  Wand2,
  Download,
  Quote,
  Code2,
  Star,
} from "lucide-react";
import { TypingHeading } from "@/components/motions/autoComplete";

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  // ✨ DATA CONFIG
  const features = [
    {
      title: "Smart Matching",
      description:
        "AI aligns your skills with any job description automatically.",
      icon: <Sparkles className="w-6 h-6 text-primary" />,
    },
    {
      title: "LaTeX Friendly",
      description:
        "Upload or paste your .tex resume directly — fully supported.",
      icon: <FileText className="w-6 h-6 text-primary" />,
    },
    {
      title: "One-Click Export",
      description:
        "Preview and export your tailored resume as a polished PDF.",
      icon: <Rocket className="w-6 h-6 text-primary" />,
    },
  ];

  const steps = [
    {
      icon: <Upload className="w-6 h-6 text-primary" />,
      title: "1. Upload Resume & JD",
      text: "Drop your LaTeX or PDF resume along with the job description.",
    },
    {
      icon: <Wand2 className="w-6 h-6 text-primary" />,
      title: "2. Let AI Tailor It",
      text: "TailorAI analyzes both and adjusts your resume for maximum match.",
    },
    {
      icon: <Download className="w-6 h-6 text-primary" />,
      title: "3. Preview & Export",
      text: "Download the optimized version instantly, ready to send.",
    },
  ];

  const testimonials = [
    {
      quote:
        "TailorAI saved me hours — my resume now speaks directly to each job I apply for!",
      name: "Alicia Gomez",
      role: "Software Engineer @ Google",
    },
    {
      quote:
        "As a recruiter, I’m impressed by how relevant candidate resumes became using this tool.",
      name: "Mark Reynolds",
      role: "Tech Recruiter @ Stripe",
    },
    {
      quote:
        "Finally, an AI tool that actually improves my LaTeX resume instead of breaking it.",
      name: "Jun Wei",
      role: "Data Scientist @ DeepMind",
    },
  ];

  // ✨ Live LaTeX Simulation
  const fullLatexLines = [
    "\\documentclass{resume}",
    "\\begin{document}",
    "\\name{John Doe}",
    "\\contact{johndoe@email.com | github.com/johndoe}",
    "",
    "\\section{Experience}",
    "\\subsection{Software Engineer | Google}",
    "\\item Developed scalable AI pipelines with TensorFlow.",
    "\\item Improved data ingestion by 45% using GCP tools.",
    "",
    "\\section{Education}",
    "\\subsection{B.Tech in Computer Science}",
    "\\item Stanford University, 2019",
    "",
    "\\end{document}",
  ];

  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [previewData, setPreviewData] = useState({
    name: "John Doe",
    contact: "",
    experience: [] as string[],
    education: "",
  });

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < fullLatexLines.length) {
        setDisplayedLines((prev) => [...prev, fullLatexLines[index]]);
        index++;
      } else clearInterval(interval);
    }, 400);
    return () => clearInterval(interval);
  }, []);

  // Parse LaTeX → Preview
  useEffect(() => {
    const text = displayedLines.join("\n");
    const expMatches = text.match(/\\item (.+)/g) || [];
    const expList = expMatches.map((line) => line.replace("\\item ", ""));
    const eduMatch = text.match(/Stanford University, 2019/);

    setPreviewData({
      name: text.includes("John Doe") ? "John Doe" : "—",
      contact: text.includes("github.com/johndoe")
        ? "johndoe@email.com | github.com/johndoe"
        : "",
      experience: expList,
      education: eduMatch
        ? "B.Tech in Computer Science, Stanford University (2019)"
        : "",
    });
  }, [displayedLines]);

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.2, duration: 0.6 },
    }),
  };

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-background via-muted/30 to-secondary/20 overflow-hidden text-foreground">
      {/* Floating blobs */}
      <motion.div
        className="absolute -top-32 -left-32 w-80 h-80 bg-primary/30 blur-[120px] rounded-full"
        animate={{ y: [0, 50, 0], x: [0, 25, 0] }}
        transition={{ repeat: Infinity, duration: 18, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/20 blur-[140px] rounded-full"
        animate={{ y: [0, -40, 0], x: [0, -20, 0] }}
        transition={{ repeat: Infinity, duration: 20, ease: "easeInOut" }}
      />

      {/* HERO */}
      <section className="relative z-10 px-6 py-24 md:py-32 text-center">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0}
          className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1 text-sm text-secondary-foreground shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-primary" /> AI-Powered Resume Tailoring
        </motion.div>

        <TypingHeading className="mt-8 text-5xl md:text-6xl font-bold tracking-tight heading-font">
          Tailor your <span className="text-primary">resume</span> to any job in seconds
        </TypingHeading>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1}
          className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto"
        >
          Upload your LaTeX resume and a job description — our AI instantly adapts your
          experience, wording, and skills for the perfect fit.
        </motion.p>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={2}
          className="mt-10 flex flex-wrap justify-center gap-4"
        >
          {isAuthenticated ? (
            <Link href="/resume-tailor">
              <Button size="lg" className="text-base px-6 py-5">
                Open Tailor
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/resume-tailor">
                <Button size="lg" className="text-base px-6 py-5">
                  Get Started
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="lg" variant="outline" className="text-base px-6 py-5">
                  Create Account
                </Button>
              </Link>
            </>
          )}
        </motion.div>
      </section>

      {/* Live LaTeX */}
      <section className="relative border-t bg-gradient-to-br from-muted/20 via-background to-muted/40 py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-start">
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-zinc-950 text-green-400 font-mono text-sm p-6 rounded-xl shadow-inner relative overflow-hidden h-[420px]"
          >
            <div className="absolute top-2 right-3 text-gray-500 text-xs flex items-center gap-1">
              <Code2 className="w-3 h-3" /> LaTeX Code
            </div>
            <pre className="whitespace-pre-wrap leading-relaxed">
              {displayedLines.join("\n")}
            </pre>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white dark:bg-card rounded-xl p-8 shadow-xl border relative overflow-hidden h-[420px]"
          >
            <motion.div
              key={previewData.experience.length}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-semibold mb-2 text-primary">
                {previewData.name}
              </h2>
              <p className="text-muted-foreground text-sm mb-4">
                {previewData.contact}
              </p>
              {previewData.experience.length > 0 && (
                <>
                  <h3 className="font-semibold mb-2">Experience</h3>
                  <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                    {previewData.experience.map((item, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        {item}
                      </motion.li>
                    ))}
                  </ul>
                </>
              )}
              {previewData.education && (
                <>
                  <h3 className="font-semibold mt-4 mb-1">Education</h3>
                  <p className="text-sm text-muted-foreground">
                    {previewData.education}
                  </p>
                </>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-gradient-to-br from-background via-muted/20 to-secondary/30 py-20">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              custom={i}
            >
              <Card className="hover:shadow-xl transition-all">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">{f.icon}</div>
                  <CardTitle>{f.title}</CardTitle>
                  <CardDescription>{f.description}</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section className="border-t py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-3 gap-8">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              className="bg-card p-6 rounded-2xl shadow-md hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-2 mb-3">{s.icon}</div>
              <h3 className="font-semibold text-lg mb-1">{s.title}</h3>
              <p className="text-muted-foreground text-sm">{s.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t py-20 bg-gradient-to-br from-muted/30 via-background to-primary/10 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-semibold mb-10"
        >
          Loved by professionals worldwide
        </motion.h2>
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 px-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              className="bg-card border rounded-2xl p-6 shadow-md hover:shadow-xl transition-all"
            >
              <Quote className="w-8 h-8 text-primary mb-3" />
              <p className="text-muted-foreground italic mb-4">"{t.quote}"</p>
              <div className="flex justify-center items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              </div>
              <h4 className="font-semibold mt-3">{t.name}</h4>
              <p className="text-sm text-muted-foreground">{t.role}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/10 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-semibold mb-6"
        >
          Ready to tailor your <span className="text-primary">perfect resume?</span>
        </motion.h2>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Link href="/resume-tailor">
            <Button size="lg" className="px-8 py-5 text-base shadow-lg">
              Get Started Now
            </Button>
          </Link>
        </motion.div>
      </section>
    </main>
  );
}

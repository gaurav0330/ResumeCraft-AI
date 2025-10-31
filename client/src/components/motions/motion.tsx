import { motion } from "framer-motion";

export default function AnimatedBackground() {
  return (
    <motion.div
      className="absolute inset-0 -z-10 bg-gradient-to-br from-purple-400/30 via-indigo-300/20 to-blue-400/20 blur-3xl"
      animate={{
        backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: "linear",
      }}
      style={{ backgroundSize: "200% 200%" }}
    />
  );
}

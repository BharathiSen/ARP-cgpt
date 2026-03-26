"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import HeroVideoBackground from "@/components/marketing/HeroVideoBackground";

export default function Hero() {
  return (
    <section className="relative h-screen w-full overflow-hidden flex items-center justify-center pt-20">
      <HeroVideoBackground />

      {/* Overlay gradient to ensure text readability */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(to bottom, rgba(5,7,15,0.35) 0%, rgba(5,7,15,0.55) 100%)",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 flex flex-col items-center justify-center text-center h-full">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center w-full"
        >
          {/* Badge */}
          <div className="ds-badge mb-8">
            <span className="relative flex h-2 w-2">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ background: "#00C8FF" }}
              />
              <span
                className="relative inline-flex rounded-full h-2 w-2"
                style={{ background: "#00C8FF" }}
              />
            </span>
            Platform Live v2.0
          </div>

          {/* Headline */}
          <h1
            className="text-5xl md:text-7xl font-black tracking-tight text-white mb-6 leading-[1.08]"
            style={{ textShadow: "0 4px 40px rgba(0,0,0,0.7)" }}
          >
            Test Your API Reliability <br className="hidden md:block" />
            <span className="ds-gradient-text">Before Production.</span>
          </h1>

          {/* Subheadline */}
          <p
            className="text-lg md:text-xl font-medium max-w-2xl mx-auto mb-10"
            style={{
              color: "#9AA6C4",
              textShadow: "0 2px 20px rgba(0,0,0,0.8)",
            }}
          >
            Simulate failures, stress test endpoints, and analyze system
            behavior with AI-powered insights.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <Button href="/login" className="text-base px-8 py-4">
              Start Testing Free
            </Button>
            <Button
              variant="ghost"
              href="/dashboard"
              className="text-base px-8 py-4"
            >
              View Product Demo
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

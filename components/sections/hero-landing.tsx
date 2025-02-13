"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const tradingPhrases = [
  "Market Analysis",
  "Pattern Recognition",
  "Risk Management",
  "Trading Signals",
  "Portfolio Tracking",
];

// Static content component
function AnnouncementBanner() {
  return (
    <div className="inline-flex items-center rounded-full border bg-white/40 px-6 py-2 backdrop-blur-sm dark:bg-white/5">
      <span className="mr-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary dark:bg-primary/30">
        New
      </span>
      <p className="text-sm text-muted-foreground">
        AI-Powered Trading Assistant Now Available
      </p>
    </div>
  );
}

export default function HeroLanding() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setPhraseIndex((current) => (current + 1) % tradingPhrases.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden bg-background py-20 md:py-32">
      {/* Background elements */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 ml-[-38rem] h-[25rem] w-[81.25rem] dark:[mask-image:linear-gradient(white,transparent)]">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-blue-500/30 [mask-image:radial-gradient(farthest-side_at_top,white,transparent)] dark:from-primary/30 dark:to-blue-500/30">
            <svg
              aria-hidden="true"
              className="dark:fill-white/2.5 absolute inset-x-0 inset-y-[-50%] h-[200%] w-full skew-y-[-18deg] fill-black/40 stroke-black/50 mix-blend-overlay dark:stroke-white/5"
            >
              <defs>
                <pattern
                  id="83fd4e5a-9d52-42fc-97b6-718e5d7ee527"
                  width="72"
                  height="56"
                  patternUnits="userSpaceOnUse"
                  x="-12"
                  y="4"
                >
                  <path d="M.5 56V.5H72" fill="none" />
                </pattern>
              </defs>
              <rect
                width="100%"
                height="100%"
                strokeWidth="0"
                fill="url(#83fd4e5a-9d52-42fc-97b6-718e5d7ee527)"
              />
            </svg>
          </div>
          <svg
            viewBox="0 0 1113 440"
            aria-hidden="true"
            className="absolute left-1/2 top-0 ml-[-19rem] w-[69.5625rem] fill-white blur-[26px] dark:hidden"
          >
            <path d="M.016 439.5s-9.5-300 434-300S882.516 20 882.516 20V0h230.004v439.5H.016Z" />
          </svg>
        </div>
      </div>

      <div className="container relative">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 text-center">
          {/* Announcement banner */}
          {mounted ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <AnnouncementBanner />
            </motion.div>
          ) : (
            <AnnouncementBanner />
          )}

          {/* Main heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4"
          >
            <h1 className="font-urban text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="block">Trader Tracker</span>
              <span className="mt-2 block bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-2xl font-medium text-transparent sm:text-3xl md:text-4xl">
                Trading Solutions
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              Your AI-powered trading companion. Analyze markets, validate
              strategies, and make informed decisions with real-time insights.
            </p>
          </motion.div>

          {/* Trading chart illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative mx-auto w-full max-w-3xl"
          >
            <div className="aspect-[16/9] overflow-hidden rounded-xl border bg-white/40 shadow-2xl dark:bg-white/5">
              <Image
                src="/_static/trading-chart.svg"
                alt="Trading Chart"
                width={1200}
                height={675}
                className="h-full w-full object-cover"
                priority
              />
            </div>
            {/* Floating elements */}
            <motion.div
              className="absolute -right-4 -top-4 rounded-lg border bg-white/80 p-4 shadow-lg backdrop-blur-sm dark:bg-white/10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm font-medium">AI Analysis Active</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Animated features */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="h-8 text-lg font-medium text-primary"
          >
            <motion.span
              key={phraseIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {tradingPhrases[phraseIndex]}
            </motion.span>
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col gap-4 sm:flex-row"
          >
            <Link
              href="/register"
              className={cn(
                buttonVariants({
                  variant: "default",
                  size: "lg",
                  rounded: "full",
                }),
                "gap-2 px-8",
              )}
            >
              Get Started
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/docs"
              className={cn(
                buttonVariants({
                  variant: "outline",
                  size: "lg",
                  rounded: "full",
                }),
                "gap-2 px-8",
              )}
            >
              Learn More
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

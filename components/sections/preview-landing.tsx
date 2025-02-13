"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function PreviewLanding() {
  return (
    <section className="overflow-hidden bg-background py-20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="font-urban text-3xl font-bold tracking-tight sm:text-4xl">
            Seamless Desktop & Web Integration
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Use our powerful desktop app for real-time chart analysis while
            accessing your insights anywhere through the web platform.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative mx-auto mt-16 max-w-[90rem]"
        >
          {/* Desktop App Preview */}
          <div className="relative z-0 rounded-xl bg-secondary/30 p-3.5 shadow-2xl ring-1 ring-secondary/60 dark:bg-secondary/20">
            <div className="absolute left-3.5 top-3.5 flex items-center gap-1.5">
              <div className="size-3 rounded-full bg-red-500" />
              <div className="size-3 rounded-full bg-yellow-500" />
              <div className="size-3 rounded-full bg-green-500" />
            </div>

            <div className="relative aspect-[16/9] overflow-hidden rounded-lg border bg-background">
              <div className="absolute inset-0 bg-gradient-to-br from-background/80 to-background/20 backdrop-blur-sm">
                {/* Desktop App Content */}
                <div className="flex h-full">
                  {/* Sidebar */}
                  <div className="w-64 border-r bg-card/50">
                    <div className="p-4">
                      <div className="h-8 w-32 rounded bg-muted/50" />
                      <div className="mt-6 space-y-2">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className="h-4 w-full rounded bg-muted/30"
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 p-4">
                    <div className="h-[calc(100%-2rem)] rounded-lg border bg-card/50 p-4">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="h-6 w-48 rounded bg-muted/50" />
                        <div className="flex gap-2">
                          {[...Array(3)].map((_, i) => (
                            <div
                              key={i}
                              className="h-6 w-6 rounded bg-muted/30"
                            />
                          ))}
                        </div>
                      </div>
                      <div className="relative h-[calc(100%-2.5rem)]">
                        <Image
                          src="/_static/trading-chart.svg"
                          alt="Trading Chart"
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Web App Preview (Floating) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="absolute -right-8 -top-8 z-10 w-72 rounded-lg border bg-background p-4 shadow-xl"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                <div className="size-2.5 rounded-full bg-primary" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">Pattern Detected</div>
                <div className="text-xs text-muted-foreground">
                  Bullish Flag on EURUSD H4
                </div>
              </div>
            </div>
          </motion.div>

          {/* Mobile Preview (Floating) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="absolute -bottom-8 -left-8 z-10 w-64 rounded-lg border bg-background p-4 shadow-xl"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-green-500/10">
                <div className="size-2.5 rounded-full bg-green-500" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">Trade Executed</div>
                <div className="text-xs text-muted-foreground">
                  +1.2% Profit on BTCUSD
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

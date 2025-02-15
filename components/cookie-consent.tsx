"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem("cookie-consent", "all");
    setIsVisible(false);
  };

  const acceptNecessary = () => {
    localStorage.setItem("cookie-consent", "necessary");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/80 p-4 backdrop-blur-sm md:p-6">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="flex-1">
            <h3 className="mb-2 text-lg font-semibold">🍪 Cookie Settings</h3>
            <p className="text-sm text-muted-foreground">
              We use cookies to enhance your browsing experience, serve
              personalized content, and analyze our traffic. You can choose to
              accept all cookies or only the essential ones needed for the
              website to function.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={acceptNecessary}
              className="whitespace-nowrap"
            >
              Essential Only
            </Button>
            <Button onClick={acceptAll} className="whitespace-nowrap">
              Accept All
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

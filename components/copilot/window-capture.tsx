"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Camera, Lock, Timer, Unlock, X } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Icons } from "@/components/shared/icons";

interface WindowCaptureProps {
  onCapture?: (screenshot: string) => void;
  className?: string;
}

export interface WindowCaptureRef {
  captureScreen: () => Promise<string | null>;
}

const CAPTURE_INTERVALS = {
  "0": "Manual Only",
  "1": "1 minute",
  "2": "2 minutes",
  "5": "5 minutes",
  "10": "10 minutes",
  "15": "15 minutes",
  "30": "30 minutes",
  custom: "Custom",
} as const;

const MAX_INTERVAL = 60; // Maximum 60 minutes

export const WindowCapture = forwardRef<WindowCaptureRef, WindowCaptureProps>(
  function WindowCapture({ onCapture, className }, ref) {
    const [isCapturing, setIsCapturing] = useState(false);
    const [isWindowLocked, setIsWindowLocked] = useState(false);
    const [selectedInterval, setSelectedInterval] = useState("0");
    const [customInterval, setCustomInterval] = useState("");
    const [imageDialogOpen, setImageDialogOpen] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const captureIntervalRef = useRef<NodeJS.Timeout | null>(null);

    useImperativeHandle(ref, () => ({
      captureScreen: async () => {
        return await captureScreen();
      },
    }));

    const handleIntervalChange = (value: string) => {
      setSelectedInterval(value);
      if (value !== "custom") {
        setCustomInterval("");
      }
    };

    const handleCustomIntervalChange = (value: string) => {
      const numValue = parseInt(value);
      if (value === "" || (numValue > 0 && numValue <= MAX_INTERVAL)) {
        setCustomInterval(value);
        if (value !== "") {
          setSelectedInterval("custom");
        }
      }
    };

    const getEffectiveInterval = () => {
      if (selectedInterval === "custom" && customInterval) {
        return parseInt(customInterval);
      }
      return parseInt(selectedInterval);
    };

    // Setup interval-based capture
    useEffect(() => {
      if (isWindowLocked && selectedInterval !== "0") {
        // Clear any existing interval
        if (captureIntervalRef.current) {
          clearInterval(captureIntervalRef.current);
        }

        const intervalMinutes = getEffectiveInterval();
        if (!intervalMinutes) return;

        // Set new interval
        captureIntervalRef.current = setInterval(
          async () => {
            const screenshot = await takeScreenshot();
            if (screenshot) {
              onCapture?.(screenshot);
              toast.success(
                `Auto-captured screenshot (${intervalMinutes} min interval)`,
              );
            }
          },
          intervalMinutes * 60 * 1000,
        );

        return () => {
          if (captureIntervalRef.current) {
            clearInterval(captureIntervalRef.current);
          }
        };
      }
    }, [isWindowLocked, selectedInterval, customInterval, onCapture]);

    const initializeCapture = async () => {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            displaySurface: "window",
          },
          audio: false,
        });

        // Create and setup video element
        const video = document.createElement("video");
        video.srcObject = stream;

        // Store references
        streamRef.current = stream;
        videoRef.current = video;

        // Wait for video metadata
        await new Promise((resolve) => {
          video.onloadedmetadata = () => {
            video.play();
            resolve(true);
          };
        });

        setIsWindowLocked(true);
        toast.success("Window locked successfully!");

        // Take initial screenshot
        const screenshot = await takeScreenshot();
        if (screenshot) {
          onCapture?.(screenshot);
        }

        return true;
      } catch (err) {
        console.error("Error initializing capture:", err);
        toast.error("Failed to select window");
        return false;
      }
    };

    const takeScreenshot = async () => {
      if (!streamRef.current || !videoRef.current) {
        return null;
      }

      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      ctx?.drawImage(video, 0, 0);

      const screenshot = canvas.toDataURL("image/png");
      setCapturedImage(screenshot);
      return screenshot;
    };

    const captureScreen = async () => {
      try {
        setIsCapturing(true);

        // If we haven't locked a window yet, initialize capture
        if (!isWindowLocked) {
          const initialized = await initializeCapture();
          if (!initialized) {
            setIsCapturing(false);
            return null;
          }
        }

        // Take the screenshot
        const screenshot = await takeScreenshot();

        if (screenshot) {
          toast.success("Screenshot captured successfully!");
          onCapture?.(screenshot);
          return screenshot;
        }

        return null;
      } catch (err) {
        console.error("Error capturing screen:", err);
        toast.error("Failed to capture screen");
        releaseWindow();
        return null;
      } finally {
        setIsCapturing(false);
      }
    };

    const releaseWindow = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      videoRef.current = null;
      setIsWindowLocked(false);
      setSelectedInterval("0");
      setCapturedImage(null);

      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
        captureIntervalRef.current = null;
      }
    };

    // Cleanup function when component unmounts
    useEffect(() => {
      return () => {
        releaseWindow();
      };
    }, []);

    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="lg"
              className={className}
              onClick={isWindowLocked ? releaseWindow : initializeCapture}
            >
              {isWindowLocked ? (
                <>
                  <Unlock className="mr-2 size-4" />
                  Release Window
                </>
              ) : (
                <>
                  <Lock className="mr-2 size-4" />
                  Lock Window
                </>
              )}
            </Button>

            {isWindowLocked && (
              <>
                <Button
                  variant="default"
                  size="lg"
                  className={className}
                  onClick={captureScreen}
                  disabled={isCapturing}
                >
                  <Camera className="mr-2 size-4" />
                  {isCapturing ? "Capturing..." : "Update Screenshot"}
                </Button>

                <div className="min-w-[300px] flex-1">
                  <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
                    <Timer className="size-4 text-muted-foreground" />
                    <div className="flex flex-1 items-center gap-2">
                      <Select
                        value={selectedInterval}
                        onValueChange={handleIntervalChange}
                      >
                        <SelectTrigger className="w-[180px] bg-background">
                          <SelectValue placeholder="Capture Interval" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(CAPTURE_INTERVALS).map(
                            ([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>

                      {selectedInterval === "custom" && (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="1"
                            max={MAX_INTERVAL}
                            value={customInterval}
                            onChange={(e) =>
                              handleCustomIntervalChange(e.target.value)
                            }
                            className="w-20 bg-background"
                            placeholder="1-60"
                          />
                          <span className="text-sm text-muted-foreground">
                            minutes
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {isWindowLocked && (
            <div className="flex items-start gap-4">
              <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
                <DialogTrigger asChild>
                  <button className="relative overflow-hidden rounded-lg border transition-colors hover:border-primary">
                    <div className="relative aspect-video w-40">
                      {capturedImage && (
                        <img
                          src={capturedImage}
                          alt="Locked window preview"
                          className="h-full w-full object-cover"
                        />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/5 transition-colors hover:bg-black/10">
                        <p className="text-xs font-medium">Click to enlarge</p>
                      </div>
                    </div>
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>Captured Window Preview</DialogTitle>
                  </DialogHeader>
                  <div className="relative mt-2 aspect-video">
                    {capturedImage && (
                      <img
                        src={capturedImage}
                        alt="Locked window preview"
                        className="h-full w-full rounded-lg object-contain"
                      />
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              <p className="flex-1 text-sm text-muted-foreground">
                Window is locked.{" "}
                {selectedInterval === "0"
                  ? "Manual capture mode."
                  : `Auto-capturing every ${
                      selectedInterval === "custom"
                        ? customInterval
                        : selectedInterval
                    } minutes.`}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  },
);

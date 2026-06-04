"use client";

import { useEffect, useRef, useState } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";
import styles from "./ScrollSequence.module.css";

const FRAME_COUNT = 240;

const currentFrame = (index: number) =>
  `/sequence/ezgif-frame-${index.toString().padStart(3, "0")}.jpg`;

export default function ScrollSequenceCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const { scrollYProgress } = useScroll();

  const renderCanvasFrame = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    // Get the CSS display size
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Set actual internal dimensions to match display dimensions exactly (accounting for retina screens)
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    // Normalize coordinates so we can draw in CSS pixels
    context.scale(dpr, dpr);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

    // Calculate cover scale (like object-fit: cover) and add the 1.3 zoom factor to hide watermark
    const scale = 1.3 * Math.max(rect.width / img.naturalWidth, rect.height / img.naturalHeight);
    const drawWidth = img.naturalWidth * scale;
    const drawHeight = img.naturalHeight * scale;

    // Center the image
    const offsetX = (rect.width - drawWidth) / 2;
    const offsetY = (rect.height - drawHeight) / 2;

    context.clearRect(0, 0, rect.width, rect.height);
    context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  };

  // Preload images
  useEffect(() => {
    const loadedImages: HTMLImageElement[] = [];
    let loadedCount = 0;

    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      img.src = currentFrame(i);
      img.onload = () => {
        loadedCount++;
        if (loadedCount === FRAME_COUNT) {
          // All loaded
        }
      };
      loadedImages.push(img);
    }
    
    setImages(loadedImages);

    // Initial draw for frame 1
    const img = new Image();
    img.src = currentFrame(1);
    img.onload = () => {
      renderCanvasFrame(img);
    };

    // Re-render on window resize to maintain sharpness and cover effect
    const handleResize = () => {
      const latest = scrollYProgress.get();
      const frameIndex = Math.min(
        FRAME_COUNT - 1,
        Math.max(0, Math.floor(latest * FRAME_COUNT))
      );
      if (loadedImages[frameIndex] && loadedImages[frameIndex].complete) {
        renderCanvasFrame(loadedImages[frameIndex]);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [scrollYProgress]);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (images.length === 0) return;

    // Map scroll progress (0 - 1) to frame index (1 - 240)
    const frameIndex = Math.min(
      FRAME_COUNT - 1,
      Math.max(0, Math.floor(latest * FRAME_COUNT))
    );

    const img = images[frameIndex];
    if (img && img.complete) {
      renderCanvasFrame(img);
    }
  });

  return (
    <div className={styles.canvasContainer}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}

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
          // Draw the first frame once all are loaded, or as soon as the first is loaded
        }
      };
      loadedImages.push(img);
    }
    
    setImages(loadedImages);

    // Initial draw for frame 1
    const img = new Image();
    img.src = currentFrame(1);
    img.onload = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const context = canvas.getContext("2d");
        if (context) {
          // Use natural resolution of the image
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          context.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
      }
    };
  }, []);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (images.length === 0) return;

    // Map scroll progress (0 - 1) to frame index (1 - 240)
    const frameIndex = Math.min(
      FRAME_COUNT - 1,
      Math.max(0, Math.floor(latest * FRAME_COUNT))
    );

    const img = images[frameIndex];
    if (img && img.complete) {
      const canvas = canvasRef.current;
      if (canvas) {
        const context = canvas.getContext("2d");
        if (context) {
          // Ensure canvas dimensions match image dimensions to maintain sharpness
          if (canvas.width !== img.naturalWidth || canvas.height !== img.naturalHeight) {
            canvas.width = img.naturalWidth || 1920;
            canvas.height = img.naturalHeight || 1080;
          }
          context.clearRect(0, 0, canvas.width, canvas.height);
          context.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
      }
    }
  });

  return (
    <div className={styles.canvasContainer}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}

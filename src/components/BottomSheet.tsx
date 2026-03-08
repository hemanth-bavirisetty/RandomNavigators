import React, { useRef, useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, animate, PanInfo } from 'motion/react';

type BottomSheetProps = {
  children: React.ReactNode;
  peekContent?: React.ReactNode;
};

// Snap points as percentages from the BOTTOM of viewport
const SNAP_PEEK = 0.12; // ~12% from bottom (peek handle + summary)
const SNAP_HALF = 0.5;  // 50% — half screen
const SNAP_FULL = 0.92; // ~92% — near full screen

export default function BottomSheet({ children, peekContent }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [windowH, setWindowH] = useState(window.innerHeight);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => {
      setWindowH(window.innerHeight);
      setIsDesktop(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // y = 0 means top, y = windowH means bottom (off-screen)
  // "peek" state means sheet top is near the bottom → y is large
  const peekY = windowH * (1 - SNAP_PEEK);
  const halfY = windowH * (1 - SNAP_HALF);
  const fullY = windowH * (1 - SNAP_FULL);

  const y = useMotionValue(peekY);

  // Background dim behind the sheet
  const backdropOpacity = useTransform(y, [fullY, peekY], [0.5, 0]);

  const snapTo = (target: number) => {
    animate(y, target, {
      type: 'spring',
      stiffness: 400,
      damping: 40,
    });
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    const currentY = y.get();
    const velocity = info.velocity.y;

    // If flicking fast, go to the next snap in that direction
    if (velocity < -500) {
      // Flicking up
      if (currentY > halfY) snapTo(halfY);
      else snapTo(fullY);
      return;
    }
    if (velocity > 500) {
      // Flicking down
      if (currentY < halfY) snapTo(halfY);
      else snapTo(peekY);
      return;
    }

    // Otherwise snap to nearest
    const snaps = [fullY, halfY, peekY];
    const nearest = snaps.reduce((prev, curr) =>
      Math.abs(curr - currentY) < Math.abs(prev - currentY) ? curr : prev
    );
    snapTo(nearest);
  };

  // Desktop: render as a side panel
  if (isDesktop) {
    return (
      <div className="desktop-panel">
        <div className="desktop-panel-inner">
          {children}
        </div>
      </div>
    );
  }

  // Mobile: draggable bottom sheet
  return (
    <>
      {/* Backdrop dim */}
      <motion.div
        className="sheet-backdrop"
        style={{ opacity: backdropOpacity }}
        pointerEvents="none"
      />

      <motion.div
        ref={sheetRef}
        className="bottom-sheet"
        style={{ y, height: windowH }}
        drag="y"
        dragConstraints={{ top: fullY, bottom: peekY }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
      >
        {/* Drag handle */}
        <div className="sheet-handle-area">
          <div className="sheet-handle" />
        </div>

        {/* Peek content (visible even collapsed) */}
        {peekContent && (
          <div className="sheet-peek-content" onPointerDown={() => snapTo(halfY)}>
            {peekContent}
          </div>
        )}

        {/* Scrollable content */}
        <div className="sheet-content">
          {children}
        </div>
      </motion.div>
    </>
  );
}

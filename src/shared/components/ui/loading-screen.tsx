"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingScreenProps {
  minDuration?: number;
}

export function LoadingScreen({ minDuration = 800 }: LoadingScreenProps) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShow(false), minDuration);
    return () => clearTimeout(t);
  }, [minDuration]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="loading-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
        >
          <div className="loading-screen-inner">
            <motion.div
              className="loading-screen-logo"
              aria-hidden="true"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: [0.3, 0.7, 0.4, 1] }}
            >
              <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 1 L9 1 L11 6 L9 11 L3 11 L1 6 Z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
                <circle cx="6" cy="6" r="1.4" fill="currentColor" />
              </svg>
            </motion.div>
            <motion.div
              className="loading-screen-spinner"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

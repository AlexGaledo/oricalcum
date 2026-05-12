"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingScreenProps {
  minDuration?: number;
}

export function LoadingScreen({ minDuration = 250 }: LoadingScreenProps) {
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
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: "easeInOut" }}
        >
          <div className="loading-screen-inner">
            <div className="loading-screen-spinner" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

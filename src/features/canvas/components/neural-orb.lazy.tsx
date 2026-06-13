"use client";

import dynamic from "next/dynamic";

/**
 * three.js is ~150kb gz — load the orb only on the client, only when a page
 * actually renders the neural background.
 */
export const NeuralOrbLazy = dynamic(() => import("./neural-orb"), { ssr: false });

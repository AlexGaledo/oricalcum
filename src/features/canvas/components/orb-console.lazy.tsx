"use client";

import dynamic from "next/dynamic";

/** three.js is heavy — load the console orb on the client only. */
export const OrbConsoleLazy = dynamic(() => import("./orb-console"), { ssr: false });

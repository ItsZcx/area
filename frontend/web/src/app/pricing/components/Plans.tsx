"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CanvasRevealEffect } from "@/components/ui/canvas-reveal-effect";
import { GiMetalBar } from "react-icons/gi";
import { GiGoldBar } from "react-icons/gi";
import { GiMinerals } from "react-icons/gi";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function Plans() {
  return (
    <div className="flex flex-col lg:flex-row items-center justify-center bg-white dark:bg-black w-full gap-4 mx-auto px-8">
      <Card title="Free" id={0} icon={<GiMetalBar className="h-20 w-20" />}>
        <CanvasRevealEffect
          animationSpeed={3}
          containerClassName="bg-sky-600"
          colors={[[125, 211, 252]]}
        />
      </Card>
      <Card title="Personal" id={1} icon={<GiGoldBar className="h-20 w-20" />}>
        <CanvasRevealEffect
          animationSpeed={5.1}
          containerClassName="bg-emerald-900"
        />
      </Card>
      <Card
        title="Professional"
        id={2}
        icon={<GiMinerals className="h-20 w-20" />}
      >
        <CanvasRevealEffect
          animationSpeed={3}
          containerClassName="bg-black"
          colors={[
            [236, 72, 153],
            [232, 121, 249],
          ]}
          dotSize={2}
        />
      </Card>
    </div>
  );
}

const Card = ({
  title,
  id = 0,
  icon,
  children,
}: {
  title: string;
  id?: number;
  icon: React.ReactNode;
  children?: React.ReactNode;
}) => {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  const [initialHovered, setInitialHovered] = useState(true);

  return (
    <div
      onMouseEnter={() => {
        setHovered(true), setInitialHovered(true);
      }}
      onMouseLeave={() => setHovered(false)}
      className="border border-black/[0.2] group/canvas-card flex items-center justify-center dark:border-white/[0.2] max-w-sm w-full mx-auto h-[30rem] relative"
    >
      <Icon className="absolute h-6 w-6 -top-3 -left-3 dark:text-white text-black" />
      <Icon className="absolute h-6 w-6 -bottom-3 -left-3 dark:text-white text-black" />
      <Icon className="absolute h-6 w-6 -top-3 -right-3 dark:text-white text-black" />
      <Icon className="absolute h-6 w-6 -bottom-3 -right-3 dark:text-white text-black" />

      <AnimatePresence>
        {!hovered && (
          <div key="initial" className="h-full w-full absolute inset-0">
            {children}
          </div>
        )}{" "}
        {hovered && (
          <motion.div
            key="hovered"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full w-full absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/70 text-white p-4"
          >
            <div className="relative z-20 text-center mb-4">
              <div className="opacity-100 transition duration-200 w-full mx-auto flex items-center justify-center">
                {icon}
              </div>
              <h2 className="text-xl opacity-100 relative z-10 mt-4 font-bold text-white -translate-y-2 transition duration-200">
                {title}
              </h2>
            </div>
            <div className="text-center w-full">
              <h3 className="text-lg font-bold">What&apos;s Included:</h3>
              <ul className="mt-2 space-y-1 text-center">
                <li className="flex items-center justify-center">
                  <span className="mr-2">✓</span> Create up to 10 automations
                </li>
                <li className="flex items-center justify-center">
                  <span className="mr-2">✓</span> Access to basic templates
                </li>
                <li className="flex items-center justify-center">
                  <span className="mr-2">✓</span>{" "}
                  {id === 0
                    ? "1k API requests per month"
                    : id === 1
                    ? "10k API requests per month"
                    : "Unlimited API requests"}
                </li>
                <li className="flex items-center justify-center">
                  <span className="mr-2">{id !== 0 ? "✓" : "✗"}</span> Analytics
                  platform
                </li>
                <li className="flex items-center justify-center">
                  <span className="mr-2">{id === 2 ? "✓" : "✗"}</span> Access to
                  all templates
                </li>
                <li className="flex items-center justify-center">
                  <span className="mr-2">{id === 2 ? "✓" : "✗"}</span> Custom
                  integration support
                </li>
              </ul>
              <button
                onClick={() => {
                  if (id === 2)
                    window.location.href =
                      "mailto:area@gmail.com?subject=Professional%20Area%20Plan%20-";
                  else
                    router.push(`/pricing/${id === 0 ? "free" : "personal"}`);
                }}
                className="inline-flex mt-4 h-12 animate-shimmer items-center justify-center rounded-md border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
              >
                {id === 0
                  ? "Get started"
                  : id === 1
                  ? "$10/month"
                  : "Contact us"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const Icon = ({ className, ...rest }: any) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className={className}
      {...rest}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
    </svg>
  );
};

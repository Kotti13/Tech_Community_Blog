import React from "react";
import { Rocket } from "lucide-react";

const RocketLaunchAnimation: React.FC<{ trigger: boolean }> = ({ trigger }) => {
  // Only render the rocket when trigger is true
  return (
    <div className="pointer-events-none relative h-8 flex justify-center items-end">
      <span
        className={`absolute bottom-0 left-1/2 -translate-x-1/2 ${
          trigger
            ? "animate-rocket-launch"
            : "opacity-0"
        }`}
        data-testid="rocket-launch"
      >
        <Rocket size={32} className="text-primary animate-pulse drop-shadow-lg" />
      </span>
      <style>
        {`
        @keyframes rocket-launch {
          0% {
            opacity: 1;
            transform: translate(-50%, 0) scale(1);
          }
          80% {
            opacity: 1;
            transform: translate(-50%, -80px) scale(1.15);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -160px) scale(0.98) rotate(-10deg);
          }
        }
        .animate-rocket-launch {
          animation: rocket-launch 1s cubic-bezier(.4,2,.6,1) forwards;
        }
        `}
      </style>
    </div>
  );
};

export default RocketLaunchAnimation;
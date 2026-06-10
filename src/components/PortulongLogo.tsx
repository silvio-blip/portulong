/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
}

export default function PortulongLogo({ className = "", size = 64 }: LogoProps) {
  return (
    <div 
      id="portulong-logo"
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-lg"
      >
        {/* Left Side: Green Dragon Wing/Body and Tail */}
        <path
          d="M 100 20 C 40 10, 10 50, 15 90 C 20 130, 60 160, 100 180 C 70 170, 45 140, 40 110 C 35 80, 55 50, 90 35 Z"
          fill="url(#greenDragonGrad)"
          className="animate-pulse"
          style={{ animationDuration: "3s" }}
        />
        {/* Left Dragon Neck/Head */}
        <path
          d="M 100 20 C 80 15, 60 25, 50 35 C 40 45, 35 60, 42 65 C 48 70, 55 55, 65 48 C 75 40, 90 42, 100 45 Z"
          fill="url(#greenDragonGrad)"
        />

        {/* Right Side: Red Dragon Wing/Body and Tail */}
        <path
          d="M 100 20 C 160 10, 190 50, 185 90 C 180 130, 140 160, 100 180 C 130 170, 155 140, 160 110 C 165 80, 145 50, 110 35 Z"
          fill="url(#redDragonGrad)"
          className="animate-pulse"
          style={{ animationDuration: "4s" }}
        />
        {/* Right Dragon Neck/Head */}
        <path
          d="M 100 20 C 120 15, 140 25, 150 35 C 160 45, 165 60, 158 65 C 152 70, 145 55, 135 48 C 125 40, 110 42, 100 45 Z"
          fill="url(#redDragonGrad)"
        />

        {/* Connection Loop at Bottom (Double Helix) */}
        <circle cx="85" cy="175" r="12" fill="url(#greenDragonGrad)" opacity="0.9" />
        <circle cx="115" cy="175" r="12" fill="url(#redDragonGrad)" opacity="0.9" />
        <path d="M 85 175 Q 100 160 115 175" stroke="#10B981" strokeWidth="4" fill="none" />
        <path d="M 85 175 Q 100 190 115 175" stroke="#EF4444" strokeWidth="4" fill="none" />

        {/* Left Accent curly bracket symbol in green container */}
        <rect x="5" y="80" width="22" height="40" rx="6" fill="#065F46" opacity="0.8" />
        <text x="16" y="106" fill="#FBBF24" fontSize="24" fontWeight="bold" textAnchor="middle">{"{"}</text>

        {/* Right Accent tag symbol in red container */}
        <rect x="173" y="80" width="22" height="40" rx="6" fill="#991B1B" opacity="0.8" />
        <text x="184" y="106" fill="#FBBF24" fontSize="20" fontWeight="bold" textAnchor="middle">{"<>"}</text>

        {/* Central Golden Speech Bubble Badge */}
        <ellipse cx="100" cy="100" rx="55" ry="40" fill="url(#goldSpeechGrad)" stroke="#B45309" strokeWidth="3" />
        <path d="M 115 135 L 138 152 L 130 131" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />

        {/* Branded Text in Speech Bubble */}
        <text
          x="100"
          y="110"
          fill="#000000"
          fontFamily="monospace, sans-serif"
          fontSize="24"
          fontWeight="900"
          textAnchor="middle"
          letterSpacing="1"
        >
          {"{PT_}"}
        </text>

        {/* Definitions of Gradients */}
        <defs>
          <linearGradient id="greenDragonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="50%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#064E3B" />
          </linearGradient>

          <linearGradient id="redDragonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DC2626" />
            <stop offset="50%" stopColor="#EF4444" />
            <stop offset="100%" stopColor="#7F1D1D" />
          </linearGradient>

          <linearGradient id="goldSpeechGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="30%" stopColor="#F59E0B" />
            <stop offset="70%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#92400E" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

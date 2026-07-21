import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Camera, Image as ImageIcon, RotateCcw, X, Check, VideoOff, AlertCircle } from "lucide-react";

// Helper to encode raw SVG markup into standard, bulletproof Base64 Data URLs
const encodeSvg = (svgMarkup: string) => {
  return "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgMarkup)));
};

// 1. PUPPY
const PUPPY_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <style>
    @keyframes bob {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-4px) rotate(1deg); }
    }
    @keyframes ear-l {
      0%, 100% { transform: rotate(0deg); }
      50% { transform: rotate(-10deg); }
    }
    @keyframes ear-r {
      0%, 100% { transform: rotate(0deg); }
      50% { transform: rotate(10deg); }
    }
    @keyframes blink {
      0%, 90%, 100% { transform: scaleY(1); }
      95% { transform: scaleY(0.1); }
    }
    .head { animation: bob 2.4s ease-in-out infinite; transform-origin: center bottom; }
    .ear-left { animation: ear-l 2.4s ease-in-out infinite; transform-origin: 30px 35px; }
    .ear-right { animation: ear-r 2.4s ease-in-out infinite; transform-origin: 70px 35px; }
    .eye { animation: blink 4s infinite; transform-origin: center; }
  </style>
  <rect width="100" height="100" rx="24" fill="#FFEAA7"/>
  <g class="head">
    <path class="ear-left" d="M22 32C15 35 12 48 15 58C18 63 25 61 27 55C29 48 30 38 22 32Z" fill="#D63031"/>
    <path class="ear-right" d="M78 32C85 35 88 48 85 58C82 63 75 61 73 55C71 48 70 38 78 32Z" fill="#D63031"/>
    <circle cx="50" cy="52" r="26" fill="#E17055"/>
    <path d="M45 32C50 32 50 48 50 48C50 48 50 32 55 32C55 32 53 42 50 44C47 42 45 32 45 32Z" fill="#FFF" opacity="0.9"/>
    <circle class="eye" cx="39" cy="48" r="4" fill="#2D3436"/>
    <circle class="eye" cx="61" cy="48" r="4" fill="#2D3436"/>
    <circle cx="37" cy="46" r="1.2" fill="#FFF"/>
    <circle cx="59" cy="46" r="1.2" fill="#FFF"/>
    <circle cx="31" cy="54" r="3" fill="#FF7675" opacity="0.5"/>
    <circle cx="69" cy="54" r="3" fill="#FF7675" opacity="0.5"/>
    <ellipse cx="50" cy="58" rx="11" ry="8" fill="#FFF"/>
    <path d="M46 56C48 58 50 58 50 58M54 56C52 58 50 58 50 58" stroke="#2D3436" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M46 54C46 52 54 52 54 54C54 56 46 56 46 54Z" fill="#2D3436"/>
    <path d="M47 57C47 57 47 64 50 64C53 64 53 57 50 57" fill="#FF7675"/>
  </g>
</svg>`;

// 2. KITTY
const KITTY_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <style>
    @keyframes purr {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.03) translateY(-1px); }
    }
    @keyframes whiskers {
      0%, 100% { transform: rotate(0deg); }
      50% { transform: rotate(-3deg); }
    }
    @keyframes blink {
      0%, 90%, 100% { transform: scaleY(1); }
      95% { transform: scaleY(0.1); }
    }
    .cat-head { animation: purr 2.2s ease-in-out infinite; transform-origin: center bottom; }
    .w-left { animation: whiskers 2.2s ease-in-out infinite; transform-origin: 35px 56px; }
    .w-right { animation: whiskers 2.2s ease-in-out infinite; transform-origin: 65px 56px; }
    .eye { animation: blink 3.5s infinite; transform-origin: center; }
  </style>
  <rect width="100" height="100" rx="24" fill="#E8F4F8"/>
  <g class="cat-head">
    <path d="M24 38L38 22L42 38Z" fill="#FD9644"/>
    <path d="M28 36L36 25L39 36Z" fill="#FDB87D"/>
    <path d="M76 38L62 22L58 38Z" fill="#FD9644"/>
    <path d="M72 36L64 25L61 36Z" fill="#FDB87D"/>
    <circle cx="50" cy="52" r="25" fill="#FFEAA7"/>
    <ellipse class="eye" cx="39" cy="49" rx="3.5" ry="4.5" fill="#2D3436"/>
    <ellipse class="eye" cx="61" cy="49" rx="3.5" ry="4.5" fill="#2D3436"/>
    <circle cx="37.5" cy="47" r="1" fill="#FFF"/>
    <circle cx="59.5" cy="47" r="1" fill="#FFF"/>
    <circle cx="31" cy="54" r="2.5" fill="#FF7675" opacity="0.4"/>
    <circle cx="69" cy="54" r="2.5" fill="#FF7675" opacity="0.4"/>
    <g class="w-left" stroke="#2D3436" stroke-width="1.5" stroke-linecap="round">
      <line x1="33" y1="54" x2="18" y2="52"/>
      <line x1="33" y1="56" x2="16" y2="56"/>
      <line x1="33" y1="58" x2="18" y2="60"/>
    </g>
    <g class="w-right" stroke="#2D3436" stroke-width="1.5" stroke-linecap="round">
      <line x1="67" y1="54" x2="82" y2="52"/>
      <line x1="67" y1="56" x2="84" y2="56"/>
      <line x1="67" y1="58" x2="82" y2="60"/>
    </g>
    <polygon points="48,53 52,53 50,55" fill="#FF7675"/>
    <path d="M46 56C48 57.5 50 57.5 50 57.5M54 56C52 57.5 50 57.5 50 57.5" stroke="#2D3436" stroke-width="1.5" stroke-linecap="round"/>
  </g>
</svg>`;

// 3. PANDA
const PANDA_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <style>
    @keyframes tilt {
      0%, 100% { transform: rotate(0deg); }
      50% { transform: rotate(-2deg) translateY(-1px); }
    }
    @keyframes ear-wiggle {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.08); }
    }
    @keyframes blink {
      0%, 90%, 100% { transform: scaleY(1); }
      95% { transform: scaleY(0.1); }
    }
    .panda { animation: tilt 3.8s ease-in-out infinite; transform-origin: center bottom; }
    .ear { animation: ear-wiggle 1.8s ease-in-out infinite alternate; }
    .eye { animation: blink 4.2s infinite; transform-origin: center; }
  </style>
  <rect width="100" height="100" rx="24" fill="#E1F5FE"/>
  <g class="panda">
    <circle class="ear" cx="28" cy="30" r="10" fill="#2D3436"/>
    <circle class="ear" cx="72" cy="30" r="10" fill="#2D3436"/>
    <circle cx="50" cy="52" r="25" fill="#FFFFFF"/>
    <ellipse cx="39" cy="49" rx="6.5" ry="8.5" fill="#2D3436" transform="rotate(-15, 39, 49)"/>
    <ellipse cx="61" cy="49" rx="6.5" ry="8.5" fill="#2D3436" transform="rotate(15, 61, 49)"/>
    <circle class="eye" cx="39" cy="47" r="2.5" fill="#FFFFFF"/>
    <circle class="eye" cx="61" cy="47" r="2.5" fill="#FFFFFF"/>
    <circle cx="39.5" cy="46.5" r="0.8" fill="#2D3436"/>
    <circle cx="61.5" cy="46.5" r="0.8" fill="#2D3436"/>
    <ellipse cx="50" cy="56" rx="3.5" ry="2.2" fill="#2D3436"/>
    <path d="M48 58.5C49 59.5 50 59.5 50 59.5M52 58.5C51 59.5 50 59.5 50 59.5" stroke="#2D3436" stroke-width="1.2" stroke-linecap="round"/>
    <circle cx="28" cy="56" r="3" fill="#FF7675" opacity="0.3"/>
    <circle cx="72" cy="56" r="3" fill="#FF7675" opacity="0.3"/>
  </g>
</svg>`;

// 4. FOX
const FOX_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <style>
    @keyframes sway {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-2px) rotate(2deg); }
    }
    @keyframes ear-twitch-l {
      0%, 90%, 100% { transform: rotate(0deg); }
      95% { transform: rotate(-6deg); }
    }
    @keyframes ear-twitch-r {
      0%, 85%, 100% { transform: rotate(0deg); }
      90% { transform: rotate(6deg); }
    }
    @keyframes blink {
      0%, 90%, 100% { transform: scaleY(1); }
      95% { transform: scaleY(0.1); }
    }
    .fox { animation: sway 3.2s ease-in-out infinite; transform-origin: center bottom; }
    .ear-l { animation: ear-twitch-l 3.6s infinite; transform-origin: 30px 30px; }
    .ear-r { animation: ear-twitch-r 4.1s infinite; transform-origin: 70px 30px; }
    .eye { animation: blink 4.5s infinite; transform-origin: center; }
  </style>
  <rect width="100" height="100" rx="24" fill="#FFF5F0"/>
  <g class="fox">
    <polygon class="ear-l" points="20,38 32,16 40,34" fill="#E15F41"/>
    <polygon class="ear-l" points="24,36 32,22 37,34" fill="#F5CD79"/>
    <polygon class="ear-r" points="80,38 68,16 60,34" fill="#E15F41"/>
    <polygon class="ear-r" points="76,36 68,22 63,34" fill="#F5CD79"/>
    <path d="M22 46C22 36 78 36 78 46C78 56 68 62 50 64C32 62 22 56 22 46Z" fill="#E15F41"/>
    <path d="M22 46C24 54 36 58 42 54C34 50 25 46 22 46Z" fill="#FFFFFF" opacity="0.95"/>
    <path d="M78 46C76 54 64 58 58 54C66 50 75 46 78 46Z" fill="#FFFFFF" opacity="0.95"/>
    <circle class="eye" cx="36" cy="45" r="3" fill="#303952"/>
    <circle class="eye" cx="35" cy="44" r="1" fill="#FFF"/>
    <circle class="eye" cx="64" cy="45" r="3" fill="#303952"/>
    <circle class="eye" cx="63" cy="44" r="1" fill="#FFF"/>
    <circle cx="28" cy="49" r="2.5" fill="#FF7675" opacity="0.4"/>
    <circle cx="72" cy="49" r="2.5" fill="#FF7675" opacity="0.4"/>
    <polygon points="47,56 53,56 50,60" fill="#303952"/>
    <circle cx="50" cy="56.5" r="3.2" fill="#FFFFFF" opacity="0.95"/>
    <polygon points="48,56 52,56 50,59" fill="#303952"/>
  </g>
</svg>`;

// 5. KOALA
const KOALA_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <style>
    @keyframes breathe {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.03) translateY(-0.8px); }
    }
    @keyframes ear-sway-l {
      0%, 100% { transform: rotate(0deg); }
      50% { transform: rotate(-5deg); }
    }
    @keyframes ear-sway-r {
      0%, 100% { transform: rotate(0deg); }
      50% { transform: rotate(5deg); }
    }
    .koala { animation: breathe 3.6s ease-in-out infinite; transform-origin: center bottom; }
    .ear-l { animation: ear-sway-l 3.6s ease-in-out infinite; transform-origin: 28px 38px; }
    .ear-r { animation: ear-sway-r 3.6s ease-in-out infinite; transform-origin: 72px 38px; }
  </style>
  <rect width="100" height="100" rx="24" fill="#E8EDF2"/>
  <g class="koala">
    <circle class="ear-l" cx="24" cy="38" r="14" fill="#7F8C8D"/>
    <circle class="ear-l" cx="24" cy="38" r="9" fill="#F5F6FA"/>
    <circle class="ear-r" cx="76" cy="38" r="14" fill="#7F8C8D"/>
    <circle class="ear-r" cx="76" cy="38" r="9" fill="#F5F6FA"/>
    <circle cx="50" cy="52" r="24" fill="#95A5A6"/>
    <ellipse cx="50" cy="53" rx="6" ry="10" fill="#2D3436"/>
    <path d="M35 48C36 50 39 50 40 48" stroke="#2D3436" stroke-width="2.5" stroke-linecap="round" fill="none"/>
    <path d="M65 48C64 50 61 50 60 48" stroke="#2D3436" stroke-width="2.5" stroke-linecap="round" fill="none"/>
    <circle cx="29" cy="54" r="3" fill="#FF7675" opacity="0.4"/>
    <circle cx="71" cy="54" r="3" fill="#FF7675" opacity="0.4"/>
  </g>
</svg>`;

// 6. BUNNY
const BUNNY_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <style>
    @keyframes jump {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }
    @keyframes ear-floppy-l {
      0%, 100% { transform: rotate(0deg); }
      50% { transform: rotate(-9deg); }
    }
    @keyframes ear-floppy-r {
      0%, 100% { transform: rotate(0deg); }
      50% { transform: rotate(9deg); }
    }
    @keyframes blink {
      0%, 90%, 100% { transform: scaleY(1); }
      95% { transform: scaleY(0.1); }
    }
    .bunny { animation: jump 2.6s ease-in-out infinite; transform-origin: center bottom; }
    .ear-left { animation: ear-floppy-l 2.6s ease-in-out infinite; transform-origin: 38px 24px; }
    .ear-right { animation: ear-floppy-r 2.6s ease-in-out infinite; transform-origin: 62px 24px; }
    .eye { animation: blink 3.8s infinite; transform-origin: center; }
  </style>
  <rect width="100" height="100" rx="24" fill="#FDF0F5"/>
  <g class="bunny">
    <path class="ear-left" d="M30 6C33 6 42 16 40 26C38 32 32 30 31 24C30 18 27 6 30 6Z" fill="#FFFFFF"/>
    <path class="ear-left" d="M32 9C34 9 39 16 38 23C37 27 33 26 33 22C33 18 30 9 32 9Z" fill="#F8A5C2"/>
    <path class="ear-right" d="M70 6C67 6 58 16 60 26C62 32 68 30 69 24C70 18 73 6 70 6Z" fill="#FFFFFF"/>
    <path class="ear-right" d="M68 9C66 9 61 16 62 23C63 27 67 26 67 22C67 18 70 9 68 9Z" fill="#F8A5C2"/>
    <circle cx="50" cy="52" r="24" fill="#FFFFFF"/>
    <circle class="eye" cx="39" cy="48" r="3" fill="#574B90"/>
    <circle class="eye" cx="38" cy="47" r="1" fill="#FFF"/>
    <circle class="eye" cx="61" cy="48" r="3" fill="#574B90"/>
    <circle class="eye" cx="60" cy="47" r="1" fill="#FFF"/>
    <circle cx="29" cy="53" r="3" fill="#F8A5C2" opacity="0.5"/>
    <circle cx="71" cy="53" r="3" fill="#F8A5C2" opacity="0.5"/>
    <polygon points="48,51 52,51 50,53" fill="#F8A5C2"/>
    <path d="M46 54C48 55.5 50 55.5 50 55.5M54 54C52 55.5 50 55.5 50 55.5" stroke="#574B90" stroke-width="1.5" stroke-linecap="round"/>
    <rect x="48.5" y="55.5" width="3" height="2.5" fill="#FFF" stroke="#574B90" stroke-width="1" rx="0.5"/>
  </g>
</svg>`;

// 7. FROG
const FROG_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <style>
    @keyframes jump-frog {
      0%, 100% { transform: scaleY(1); }
      50% { transform: scaleY(1.05) translateY(-2px); }
    }
    @keyframes look-around {
      0%, 90%, 100% { transform: scaleX(1); }
      95% { transform: scaleX(0.1); }
    }
    .frog { animation: jump-frog 2.0s ease-in-out infinite; transform-origin: center bottom; }
    .frog-eye { animation: look-around 3.0s infinite; transform-origin: center; }
  </style>
  <rect width="100" height="100" rx="24" fill="#E8F8F5"/>
  <g class="frog">
    <circle cx="34" cy="38" r="9" fill="#2ECC71"/>
    <circle cx="34" cy="38" r="6" fill="#FFFFFF"/>
    <circle class="frog-eye" cx="34" cy="38" r="3" fill="#2C3E50"/>
    <circle class="frog-eye" cx="35.5" cy="36.5" r="1" fill="#FFFFFF"/>
    <circle cx="66" cy="38" r="9" fill="#2ECC71"/>
    <circle cx="66" cy="38" r="6" fill="#FFFFFF"/>
    <circle class="frog-eye" cx="66" cy="38" r="3" fill="#2C3E50"/>
    <circle class="frog-eye" cx="67.5" cy="36.5" r="1" fill="#FFFFFF"/>
    <ellipse cx="50" cy="54" rx="26" ry="20" fill="#2ECC71"/>
    <ellipse cx="50" cy="62" rx="16" ry="10" fill="#F1C40F" opacity="0.8"/>
    <circle cx="30" cy="54" r="3" fill="#E74C3C" opacity="0.4"/>
    <circle cx="70" cy="54" r="3" fill="#E74C3C" opacity="0.4"/>
    <path d="M38 52C42 58 58 58 62 52" stroke="#2C3E50" stroke-width="2.5" stroke-linecap="round" fill="none"/>
  </g>
</svg>`;

// 8. BEAR
const BEAR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <style>
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-2.5px); }
    }
    @keyframes blink {
      0%, 90%, 100% { transform: scaleY(1); }
      95% { transform: scaleY(0.1); }
    }
    .bear { animation: bounce 3.0s ease-in-out infinite; transform-origin: center bottom; }
    .eye { animation: blink 4.2s infinite; transform-origin: center; }
  </style>
  <rect width="100" height="100" rx="24" fill="#FEF9E7"/>
  <g class="bear">
    <circle cx="28" cy="34" r="9" fill="#D35400"/>
    <circle cx="28" cy="34" r="5" fill="#ED3C00" opacity="0.5"/>
    <circle cx="72" cy="34" r="9" fill="#D35400"/>
    <circle cx="72" cy="34" r="5" fill="#ED3C00" opacity="0.5"/>
    <circle cx="50" cy="52" r="24" fill="#E67E22"/>
    <circle class="eye" cx="39" cy="48" r="3" fill="#2C3E50"/>
    <circle class="eye" cx="38" cy="47" r="1" fill="#FFF"/>
    <circle class="eye" cx="61" cy="48" r="3" fill="#2C3E50"/>
    <circle class="eye" cx="60" cy="47" r="1" fill="#FFF"/>
    <circle cx="29" cy="54" r="2.5" fill="#E74C3C" opacity="0.4"/>
    <circle cx="71" cy="54" r="2.5" fill="#E74C3C" opacity="0.4"/>
    <ellipse cx="50" cy="57" rx="7" ry="5" fill="#F9E79F"/>
    <ellipse cx="50" cy="55.5" rx="2.5" ry="1.8" fill="#2C3E50"/>
    <path d="M47 58C48.5 59.5 50 59.5 50 59.5M53 58C51.5 59.5 50 59.5 50 59.5" stroke="#2C3E50" stroke-width="1.2" stroke-linecap="round"/>
  </g>
</svg>`;

const PREBUILT_AVATARS = [
  { id: "dog", name: "Cheerful Pup", url: encodeSvg(PUPPY_SVG) },
  { id: "cat", name: "Sassy Kitty", url: encodeSvg(KITTY_SVG) },
  { id: "panda", name: "Fluffy Panda", url: encodeSvg(PANDA_SVG) },
  { id: "fox", name: "Clever Fox", url: encodeSvg(FOX_SVG) },
  { id: "koala", name: "Sleepy Koala", url: encodeSvg(KOALA_SVG) },
  { id: "rabbit", name: "Fluffy Bunny", url: encodeSvg(BUNNY_SVG) },
  { id: "frog", name: "Jolly Frog", url: encodeSvg(FROG_SVG) },
  { id: "bear", name: "Gentle Bear", url: encodeSvg(BEAR_SVG) }
];

interface AvatarSelectorProps {
  currentAvatar: string;
  onSelectAvatar: (avatarUrl: string) => void;
  themeColor: string;
}

export function AvatarSelector({ currentAvatar, onSelectAvatar, themeColor }: AvatarSelectorProps) {
  const [activeTab, setActiveTab] = useState<"gallery" | "camera">("gallery");
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [previewCaptured, setPreviewCaptured] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop camera stream when component unmounts
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    setPreviewCaptured(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 300, height: 300, facingMode: "user" }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraOn(true);
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError(
        "Could not access your camera. Please ensure permissions are granted and you are on a secure (HTTPS) connection."
      );
      setIsCameraOn(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraOn(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      // Create a square canvas to keep avatars uniform
      const size = Math.min(video.videoWidth, video.videoHeight) || 300;
      canvas.width = size;
      canvas.height = size;
      
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Crop video to a centered square
        const sx = (video.videoWidth - size) / 2;
        const sy = (video.videoHeight - size) / 2;
        ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);
        
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        setPreviewCaptured(dataUrl);
        stopCamera();
      }
    }
  };

  const handleApplyCaptured = () => {
    if (previewCaptured) {
      onSelectAvatar(previewCaptured);
      setPreviewCaptured(null);
    }
  };

  const switchTab = (tab: "gallery" | "camera") => {
    setActiveTab(tab);
    if (tab === "gallery") {
      stopCamera();
    } else {
      startCamera();
    }
  };

  return (
    <div className="space-y-4 pt-1">
      {/* Selector tab switchers */}
      <div className="flex gap-2 p-1 bg-gray-100 dark:bg-neutral-900 border border-gray-300 dark:border-subtle rounded-lg w-fit">
        <button
          type="button"
          onClick={() => switchTab("gallery")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
            activeTab === "gallery"
              ? "bg-white dark:bg-neutral-800 text-gray-950 dark:text-white shadow-xs"
              : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          Cute Animal Avatars
        </button>
        <button
          type="button"
          onClick={() => switchTab("camera")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
            activeTab === "camera"
              ? "bg-white dark:bg-neutral-800 text-gray-950 dark:text-white shadow-xs"
              : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          Camera Shot
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "gallery" ? (
          <motion.div
            key="gallery"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="grid grid-cols-4 gap-2.5"
          >
            {PREBUILT_AVATARS.map((avatar) => {
              const isSelected = currentAvatar === avatar.url;
              return (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => onSelectAvatar(avatar.url)}
                  className="group relative flex flex-col items-center gap-1.5 p-1 cursor-pointer transition-all focus:outline-hidden"
                  title={avatar.name}
                >
                  <div
                    className="relative w-12 h-12 rounded-full overflow-hidden border-2 transition-all group-hover:scale-105"
                    style={{
                      borderColor: isSelected ? themeColor : "transparent",
                      boxShadow: isSelected ? `0 0 10px ${themeColor}40` : "none"
                    }}
                  >
                    <img
                      src={avatar.url}
                      alt={avatar.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white stroke-[3.5]" />
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] text-gray-700 dark:text-neutral-500 font-mono text-center truncate w-full max-w-[65px] font-bold">
                    {avatar.name}
                  </span>
                </button>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            key="camera"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col items-center gap-3 bg-gray-50 dark:bg-neutral-900/40 p-4 border border-gray-300 dark:border-subtle rounded-xl"
          >
            {cameraError && (
              <div className="w-full p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-950/40 rounded-lg flex items-start gap-2 text-rose-700 dark:text-rose-400 text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{cameraError}</span>
              </div>
            )}

            <div className="relative w-44 h-44 rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-800 border-2 border-gray-300 dark:border-subtle flex items-center justify-center">
              {/* Camera Video Feed */}
              {isCameraOn && !previewCaptured && (
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]" // mirror look
                />
              )}

              {/* No video / Camera off */}
              {!isCameraOn && !previewCaptured && (
                <div className="flex flex-col items-center gap-2 text-gray-400 dark:text-neutral-600">
                  <VideoOff className="w-8 h-8" />
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider">Camera Off</span>
                </div>
              )}

              {/* Preview captured photo */}
              {previewCaptured && (
                <img
                  src={previewCaptured}
                  alt="Captured Avatar Preview"
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap justify-center gap-2">
              {isCameraOn && (
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Camera className="w-3.5 h-3.5" />
                  Take Snapshot
                </button>
              )}

              {previewCaptured && (
                <>
                  <button
                    type="button"
                    onClick={handleApplyCaptured}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Apply Picture
                  </button>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-3.5 py-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-gray-900 dark:text-white rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-gray-300 dark:border-subtle"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Retake
                  </button>
                </>
              )}

              {!isCameraOn && !previewCaptured && (
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Camera className="w-3.5 h-3.5" />
                  Turn Camera On
                </button>
              )}

              {isCameraOn && (
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-gray-700 dark:text-neutral-300 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-gray-300 dark:border-subtle"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancel
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

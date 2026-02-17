"use client";
import React from "react";
import { motion } from "framer-motion";

export default function ScrollingShowcase() {
    const items = [
        { label: "Steam", img: "/Steam-Emblem.png" },
        { label: "Windows", img: "https://upload.wikimedia.org/wikipedia/commons/4/48/Windows_logo_-_2012.svg" },
        { label: "macOS", img: "https://upload.wikimedia.org/wikipedia/commons/3/30/MacOS_logo.svg" },
        { label: "Deck", img: "https://upload.wikimedia.org/wikipedia/commons/a/a7/Steam_Deck_logo.svg" },
        { label: "DirectX", img: "https://upload.wikimedia.org/wikipedia/commons/e/e0/DirectX_logo.svg" },
        { label: "Vulkan", img: "https://upload.wikimedia.org/wikipedia/commons/d/df/Vulkan_logo.svg" },
    ];

    // Double up items for a seamless infinite loop
    const duplicatedItems = [...items, ...items];

    return (
        <section className="relative w-screen ml-[calc(50%-50vw)] mt-16 py-8 overflow-hidden">
            {/* Background line */}
            <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent -z-10" />

            {/* Masked edges for professional look */}
            <div className="absolute inset-y-0 left-0 w-24 sm:w-48 bg-gradient-to-r from-[#000000] to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-24 sm:w-48 bg-gradient-to-l from-[#000000] to-transparent z-10 pointer-events-none" />

            <div className="relative flex overflow-hidden py-4">
                <motion.div
                    className="flex items-center gap-16 whitespace-nowrap w-max"
                    animate={{
                        x: ["0%", "-50%"]
                    }}
                    transition={{
                        duration: 30,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                >
                    {duplicatedItems.map((it, idx) => (
                        <div
                            key={`${it.label}-${idx}`}
                            className="flex items-center gap-3 group grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500 pointer-events-auto"
                        >
                            <img
                                src={it.img}
                                alt={it.label}
                                className="h-6 sm:h-8 w-auto object-contain transition-transform group-hover:scale-110"
                            />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-blue-400 transition-colors">
                                {it.label}
                            </span>
                        </div>
                    ))}
                </motion.div>
            </div>

            <p className="mt-8 text-[11px] uppercase tracking-[0.3em] font-bold text-gray-600">
                Compatible Ecosystems
            </p>
        </section>
    );
}

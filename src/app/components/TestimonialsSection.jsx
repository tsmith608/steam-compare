"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const testimonials = [
    {
        name: "Alex",
        avatar: "https://avatars.akamai.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg",
        text: "Finally, a way to settle the 'what should we play' argument in seconds. The shared backlog feature is a game changer for our weekend sessions.",
        role: "Squad Leader",
        rating: 5
    },
    {
        name: "Jordan",
        avatar: "https://avatars.akamai.steamstatic.com/c5d3429fa8669c1766a5e6659c25f778fccae068_full.jpg",
        text: "Found out my friend actually owns 40% of my library. We've been buying the same games for years without knowing!",
        role: "Casual Gamer",
        rating: 5
    },
    {
        name: "Sam",
        avatar: "https://avatars.akamai.steamstatic.com/51528641978d7c4939b6e82a93b4512401831c19_full.jpg",
        text: "The UI is incredible. It feels like a native Steam extension. Super helpful for planning our next co-op run.",
        role: "Achievement Hunter",
        rating: 4
    },
    {
        name: "Riley",
        avatar: "https://avatars.akamai.steamstatic.com/6666ec7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg",
        text: "Being able to see exactly who owns what and who's played what makes organizing our 4-stack a breeze. Highly recommend.",
        role: "Tactician",
        rating: 5
    },
    {
        name: "Casey",
        avatar: "https://avatars.akamai.steamstatic.com/7777ec7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg",
        text: "The 'Game Roulette' feature is actually dangerous. We ended up playing some random indie game for 6 hours straight.",
        role: "Indie Lover",
        rating: 5
    },
    {
        name: "Taylor",
        avatar: "https://avatars.akamai.steamstatic.com/8888ec7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg",
        text: "Clean, fast, and does exactly what it says. No more logging into three different sites to compare libraries.",
        role: "Speedrunner",
        rating: 5
    }
];

// Triple the items to ensure enough space for seamless sliding
const extendedTestimonials = [...testimonials, ...testimonials, ...testimonials];

const TestimonialsSection = () => {
    const [index, setIndex] = useState(testimonials.length);
    const [cardsToShow, setCardsToShow] = useState(3);
    const [isExpanding, setIsExpanding] = useState(true);

    // Responsive logic
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setCardsToShow(1);
            } else if (window.innerWidth < 1024) {
                setCardsToShow(2);
            } else {
                setCardsToShow(3);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const nextStep = () => {
        setIsExpanding(true);
        setIndex((prev) => prev + 1);
    };

    const prevStep = () => {
        setIsExpanding(true);
        setIndex((prev) => prev - 1);
    };

    const onAnimationComplete = () => {
        // Seamlessly snap back to middle set when reaching boundaries
        if (index >= testimonials.length * 2) {
            setIsExpanding(false);
            setIndex(index - testimonials.length);
        } else if (index < testimonials.length) {
            setIsExpanding(false);
            setIndex(index + testimonials.length);
        }
    };

    return (
        <section className="w-full max-w-7xl mx-auto mt-24 px-6 mb-20 relative overflow-hidden">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-extralight text-white mb-4">
                    Trusted by <span className="text-blue-400">Steam Squads</span>
                </h2>
                <div className="h-1 w-20 bg-blue-500/50 mx-auto rounded-full" />
            </div>

            <div className="relative group px-4 md:px-12">
                {/* Navigation Arrows */}
                <button
                    onClick={prevStep}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-2 md:p-3 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-blue-500/50 transition-all focus:outline-none backdrop-blur-sm shadow-lg"
                    aria-label="Previous testimonial"
                >
                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                </button>

                <button
                    onClick={nextStep}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-2 md:p-3 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-blue-500/50 transition-all focus:outline-none backdrop-blur-sm shadow-lg"
                    aria-label="Next testimonial"
                >
                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                </button>

                {/* Gallery Slider */}
                <div className="overflow-hidden">
                    <motion.div
                        className="flex py-4"
                        animate={{ x: `-${(index / extendedTestimonials.length) * 100}%` }}
                        transition={isExpanding ? {
                            duration: 0.8,
                            ease: [0.32, 0.72, 0, 1]
                        } : { duration: 0 }}
                        onAnimationComplete={onAnimationComplete}
                        style={{ width: `${(extendedTestimonials.length / cardsToShow) * 100}%` }}
                    >
                        {extendedTestimonials.map((testi, i) => (
                            <div
                                key={i}
                                className="px-3"
                                style={{ width: `${100 / extendedTestimonials.length}%` }}
                            >
                                <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md flex flex-col items-center text-center shadow-xl h-full select-none">
                                    <div className="flex flex-col items-center mb-4">
                                        <img
                                            src={testi.avatar}
                                            alt={testi.name}
                                            className="w-14 h-14 md:w-16 md:h-16 rounded-xl ring-2 ring-blue-500/20 shadow-lg mb-3 object-cover pointer-events-none"
                                        />
                                        <h4 className="text-lg text-white font-medium">{testi.name}</h4>
                                        <span className="text-[10px] text-blue-400 uppercase tracking-widest font-bold mt-0.5">{testi.role}</span>
                                    </div>

                                    <div className="flex gap-1 mb-4">
                                        {[...Array(5)].map((_, star) => (
                                            <svg
                                                key={star}
                                                className={`w-3.5 h-3.5 ${star < testi.rating ? 'text-yellow-400' : 'text-gray-600'}`}
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                            </svg>
                                        ))}
                                    </div>

                                    <p className="text-gray-300 text-sm md:text-base italic leading-relaxed">
                                        "{testi.text}"
                                    </p>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* Pagination Indicators (Mapped to 0-5) */}
            <div className="flex justify-center gap-2 mt-10">
                {testimonials.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => {
                            setIsExpanding(true);
                            setIndex(i + testimonials.length);
                        }}
                        className={`h-1.5 rounded-full transition-all duration-500 ${(index % testimonials.length) === i ? 'w-6 bg-blue-500' : 'w-1.5 bg-white/20 hover:bg-white/40'}`}
                        aria-label={`Go to testimonial ${i + 1}`}
                    />
                ))}
            </div>
        </section>
    );
};

export default TestimonialsSection;

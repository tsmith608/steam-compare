"use client";
import React, { useRef } from 'react';

const testimonials = [
    {
        name: "Tyndal",
        avatar: "/pfp/pfp1.jpg",
        text: "Now we have a way to settle the 'what should we play' argument in seconds. Its a game changer for our weekend sessions.",
        role: "Squad Leader",
        rating: 5
    },
    {
        name: "Farted",
        avatar: "/pfp/pfp2.jpg",
        text: "Found out my friend actually owns like 40% of my library so we have lots of options.",
        role: "Casual Gamer",
        rating: 5
    },
    {
        name: "TwoJuice",
        avatar: "/pfp/pfp3.jpg",
        text: "The UI is incredible. It feels like a native Steam extension. Super helpful for planning our next co-op run.",
        role: "Achievement Hunter",
        rating: 4
    },
    {
        name: "JoJoDio22",
        avatar: "/pfp/pfp4.jpg",
        text: "Being able to see exactly who owns what and who's played what makes organizing our 4-stack a breeze. Highly recommend.",
        role: "Tactician",
        rating: 5
    },
    {
        name: "Elucidx",
        avatar: "/pfp/pfp5.jpg",
        text: "The 'Game Roulette' feature is actually dangerous. We ended up playing some random indie game we forgot about for 6 hours straight.",
        role: "Indie Lover",
        rating: 5
    },
    {
        name: "Senpai72",
        avatar: "/pfp/pfp6.jpg",
        text: "Clean, fast, and does exactly what it says. No more logging into three different sites to compare libraries.",
        role: "Speedrunner",
        rating: 5
    },
    {
        name: "JamesJamesJames",
        avatar: "/pfp/pfp7.jpg",
        text: "The squad pulse feature is so good for seeing which of my friends are actually online and ready to play.",
        role: "Pro Gamer",
        rating: 5
    },
    {
        name: "Morgan<3",
        avatar: "/pfp/pfp8.jpg",
        text: "I've been using this for months and it's saved me so much time. No more manual library checks!",
        role: "Legacy User",
        rating: 5
    }
];

// Double up for a longer scrollable area, but keeping it simple
const scrollableTestimonials = [...testimonials, ...testimonials];

const CARD_WIDTH = 350;
const CARD_GAP = 24;

const TestimonialsSection = () => {
    const scrollRef = useRef(null);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const shift = CARD_WIDTH + CARD_GAP;
            scrollRef.current.scrollBy({
                left: direction * shift,
                behavior: 'smooth'
            });
        }
    };

    return (
        <section className="w-full mx-auto mt-24 mb-20 relative overflow-hidden">
            <style jsx>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>

            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-extralight text-white mb-4 uppercase tracking-tighter">
                    Trusted by <span className="text-blue-400 font-bold">Steam</span> Squads
                </h2>
                <div className="h-1 w-20 bg-blue-500/50 mx-auto rounded-full" />
            </div>

            <div className="relative group w-full">
                {/* Navigation Arrows - Absolute edges of the screen-width container */}
                <button
                    onClick={() => scroll(-1)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 md:p-3 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-blue-500/50 transition-all focus:outline-none backdrop-blur-sm shadow-lg"
                    aria-label="Previous testimonial"
                >
                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                </button>

                <button
                    onClick={() => scroll(1)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 md:p-3 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-blue-500/50 transition-all focus:outline-none backdrop-blur-sm shadow-lg"
                    aria-label="Next testimonial"
                >
                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                </button>

                {/* Gallery Slider Viewport - No max-width or padding restrictions */}
                <div
                    ref={scrollRef}
                    className="flex py-4 px-16 overflow-x-auto scroll-smooth hide-scrollbar scroll-snap-x mandatory gap-6 w-full"
                >
                    {scrollableTestimonials.map((testi, i) => (
                        <div
                            key={i}
                            className="flex-shrink-0 scroll-snap-align-start pb-4"
                            style={{ width: `${CARD_WIDTH}px` }}
                        >
                            <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md flex flex-col items-center text-center shadow-xl h-full select-none hover:border-blue-500/30 transition-colors">
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
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;

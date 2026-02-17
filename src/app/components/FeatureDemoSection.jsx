"use client";
import { useRef, useEffect } from "react";
import { motion } from "framer-motion";

/* Autoplaying, in-view looping clip with mobile-safe flags */
function Clip({ webm, mp4, poster, label }) {
    const ref = useRef(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        // play/pause only when visible
        const io = new IntersectionObserver(
            (entries) => entries.forEach((e) => (e.isIntersecting ? el.play().catch(() => { }) : el.pause())),
            { threshold: 0.25 }
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);

    return (
        <video
            ref={ref}
            className="absolute inset-0 h-full w-full object-cover rounded-2xl"
            muted
            playsInline
            loop
            preload="metadata"
            poster={poster}
            aria-label={label}
        >
            {webm && <source src={webm} type="video/webm" />}
            {mp4 && <source src={mp4} type="video/mp4" />}
        </video>
    );
}

export default function FeatureDemoSection() {
    const features = [
        {
            number: "01",
            title: "Connect the Squad",
            subtitle: "Grab any Steam profile URL or Steam64 ID. Paste them in to build your comparison list instantly.",
            video: {
                mp4: "/panels/paste-profiles.mp4",
                poster: "/panels/paste-profiles.png",
            },
            imageSrc: "/panels/paste-profiles.png",
            imageAlt: "Pasting Steam profiles",
        },
        {
            number: "02",
            title: "Side-by-Side Stats",
            subtitle: "View shared games with playtime stats for the whole squad. Compare up to 10 friends at once.",
            video: {
                mp4: "/panels/compare-instantly.mp4",
            },
            imageSrc: "/panels/compare-instantly.png",
            imageAlt: "Instant comparison",
        },
        {
            number: "03",
            title: "Explore Collections",
            subtitle: "Filter by player to see unique titles and hidden gems. Uncover those \"Only You\" games for your next session.",
            video: {
                mp4: "/panels/plan-session.mp4",
                poster: "/panels/plan-session.png",
            },
            imageSrc: "/panels/plan-session.png",
            imageAlt: "Planning a session",
        },
        {
            number: "04",
            title: "Launch or Buy",
            subtitle: "One click takes you straight to Steam. Launch the games you own or wishlist new titles for the group.",
            video: {
                mp4: "/panels/open-store.mp4",
            },
            imageSrc: "/panels/open-store.png",
            imageAlt: "Open Steam store",
        },
    ];

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.1,
            },
        },
    };

    const headerVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut",
            },
        },
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 30, scale: 0.95 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.5,
                ease: "easeOut",
            },
        },
    };

    const badgeVariants = {
        hidden: { scale: 0, rotate: -180 },
        visible: {
            scale: 1,
            rotate: 0,
            transition: {
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.2,
            },
        },
    };

    return (
        <section
            id="features"
            className="mt-20 sm:mt-24 px-3 sm:px-4 md:px-0 scroll-mt-32 sm:scroll-mt-40"
        >
            {/* Section Header */}
            <motion.div
                className="text-center mb-12 sm:mb-16"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={headerVariants}
            >
                <motion.div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-blue-400">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-sm font-medium text-blue-300">How It Works</span>
                </motion.div>
                <motion.h2
                    className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4"
                    variants={headerVariants}
                >
                    Simple, Fast, Powerful
                </motion.h2>
                <motion.p
                    className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto"
                    variants={headerVariants}
                >
                    Compare your Steam libraries in four easy steps. No registration required.
                </motion.p>
            </motion.div>

            {/* Features Grid */}
            <motion.div
                className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={containerVariants}
            >
                {features.map((feature, i) => (
                    <motion.article
                        key={i}
                        className="group relative"
                        variants={cardVariants}
                        whileHover={{ y: -8 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                        {/* Step Number Badge */}
                        <motion.div
                            className="absolute -top-3 -left-3 z-10"
                            variants={badgeVariants}
                        >
                            <div className="relative">
                                <motion.div
                                    className="absolute inset-0 bg-blue-500 blur-xl opacity-50"
                                    animate={{
                                        opacity: [0.5, 0.7, 0.5],
                                        scale: [1, 1.1, 1],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                />
                                <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                                    <span className="text-xl font-bold text-white">{feature.number}</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Card Container */}
                        <motion.div
                            className="relative rounded-3xl p-[1px] bg-gradient-to-br from-white/20 via-white/5 to-transparent"
                            whileHover={{ backgroundImage: "linear-gradient(to bottom right, rgba(255,255,255,0.3), rgba(255,255,255,0.1), transparent)" }}
                        >
                            <div className="rounded-3xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-sm
                            border border-white/10 overflow-hidden
                            transition-all duration-300 group-hover:border-white/20">

                                {/* Content */}
                                <div className="p-6 sm:p-8">
                                    {/* Text Content */}
                                    <motion.div
                                        className="mb-6"
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.3 + i * 0.1 }}
                                    >
                                        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                                            {feature.title}
                                        </h3>
                                        <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                                            {feature.subtitle}
                                        </p>
                                    </motion.div>

                                    {/* Video/Image Container */}
                                    <motion.div
                                        className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-white/5 to-transparent
                                ring-1 ring-white/10 group-hover:ring-white/20 transition-all"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                                    >
                                        <div className="relative w-full aspect-[16/9]">
                                            {feature.video ? (
                                                <Clip
                                                    webm={feature.video.webm}
                                                    mp4={feature.video.mp4}
                                                    poster={feature.video.poster}
                                                    label={feature.imageAlt}
                                                />
                                            ) : feature.imageSrc ? (
                                                <img
                                                    src={feature.imageSrc}
                                                    alt={feature.imageAlt}
                                                    className="absolute inset-0 h-full w-full object-cover rounded-2xl"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 grid place-items-center rounded-2xl border border-dashed border-white/15 text-gray-400 text-sm">
                                                    Add media here
                                                </div>
                                            )}
                                        </div>

                                        {/* Subtle glow effect */}
                                        <motion.div
                                            aria-hidden
                                            className="pointer-events-none absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-blue-500/10 blur-3xl"
                                            initial={{ opacity: 0 }}
                                            whileInView={{ opacity: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: 0.6 + i * 0.1, duration: 0.8 }}
                                        />
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Connecting Line (except for last item on desktop) */}
                        {i < features.length - 1 && (
                            <motion.div
                                className="hidden lg:block absolute top-1/2 -right-6 w-12 h-[2px] bg-gradient-to-r from-white/20 to-transparent"
                                initial={{ scaleX: 0, originX: 0 }}
                                whileInView={{ scaleX: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.5 + i * 0.2, duration: 0.6 }}
                            />
                        )}
                    </motion.article>
                ))}
            </motion.div>

            {/* Bottom CTA or Info */}
            <motion.div
                className="mt-16 text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8, duration: 0.6 }}
            >
                <p className="text-sm text-gray-500">
                    All features work without an account. Your privacy is our priority.
                </p>
            </motion.div>
        </section>
    );
}

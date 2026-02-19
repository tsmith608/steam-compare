
"use client";
import React, { useState } from 'react';

export default function StarRating({ rating = 0, onChange, readOnly = false, size = "md" }) {
    const [hover, setHover] = useState(0);

    const sizes = {
        sm: "text-base",
        md: "text-2xl",
        lg: "text-3xl"
    };

    return (
        <div className="flex items-center">
            {[...Array(5)].map((_, index) => {
                const ratingValue = index + 1;
                return (
                    <button
                        key={index}
                        type="button"
                        disabled={readOnly}
                        className={`
                            ${sizes[size]} 
                            bg-transparent border-none outline-none cursor-pointer transition-colors
                            ${readOnly ? 'cursor-default' : 'hover:scale-110 active:scale-95'}
                            ${ratingValue <= (hover || rating) ? "text-amber-400" : "text-gray-700"}
                        `}
                        onClick={() => onChange && onChange(ratingValue)}
                        onMouseEnter={() => !readOnly && setHover(ratingValue)}
                        onMouseLeave={() => !readOnly && setHover(0)}
                    >
                        ★
                    </button>
                );
            })}
        </div>
    );
}

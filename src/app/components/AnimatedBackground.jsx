import React from 'react';
import './AnimatedBackground.css';

const AnimatedBackground = ({ children }) => {
    return (
        <div className="relative w-full">
            <div className="animated-bg-container">
                <div className="ball"></div>
                <div className="ball"></div>
                <div className="ball"></div>
                <div className="ball"></div>
                <div className="ball"></div>
                <div className="ball"></div>
                <div className="ball"></div>
                <div className="ball"></div>
            </div>
            <div className="relative z-10 w-full">
                {children}
            </div>
        </div>
    );
};

export default AnimatedBackground;

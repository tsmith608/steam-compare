import { useState, useRef, useEffect } from 'react';

export default function BannerEditorModal({ initialImage, onSave, onCancel }) {
    const [scale, setScale] = useState(1);
    const [posX, setPosX] = useState(50);
    const [posY, setPosY] = useState(50);
    const [stretch, setStretch] = useState(false);
    const imageRef = useRef(null);

    // If the initial image is already a JSON object (re-editing), parse it
    useEffect(() => {
        try {
            if (initialImage && initialImage.startsWith('{')) {
                const parsed = JSON.parse(initialImage);
                // We're likely passed the raw file reader result here typically, but if we support re-editing:
                // This component expects a raw image data URL as 'initialImage' ideally, 
                // but we should handle the case where we might want to edit existing settings.
                // For now, we'll assume the parent passes the raw image data string.
            }
        } catch (e) {
            // ignore
        }
    }, [initialImage]);

    const handleSave = () => {
        onSave({
            image: initialImage,
            x: posX,
            y: posY,
            scale: scale,
            stretch: stretch
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#18181b] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#202024]">
                    <h3 className="text-white font-bold text-lg">Adjust Banner</h3>
                    <button onClick={onCancel} className="text-gray-400 hover:text-white">✕</button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Preview Area */}
                    <div className="relative w-full aspect-[3/1] bg-black/50 rounded-lg overflow-hidden border border-white/10 shadow-inner group">
                        {/* We simulate the banner view here */}
                        <div
                            className="w-full h-full transition-all duration-200"
                            style={{
                                backgroundImage: `url(${initialImage})`,
                                backgroundPosition: stretch ? 'center' : `${posX}% ${posY}%`,
                                backgroundSize: stretch ? '100% 100%' : `${scale * 100}%`,
                                backgroundRepeat: 'no-repeat'
                            }}
                        />
                        <div className="absolute inset-0 border-2 border-white/5 pointer-events-none rounded-lg"></div>
                    </div>

                    {/* Controls */}
                    <div className="space-y-4 bg-[#202024] p-4 rounded-xl border border-white/5">

                        {/* Stretch Toggle */}
                        <div className="flex items-center justify-between pb-4 border-b border-white/5">
                            <label className="text-sm font-bold text-gray-300">Stretch to Fit</label>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={stretch} onChange={e => setStretch(e.target.checked)} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        {!stretch && (
                            <>
                                {/* Zoom */}
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Zoom</label>
                                        <span className="text-xs font-mono text-gray-500">{Math.round(scale * 100)}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1"
                                        max="3"
                                        step="0.1"
                                        value={scale}
                                        onChange={e => setScale(parseFloat(e.target.value))}
                                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                    />
                                </div>

                                {/* Pan X */}
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pan Horizontal (X)</label>
                                        <span className="text-xs font-mono text-gray-500">{posX}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={posX}
                                        onChange={e => setPosX(parseInt(e.target.value))}
                                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                    />
                                </div>

                                {/* Pan Y */}
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pan Vertical (Y)</label>
                                        <span className="text-xs font-mono text-gray-500">{posY}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={posY}
                                        onChange={e => setPosY(parseInt(e.target.value))}
                                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="p-4 border-t border-white/10 flex justify-end gap-3 bg-[#202024]">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-bold text-gray-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-lg transition-colors shadow-lg shadow-blue-500/20"
                    >
                        Set Banner
                    </button>
                </div>
            </div>
        </div>
    );
}

import React, { useEffect, useState } from 'react';

const ParcelModal = ({ parcel, onClose, onSearch }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (parcel) {
            requestAnimationFrame(() => {
                setIsVisible(true);
            });
        }
    }, [parcel]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            onClose();
        }, 300); // 애니메이션 시간 대기
    };

    if (!parcel) return null;

    const isGrand = parcel.grade === 'Grand Cru';
    const isPremier = parcel.grade === 'Premier Cru';

    // 등급별 색상 테마
    const themeColor = isGrand ? 'text-yellow-500 border-yellow-500/50 bg-yellow-500/10' :
        isPremier ? 'text-amber-400 border-amber-400/50 bg-amber-400/10' :
            'text-zinc-400 border-zinc-600 bg-zinc-800';

    const borderColor = isGrand ? 'border-yellow-500/30' :
        isPremier ? 'border-amber-400/30' : 'border-zinc-700';

    return (
        <div className={`fixed inset-0 z-[2000] flex items-end md:items-center justify-center pointer-events-none transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
                onClick={handleClose}
            ></div>

            {/* Modal Content */}
            <div
                className={`relative w-full md:w-[500px] bg-zinc-900/90 backdrop-blur-xl border ${borderColor} 
                            md:rounded-2xl rounded-t-2xl shadow-2xl p-6 md:p-8 pointer-events-auto
                            transform transition-transform duration-300 
                            ${isVisible ? 'translate-y-0 scale-100' : 'translate-y-full md:translate-y-10 md:scale-95'}`}
            >
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                >
                    ✕
                </button>

                {/* Header */}
                <div className="mb-6">
                    <span className={`text-[10px] font-bold uppercase tracking-[0.2em] px-2 py-1 rounded border ${themeColor} inline-block mb-2 w-auto`}>
                        {parcel.grade || 'Village'}
                    </span>
                    <h2 className="text-3xl font-display font-bold text-white mb-1">{parcel.name}</h2>
                    <h3 className="text-lg font-serif text-zinc-400">{parcel.koreanName}</h3>
                </div>

                {/* Body: 상세 정보 */}
                <div className="space-y-6">
                    {/* 1. Description */}
                    {parcel.description && (
                        <p className="text-zinc-300 leading-relaxed font-light">
                            {parcel.description}
                        </p>
                    )}

                    {/* 2. Terroir (데이터가 있을 경우만) */}
                    {parcel.terroir && (
                        <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800">
                            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <span>🏔️</span> Terroir
                            </h4>
                            <p className="text-sm text-zinc-300">{parcel.terroir}</p>
                        </div>
                    )}

                    {/* 3. Characteristics */}
                    {parcel.characteristics && (
                        <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800">
                            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <span>🍷</span> Style
                            </h4>
                            <p className="text-sm text-zinc-300">{parcel.characteristics}</p>
                        </div>
                    )}

                    {/* 4. Producers (태그 형태) */}
                    {parcel.producers && parcel.producers.length > 0 && (
                        <div>
                            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Top Producers</h4>
                            <div className="flex flex-wrap gap-2">
                                {parcel.producers.map((producer, idx) => (
                                    <span
                                        key={idx}
                                        onClick={() => onSearch && onSearch(producer)}
                                        className="text-xs text-zinc-300 bg-zinc-800 px-3 py-1.5 rounded-full border border-zinc-700
                                                 hover:bg-burgundy-900/50 hover:text-burgundy-200 hover:border-burgundy-800
                                                 cursor-pointer transition-colors"
                                    >
                                        {producer}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Link (Optional) */}
                <div className="mt-8 pt-4 border-t border-zinc-800 text-center">
                    <button className="text-xs text-burgundy-400 hover:text-burgundy-300 transition-colors uppercase tracking-widest font-bold">
                        View Vintage Chart →
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ParcelModal;

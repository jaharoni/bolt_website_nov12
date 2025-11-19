import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useStudioStore } from '../../store/studioStore';
import { supabase } from '../../lib/supabase';
import { clsx } from 'clsx';

export function CinematicBackground() {
    const location = useLocation();
    const {
        currentBg,
        nextBg,
        isTransitioning,
        transitionTo,
        completeTransition,
        setBackground
    } = useStudioStore();

    const [mounted, setMounted] = useState(false);
    const timerRef = useRef<NodeJS.Timeout>();

    // Initial load
    useEffect(() => {
        setMounted(true);
        fetchRandomBackground().then(url => {
            if (url) setBackground(url);
        });
        return () => setMounted(false);
    }, []);

    // Fetch random background from Supabase
    const fetchRandomBackground = async () => {
        try {
            const { data } = await supabase
                .from('backgrounds')
                .select('url')
                .limit(10); // Fetch a few to pick randomly, or use a random function if available in DB

            if (data && data.length > 0) {
                const randomIndex = Math.floor(Math.random() * data.length);
                return data[randomIndex].url;
            }
        } catch (error) {
            console.error('Failed to fetch background:', error);
        }
        return null;
    };

    // Route change handler
    useEffect(() => {
        if (!mounted) return;

        const handleRouteChange = async () => {
            const newBg = await fetchRandomBackground();
            if (newBg) {
                transitionTo(newBg);
            }
        };

        handleRouteChange();
    }, [location.pathname]);

    // Auto-cycle on Home
    useEffect(() => {
        if (location.pathname === '/') {
            timerRef.current = setInterval(async () => {
                const newBg = await fetchRandomBackground();
                if (newBg) {
                    transitionTo(newBg);
                }
            }, 8000);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [location.pathname]);

    // Handle image load for transition
    const handleNextImageLoad = () => {
        // Small delay to ensure render
        setTimeout(() => {
            completeTransition();
        }, 100);
    };

    return (
        <div className="fixed inset-0 w-full h-full z-[-50] bg-black overflow-hidden">
            {/* Current Background */}
            <div
                className={clsx(
                    "absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out",
                    isTransitioning ? "opacity-0" : "opacity-100"
                )}
            >
                {currentBg && (
                    <img
                        src={currentBg}
                        alt="Background"
                        className="w-full h-full object-cover"
                        decoding="async"
                    />
                )}
                <div className="absolute inset-0 bg-black/20" /> {/* Global safety overlay */}
            </div>

            {/* Next Background (Double Buffer) */}
            <div
                className={clsx(
                    "absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out",
                    isTransitioning ? "opacity-100" : "opacity-0"
                )}
            >
                {nextBg && (
                    <img
                        src={nextBg}
                        alt="Next Background"
                        className="w-full h-full object-cover"
                        onLoad={handleNextImageLoad}
                        decoding="async"
                    />
                )}
                <div className="absolute inset-0 bg-black/20" />
            </div>
        </div>
    );
}

'use client';

import { useEffect, useRef } from 'react';
import { Application, Assets, Text, Container, Graphics } from 'pixi.js';
import { Background } from './Background';
import { Fishes, animateFishes, AnimatedFish } from './Fishes';
import { WaterOverlay, animateWaterOverlay } from './WaterOverlay';
import { DisplacementEffect } from './DisplacementEffect';


export default function VocaloidtoGO() {
    const gameRef = useRef<HTMLDivElement>(null);
    // Store an array of fish sprites for animation.
    const fishes: AnimatedFish[] = [];
    // Create a PixiJS application inside the component
    const app = new Application();

    useEffect(() => {
        if (gameRef.current) {
            (async () => {
                await setup();
                await preload();
                Background(app);
                Fishes(app, fishes);
                WaterOverlay(app);
                DisplacementEffect(app);    
                app.ticker.add((time) => {
                    animateFishes(app, fishes, time);
                    animateWaterOverlay(app, time);
                });
            })();
        }
    }, []);


    async function setup() {
        // Initialize the application
        await app.init({
            background: '#1099bb',
            width: window.innerWidth,
            height: window.innerHeight,
            antialias: true
        });

        // Add resize handler
        window.addEventListener('resize', () => {
            app.renderer.resize(window.innerWidth, window.innerHeight);
        });

        document.body.appendChild(app.canvas);
    }

    async function preload() {
        // Create an array of asset data to load.
        const assets = [
            { alias: 'background', src: 'https://pixijs.com/assets/tutorials/fish-pond/pond_background.jpg' },
            { alias: 'fish1', src: 'https://pixijs.com/assets/tutorials/fish-pond/fish1.png' },
            { alias: 'fish2', src: 'https://pixijs.com/assets/tutorials/fish-pond/fish2.png' },
            { alias: 'fish3', src: 'https://pixijs.com/assets/tutorials/fish-pond/fish3.png' },
            { alias: 'fish4', src: 'https://pixijs.com/assets/tutorials/fish-pond/fish4.png' },
            { alias: 'fish5', src: 'https://pixijs.com/assets/tutorials/fish-pond/fish5.png' },
            { alias: 'overlay', src: 'https://pixijs.com/assets/tutorials/fish-pond/wave_overlay.png' },
            { alias: 'displacement', src: 'https://pixijs.com/assets/tutorials/fish-pond/displacement_map.png' },
        ];

        // Load the assets defined above.
        await Assets.load(assets);
    }

    return <div ref={gameRef}></div>
}

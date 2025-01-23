'use client';

import { useEffect, useRef, useState } from 'react';
import { Stage, Container, Sprite, useTick } from '@pixi/react';
import { Application, Assets, Texture } from 'pixi.js';

interface Dimensions {
    width: number;
    height: number;
}

interface BackgroundProps {
    texture: string;
    dimensions: Dimensions;
}

interface FishContainerProps {
    assets: Record<string, string>;
    dimensions: Dimensions;
}

interface WaterEffectProps {
    texture: string;
    displacement: string;
    dimensions: Dimensions;
}

interface FishSprite {
    texture: string;
    x: number;
    y: number;
    direction: number;
    speed: number;
    turnSpeed: number;
    scale: number;
    rotation?: number;
}

export default function VocaloidtoGO() {
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [assets, setAssets] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(true);

    // 处理窗口大小变化
    useEffect(() => {
        const handleResize = () => {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // 加载资源
    useEffect(() => {
        async function loadAssets() {
            const assetsList = [
                { alias: 'background', src: 'https://pixijs.com/assets/tutorials/fish-pond/pond_background.jpg' },
                { alias: 'fish1', src: 'https://pixijs.com/assets/tutorials/fish-pond/fish1.png' },
                { alias: 'fish2', src: 'https://pixijs.com/assets/tutorials/fish-pond/fish2.png' },
                { alias: 'fish3', src: 'https://pixijs.com/assets/tutorials/fish-pond/fish3.png' },
                { alias: 'fish4', src: 'https://pixijs.com/assets/tutorials/fish-pond/fish4.png' },
                { alias: 'fish5', src: 'https://pixijs.com/assets/tutorials/fish-pond/fish5.png' },
                { alias: 'overlay', src: 'https://pixijs.com/assets/tutorials/fish-pond/wave_overlay.png' },
                { alias: 'displacement', src: 'https://pixijs.com/assets/tutorials/fish-pond/displacement_map.png' },
            ];

            await Assets.load(assetsList);
            const loadedAssets = assetsList.reduce((acc, asset) => ({
                ...acc,
                [asset.alias]: asset.src
            }), {});
            console.log(loadedAssets);
            setAssets(loadedAssets);
            setIsLoading(false);
        }

        loadAssets();
    }, []);

    if (isLoading || dimensions.width === 0) {
        return <div>Loading...</div>;
    }

    return (
        <Stage
            width={dimensions.width}
            height={dimensions.height}
            options={{
                backgroundColor: 0x1099bb,
                antialias: true
            }}
        >
            <Background texture={assets.background} dimensions={dimensions} />
            <FishContainer assets={assets} dimensions={dimensions} />
            <WaterEffect texture={assets.overlay} displacement={assets.displacement} dimensions={dimensions} />
        </Stage>
    );
}

// 背景组件
function Background({ texture, dimensions }: BackgroundProps) {
    return (
        <Sprite
            image={texture}
            width={dimensions.width}
            height={dimensions.height}
        />
    );
}

// 鱼群组件
function FishContainer({ assets, dimensions }: FishContainerProps) {
    const fishSprites = useRef<FishSprite[]>([]);
    
    useEffect(() => {
        // 初始化鱼群
        const fishCount = 20;
        const fishAssets = ['fish1', 'fish2', 'fish3', 'fish4', 'fish5'];
        
        fishSprites.current = Array(fishCount).fill(null).map((_, i) => ({
            // 使用完整的资源URL
            texture: assets[fishAssets[i % fishAssets.length]],  // 从 assets 中获取 URL
            x: Math.random() * dimensions.width,
            y: Math.random() * dimensions.height,
            direction: Math.random() * Math.PI * 2,
            speed: 2 + Math.random() * 2,
            turnSpeed: Math.random() - 0.8,
            scale: 0.5 + Math.random() * 0.2,
            rotation: 0
        }));
         console.log(fishSprites.current);
    }, [dimensions, assets]);

    return (
        <Container>
            {fishSprites.current.map((fish, i) => (
                <Sprite
                    key={i}
                    image={fish.texture}
                    x={fish.x}
                    y={fish.y}
                    rotation={fish.rotation}
                    scale={fish.scale}
                    anchor={0.5}
                />
            ))}
        </Container>
    );
}

// 水效果组件
function WaterEffect({ texture, displacement, dimensions }: WaterEffectProps) {
    const [time, setTime] = useState(0);

    useTick((delta) => {
        setTime(t => t + delta * 0.1);
    });

    return (
        <Container>
            <Sprite
                image={texture}
                width={dimensions.width}
                height={dimensions.height}
                alpha={0.5}
                y={Math.sin(time) * 5}
            />
        </Container>
    );
}

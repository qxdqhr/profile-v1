import { Container, Sprite } from '@pixi/react';
import { CarProps } from '../types';
import { useState, useEffect } from 'react';

const CAR_WIDTH = 50;  // 车的宽度
const CAR_HEIGHT = 80; // 车的高度

export const Car = ({ x, y }: CarProps) => {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return null;
    }

    return (
        <Container position={[x, y]}>
            <Sprite
                image="/raceGame/images/car.png"
                width={CAR_WIDTH}
                height={CAR_HEIGHT}
                anchor={0.5}
            />
        </Container>
    );
}; 
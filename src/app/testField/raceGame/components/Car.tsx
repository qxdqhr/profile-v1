import { Container, Graphics } from '@pixi/react';
import { CarProps } from '../types';
import { useState, useEffect } from 'react';

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
            <Graphics
                draw={g => {
                    // 绘制小车主体
                    g.clear();
                    g.beginFill(0xFF4081);
                    g.drawRoundedRect(-25, -15, 50, 30, 8);
                    g.endFill();

                    // 绘制车轮
                    g.beginFill(0x333333);
                    g.drawCircle(-15, -12, 6); // 左前轮
                    g.drawCircle(15, -12, 6);  // 右前轮
                    g.drawCircle(-15, 12, 6);  // 左后轮
                    g.drawCircle(15, 12, 6);   // 右后轮
                    g.endFill();

                    // 绘制车窗
                    g.beginFill(0x81D4FA);
                    g.drawRoundedRect(-15, -10, 30, 15, 4);
                    g.endFill();
                }}
            />
        </Container>
    );
}; 
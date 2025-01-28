import { Container, Graphics, Text } from '@pixi/react';
import * as PIXI from 'pixi.js';
import { ButtonProps } from '../types';
import { COLORS } from '../constants';

export const Button = ({ text, x, y, onClick }: ButtonProps) => {
    const textStyle = new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: 24,
        fill: COLORS.BUTTON_TEXT,
        align: 'center',
        fontWeight: 'bold'
    });

    return (
        <Container position={[x, y]}>
            <Graphics
                draw={g => {
                    g.clear();
                    g.lineStyle(2, 0xFFFFFF);
                    g.beginFill(COLORS.BUTTON_FILL);
                    g.drawRoundedRect(-100, -25, 200, 50, 10);
                    g.endFill();
                }}
                interactive={true}
                cursor="pointer"
                onclick={onClick}
            />
            <Text
                text={text}
                anchor={0.5}
                style={textStyle}
            />
        </Container>
    );
}; 
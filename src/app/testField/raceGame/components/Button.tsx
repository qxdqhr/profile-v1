import { Container, Graphics, Text } from '@pixi/react';
import * as PIXI from 'pixi.js';
import { ButtonProps } from '../types';
import { COLORS } from '../constants';

export const Button = ({ text, x, y, onClick }: ButtonProps) => {
    const style = new PIXI.TextStyle();
    style.fill = COLORS.BUTTON_TEXT;
    style.fontSize = 24;
    style.fontFamily = "Arial";

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
                style={style}
            />
        </Container>
    );
}; 
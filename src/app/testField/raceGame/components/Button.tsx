import { Container, Graphics, Text } from '@pixi/react';
import * as PIXI from 'pixi.js';
import { ButtonProps } from '../types';
import { COLORS } from '../constants';
import { TextStyle } from 'pixi.js';

export const Button = ({ text, x, y, onClick }: ButtonProps) => {
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
                style={
                    new TextStyle({
                        align: 'center',
                        fontFamily: '"Source Sans Pro", Helvetica, sans-serif',
                        fontSize: 50,
                        fontWeight: '400',
                        stroke: 0x01d27e,
                        strokeThickness: 5,
                        letterSpacing: 20,
                        dropShadow: true,
                        dropShadowColor: 0xccced2,
                        dropShadowBlur: 4,
                        dropShadowAngle: Math.PI / 6,
                        dropShadowDistance: 6,
                        wordWrap: true,
                        wordWrapWidth: 440,
                      })
                }
            />
        </Container>
    );
}; 
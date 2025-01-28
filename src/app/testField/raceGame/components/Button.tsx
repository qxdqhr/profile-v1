import { Container, Graphics, Text } from '@pixi/react';
import * as PIXI from 'pixi.js';
import { ButtonProps } from '../types';
import { COLORS } from '../constants';

// 创建文本样式
const buttonTextStyle = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 24,
    fill: COLORS.BUTTON_TEXT,
    align: 'center',
    fontWeight: 'bold',
    // 添加必要的默认值
    wordWrap: false,
    letterSpacing: 0,
    padding: 0,
    lineHeight: 0,
    leading: 0,
    breakWords: false,
    dropShadow: false,
    whiteSpace: "pre",
    textBaseline: "alphabetic",
    trim: false
});

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
                style={buttonTextStyle}
            />
        </Container>
    );
}; 
import { Container, Graphics, Text } from '@pixi/react';
import { TextStyle } from 'pixi.js';
import { StartScreenProps } from '../types';
import { Button } from './Button';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../constants';
import '@pixi/events'

export const StartScreen = ({ onStartGame }: StartScreenProps) => {
    const titleStyle = new TextStyle({
        align: 'center',
        fontFamily: '"Source Sans Pro", Helvetica, sans-serif',
        fontSize: 50,
        fontWeight: '400',
        fill: ['#ffffff', '#00ff99'],
        stroke: '#01d27e',
        strokeThickness: 5,
        letterSpacing: 20,
        dropShadow: true,
        dropShadowColor: '#ccced2',
        dropShadowBlur: 4,
        dropShadowAngle: Math.PI / 6,
        dropShadowDistance: 6,
        wordWrap: true,
        wordWrapWidth: 440,
    });

    const subtitleStyle = new TextStyle({
        fill: 0x81C784,
        fontSize: 28,
        fontWeight: 'bold',
        fontFamily: 'Arial'
    });

    const instructionStyle = new TextStyle({
        fill: 0xFFFFFF,
        fontSize: 16,
        fontFamily: 'Arial',
        align: 'center',
        wordWrap: true,
        wordWrapWidth: 300
    });

    return (
        <Container>
            {/* 背景动画 */}
            <Graphics
                draw={g => {
                    g.clear();
                    g.beginFill(COLORS.BACKGROUND);
                    g.drawRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
                    g.endFill();
                }}
            />

            {/* 游戏标题 */}
            <Text
                text="极速狂飙"
                anchor={0.5}
                position={[GAME_WIDTH / 2, 150]}
                style={titleStyle}
            />

            {/* 副标题 */}
            <Text
                text="- 2D 竞速游戏 -"
                anchor={0.5}
                position={[GAME_WIDTH / 2, 250]}
                style={subtitleStyle}
            />

            {/* 开始游戏按钮 */}
            <Button 
                text="开始游戏" 
                x={GAME_WIDTH / 2} 
                y={350} 
                onClick={onStartGame} 
            />

            {/* 游戏说明背景 */}
            <Graphics
                draw={g => {
                    g.clear();
                    g.beginFill(0x000000, 0.3);
                    g.lineStyle(2, COLORS.TRACK_LINE, 0.6);
                    g.drawRoundedRect(GAME_WIDTH / 2 - 160, 430, 320, 160, 10);
                    g.endFill();
                }}
            />

            {/* 游戏说明标题 */}
            <Text
                text="游戏说明"
                anchor={0.5}
                position={[GAME_WIDTH / 2, 450]}
                style={new TextStyle({
                    ...instructionStyle,
                    fontSize: 20,
                    fontWeight: 'bold'
                })}
            />

            {/* 游戏说明内容 */}
            <Text
                text={[
                    "• 使用方向键或屏幕按钮控制赛车",
                    "• 躲避路上的障碍物",
                    "• 收集金币获得额外分数",
                    "• 游戏速度会随时间逐渐加快",
                    "• 尽可能获得高分！"
                ].join('\n')}
                anchor={[0.5, 0]}
                position={[GAME_WIDTH / 2, 480]}
                style={instructionStyle}
            />
        </Container>
    );
}; 
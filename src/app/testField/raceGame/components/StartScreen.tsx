import { Container, Graphics, Text } from '@pixi/react';
import { TextStyle } from 'pixi.js';
import { StartScreenProps } from '../types';
import { Button } from './Button';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../constants';

export const StartScreen = ({ onStartGame }: StartScreenProps) => {
    const titleStyle = new TextStyle({
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
   
    

    const subtitleStyle = new TextStyle({
        fontFamily: 'Arial',
        fontSize: 28,
        fill: 0x81C784,
        fontWeight: 'bold',
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
                    
                    // 绘制赛道装饰
                    g.lineStyle(5, COLORS.TRACK_LINE, 0.2);
                    for (let i = 0; i < 4; i++) {
                        g.moveTo(200 + i * 150, 0);
                        g.lineTo(200 + i * 150, GAME_HEIGHT);
                    }
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

            {/* 按钮组 */}
            <Button text="开始游戏" x={GAME_WIDTH / 2} y={350} onClick={onStartGame} />
            <Button 
                text="游戏说明" 
                x={GAME_WIDTH / 2} 
                y={430} 
                onClick={() => alert('游戏说明：\n使用方向键控制赛车\n收集金币并躲避障碍物\n尽可能获得高分！')} 
            />
        </Container>
    );
}; 
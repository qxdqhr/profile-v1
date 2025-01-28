import { Container, Graphics, Text } from '@pixi/react';
import { TextStyle } from 'pixi.js';
import { StartScreenProps } from '../types';
import { Button } from './Button';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../constants';

export const StartScreen = ({ onStartGame }: StartScreenProps) => {
    const titleStyle = new TextStyle(TextStyle.defaultTextStyle);
    titleStyle.align = 'center';
    titleStyle.fontFamily = '"Source Sans Pro", Helvetica, sans-serif';
    titleStyle.fontSize = 50;
    titleStyle.fontWeight = '400';
    titleStyle.stroke = 0x01d27e;
    titleStyle.strokeThickness = 5;
    titleStyle.letterSpacing = 20;
    titleStyle.dropShadow = true;
    titleStyle.dropShadowColor = 0xccced2;
    titleStyle.dropShadowBlur = 4;
    titleStyle.dropShadowAngle = Math.PI / 6;
    titleStyle.dropShadowDistance = 6;
    titleStyle.wordWrap = true;
    titleStyle.wordWrapWidth = 440;
   
    

    const subtitleStyle =  new TextStyle(TextStyle.defaultTextStyle);
    subtitleStyle.fill = 0x81C784;
    subtitleStyle.fontSize = 28;
    subtitleStyle.fontWeight = 'bold';


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
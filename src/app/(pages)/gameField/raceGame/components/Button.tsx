import { Container, Graphics, Text } from '@pixi/react';
import { TextStyle } from 'pixi.js';
import { COLORS } from '../constants';
import '@pixi/events'

interface ButtonProps {
    x: number;
    y: number;
    text: string;
    width?: number;
    height?: number;
    style?: TextStyle;
    onClick: () => void;
}

interface CircleButtonProps {
    x: number;
    y: number;
    text: string;
    size?: number;
    onClick: () => void;
}

export const Button = ({ x, y, text, width = 200, height = 50, style, onClick }: ButtonProps) => {
  const defaultStyle = new TextStyle({
    fill: COLORS.BUTTON_TEXT,
    fontSize: 24,
    fontFamily: "Arial",
    fontWeight: "bold"
  });

  return (
    <Container 
      position={[x, y]}
      interactive={true}
      cursor="pointer"
      eventMode='static'
      onclick={onClick}
      ontouchstart={onClick}
      pointerdown={onClick}
    >
      <Graphics
        draw={g => {
          g.clear();
          g.lineStyle(2, 0xFFFFFF);
          g.beginFill(COLORS.BUTTON_FILL, 0.8);
          g.drawRoundedRect(-width/2, -height/2, width, height, 10);
          g.endFill();
        }}
      />
      <Container
        position={[0, 0]}
        interactive={true}
        cursor="pointer"
        eventMode='static'
        onclick={onClick}
        ontouchstart={onClick}
        pointerdown={onClick}
      >
        <Text
          text={text}
          anchor={0.5}
          style={style === null ? defaultStyle : style}
          eventMode='static'
          interactive={true}
          onclick={onClick}
          ontouchstart={onClick}
          pointerdown={onClick}
        />
      </Container>
    </Container>
  );
};

export const CircleButton = ({ x, y, text, size = 35, onClick }: CircleButtonProps) => {
  const style = new TextStyle({
    fill: COLORS.BUTTON_TEXT,
    fontSize: 18,
    fontFamily: "Arial",
    fontWeight: "bold"
  });

  return (
    <Container 
      position={[x, y]}
      interactive={true}
      cursor="pointer"
      eventMode='static'
      onclick={onClick}
      ontouchstart={onClick}
      pointerdown={onClick}
    >
      <Graphics
        draw={g => {
          g.clear();
          g.beginFill(COLORS.BUTTON_FILL, 0.8);
          g.drawCircle(0, 0, size);
          g.endFill();
        }}
      />
      <Container
        position={[0, 0]}
        interactive={true}
        cursor="pointer"
        eventMode='static'
        onclick={onClick}
        ontouchstart={onClick}
        pointerdown={onClick}
      >
        <Text
          text={text}
          anchor={0.5}
          style={style}
          eventMode='static'
          interactive={true}
          onclick={onClick}
          ontouchstart={onClick}
          pointerdown={onClick}
        />
      </Container>
    </Container>
  );
}; 
import React, { useEffect, useRef, useState } from 'react';

import tailwind from '@/../tailwind.config';

const BACKGROUND_COLOR = tailwind.theme.extend.colors['theme-color'];
const BUBBLE_COLOR = '#ffffffa0';

const WIDTH_PER_BUBBLE = 100;
const WIDTH_PER_FLOWING_TEXT = 200;

const MIN_BUBBLE_RADIUS = 6;
const MAX_BUBBLE_RADIUS = 12;
const MIN_BUBBLE_VELOCITY = 1;
const MAX_BUBBLE_VELOCITY = 2.5;

const MIN_FLOWING_TEXT_SIZE = 28;
const MAX_FLOWING_TEXT_SIZE = 64;
const MIN_FLOWING_TEXT_VEROCITY = 2;
const MAX_FLOWING_TEXT_VEROCITY = 7;
const MIN_FLOWING_TEXT_TRANSPARENCY = 64;
const MAX_FLOWING_TEXT_TRANSPARENCY = 208;

function random(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function useDisplayableSize(
  ref: React.RefObject<HTMLCanvasElement>,
): [number, number] {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      if (!ref.current?.parentElement) {
        return;
      }
      const { clientWidth, clientHeight } = ref.current.parentElement;
      setWidth(clientWidth);
      setHeight(clientHeight);
    };

    window.addEventListener('resize', handleResize);

    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return [width, height];
}

type Bubble = {
  x: number;
  y: number;
  radius: number;
  verocity: number;
  count: number; // random seed
};

type FlowingText = {
  text: string;
  x: number;
  y: number;
  size: number;
  verocity: number;
  transparency: number;
  reverse: boolean;
};

export const SwimmingFish: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [width, height] = useDisplayableSize(canvasRef);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    canvasRef.current.width = width;
    canvasRef.current.height = height;

    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) {
      return;
    }

    const createBubble = (base?: Partial<Bubble>): Bubble => {
      return {
        x: random(0, width),
        y: height + MAX_BUBBLE_RADIUS,
        radius: random(MIN_BUBBLE_RADIUS, MAX_BUBBLE_RADIUS),
        verocity: random(MIN_BUBBLE_VELOCITY, MAX_BUBBLE_VELOCITY),
        count: random(0, 100),
        ...base,
      };
    };

    const bubbles: Bubble[] = [];
    for (let i = 0; i < width / WIDTH_PER_BUBBLE; ++i) {
      const bubble = createBubble({
        y: random(0, height + MAX_BUBBLE_RADIUS),
      });
      bubbles.push(bubble);
    }

    const updateBubble = (bubble: Bubble) => {
      if (bubble.y < -bubble.radius) {
        Object.assign(bubble, createBubble());
        return;
      }

      bubble.x += Math.sin(bubble.count * 0.1) * 0.5;
      bubble.y += -bubble.verocity;
      bubble.count += 1;
    };

    const drawBackground = () => {
      ctx.fillStyle = BACKGROUND_COLOR;
      ctx.fillRect(0, 0, width, height);
    };

    const drawBubble = ({ x, y, radius }: Bubble) => {
      ctx.fillStyle = BUBBLE_COLOR;
      ctx.beginPath();
      ctx.ellipse(x, y, radius, radius, 0, 0, Math.PI * 2);
      ctx.fill();
    };

    const createFlowingText = (
      base: Partial<Omit<FlowingText, 'text'>> & Pick<FlowingText, 'text'>,
    ): FlowingText => {
      return {
        x: width,
        y: random(0, height - MAX_FLOWING_TEXT_SIZE),
        size: random(MIN_FLOWING_TEXT_SIZE, MAX_FLOWING_TEXT_SIZE),
        verocity: random(MIN_FLOWING_TEXT_VEROCITY, MAX_FLOWING_TEXT_VEROCITY),
        transparency: Math.floor(
          random(MIN_FLOWING_TEXT_TRANSPARENCY, MAX_FLOWING_TEXT_TRANSPARENCY),
        ),
        reverse: Math.random() > 0.5,
        ...base,
      };
    };

    const flowingTexts: FlowingText[] = [];
    for (let i = 0; i < width / WIDTH_PER_FLOWING_TEXT; ++i) {
      const flowingText = createFlowingText({
        text: '🐟',
        x: random(0, width + MAX_FLOWING_TEXT_SIZE),
      });
      flowingTexts.push(flowingText);
    }

    const updateFlowingText = (flowingText: FlowingText) => {
      if (flowingText.x < -flowingText.size) {
        Object.assign(
          flowingText,
          createFlowingText({ text: flowingText.text }),
        );
        return;
      }
      flowingText.x += -flowingText.verocity;
    };

    const drawFlowingText = ({
      text,
      x,
      y,
      size,
      transparency,
      reverse,
    }: FlowingText) => {
      ctx.fillStyle = `#000000${transparency.toString(16)}`;
      ctx.font = `${size}px serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';

      if (reverse) {
        ctx.scale(-1, 1);
        ctx.fillText(text, x - width, y);
        ctx.scale(-1, 1);
      } else {
        ctx.fillText(text, x, y);
      }
    };

    let handle: number;
    const frame = () => {
      flowingTexts.forEach(updateFlowingText);
      bubbles.forEach(updateBubble);

      drawBackground();
      flowingTexts.forEach(drawFlowingText);
      bubbles.forEach(drawBubble);

      handle = requestAnimationFrame(frame);
    };
    handle = requestAnimationFrame(frame);

    return () => cancelAnimationFrame(handle);
  }, [width, height]);

  return <canvas ref={canvasRef} />;
};

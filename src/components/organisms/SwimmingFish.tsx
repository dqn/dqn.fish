import { useEffect, useRef, useState } from "react";
import * as React from "react";

import tailwind from "@/../tailwind.config";

const text = "🐟";

const backgroundColor = tailwind.theme.extend.colors["theme-color"];
const bubbleColor = "#ffffffa0";

const widthPerBubble = 100;
const widthPerFlowingText = 200;

const minBubbleRadius = 6;
const maxBubbleRadius = 12;
const minBubbleVelocity = 1;
const maxBubbleVelocity = 2.5;

const minFlowingTextSize = 28;
const maxFlowingTextSize = 64;
const minFlowingTextVerocity = 2;
const maxFlowingTextVerocity = 7;
const minFlowingTextTransparency = 64;
const maxFlowingTextTransparency = 208;

function random(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomBoolean(): boolean {
  return Math.random() > 0.5;
}

function useDisplayableSize(
  ref: React.RefObject<HTMLCanvasElement>
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

    window.addEventListener("resize", handleResize);

    handleResize();

    return () => window.removeEventListener("resize", handleResize);
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

    const ctx = canvasRef.current?.getContext("2d");

    if (!ctx) {
      return;
    }

    const drawInReverse = (fn: () => void) => {
      ctx.scale(-1, 1);
      fn();
      ctx.scale(-1, 1);
    };

    const drawBackground = () => {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);
    };

    const createBubble = (base?: Partial<Bubble>): Bubble => {
      return {
        x: random(0, width),
        y: height + maxBubbleRadius,
        radius: random(minBubbleRadius, maxBubbleRadius),
        verocity: random(minBubbleVelocity, maxBubbleVelocity),
        count: random(0, 100),
        ...base,
      };
    };

    const bubbles: Bubble[] = [];

    for (let i = 0; i < width / widthPerBubble; ++i) {
      const bubble = createBubble({
        y: random(0, height + maxBubbleRadius),
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

    const drawBubble = ({ x, y, radius }: Bubble) => {
      ctx.fillStyle = bubbleColor;
      ctx.beginPath();
      ctx.ellipse(x, y, radius, radius, 0, 0, Math.PI * 2);
      ctx.fill();
    };

    const createFlowingText = (base?: Partial<FlowingText>): FlowingText => {
      return {
        text,
        x: width,
        y: random(0, height - maxFlowingTextSize),
        size: random(minFlowingTextSize, maxFlowingTextSize),
        verocity: random(minFlowingTextVerocity, maxFlowingTextVerocity),
        transparency: Math.floor(
          random(minFlowingTextTransparency, maxFlowingTextTransparency)
        ),
        reverse: randomBoolean(),
        ...base,
      };
    };

    const flowingTexts: FlowingText[] = [];

    for (let i = 0; i < width / widthPerFlowingText; ++i) {
      const flowingText = createFlowingText({
        text: text,
        x: random(0, width + maxFlowingTextSize),
      });
      flowingTexts.push(flowingText);
    }

    const updateFlowingText = (flowingText: FlowingText) => {
      if (flowingText.x < -flowingText.size) {
        Object.assign(flowingText, createFlowingText());
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
      ctx.textAlign = "left";
      ctx.textBaseline = "top";

      if (reverse) {
        drawInReverse(() => {
          ctx.fillText(text, x - width, y);
        });
      } else {
        ctx.fillText(text, x, y);
      }
    };

    const frame = (): number => {
      flowingTexts.forEach(updateFlowingText);
      bubbles.forEach(updateBubble);

      drawBackground();
      flowingTexts.forEach(drawFlowingText);
      bubbles.forEach(drawBubble);

      return requestAnimationFrame(frame);
    };

    const handle = frame();

    return () => {
      cancelAnimationFrame(handle);
    };
  }, [width, height]);

  return <canvas ref={canvasRef} />;
};

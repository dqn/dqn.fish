import { useEffect, useRef, useState } from "react";
import * as React from "react";

import tailwind from "@/../tailwind.config";

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

function booleanToNumber(bool: boolean): 1 | -1 {
  return bool ? 1 : -1;
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

    const states = {
      hover: false,
      mouse: {
        x: 0,
        y: 0,
      },
    };

    canvasRef.current.addEventListener("mouseover", () => {
      states.hover = true;
    });

    canvasRef.current.addEventListener("mouseout", () => {
      states.hover = false;
    });

    canvasRef.current.addEventListener("mousemove", (event) => {
      if (!canvasRef.current) {
        return;
      }

      const rect = canvasRef.current.getBoundingClientRect();

      states.mouse.x = event.clientX - rect.left;
      states.mouse.y = event.clientY - rect.top;
    });

    const drawInReverse = (x: number, fn: () => void) => {
      ctx.save();
      ctx.translate(x, 0);
      ctx.scale(-1, 1);
      ctx.translate(-x, 0);
      fn();
      ctx.restore();
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
      const reverse = randomBoolean();

      return {
        text: "🐟",
        x: reverse ? 0 : width,
        y: random(0, height - maxFlowingTextSize),
        size: random(minFlowingTextSize, maxFlowingTextSize),
        verocity: random(minFlowingTextVerocity, maxFlowingTextVerocity),
        transparency: Math.floor(
          random(minFlowingTextTransparency, maxFlowingTextTransparency)
        ),
        reverse,
        ...base,
      };
    };

    const flowingTexts: FlowingText[] = [];

    for (let i = 0; i < width / widthPerFlowingText; ++i) {
      const flowingText = createFlowingText({
        x: random(0, width + maxFlowingTextSize),
      });
      flowingTexts.push(flowingText);
    }

    const updateFlowingText = (flowingText: FlowingText) => {
      if (
        (!flowingText.reverse && flowingText.x < -flowingText.size) ||
        (flowingText.reverse && flowingText.x > width + flowingText.size)
      ) {
        Object.assign(flowingText, createFlowingText());
        return;
      }

      if (states.hover) {
        const rad = Math.atan(
          (flowingText.y - states.mouse.y) / (flowingText.x - states.mouse.x)
        );

        const areaSize = 50;

        if (Math.abs(flowingText.x - states.mouse.x) > areaSize) {
          const reverse = flowingText.x < states.mouse.x;
          const xSign = booleanToNumber(reverse);
          const coefficient = Math.abs(Math.cos(rad));
          flowingText.reverse = reverse;
          flowingText.x += flowingText.verocity * coefficient * xSign;
        }

        if (Math.abs(flowingText.y - states.mouse.y) > areaSize) {
          const ySign = booleanToNumber(flowingText.y < states.mouse.y);
          const coefficient = Math.abs(Math.sin(rad));
          flowingText.y += flowingText.verocity * coefficient * ySign;
        }

        if (
          Math.abs(flowingText.x - states.mouse.x) < areaSize &&
          Math.abs(flowingText.y - states.mouse.y) < areaSize
        ) {
          const sign = booleanToNumber(flowingText.reverse);
          const rad = random(0, 360) * (Math.PI / 180);
          const xCoefficient = Math.abs(Math.cos(rad));
          const yCoefficient = Math.abs(Math.sin(rad));
          flowingText.x += flowingText.verocity * xCoefficient * sign;
          flowingText.y += flowingText.verocity * yCoefficient * sign;
        }
      } else {
        const sign = booleanToNumber(flowingText.reverse);
        flowingText.x += flowingText.verocity * sign;
      }
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
        drawInReverse(x, () => {
          ctx.fillText(text, x, y);
        });
      } else {
        ctx.fillText(text, x, y);
      }
    };

    const drawCursor = () => {
      ctx.font = "32px serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#000000FF";

      ctx.fillText("🦐", states.mouse.x, states.mouse.y);
    };

    const frame = (): number => {
      flowingTexts.forEach(updateFlowingText);
      bubbles.forEach(updateBubble);

      drawBackground();
      flowingTexts.forEach(drawFlowingText);
      bubbles.forEach(drawBubble);

      if (states.hover) {
        drawCursor();
      }

      return requestAnimationFrame(frame);
    };

    const handle = frame();

    return () => {
      cancelAnimationFrame(handle);
    };
  }, [width, height]);

  return <canvas ref={canvasRef} />;
};

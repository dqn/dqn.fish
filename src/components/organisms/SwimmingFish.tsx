import { useEffect, useRef, useState } from "react";
import * as React from "react";

import tailwind from "@/../tailwind.config";

const backgroundColor = tailwind.theme.extend.colors["theme-color"];
const bubbleColor = "#ffffffa0";

const widthPerBubble = 100;
const widthPerFish = 100;

const minBubbleRadius = 6;
const maxBubbleRadius = 12;
const minBubbleVelocity = 1;
const maxBubbleVelocity = 2.5;

const minFishSize = 28;
const maxFishSize = 64;
const minFishVerocity = 2;
const maxFishVerocity = 7;
const minFishTransparency = 64;
const maxFishTransparency = 208;

function random(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomBoolean(): boolean {
  return Math.random() > 0.5;
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

type Fish = {
  text: string;
  x: number;
  y: number;
  rad: number;
  size: number;
  verocity: number;
  transparency: number;
  eating: boolean;
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
      mouse: {
        isHovering: false,
        x: 0,
        y: 0,
      },
    };

    canvasRef.current.addEventListener("mouseover", () => {
      states.mouse.isHovering = true;
    });

    canvasRef.current.addEventListener("mouseout", () => {
      states.mouse.isHovering = false;
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

    const drawWithRotate = (
      x: number,
      y: number,
      rad: number,
      fn: () => void,
    ) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.cos(rad) > 0 ? -rad : rad - Math.PI);
      ctx.translate(-x, -y);
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

    const createFish = (base?: Partial<Fish>): Fish => {
      const reverse = randomBoolean();

      return {
        text: "🐟",
        x: reverse ? 0 : width,
        y: random(0, height - maxFishSize),
        rad: reverse ? 0 : Math.PI,
        size: random(minFishSize, maxFishSize),
        verocity: random(minFishVerocity, maxFishVerocity),
        transparency: Math.floor(
          random(minFishTransparency, maxFishTransparency),
        ),
        eating: false,
        ...base,
      };
    };

    const fishList: Fish[] = [];

    for (let i = 0; i < width / widthPerFish; ++i) {
      const fish = createFish({
        x: random(0, width + maxFishSize),
      });
      fishList.push(fish);
    }

    const updateFish = (fish: Fish) => {
      if (fish.x < -fish.size || fish.x > width + fish.size) {
        Object.assign(fish, createFish());
        return;
      }

      if (states.mouse.isHovering) {
        const areaSize = 40;

        const xDist = Math.abs(states.mouse.x - fish.x);
        const yDist = Math.abs(states.mouse.y - fish.y);

        if (xDist > areaSize || yDist > areaSize) {
          fish.rad = Math.atan2(
            states.mouse.y - fish.y,
            states.mouse.x - fish.x,
          );

          fish.eating = false;
        } else {
          if (!fish.eating) {
            fish.rad = random(0, 2 * Math.PI);
            fish.eating = true;
          }
        }
      } else {
        fish.rad = Math.cos(fish.rad) > 0 ? 0 : Math.PI;
      }

      fish.x += fish.verocity * Math.cos(fish.rad);
      fish.y += fish.verocity * Math.sin(fish.rad);
    };

    const drawFish = ({ text, x, y, rad, size, transparency }: Fish) => {
      ctx.fillStyle = `#000000${transparency.toString(16)}`;
      ctx.font = `${size}px serif`;
      ctx.textAlign = "left";
      ctx.textBaseline = "top";

      if (Math.cos(rad) > 0) {
        drawInReverse(x, () => {
          drawWithRotate(x, y, rad, () => {
            ctx.fillText(text, x, y);
          });
        });
      } else {
        drawWithRotate(x, y, rad, () => {
          ctx.fillText(text, x, y);
        });
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
      fishList.forEach(updateFish);
      bubbles.forEach(updateBubble);

      drawBackground();
      fishList.forEach(drawFish);
      bubbles.forEach(drawBubble);

      if (states.mouse.isHovering) {
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

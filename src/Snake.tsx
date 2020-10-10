import * as React from "react";
import "./styles.css";
import { throttle } from "lodash";

interface Velocity {
  x: number;
  y: number;
}

interface GameState {
  playerPosition: { x: number; y: number };
  applePosition: {
    x: number;
    y: number;
  };
  trail: [{ x: number; y: number }];
  tailSize: number;
}

const CONSTANTS = {
  gridSize: 20,
  get tileSize() {
    return this.gridSize * 0.9;
  }
};

const handleKeyDown = (
  setVelocity: React.Dispatch<React.SetStateAction<Velocity>>,
  { keyCode }: React.KeyboardEvent<HTMLDivElement>
) => {
  switch (keyCode) {
    case 37:
      setVelocity({ x: -1, y: 0 });
      break;
    case 38:
      setVelocity({ x: 0, y: -1 });
      break;
    case 39:
      setVelocity({ x: 1, y: 0 });
      break;
    case 40:
      setVelocity({ x: 0, y: 1 });
      break;
  }
};

const game = (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  velocity: Velocity,
  gameState: GameState,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
) => {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const {
    playerPosition: { x: px, y: py },
    trail,
    applePosition: { x: ax, y: ay },
    tailSize
  } = gameState;

  const newPlayerPosition = {
    x: px + velocity.x,
    y: py + velocity.y
  };

  if (newPlayerPosition.x < 0) {
    newPlayerPosition.x = CONSTANTS.gridSize - 1;
  }
  if (newPlayerPosition.x > CONSTANTS.gridSize - 1) {
    newPlayerPosition.x = 0;
  }
  if (newPlayerPosition.y < 0) {
    newPlayerPosition.y = CONSTANTS.gridSize - 1;
  }
  if (newPlayerPosition.y > CONSTANTS.gridSize - 1) {
    newPlayerPosition.y = 0;
  }

  ctx.fillStyle = "lime";
  let newTailSize = tailSize;
  for (var i = 0; i < trail.length; i++) {
    ctx.fillRect(
      trail[i].x * CONSTANTS.gridSize,
      trail[i].y * CONSTANTS.gridSize,
      CONSTANTS.tileSize,
      CONSTANTS.tileSize
    );
    if (
      trail[i].x === newPlayerPosition.x &&
      trail[i].y === newPlayerPosition.y
    ) {
      newTailSize = 5;
    }
  }

  const isOnApple = ax === px && ay === py;
  if (isOnApple) {
    newTailSize++;
  }

  const newGameState = {
    playerPosition: newPlayerPosition,
    trail:
      JSON.stringify(trail[trail.length - 1]) !==
      JSON.stringify(newPlayerPosition)
        ? (trail
            .concat(newPlayerPosition)
            .slice(-newTailSize) as GameState["trail"])
        : trail,
    applePosition: isOnApple
      ? {
          x: Math.floor(Math.random() * CONSTANTS.gridSize),
          y: Math.floor(Math.random() * CONSTANTS.gridSize)
        }
      : { x: ax, y: ay },
    tailSize: newTailSize
  };

  ctx.fillStyle = "red";
  ctx.fillRect(
    ax * CONSTANTS.gridSize,
    ay * CONSTANTS.gridSize,
    CONSTANTS.tileSize,
    CONSTANTS.tileSize
  );

  if (JSON.stringify(gameState) !== JSON.stringify(newGameState)) {
    setGameState(newGameState);
  }
  // window.requestAnimationFrame(game);
  // }, 1000 / 5);
};

export default function Snake() {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  const [velocity, setVelocity] = React.useState<Velocity>({
    x: 0,
    y: 0
  });

  const [gameState, setGameState] = React.useState<GameState>({
    playerPosition: { x: CONSTANTS.gridSize / 2, y: CONSTANTS.gridSize / 2 },
    applePosition: {
      x: Math.floor(Math.random() * CONSTANTS.tileSize),
      y: Math.floor(Math.random() * CONSTANTS.tileSize)
    },
    trail: [{ x: 10, y: 10 }],
    tailSize: 5
  });

  const runGame = React.useMemo(
    () => throttle(game, 1000 / gameState.tailSize),
    [gameState.tailSize]
  );

  React.useLayoutEffect(() => {
    if (canvasRef.current) {
      const { current: canvas } = canvasRef;
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        runGame(canvas, ctx, velocity, gameState, setGameState);
      }
    }
  }, [velocity, gameState, runGame]);

  return (
    <div
      className="snake"
      onKeyDown={handleKeyDown.bind(null, setVelocity)}
      tabIndex={1}
    >
      <canvas
        ref={canvasRef}
        width={CONSTANTS.gridSize * 20}
        height={CONSTANTS.gridSize * 20}
      />
    </div>
  );
}

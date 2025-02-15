import React, { useState, useEffect, useRef } from 'react';
import { Dimensions, StyleSheet, StatusBar, Text, View, Alert } from 'react-native';
import Matter from 'matter-js';
import { GameEngine } from 'react-native-game-engine';
import Svg, { Polygon, Circle, Rect } from 'react-native-svg';

const { width, height } = Dimensions.get('screen');
const shipSize = 50;
const colors = ['red', 'blue', 'orange'];

export default function GameScreen({ navigation }) {
  const [displayScore, setDisplayScore] = useState(0);
  const [displayLives, setDisplayLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const gameEngine = useRef(null);

  // Game state variables
  const livesRef = useRef(3);
  const scoreRef = useRef(0);
  const engineRef = useRef(Matter.Engine.create({ enableSleeping: false }));
  const worldRef = useRef(engineRef.current.world);
  const shipRef = useRef(Matter.Bodies.rectangle(width / 2, height - shipSize * 2, shipSize, shipSize, { isStatic: true }));

  // Initialize Matter.js world
  const initializeWorld = () => {
    Matter.World.add(worldRef.current, shipRef.current);
  };

  // Reset game state
  const resetGame = () => {
    livesRef.current = 3;
    scoreRef.current = 0;
    setDisplayLives(3);
    setDisplayScore(0);
    setGameOver(false);

    // Clear the Matter.js world and reinitialize
    Matter.Engine.clear(engineRef.current);
    Matter.World.clear(worldRef.current, false);
    engineRef.current = Matter.Engine.create({ enableSleeping: false });
    worldRef.current = engineRef.current.world;
    shipRef.current = Matter.Bodies.rectangle(width / 2, height - shipSize * 2, shipSize, shipSize, { isStatic: true });
    initializeWorld();
  };

  // Reset game when the component mounts
  useEffect(() => {
    resetGame();
  }, []);

  // Physics system
  const Physics = (entities, { time }) => {
    Matter.Engine.update(engineRef.current, time.delta);
    return entities;
  };

  // Ship Movement
  const MoveShip = (entities, { touches }) => {
    touches.forEach(t => {
      if (t.type === 'move' || t.type === 'press') {
        const x = t.event.pageX;
        if (x >= 0 && x <= width) {
          Matter.Body.setPosition(shipRef.current, { x, y: height - shipSize * 2 });
        }
      }
    });
    const shipEntity = entities.spaceship;
    if (shipEntity && shipRef.current) {
      shipEntity.body = shipRef.current;
    }
    return entities;
  };

  // Bullet Shooting (continuous)
  let bulletCooldown = 0;
  const BulletShooter = (entities, { time }) => {
    bulletCooldown += time.delta;
    if (bulletCooldown > 300) {
      bulletCooldown = 0;
      console.log(shipRef.current.position.x,' bullet')
      const bullet = Matter.Bodies.rectangle(shipRef.current.position.x, shipRef.current.position.y - 30, 10, 20, {
        label: 'bullet',
        isSensor: true,
        frictionAir: 0,
        inertia: Infinity,
      });
      Matter.Body.setVelocity(bullet, { x: 0, y: -5 }); // Reduced bullet speed
      Matter.Body.set(bullet, { force: { x: 0, y: -0.03 } }); // Counteract gravity
      Matter.World.add(worldRef.current, bullet);
      entities[`bullet_${Date.now()}`] = { body: bullet, color: 'yellow', renderer: Bullet };
    }
    return entities;
  };

  // Asteroid Spawner
  const AsteroidSpawner = (entities) => {
    if (Math.random() < 0.015) {
      const x = Math.random() * width;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const asteroid = Matter.Bodies.circle(x, 0, 20, {
        label: 'asteroid',
        restitution: 0.5,
      });
      Matter.Body.setVelocity(asteroid, { x: 0, y: 1 }); // Reduced asteroid speed
      Matter.World.add(worldRef.current, asteroid);
      entities[`asteroid_${Date.now()}`] = { body: asteroid, color, renderer: Asteroid };
    }
    return entities;
  };

  // Collision Handling
  const handleCollisions = (entities) => {
    Matter.Events.on(engineRef.current, 'collisionStart', (event) => {
      event.pairs.forEach(pair => {
        const bodies = [pair.bodyA, pair.bodyB];

        const bullet = bodies.find(b => b.label === 'bullet');
        const asteroid = bodies.find(b => b.label === 'asteroid');

        if (bullet && asteroid) {
          // Remove bullet and asteroid from Matter.js world
          Matter.World.remove(worldRef.current, bullet);
          Matter.World.remove(worldRef.current, asteroid);

          // Remove bullet and asteroid from entities
          Object.keys(entities).forEach(key => {
            const entity = entities[key];
            if (entity.body === bullet || entity.body === asteroid) {
              delete entities[key];
            }
          });

          // Update score only when bullet hits asteroid
          scoreRef.current += 10;
          setDisplayScore(scoreRef.current);
        }

        if (bodies.includes(shipRef.current) && bodies.some(b => b.label === 'asteroid')) {
          // Ensure lives are decremented only once per collision
          if (!pair.isProcessed) {
            livesRef.current -= 1;
            setDisplayLives(livesRef.current);
            pair.isProcessed = true; // Mark the collision as processed
          }
        }
      });
    });

    return entities;
  };

  // Cleanup System
  const CleanupEntities = (entities) => {
    Object.keys(entities).forEach(key => {
      const entity = entities[key];
      if (entity.body && (entity.body.position.y < -50 || entity.body.position.y > height + 50)) {
        Matter.World.remove(worldRef.current, entity.body);
        delete entities[key];
      }
    });
    return entities;
  };

  // Check for game over
  useEffect(() => {
    if (livesRef.current <= 0 && !gameOver) {
      setGameOver(true);
      Alert.alert('Game Over!', `Final Score: ${scoreRef.current}`, [
        { text: 'OK', onPress: () => navigation.navigate('MainMenu') },
      ]);
      Matter.Engine.clear(engineRef.current); // Stop the physics engine
    }
  }, [displayLives, gameOver, navigation]);

  return (
    <View style={styles.container}>
      <GameEngine
        ref={gameEngine}
        style={styles.container}
        systems={[Physics, MoveShip, BulletShooter, AsteroidSpawner, handleCollisions, CleanupEntities]}
        entities={{
          physics: { engine: engineRef.current, world: worldRef.current },
          spaceship: { body: shipRef.current, size: [shipSize, shipSize], renderer: Spaceship },
        }}
        running={!gameOver} // Stop the game loop when game is over
      >
        <StatusBar hidden={true} />
        <Text style={styles.score}>Score: {displayScore}</Text>
        <Text style={styles.lives}>Lives: {displayLives}</Text>
      </GameEngine>
    </View>
  );
}

// Render Components
const Spaceship = ({ body }) => (
  <Svg width={shipSize} height={shipSize} style={{ position: 'absolute', left: body.position.x - shipSize / 2, top: body.position.y - shipSize / 2 }}>
    {console.log(body.position.x,' bodypos')}
    <Polygon points="25,0 0,50 50,50" fill="white" />
  </Svg>
);

const Asteroid = ({ body, color }) => (
  <Svg width={40} height={40} style={{ position: 'absolute', left: body.position.x - 20, top: body.position.y - 20 }}>
    <Circle cx="20" cy="20" r="20" fill={color} />
  </Svg>
);

const Bullet = ({ body }) => (
  <Svg width={10} height={20} style={{ position: 'absolute', left: body.position.x - 5, top: body.position.y - 10 }}>
    <Rect width="10" height="20" fill="yellow" />
  </Svg>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  score: { position: 'absolute', top: 40, left: 20, color: 'white', fontSize: 24, fontWeight: 'bold' },
  lives: { position: 'absolute', top: 80, left: 20, color: 'white', fontSize: 24, fontWeight: 'bold' }
});
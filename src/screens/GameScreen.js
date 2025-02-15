import React, { useState, useEffect, useRef } from 'react';
import { Dimensions, StyleSheet, StatusBar, Text, View, Alert } from 'react-native';
import Matter from 'matter-js';
import { GameEngine } from 'react-native-game-engine';
import Svg, { Polygon, Circle, Rect } from 'react-native-svg';

const { width, height } = Dimensions.get('screen');
const engine = Matter.Engine.create({ enableSleeping: false });
const world = engine.world;

// Spaceship Setup
const shipSize = 50;
const ship = Matter.Bodies.rectangle(width / 2, height - shipSize * 2, shipSize, shipSize, { isStatic: true });
Matter.World.add(world, ship);

let lives = 3;
let score = 0;

const colors = ['red', 'blue', 'orange'];

// Physics system
const Physics = (entities, { time }) => {
  Matter.Engine.update(engine, time.delta);
  return entities;
};

// Ship Movement
const MoveShip = (entities, { touches }) => {
  touches.forEach(t => {
    if (t.type === 'move' || t.type === 'press') {
      const x = t.event.pageX;
      if (x >= 0 && x <= width) {
        Matter.Body.setPosition(ship, { x, y: height - shipSize * 2 });
      }
    }
  });
  return entities;
};

// Bullet Shooting (continuous)
let bulletCooldown = 0;
const BulletShooter = (entities, { time }) => {
  bulletCooldown += time.delta;
  if (bulletCooldown > 300) {
    bulletCooldown = 0;
    const bullet = Matter.Bodies.rectangle(ship.position.x, ship.position.y - 30, 10, 20, {
      label: 'bullet',
      isSensor: true,
      frictionAir: 0,
      inertia: Infinity,
    });
    Matter.Body.setVelocity(bullet, { x: 0, y: -5 }); // Reduced bullet speed
    Matter.Body.set(bullet, { force: { x: 0, y: -0.05 } }); // Counteract gravity
    Matter.World.add(world, bullet);
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
    Matter.World.add(world, asteroid);
    entities[`asteroid_${Date.now()}`] = { body: asteroid, color, renderer: Asteroid };
  }
  return entities;
};

// Collision Handling
const handleCollisions = (entities) => {
  Matter.Events.on(engine, 'collisionStart', (event) => {
    event.pairs.forEach(pair => {
      const bodies = [pair.bodyA, pair.bodyB];

      const bullet = bodies.find(b => b.label === 'bullet');
      const asteroid = bodies.find(b => b.label === 'asteroid');

      if (bullet && asteroid) {
        // Remove bullet and asteroid from Matter.js world
        Matter.World.remove(world, bullet);
        Matter.World.remove(world, asteroid);

        // Remove bullet and asteroid from entities
        Object.keys(entities).forEach(key => {
          const entity = entities[key];
          if (entity.body === bullet || entity.body === asteroid) {
            delete entities[key];
          }
        });

        // Update score only when bullet hits asteroid
        score += 10;
      }

      if (bodies.includes(ship) && bodies.some(b => b.label === 'asteroid')) {
        // Ensure lives are decremented only once per collision
        if (!pair.isProcessed) {
          lives -= 1;
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
      Matter.World.remove(world, entity.body);
      delete entities[key];
    }
  });
  return entities;
};

// Render Components
const Spaceship = ({ body }) => (
  <Svg width={shipSize} height={shipSize} style={{ position: 'absolute', left: body.position.x - shipSize / 2, top: body.position.y - shipSize / 2 }}>
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

export default function GameScreen({ navigation }) {
  const [displayScore, setDisplayScore] = useState(0);
  const [displayLives, setDisplayLives] = useState(lives);
  const [gameOver, setGameOver] = useState(false);
  const gameEngine = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayScore(score);
      setDisplayLives(lives);

      // Check for game over
      if (lives <= 0 && !gameOver) {
        setGameOver(true);
        Alert.alert('Game Over!', `Final Score: ${score}`, [
          { text: 'OK', onPress: () => navigation.navigate('MainMenu') },
        ]);
        Matter.Engine.clear(engine); // Stop the physics engine
      }
    }, 500);
    return () => clearInterval(interval);
  }, [gameOver, lives, navigation]);

  return (
    <View style={styles.container}>
      <GameEngine
        ref={gameEngine}
        style={styles.container}
        systems={[Physics, MoveShip, BulletShooter, AsteroidSpawner, handleCollisions, CleanupEntities]}
        entities={{
          physics: { engine, world },
          spaceship: { body: ship, size: [shipSize, shipSize], renderer: Spaceship },
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  score: { position: 'absolute', top: 40, left: 20, color: 'white', fontSize: 24, fontWeight: 'bold' },
  lives: { position: 'absolute', top: 80, left: 20, color: 'white', fontSize: 24, fontWeight: 'bold' }
});
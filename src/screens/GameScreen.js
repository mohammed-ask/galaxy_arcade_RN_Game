import React, { useState, useEffect, useRef } from 'react';
import { Dimensions, StyleSheet, StatusBar, Text, View, Alert, ImageBackground } from 'react-native';
import Matter from 'matter-js';
import { GameEngine } from 'react-native-game-engine';
import Svg, { Polygon, Circle, Rect } from 'react-native-svg';
import Asteroid from '../assets/Ufo.js';
import Bullet from '../assets/Bullets.js';
import Spaceship from '../assets/Spaceship.js';
import Boom from '../assets/Boom.js';

const { width, height } = Dimensions.get('screen');
const shipSize = 50;
const colors = ['red', 'blue', 'orange'];

export default function GameScreen({ navigation }) {
  const [displayScore, setDisplayScore] = useState(0);
  const [displayLives, setDisplayLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [levelUp, setLevelUp] = useState(false); // Track level up
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
    return () => {
      stopGame();
    };
  }, []);

  // Check for level up
  useEffect(() => {
    if (scoreRef.current >= 200 && !levelUp) {
      setLevelUp(true); // Activate level up
    }
  }, [displayScore, levelUp]);

  // Stop the game
  const stopGame = () => {
    Matter.Engine.clear(engineRef.current); // Stop the physics engine
    Matter.World.clear(worldRef.current, false);
    if (gameEngine.current) {
      gameEngine.current.stop(); // Stop the GameEngine
    }
  };

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

      // Fire two bullets together if level up is active
      if (levelUp) {
        const bullet1 = Matter.Bodies.rectangle(shipRef.current.position.x - 5, shipRef.current.position.y - 30, 10, 20, {
          label: 'bullet',
          isSensor: true,
          frictionAir: 0,
          inertia: Infinity,
        });
        const bullet2 = Matter.Bodies.rectangle(shipRef.current.position.x + 5, shipRef.current.position.y - 30, 10, 20, {
          label: 'bullet',
          isSensor: true,
          frictionAir: 0,
          inertia: Infinity,
        });
        Matter.Body.setVelocity(bullet1, { x: 0, y: -5 });
        Matter.Body.setVelocity(bullet2, { x: 0, y: -5 });
        Matter.Body.set(bullet1, { force: { x: 0, y: -0.03 } }); // Counteract gravity
        Matter.Body.set(bullet2, { force: { x: 0, y: -0.03 } }); // Counteract gravity
        Matter.World.add(worldRef.current, bullet1);
        Matter.World.add(worldRef.current, bullet2);
        entities[`bullet_${Date.now()}_1`] = { body: bullet1, color: 'yellow', renderer: Bullet };
        entities[`bullet_${Date.now()}_2`] = { body: bullet2, color: 'yellow', renderer: Bullet };
      } else {
        // Fire single bullet
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
    }
    return entities;
  };

  const genreateEvenOdd = () => {
    const num = Math.floor(Math.random() * 10) + 1
    return num % 2 === 0
  }

  // Asteroid Spawner
  const AsteroidSpawner = (entities) => {
    const enemy = levelUp && genreateEvenOdd()
    if (Math.random() < 0.015) {
      const x = Math.random() * width;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const asteroid = Matter.Bodies.circle(x, 0, 20, {
        label: enemy ? 'meteor' : 'asteroid',
        restitution: 0.5,
        frictionAir: levelUp ? 0.05 : 0.1,
        health: enemy ? 4 : 1, // Set health to 4 if level up is active
      });
      Matter.Body.setVelocity(asteroid, { x: 0, y: 5 }); // Reduced asteroid speed
      Matter.World.add(worldRef.current, asteroid);
      if (!enemy) {
        entities[`asteroid_${Date.now()}`] = { body: asteroid, color, renderer: Asteroid, health: asteroid.health };
      } else {
        entities[`meteor_${Date.now()}`] = { body: asteroid, color, renderer: Asteroid, health: asteroid.health };
      }
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
        const meteor = bodies.find(b => b.label === 'meteor');

        if (bullet && asteroid && !pair.isProcessed) {
          // Mark the collision pair as processed
          pair.isProcessed = true;

          // Remove bullet from Matter.js world and entities
          Matter.World.remove(worldRef.current, bullet);
          Object.keys(entities).forEach(key => {
            if (entities[key].body === bullet) {
              delete entities[key];
            }
          });

          // Find the asteroid entity in the entities object
          const asteroidKey = Object.keys(entities).find(key => entities[key].body === asteroid);
          if (asteroidKey) {
            // Decrease asteroid health
            entities[asteroidKey].health -= 1;

            // If asteroid health reaches 0, remove it
            if (entities[asteroidKey].health <= 0) {
              Matter.World.remove(worldRef.current, asteroid);
              delete entities[asteroidKey];

              // Add boom effect at the collision point
              const boom = {
                body: Matter.Bodies.circle(asteroid.position.x, asteroid.position.y, 30, {
                  isStatic: true,
                  isSensor: true,
                }),
                color: 'orange',
                renderer: Boom,
                timeout: setTimeout(() => {
                  Matter.World.remove(worldRef.current, boom.body);
                  delete entities[`boom_${boom.body.id}`];
                }, 300), // Remove boom after 300ms
              };
              Matter.World.add(worldRef.current, boom.body);
              entities[`boom_${boom.body.id}`] = boom;

              // Update score
              scoreRef.current += 10;
              setDisplayScore(scoreRef.current);
            }
          }
        } else if (bullet && meteor && !pair.isProcessed) {
          // Mark the collision pair as processed
          pair.isProcessed = true;

          // Remove bullet from Matter.js world and entities
          Matter.World.remove(worldRef.current, bullet);
          Object.keys(entities).forEach(key => {
            if (entities[key].body === bullet) {
              delete entities[key];
            }
          });

          // Find the meteor entity in the entities object
          const asteroidKey = Object.keys(entities).find(key => entities[key].body === meteor);
          if (asteroidKey) {
            // Decrease meteor health
            entities[asteroidKey].health -= 1;

            // If meteor health reaches 0, remove it
            if (entities[asteroidKey].health <= 0) {
              Matter.World.remove(worldRef.current, meteor);
              delete entities[asteroidKey];

              // Add boom effect at the collision point
              const boom = {
                body: Matter.Bodies.circle(meteor.position.x, meteor.position.y, 30, {
                  isStatic: true,
                  isSensor: true,
                }),
                color: 'orange',
                renderer: Boom,
                timeout: setTimeout(() => {
                  Matter.World.remove(worldRef.current, boom.body);
                  delete entities[`boom_${boom.body.id}`];
                }, 300), // Remove boom after 300ms
              };
              Matter.World.add(worldRef.current, boom.body);
              entities[`boom_${boom.body.id}`] = boom;

              // Update score
              scoreRef.current += 10;
              setDisplayScore(scoreRef.current);
            }
          }
        }

        if (bodies.includes(shipRef.current) && bodies.some(b => b.label === 'asteroid')) {
          // Ensure lives are decremented only once per collision
          if (!pair.isProcessed) {

            // Remove asteroid from Matter.js world
            Matter.World.remove(worldRef.current, asteroid);

            // Remove asteroid from entities
            Object.keys(entities).forEach(key => {
              const entity = entities[key];
              if (entity.body === asteroid) {
                delete entities[key];
              }
            });

            livesRef.current -= 1;
            setDisplayLives(livesRef.current);
            pair.isProcessed = true; // Mark the collision as processed
          }
        } else if (bodies.includes(shipRef.current) && bodies.some(b => b.label === 'meteor')) {
          // Ensure lives are decremented only once per collision
          if (!pair.isProcessed) {

            // Remove meteor from Matter.js world
            Matter.World.remove(worldRef.current, meteor);

            // Remove meteor from entities
            Object.keys(entities).forEach(key => {
              const entity = entities[key];
              if (entity.body === meteor) {
                delete entities[key];
              }
            });

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
    <ImageBackground source={require('../assets/imgaes/background2.jpg')} resizeMode='cover' style={styles.containerImg}>
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
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  containerImg: { flex: 1, zIndex: 2 },
  container: { flex: 1 },
  score: { position: 'absolute', top: 40, left: 20, color: 'white', fontSize: 24, fontWeight: 'bold' },
  lives: { position: 'absolute', top: 80, left: 20, color: 'white', fontSize: 24, fontWeight: 'bold' }
});
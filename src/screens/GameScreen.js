import React, { useState, useEffect, useRef } from 'react';
import { Dimensions, StyleSheet, StatusBar, Text, View, Alert, ImageBackground, Modal, TouchableOpacity, BackHandler } from 'react-native';
import Matter from 'matter-js';
import { GameEngine } from 'react-native-game-engine';
import Asteroid from '../assets/Ufo.js';
import Bullet from '../assets/Bullets.js';
import Spaceship from '../assets/Spaceship.js';
import Boom from '../assets/Boom.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TouchableScale from 'react-native-touchable-scale';

const { width, height } = Dimensions.get('screen');
const shipSize = 50;
const colors = ['red', 'blue', 'orange'];

export default function GameScreen({ navigation }) {
  const [displayScore, setDisplayScore] = useState(0);
  const [displayLives, setDisplayLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [levelUp, setLevelUp] = useState(false); // Track level up
  const [level3, setLevel3] = useState(false); // Track level 3
  const [megaSpawned, setMegaSpawned] = useState(false); // Track if mega is spawned
  const gameEngine = useRef(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [gamePause, setGamePause] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);

  // Game state variables
  const livesRef = useRef(3);
  const scoreRef = useRef(0);
  const engineRef = useRef(Matter.Engine.create({ enableSleeping: false }));
  const worldRef = useRef(engineRef.current.world);
  const shipRef = useRef(Matter.Bodies.rectangle(width / 2, height - shipSize * 2, shipSize, shipSize, { isStatic: true }));

  //Update Best Score
  const updateBestScore = async (currentScore) => {
    const bestScore = await AsyncStorage.getItem('bestScore');
    if (!bestScore || currentScore > parseInt(bestScore)) {
      await AsyncStorage.setItem('bestScore', currentScore.toString());
      setUserDetail((prev) => ({ ...prev, bestScore: currentScore.toString() }));
    }
  };

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
    setLevelUp(false);
    setLevel3(false);
    setMegaSpawned(false);

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
    // Handle back button press
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      pauseGame() // Stop the game when back button is pressed
      setShowPauseModal(true) // Navigate back to the previous screen
      return true; // Prevent default behavior
    });

    return () => {
      stopGame();
    };
  }, []);

  // Check for level up
  useEffect(() => {
    if (scoreRef.current >= 200 && !levelUp) {
      setLevelUp(true); // Activate level up
    }
    if (scoreRef.current >= 500 && !level3) {
      setLevel3(true); // Activate level 3
    }
  }, [displayScore, levelUp, level3]);

  //Pause Game
  const pauseGame = () => {
    setGamePause(true)
  }

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

  // Create a bullet
  const createBullet = (x, y, isEnemyBullet = false) => {
    return Matter.Bodies.rectangle(x, y, 10, 20, {
      label: isEnemyBullet ? 'enemyBullet' : 'bullet',
      isSensor: true,
      frictionAir: 0,
      inertia: Infinity,
      // friction: 0,
      // restitution: 0,
      // collisionFilter: {
      //   category: 0x0002, // Assign a collision category
      //   mask: 0x0001, // Collide with enemies (category 0x0001)
      // },
      // force: { x: 0, y: -0.03 }, // Apply force to move the bullet
      // velocity: { x: 0, y: -5 }, // Set initial velocity
      // angularVelocity: 0,
      // isStatic: false,
      // chamfer: { radius: 10 },
      // render: {
      //   fillStyle: 'yellow',
      // },
      // // Enable CCD for fast-moving bullets
      // collisionResponse: true,
      // isBullet: true, // Mark as a bullet for CCD
    });
  };

  // Bullet Shooting (continuous)
  let bulletCooldown = 0;
  const BulletShooter = (entities, { time }) => {
    bulletCooldown += time.delta;
    if (bulletCooldown > 300) {
      bulletCooldown = 0;

      // Fire two bullets together if level up is active
      if (levelUp) {
        const bullet1 = createBullet(shipRef.current.position.x - 5, shipRef.current.position.y - 30);
        const bullet2 = createBullet(shipRef.current.position.x + 5, shipRef.current.position.y - 30);
        Matter.Body.setVelocity(bullet1, { x: 0, y: -5 });
        Matter.Body.setVelocity(bullet2, { x: 0, y: -5 });
        Matter.Body.set(bullet1, { force: { x: 0, y: -0.03 } });
        Matter.Body.set(bullet2, { force: { x: 0, y: -0.03 } });
        Matter.World.add(worldRef.current, bullet1);
        Matter.World.add(worldRef.current, bullet2);
        entities[`bullet_${Date.now()}_1`] = { body: bullet1, color: 'yellow', renderer: Bullet };
        entities[`bullet_${Date.now()}_2`] = { body: bullet2, color: 'yellow', renderer: Bullet };
      } else {
        // Fire single bullet
        const bullet = createBullet(shipRef.current.position.x + 3, shipRef.current.position.y - 30);
        Matter.Body.setVelocity(bullet, { x: 0, y: -5 });
        Matter.Body.set(bullet, { force: { x: 0, y: -0.03 } });
        Matter.World.add(worldRef.current, bullet);
        entities[`bullet_${Date.now()}`] = { body: bullet, color: 'yellow', renderer: Bullet };
      }
    }
    return entities;
  };

  // Generate even or odd
  const generateEvenOdd = () => {
    const num = Math.floor(Math.random() * 10) + 1;
    return num % 2 === 0;
  };

  // Create an asteroid or meteor
  const createAsteroid = (x, y, isMeteor = false, isMega = false) => {
    return Matter.Bodies.circle(x, y, 40, {
      label: isMega ? 'mega' : isMeteor ? 'meteor' : 'asteroid',
      restitution: 0.5,
      frictionAir: isMega ? 0.6 : isMeteor ? 0.15 : 0.1,
      health: isMega ? 15 : isMeteor ? 4 : 1,
    });
  };

  // Create 10 asteroids when mega is destroyed
  const spawnAsteroids = (x, y, entities) => {
    for (let i = 0; i < 4; i++) {
      const asteroid = createAsteroid(x, y);
      Matter.Body.setVelocity(asteroid, { x: (Math.random() - 0.5) * 2, y: 5 });
      Matter.World.add(worldRef.current, asteroid);
      entities[`asteroid_${Date.now()}_${i}`] = { body: asteroid, color: colors[Math.floor(Math.random() * colors.length)], renderer: Asteroid, health: 1 };
    }
  };

  // Mega enemy shooting bullets
  const megaShoot = (mega, entities) => {
    const bullet = createBullet(mega.position.x, mega.position.y + 30, true);
    Matter.Body.setVelocity(bullet, { x: 0, y: 3 }); // Bullet speed
    Matter.World.add(worldRef.current, bullet);
    entities[`enemyBullet_${Date.now()}`] = { body: bullet, color: 'red', renderer: Bullet };
  };


  // Move mega with sinusoidal pattern
  const moveMega = (entities, { time }) => {
    Object.keys(entities).forEach((key) => {
      const entity = entities[key];
      if (entity?.body?.label === 'mega') {
        const t = time.current / 1000;
        const amplitude = 100; // Horizontal movement range
        const frequency = 0.5; // Oscillation speed
        const x = entity.body.position.x + Math.sin(t * frequency) * amplitude * 0.05;

        // Keep the mega within screen bounds
        const clampedX = Math.max(30, Math.min(width - 30, x));

        // Apply slower vertical movement
        const fallSpeed = 0.01; // Reduce for slower falling
        Matter.Body.setPosition(entity.body, {
          x: clampedX,
          y: entity.body.position.y + fallSpeed,
        });
      }
    });
    return entities;
  };

  // Asteroid Spawner
  const AsteroidSpawner = (entities, { time }) => {
    const isMeteor = levelUp && generateEvenOdd();

    // Spawn mega only once when level 3 is active
    if (level3 && !megaSpawned) {
      const x = Math.random() * width;
      const mega = createAsteroid(x, 0, false, true);
      Matter.Body.setVelocity(mega, { x: (Math.random() - 0.5) * 2, y: 2 }); // Random X movement, slow Y movement
      Matter.World.add(worldRef.current, mega);
      entities[`mega_${Date.now()}`] = { body: mega, color: 'purple', renderer: Asteroid, health: 20 };
      setMegaSpawned(true); // Mark mega as spawned
    }



    if (Math.random() < 0.015) {
      const x = Math.random() * width;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const asteroid = createAsteroid(x, 0, isMeteor);
      Matter.Body.setVelocity(asteroid, { x: 0, y: 5 });
      Matter.World.add(worldRef.current, asteroid);
      const key = isMeteor ? `meteor_${Date.now()}` : `asteroid_${Date.now()}`;
      entities[key] = { body: asteroid, color, renderer: Asteroid, health: asteroid.health };
    }

    // Mega shooting logic
    Object.keys(entities).forEach(key => {
      const entity = entities[key];
      if (entity?.body?.label === 'mega' && Math.random() < 0.01) {
        megaShoot(entity.body, entities);
      }
    });

    return entities;
  };

  // Handle collision between bullet and asteroid/meteor/mega
  const handleBulletCollision = (entities, bullet, target, targetKey) => {
    // Remove bullet from Matter.js world and entities
    Matter.World.remove(worldRef.current, bullet);
    Object.keys(entities).forEach(key => {
      if (entities[key].body === bullet) {
        delete entities[key];
      }
    });

    // Decrease target health
    entities[targetKey].health -= 1;

    // If target health reaches 0, remove it
    if (entities[targetKey].health <= 0) {
      Matter.World.remove(worldRef.current, target);
      delete entities[targetKey];

      // Add boom effect at the collision point
      const boom = {
        body: Matter.Bodies.circle(target.position.x, target.position.y, 30, {
          isStatic: true,
          isSensor: true,
        }),
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

      // If mega is destroyed, spawn 10 asteroids
      if (target.label === 'mega') {
        spawnAsteroids(target.position.x, target.position.y, entities);
        setMegaSpawned(false); // Reset mega spawn flag
      }
    }
  };

  // Collision Handling
  const handleCollisions = (entities) => {
    Matter.Events.on(engineRef.current, 'collisionStart', (event) => {
      event.pairs.forEach(pair => {
        const bodies = [pair.bodyA, pair.bodyB];

        const bullet = bodies.find(b => b.label === 'bullet');
        const enemyBullet = bodies.find(b => b.label === 'enemyBullet');
        const asteroid = bodies.find(b => b.label === 'asteroid');
        const meteor = bodies.find(b => b.label === 'meteor');
        const mega = bodies.find(b => b.label === 'mega');

        if (bullet && (asteroid || meteor || mega) && !pair.isProcessed) {
          // Mark the collision pair as processed
          pair.isProcessed = true;

          const target = asteroid || meteor || mega;
          const targetKey = Object.keys(entities).find(key => entities[key].body === target);
          if (targetKey) {
            handleBulletCollision(entities, bullet, target, targetKey);
          }
        }

        if (enemyBullet && bodies.includes(shipRef.current) && !pair.isProcessed) {
          // Mark the collision pair as processed
          pair.isProcessed = true;

          // Remove enemy bullet from Matter.js world and entities
          Matter.World.remove(worldRef.current, enemyBullet);
          Object.keys(entities).forEach(key => {
            if (entities[key].body === enemyBullet) {
              delete entities[key];
            }
          });

          // Decrease lives
          livesRef.current -= 1;
          setDisplayLives(livesRef.current);
        }

        if (bodies.includes(shipRef.current) && (asteroid || meteor || mega) && !pair.isProcessed) {
          // Mark the collision pair as processed
          pair.isProcessed = true;

          // If mega collides with spaceship, game over instantly
          if (mega) {
            livesRef.current = 0;
            setDisplayLives(0);
          } else {
            // Remove asteroid/meteor from Matter.js world and entities
            const target = asteroid || meteor;
            Matter.World.remove(worldRef.current, target);
            Object.keys(entities).forEach(key => {
              if (entities[key].body === target) {
                delete entities[key];
              }
            });

            // Add boom effect at the collision point
            const boom = {
              body: Matter.Bodies.circle(target.position.x, target.position.y, 30, {
                isStatic: true,
                isSensor: true,
              }),
              renderer: Boom,
              timeout: setTimeout(() => {
                Matter.World.remove(worldRef.current, boom.body);
                delete entities[`boom_${boom.body.id}`];
              }, 300), // Remove boom after 300ms
            };
            Matter.World.add(worldRef.current, boom.body);
            entities[`boom_${boom.body.id}`] = boom;

            // Trigger blinking effect
            const shipEntity = entities.spaceship;
            if (shipEntity && shipRef.current) {
              shipEntity.isVisible = false;
            }
            // setIsBlinking(true);
            setTimeout(() => {
              const shipEntity = entities.spaceship;
              if (shipEntity && shipRef.current) {
                shipEntity.isVisible = true;
              }
            }, 500); // 500ms blink

            // Decrease lives
            livesRef.current -= 1;
            setDisplayLives(livesRef.current);
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
      setModalVisible(true), updateBestScore(scoreRef.current)
      // Alert.alert('Game Over!', `Final Score: ${scoreRef.current}`, [
      //   { text: 'OK', onPress: () => { setModalVisible(true), updateBestScore(scoreRef.current) } },
      // ]);
      Matter.Engine.clear(engineRef.current); // Stop the physics engine
    }
  }, [displayLives, gameOver, navigation]);

  return (
    <ImageBackground source={require('../assets/imgaes/background2.jpg')} resizeMode='cover' style={styles.containerImg}>
      <GameEngine
        ref={gameEngine}
        style={styles.container}
        systems={[Physics, MoveShip, BulletShooter, AsteroidSpawner, handleCollisions, CleanupEntities, moveMega]}
        entities={{
          physics: { engine: engineRef.current, world: worldRef.current },
          spaceship: { body: shipRef.current, size: [shipSize, shipSize], renderer: Spaceship, isVisible: true },
        }}
        running={!gameOver && !gamePause} // Stop the game loop when game is over
      >
        <StatusBar hidden={true} />
        <Text style={styles.score}>Score: {displayScore}</Text>
        <Text style={styles.lives}>Lives: {displayLives}</Text>
      </GameEngine>
      {/* Modal for User Name Input */}
      <Modal animationType="fade" transparent={true} visible={modalVisible}>
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent]}>
            <Text style={styles.modalTitle}>GAME OVER</Text>

            <TouchableScale style={styles.modalButton} onPress={() => { resetGame(); setModalVisible(false) }}>
              <Text style={styles.modalButtonText}>Play Again</Text>
            </TouchableScale>
            <TouchableScale onPress={() => navigation.replace('MainMenu')} style={styles.modalButton} >
              <Text style={styles.modalButtonText}>Main Menu</Text>
            </TouchableScale>
          </View>
        </View>
      </Modal>
      <Modal animationType="fade" transparent={true} visible={showPauseModal}>
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent]}>
            <Text style={styles.modalTitle}>GAME PAUSE</Text>

            <TouchableScale style={styles.modalButton} onPress={() => { setGamePause(false), setShowPauseModal(false) }}>
              <Text style={styles.modalButtonText}>Resume</Text>
            </TouchableScale>
            <TouchableScale onPress={() => navigation.replace('MainMenu')} style={styles.modalButton} >
              <Text style={styles.modalButtonText}>Go Back</Text>
            </TouchableScale>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  containerImg: { flex: 1, zIndex: 2 },
  container: { flex: 1 },
  score: { position: 'absolute', top: 40, left: 20, color: 'white', fontSize: 24, fontWeight: 'bold' },
  lives: { position: 'absolute', top: 80, left: 20, color: 'white', fontSize: 24, fontWeight: 'bold' },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)'
  },
  modalContent: {
    backgroundColor: '#222',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    width: '80%',
    borderWidth: 3,
    borderColor: '#6200EE',
    elevation: 10
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 20,
    color: '#FFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
    fontFamily: 'Audiowide-Regular',
  },
  modalButton: {
    marginTop: 20,
    backgroundColor: '#6200EE',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#fff'
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Audiowide-Regular',
  },
});
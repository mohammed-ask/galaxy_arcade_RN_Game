import Matter from 'matter-js';
import { Dimensions, Vibration } from 'react-native';
import { playSound } from './utils';
import { getBulletFromPool, getAsteroidFromPool, getCoinFromPool, createExplosion, getBullet2FromPool, resetEntity } from './entities'; // Assuming entity pooling
import { shipSize, colors, asteroidImages, MULTIPLIER_DURATION, SHIELD_DURATION, MAGNET_DURATION, EXPLOSION_DURATION } from './constants';
import Bullet from '../assets/Bullets';
import Asteroid from '../assets/Ufo';
import Coin from '../assets/Coin';
import Bomb from '../assets/Bomb';
import Star from '../assets/Star';
import Shield from '../assets/Shield';
import CoinMagnet from '../assets/CoinMagnet';
import Boom from '../assets/Boom';
import Explosion from '../assets/Explosion';
import { isEmpty } from '../utils';

const { width, height } = Dimensions.get('screen');

// References to be passed from GameScreen
let entitiesRef = null;
let gameStateRef = null;
let shipRef = null;
let setters = {}; // Store setters from GameScreen
let collisionRegistered = false;
let levelUpDone = false

let progressiveDifficulty = null;

// Initialize references (call this from GameScreen)
export const initializeSystems = (entities, gameState, ship, stateSetters, difficultySystem) => {
    entitiesRef = entities;
    gameStateRef = gameState;
    shipRef = ship;
    setters = stateSetters; // Store setters (setDisplayScore, setDisplayCoins, etc.)
    collisionRegistered = false,
    levelUpDone = false,
    progressiveDifficulty = difficultySystem;
};

// Fixed time step for physics
const FIXED_TIME_STEP = 1000 / 60;
const MAX_STEPS = 5; // cap to at most 5 physics updates per frame
let accumulator = 0;

// export const Physics = (entities, { time }) => {
//     try {
//         // console.log(entities, 'entitit')
//         accumulator += time.delta;
//         while (accumulator >= FIXED_TIME_STEP) {
//             Matter.Engine.update(entities.physics.engine, FIXED_TIME_STEP);
//             accumulator -= FIXED_TIME_STEP;
//         }
//         entitiesRef.current = entities; // Update ref for other systems
//         // Log entity and physics body counts
//         // console.log('Physics - Entity count:', Object.keys(entities).length, 'Physics bodies:', Matter.Composite.allBodies(entities.physics.world).length);
//         return entities;
//     } catch (e) {
//         console.log('physics error', e)
//     }
// };

export const Physics = (entities, { time }) => {
    try {
        accumulator += time.delta;
        let numSteps = 0;

        while (accumulator >= FIXED_TIME_STEP && numSteps < MAX_STEPS) {
            Matter.Engine.update(entities.physics.engine, FIXED_TIME_STEP);
            accumulator -= FIXED_TIME_STEP;
            numSteps++;
        }

        // If still leftover after MAX_STEPS, just drop it (prevents spiral of death)
        accumulator = Math.min(accumulator, FIXED_TIME_STEP);

        entitiesRef.current = entities;
        return entities;
    } catch (e) {
        console.log('physics error', e);
    }
};

export const TimerSystem = (entities, { time }) => {
  try {
    gameStateRef.current.elapsedTime = (gameStateRef.current.elapsedTime || 0) + time.delta;
    
    // Update progressive difficulty
    if (progressiveDifficulty) {
      progressiveDifficulty.updateDifficulty(gameStateRef.current.score);
    }
    
    return entities;
  } catch (e) {
    console.log(e);
  }
};

export const MoveShip = (entities, { touches }) => {
    touches.forEach(t => {
        if (t.type === 'move' || t.type === 'press') {
            const x = Math.max(shipSize / 2, Math.min(width - shipSize / 2, t.event.pageX));
            Matter.Body.setPosition(shipRef.current, { x, y: height - shipSize * 2 });
        }
    });
    if (entities?.spaceship?.body) {
        entities.spaceship.body = shipRef.current;
    }
    return entities;
};

export const CoinAttractionSystem = (entities, { time }) => {
    try {
        if (gameStateRef.current.isCoinMagnetActive) {
            const shipPosition = shipRef.current.position;
            Object.keys(entities).forEach(key => {
                const entity = entities[key];
                if (entity.body?.label === 'coin') {
                    const coinPosition = entity.body.position;
                    const distance = Matter.Vector.magnitude(Matter.Vector.sub(coinPosition, shipPosition));
                    if (distance < 200) {
                        const direction = Matter.Vector.sub(shipPosition, coinPosition);
                        const force = Matter.Vector.normalise(direction);
                        Matter.Body.setVelocity(entity.body, Matter.Vector.mult(force, 5));
                    }
                }
            });
        }
        return entities;
    } catch (e) {
        console.log('coinattraction', e)
    }
};

let bulletCooldown = 0;
export const BulletShooter = (entities, { time }) => {
  try {
    if (!entities?.physics?.world) return entities;

    bulletCooldown += time.delta;
    
    // Make shooting slightly harder as game progresses
    const baseBulletSpeed = gameStateRef.current.bulletSpeed;
    const difficultyFactor = progressiveDifficulty ? 
      Math.max(0.7, 1.0 - (progressiveDifficulty.currentMilestone * 0.05)) : 1.0;
    
    const adjustedBulletSpeed = baseBulletSpeed * difficultyFactor;
    
    if (bulletCooldown > adjustedBulletSpeed) {
      bulletCooldown = 0;
      playSound('laser', 10000);

      // Simple bullet pattern based on score
      const score = gameStateRef.current.score;
      if (score >= 500) {
        // Triple shot at high scores
        const bullets = [
          getBulletFromPool(shipRef.current.position.x, shipRef.current.position.y - 30),
          getBulletFromPool(shipRef.current.position.x - 20, shipRef.current.position.y - 25),
          getBulletFromPool(shipRef.current.position.x + 20, shipRef.current.position.y - 25)
        ];
        
        bullets.forEach((bullet, index) => {
          if (bullet) {
            Matter.World.add(entities.physics.world, bullet);
            entities[`bullet_${bullet.id}_${index}`] = { body: bullet, color: 'yellow', renderer: Bullet };
          }
        });
      } else if (score >= 200) {
        // Double shot at medium scores
        const bullet1 = getBulletFromPool(shipRef.current.position.x - 15, shipRef.current.position.y - 30);
        const bullet2 = getBulletFromPool(shipRef.current.position.x + 15, shipRef.current.position.y - 30);
        
        if (bullet1 && bullet2) {
          Matter.World.add(entities.physics.world, bullet1);
          Matter.World.add(entities.physics.world, bullet2);
          entities[`bullet_${bullet1.id}_1`] = { body: bullet1, color: 'yellow', renderer: Bullet };
          entities[`bullet_${bullet2.id}_2`] = { body: bullet2, color: 'yellow', renderer: Bullet };
        }
      } else {
        // Single shot at low scores
        const bullet = getBulletFromPool(shipRef.current.position.x, shipRef.current.position.y - 30);
        if (bullet) {
          Matter.World.add(entities.physics.world, bullet);
          entities[`bullet_${bullet.id}`] = { body: bullet, color: 'yellow', renderer: Bullet };
        }
      }
    }
    return entities;
  } catch (e) {
    console.log('bulletshooter', e);
  }
};

let asteroidCooldown = 0;
// Progressive Asteroid Spawner
export const AsteroidSpawner = (entities, { time }) => {
  try {
    asteroidCooldown += time.delta;
    
    if (!progressiveDifficulty) return entities;
    
    const settings = progressiveDifficulty.getInfiniteProgressionSettings();
    
    if (asteroidCooldown > settings.spawnRate && Math.random() < 0.02) {
      asteroidCooldown = 0;
      
      const enemyType = progressiveDifficulty.getRandomEnemyType();
      const x = Math.random() * (width - 80) + 40;
      
      switch (enemyType) {
        case 'asteroid':
          const asteroid = getAsteroidFromPool(x, 0, false, false, settings.enemySpeed);
          if (asteroid) {
            Matter.World.add(entities.physics.world, asteroid);
            entities[`asteroid_${asteroid.id}`] = {
              body: asteroid,
              color: colors[Math.floor(Math.random() * colors.length)],
              renderer: Asteroid,
              health: 1,
            };
          }
          break;
          
        case 'meteor':
          const meteor = getAsteroidFromPool(x, 0, true, false, settings.enemySpeed);
          if (meteor) {
            Matter.World.add(entities.physics.world, meteor);
            entities[`meteor_${meteor.id}`] = {
              body: meteor,
              color: 'red',
              renderer: Asteroid,
              health: 2,
            };
          }
          break;
          
        case 'mega':
          if (!gameStateRef.current.megaSpawned && Math.random() < 0.1) { // 10% chance when available
            const mega = getAsteroidFromPool(x, 0, false, true, settings.enemySpeed);
            if (mega) {
              Matter.World.add(entities.physics.world, mega);
              entities[`mega_${mega.id}`] = { 
                body: mega, 
                color: 'purple', 
                renderer: Asteroid, 
                health: 20 
              };
              gameStateRef.current.megaSpawned = true;
            }
          }
          break;
          
        case 'boss':
          if (!gameStateRef.current.bossSpawned && Math.random() < 0.05) { // 5% chance when available
            const boss = getAsteroidFromPool(x, 0, false, false, settings.enemySpeed * 0.7, true); // Boss moves slower
            if (boss) {
              Matter.World.add(entities.physics.world, boss);
              entities[`boss_${boss.id}`] = { 
                body: boss, 
                color: 'darkred', 
                renderer: Asteroid, 
                health: 50 
              };
              gameStateRef.current.bossSpawned = true;
            }
          }
          break;
      }
    }

    return entities;
  } catch (e) {
    console.log('asteroidspawner', e);
  }
};

export const MoveMega = (entities, { time }) => {
    try {
        Object.keys(entities).forEach(key => {
            const entity = entities[key];
            if (entity.body?.label === 'mega') {
                const t = time.current / 1000;
                const amplitude = 100;
                const frequency = 0.5;
                const x = entity.body.position.x + Math.sin(t * frequency) * amplitude * 0.05;
                const clampedX = Math.max(30, Math.min(width - 30, x));
                Matter.Body.setPosition(entity.body, { x: clampedX, y: entity.body.position.y + 0.01 });
            }
        });
        return entities;
    } catch (e) {
        console.log(e, 'movemega')
    }
};

let coinCooldown = 0;
export const CoinSpawner = (entities, { time }) => {
    try {
        coinCooldown += time.delta;
        if (!gameStateRef.current.isCoinsActive && coinCooldown > 1000 && Math.random() < 0.002) {
            coinCooldown = 0;
            const pattern = Math.floor(Math.random() * 3);
            const numCoins = 5;
            const spacing = 50;
            let x, dx, dy;

            switch (pattern) {
                case 0: // Vertical
                    x = Math.random() * (width - 20) + 10;
                    dx = 0;
                    dy = spacing;
                    break;
                case 1: // Diagonal left-to-right
                    x = Math.random() * (width - 20 * numCoins) + 10;
                    dx = spacing;
                    dy = spacing;
                    break;
                case 2: // Diagonal right-to-left
                    x = Math.random() * (width - 20 * numCoins) + 10 + 20 * numCoins;
                    dx = -spacing;
                    dy = spacing;
                    break;
            }

            for (let i = 0; i < numCoins; i++) {
                const coin = getCoinFromPool(x + i * dx, i * dy);
                if (coin) {
                    Matter.World.add(entities.physics.world, coin);
                    entities[`coin_${coin.id}_${i}`] = { body: coin, renderer: Coin };
                }
            }
            gameStateRef.current.isCoinsActive = true;
        }
        return entities;
    } catch (e) {
        console.log('coinspawn', e)
    }
};

export const MegaBombSpawner = (entities) => {
    try {
        if (!gameStateRef.current.isPowerUpActive && Math.random() < 0.001) {
            const x = Math.random() * (width - 40) + 20;
            const megaBomb = Matter.Bodies.circle(x, 0, 20, {
                label: 'megaBomb',
                isSensor: true,
                frictionAir: 0.2,
            });
            Matter.World.add(entities.physics.world, megaBomb);
            entities[`megaBomb_${Date.now()}`] = { body: megaBomb, renderer: Bomb };
            gameStateRef.current.isPowerUpActive = true;
        }
        return entities;
    } catch (e) {
        console.log(e, 'megabomb')
    }
};

export const MultiplierSpawner = (entities) => {
    try {
        if (!gameStateRef.current.isPowerUpActive && Math.random() < 0.001) {
            const x = Math.random() * (width - 40) + 20;
            const multiplier = Matter.Bodies.circle(x, 0, 30, {
                label: 'multiplier',
                isSensor: true,
                frictionAir: 0.2,
            });
            Matter.World.add(entities.physics.world, multiplier);
            entities[`multiplier_${Date.now()}`] = { body: multiplier, renderer: Star };
            gameStateRef.current.isPowerUpActive = true;
        }
        return entities;
    } catch (e) {
        console.log('multiplierspwan', e)
    }
};

export const ShieldSpawner = (entities) => {
    try {
        if (!gameStateRef.current.isPowerUpActive && Math.random() < 0.001) {
            const x = Math.random() * (width - 40) + 20;
            const shield = Matter.Bodies.circle(x, 0, 20, {
                label: 'shield',
                isSensor: true,
                frictionAir: 0.2,
            });
            Matter.World.add(entities.physics.world, shield);
            entities[`shield_${Date.now()}`] = { body: shield, renderer: Shield };
            gameStateRef.current.isPowerUpActive = true;
        }
        return entities;
    } catch (e) {
        console.log('shieldspwan', e)
    }
};

export const CoinMagnetSpawner = (entities) => {
    try {
        if (!gameStateRef.current.isPowerUpActive && Math.random() < 0.001) {
            const x = Math.random() * (width - 40) + 20;
            const coinMagnet = Matter.Bodies.circle(x, 0, 20, {
                label: 'coinMagnet',
                isSensor: true,
                frictionAir: 0.2,
            });
            Matter.World.add(entities.physics.world, coinMagnet);
            entities[`coinMagnet_${Date.now()}`] = { body: coinMagnet, renderer: CoinMagnet };
            gameStateRef.current.isPowerUpActive = true;
        }
        return entities;
    } catch (e) {
        console.log('coinmagenr', e)
    }
};

export const handleCollisions = (entities) => {
    try {
        const collisionEffects = {
            asteroid: { score: 10, sound: 'pop', onDestroy: null },
            meteor: { score: 20, sound: 'bossPop', onDestroy: null },
            mega: { score: 50, sound: 'bossPop', onDestroy: null },
        };
        if (!collisionRegistered) {
            Matter.Events.on(entities.physics.engine, 'collisionStart', (event) => {
                event.pairs.forEach(pair => {
                    if (pair.isProcessed) return;


                    const [bodyA, bodyB] = [pair.bodyA, pair.bodyB];
                    const bullet = bodyA.label === 'bullet' ? bodyA : bodyB.label === 'bullet' ? bodyB : null;
                    const enemyBullet = bodyA.label === 'enemyBullet' ? bodyA : bodyB.label === 'enemyBullet' ? bodyB : null;
                    const target = collisionEffects[bodyA.label] ? bodyA : collisionEffects[bodyB.label] ? bodyB : null;
                    const coin = bodyA.label === 'coin' ? bodyA : bodyB.label === 'coin' ? bodyB : null;
                    const powerUp = ['megaBomb', 'multiplier', 'shield', 'coinMagnet'].includes(bodyA.label) ? bodyA : ['megaBomb', 'multiplier', 'shield', 'coinMagnet'].includes(bodyB.label) ? bodyB : null;

                    if (bullet && target) {
                        pair.isProcessed = true;
                        const targetKey = Object.keys(entities).find(key => entities[key].body === target);
                        Matter.World.remove(entities.physics.world, bullet);
                        delete entities[Object.keys(entities).find(key => entities[key].body === bullet)];
                        if (!isEmpty(entities[targetKey])) {
                            entities[targetKey].health -= 1;
                            if (entities[targetKey].health <= 0) {
                                Matter.World.remove(entities.physics.world, target);
                                delete entities[targetKey];
                                const effect = collisionEffects[target.label];
                                gameStateRef.current.score += effect.score * (gameStateRef.current.isMultiplierActive ? 2 : 1);
                                setters.setDisplayScore(gameStateRef.current.score); // Update UI
                                playSound(effect.sound);
                                if (effect.onDestroy) effect.onDestroy(target.position.x, target.position.y);
                                // if (target.label === 'mega') gameStateRef.current.megaSpawned = false;

                                const boom = Matter.Bodies.circle(target.position.x, target.position.y, 30, { isStatic: true, isSensor: true });
                                Matter.World.add(entities.physics.world, boom);
                                entities[`boom_${boom.id}`] = {
                                    body: boom, renderer: Boom, timeout: setTimeout(() => { Matter.World.remove(entities.physics.world, boom); delete entities[`boom_${boom.id}`] }, 300)
                                };
                            }
                        }
                    }

                    if (shipRef.current === bodyA || shipRef.current === bodyB) {
                        pair.isProcessed = true;
                        if (coin) {
                            Matter.World.remove(entities.physics.world, coin);
                            delete entities[Object.keys(entities).find(key => entities[key].body === coin)];
                            playSound('coin');
                            gameStateRef.current.isCoinsActive = false;
                            gameStateRef.current.coins += 1;
                            setters.setDisplayCoins(gameStateRef.current.coins); // Update UI
                        } else if (powerUp) {
                            const powerUpKey = Object.keys(entities).find(key => entities[key].body === powerUp);
                            Matter.World.remove(entities.physics.world, powerUp);
                            delete entities[powerUpKey];
                            playSound('powercollection');
                            gameStateRef.current.isPowerUpActive = false;

                            switch (powerUp.label) {
                                case 'megaBomb':
                                    gameStateRef.current.megaBombCount += 1;
                                    setters.setDisplayMegaBombCount(gameStateRef.current.megaBombCount);
                                    break;
                                case 'multiplier':
                                    gameStateRef.current.isMultiplierActive = true;
                                    gameStateRef.current.multiplierDuration = MULTIPLIER_DURATION;
                                    setters.setMultiplierDuration(MULTIPLIER_DURATION)
                                    break;
                                case 'shield':
                                    gameStateRef.current.isShieldActive = true;
                                    gameStateRef.current.shieldDuration = SHIELD_DURATION;
                                    setters.setShieldDuration(SHIELD_DURATION)
                                    entities.spaceship.showShield = true;
                                    if (!isEmpty(gameStateRef.current.shieldTimeoutId)) {
                                        clearInterval(gameStateRef.current.shieldTimeoutId)
                                    }
                                    gameStateRef.current.shieldTimeoutId = setTimeout(() => (entities.spaceship.showShield = false), SHIELD_DURATION * 1000);
                                    break;
                                case 'coinMagnet':
                                    gameStateRef.current.isCoinMagnetActive = true;
                                    gameStateRef.current.coinMagnetDuration = MAGNET_DURATION;
                                    setters.setCoinMagnetDuration(MAGNET_DURATION)
                                    entities.spaceship.showMagnet = true;
                                    if (!isEmpty(gameStateRef.current.magnetTimeoutId)) {
                                        clearInterval(gameStateRef.current.magnetTimeoutId)
                                    }
                                    gameStateRef.current.magnetTimeoutId = setTimeout(() => (entities.spaceship.showMagnet = false), MAGNET_DURATION * 1000);
                                    break;
                            }
                        } else if (enemyBullet) {
                            Matter.World.remove(entities.physics.world, enemyBullet);
                            delete entities[Object.keys(entities).find(key => entities[key].body === enemyBullet)];
                            if (!gameStateRef.current.isShieldActive) {
                                gameStateRef.current.lives -= 1;
                                setters.setDisplayLives(gameStateRef.current.lives); // Update UI
                                setters.setShowBlinkingHeart(true)
                                playSound(gameStateRef.current.lives > 0 ? 'lifeLost' : 'gameOver');
                            }
                        } else if (target) {
                            Matter.World.remove(entities.physics.world, target);
                            delete entities[Object.keys(entities).find(key => entities[key].body === target)];

                            // Add boom effect at the collision point
                            const boom = {
                                body: Matter.Bodies.circle(target.position.x, target.position.y, 30, {
                                    isStatic: true,
                                    isSensor: true,
                                }),
                                renderer: Boom,
                                timeout: setTimeout(() => {
                                    Matter.World.remove(entities.physics.world, boom.body);
                                    delete entities[`boom_${boom.body.id}`];
                                }, 300), // Remove boom after 300ms
                            };
                            Matter.World.add(entities.physics.world, boom.body);
                            entities[`boom_${boom.body.id}`] = boom;

                            // Trigger blinking effect
                            const shipEntity = entities.spaceship;
                            if (shipEntity && shipRef.current) {
                                shipEntity.isVisible = false;
                            }
                            setTimeout(() => {
                                const shipEntity = entities.spaceship;
                                if (shipEntity && shipRef.current) {
                                    shipEntity.isVisible = true;
                                }
                            }, 500); // 500ms blink

                            if (!gameStateRef.current.isShieldActive) {
                                gameStateRef.current.lives -= target.label === 'mega' ? gameStateRef.current.lives : 1;
                                setters.setDisplayLives(gameStateRef.current.lives); // Update UI
                                setters.setShowBlinkingHeart(true)
                                playSound(gameStateRef.current.lives > 0 ? 'lifeLost' : 'gameOver');
                            } else {
                                playSound('pop');
                            }
                        }
                    }
                });
            });
            collisionRegistered = true;
        }
        return entities;
    } catch (e) {
        console.log('handlicollision', e)
    }
};

let timer
export const CleanupEntities = (entities) => {
    try {
        if (!entities || !entities.physics || !entities.physics.world) {
            console.warn('CleanupEntities: entities or entities.physics is undefined');
            return entities || entitiesRef.current || {};
        }

        // console.log(
        //     "Entities:", Object.keys(entities).length,
        //     "Bodies:", entities.physics.world.bodies.length,
        //     "Constraints:", entities.physics.world.constraints.length,
        //     "Active Timers:", global.nativeTimers
        // );

        Object.keys(entities).forEach(key => {
            const entity = entities[key];
            if (!entity?.body) return;

            const isPooled = ['bullet', 'asteroid', 'coin'].includes(entity.body.label);
            const isOffScreen = entity.body.position.y < -50 || entity.body.position.y > height + 50;

            if (isOffScreen) {
                if (false && isPooled) {
                    if (entity.body.isActive) {
                        clearTimeout(timer)
                        timer = setTimeout(() => {
                            resetEntity(entity.body);
                        }, 300);
                        console.log(`Reset pooled entity: ${key} (${entity.body.label})`);
                    }
                    // Do nothing else for pooled entities—keep them in entities
                } else {
                    // Remove non-pooled entities (e.g., booms, explosions)
                    Matter.World.remove(entities.physics.world, entity.body);
                    if (entity.timeout) clearTimeout(entity.timeout);
                    delete entities[key];

                    if (entity.body.label === 'megaBomb' || entity.body.label === 'multiplier' || entity.body.label === 'coinMagnet' || entity.body.label === 'shield') {
                        gameStateRef.current.isPowerUpActive = false
                    }
                    if (entity.body.label === 'coin') {
                        gameStateRef.current.isCoinsActive = false
                    }
                    // console.log(`Removed non-pooled entity: ${key}`);
                }
            }
        });

        // console.log('CleanupEntities - Entity count after:', Object.keys(entities).length);
        return entities;


    } catch (e) {
        console.log(e, 'cleanup error')
    }
};

// Helper function for mega destruction
const spawnAsteroids = (x, y, entities) => {
    try {
        for (let i = 0; i < 4; i++) {
            const asteroid = getAsteroidFromPool(x, y);
            if (asteroid) {
                Matter.Body.setVelocity(asteroid, { x: (Math.random() - 0.5) * 2, y: 5 });
                Matter.World.add(entities.physics.world, asteroid);
                entities[`asteroid_${asteroid.id}_${i}`] = {
                    body: asteroid,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    renderer: Asteroid,
                    health: 1,
                    enemyGenerate: asteroidImages[Math.floor(Math.random() * 8) + 1],
                };
            }
        }
    } catch (e) {
        console.log('asteroid', e)
    }
};

// In systems.js
export const useMegaBomb = () => {
    try {
        // Access entities from the ref
        const entities = entitiesRef.current
        if (gameStateRef.current.megaBombCount > 0) {
            gameStateRef.current.megaBombCount -= 1;
            Object.keys(entities).forEach(key => {
                const entity = entities[key];
                if (entity.body && ['asteroid', 'meteor', 'mega'].includes(entity.body.label)) {
                    Matter.World.remove(entities.physics.world, entity.body);
                    delete entities[key];
                }
            });
            const explosion = createExplosion(width / 9, height / 3);
            Matter.World.add(entities.physics.world, explosion);
            entities[`explosion_${explosion.id}`] = { body: explosion, renderer: Explosion, timeout: setTimeout(() => delete entities[`explosion_${explosion.id}`], EXPLOSION_DURATION) };
            Vibration.vibrate(100);
            playSound('explosion');
        }
        return entities;
    } catch (e) {
        console.log(e, 'usemegabomb')
    }
};
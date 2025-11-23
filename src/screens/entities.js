import Matter from 'matter-js';
import { Dimensions } from 'react-native';
import { shipSize } from './constants';

const { width, height } = Dimensions.get('screen');

// Object pools for reusing entities
const bulletPool = [];
const asteroidPool = [];
const coinPool = [];
const POOL_SIZE = 50; // Adjust based on game needs

// Initialize pools
for (let i = 0; i < POOL_SIZE; i++) {
    bulletPool.push(
        Matter.Bodies.rectangle(0, 0, 10, 20, {
            label: 'bullet',
            isSensor: true,
            frictionAir: 0,
            inertia: Infinity,
            isActive: false,
            id: `bullet_${i}_${Date.now()}`, // Unique ID for entity tracking
        })
    );
    asteroidPool.push(
        Matter.Bodies.circle(0, 0, 40, {
            label: 'asteroid',
            restitution: 0.5,
            frictionAir: 0.1,
            health: 1,
            isActive: false,
            id: `asteroid_${i}_${Date.now()}`,
        })
    );
    coinPool.push(
        Matter.Bodies.circle(0, 0, 10, {
            label: 'coin',
            isSensor: true,
            restitution: 1,
            frictionAir: 0.1,
            friction: 0.1,
            isActive: false,
            id: `coin_${i}_${Date.now()}`,
        })
    );
}

// Bullet creation (with pooling)
export const getBulletFromPool = (x, y, isEnemyBullet = false) => {
    const bullet = bulletPool.find(b => !b.isActive);
    if (bullet) {
        bullet.label = isEnemyBullet ? 'enemyBullet' : 'bullet';
        Matter.Body.setPosition(bullet, { x, y });
        Matter.Body.setVelocity(bullet, { x: 0, y: isEnemyBullet ? 3 : -5 });
        if (!isEnemyBullet) {
            Matter.Body.set(bullet, { force: { x: 0, y: -0.03 } });
        }
        bullet.isActive = true;
        return bullet;
    }
    // Fallback: Create a new bullet if pool is exhausted (rare case)
    const newBullet = Matter.Bodies.rectangle(x, y, 10, 20, {
        label: isEnemyBullet ? 'enemyBullet' : 'bullet',
        isSensor: true,
        frictionAir: 0,
        inertia: Infinity,
        id: `bullet_extra_${Date.now()}`,
    });
    Matter.Body.setVelocity(newBullet, { x: 0, y: isEnemyBullet ? 3 : -5 });
    if (!isEnemyBullet) {
        Matter.Body.set(newBullet, { force: { x: 0, y: -0.03 } });
    }
    return newBullet;
};


// Asteroid creation (with pooling)
export const getAsteroidFromPool = (x, y, isMeteor = false, isMega = false, isBoss = false, enemySpeed = 1.0) => {
    const asteroid = asteroidPool.find(a => !a.isActive);
    
    if (asteroid) {
        // Set enemy type
        if (isBoss) {
            asteroid.label = 'boss';
        } else if (isMega) {
            asteroid.label = 'mega';
        } else if (isMeteor) {
            asteroid.label = 'meteor';
        } else {
            asteroid.label = 'asteroid';
        }

        // Calculate properties based on enemy type and difficulty
        const properties = calculateEnemyProperties(asteroid.label, enemySpeed);
        
        // Apply properties
        asteroid.frictionAir = properties.frictionAir;
        asteroid.health = properties.health;
        // asteroid.mass = properties.mass;
        asteroid.restitution = properties.restitution;
        
        // Set position and velocity with progressive speed
        Matter.Body.setPosition(asteroid, { x, y });
        Matter.Body.setVelocity(asteroid, { 
            x: properties.velocity.x, 
            y: properties.velocity.y 
        });
        
        asteroid.isActive = true;
        return asteroid;
    }
    
    // Fallback: Create a new asteroid if pool is exhausted
    const properties = calculateEnemyProperties(
        isBoss ? 'boss' : isMega ? 'mega' : isMeteor ? 'meteor' : 'asteroid', 
        enemySpeed
    );
    const newAsteroid = Matter.Bodies.circle(x, y, properties.radius, {
        label: isBoss ? 'boss' : isMega ? 'mega' : isMeteor ? 'meteor' : 'asteroid',
        restitution: properties.restitution,
        frictionAir: properties.frictionAir,
        health: properties.health,
        // mass: properties.mass,
        id: `asteroid_extra_${Date.now()}`,
        render: {
            fillStyle: properties.color
        }
    });
    
    Matter.Body.setVelocity(newAsteroid, { 
        x: properties.velocity.x, 
        y: properties.velocity.y 
    });
    
    return newAsteroid;
};

// Helper function to calculate enemy properties based on type and difficulty
const calculateEnemyProperties = (enemyType, enemySpeed = 1.0) => {
    const baseProperties = {
        asteroid: {
            radius: 25,
            health: 1,
            // mass: 1,
            frictionAir: 0.1,
            restitution: 0.5,
            color: '#888888',
            velocity: { x: 0, y: 3 }
        },
        meteor: {
            radius: 25,
            health: 2,
            // mass: 2,
            frictionAir: 0.15,
            restitution: 0.3,
            color: '#FF4444',
            velocity: { x: (Math.random() - 0.5) * 0.5, y: 3.5 }
        },
        mega: {
            radius: 35,
            health: 15,
            // mass: 5,
            frictionAir: 0.6,
            restitution: 0.8,
            color: '#AA00FF',
            velocity: { x: 0, y: 2 }
        },
        boss: {
            radius: 45,
            health: 100,
            // mass: 10,
            frictionAir: 0.8,
            restitution: 0.9,
            color: '#8B0000',
            velocity: { x: (Math.random() - 0.5) * 0.3, y: 1.5 },
            abilities: {
                hasShield: true,
                shieldCooldown: 3000, // 3 seconds shield cooldown
                bulletSpawnCooldown: 2000, // 2 seconds between bullet bursts
                movementPattern: 'horizontal', // Starts with horizontal movement
                spawnMinions: true
            }
        }
    };

    const base = baseProperties[enemyType] || baseProperties.asteroid;
    
    // Apply difficulty scaling
    const speedMultiplier = Math.min(2.0, enemySpeed); // Cap at 2x speed
    const healthMultiplier = Math.min(2.0, 1 + (enemySpeed - 1) * 0.5); // Health increases slower
    return {
        radius: base.radius,
        health: Math.ceil(base.health),
        // mass: base.mass,
        frictionAir: Math.max(0.01, base.frictionAir - enemySpeed), // Less air friction = faster
        restitution: base.restitution,
        color: base.color,
        velocity: {
            x: base.velocity.x * speedMultiplier,
            y: base.velocity.y * speedMultiplier
        }
    };
};

// Coin creation (with pooling)
export const getCoinFromPool = (x, y) => {
    const coin = coinPool.find(c => !c.isActive);
    if (coin) {
        Matter.Body.setPosition(coin, { x, y });
        Matter.Body.setVelocity(coin, { x: 0, y: 1 });
        coin.isActive = true;
        return coin;
    }
    // Fallback: Create a new coin if pool is exhausted
    const newCoin = Matter.Bodies.circle(x, y, 10, {
        label: 'coin',
        isSensor: true,
        restitution: 1,
        frictionAir: 0.1,
        friction: 0.1,
        id: `coin_extra_${Date.now()}`,
    });
    Matter.Body.setVelocity(newCoin, { x: 0, y: 1 });
    return newCoin;
};

// Power-up creation (no pooling for simplicity, as they’re rare)
export const createMegaBomb = (x, y) => {
    return Matter.Bodies.circle(x, y, 20, {
        label: 'megaBomb',
        isSensor: true,
        frictionAir: 0.2,
        id: `megaBomb_${Date.now()}`,
    });
};

export const createMultiplier = (x, y) => {
    return Matter.Bodies.circle(x, y, 30, {
        label: 'multiplier',
        isSensor: true,
        frictionAir: 0.2,
        id: `multiplier_${Date.now()}`,
    });
};

export const createShield = (x, y) => {
    return Matter.Bodies.circle(x, y, 20, {
        label: 'shield',
        isSensor: true,
        frictionAir: 0.2,
        id: `shield_${Date.now()}`,
    });
};

export const createCoinMagnet = (x, y) => {
    return Matter.Bodies.circle(x, y, 20, {
        label: 'coinMagnet',
        isSensor: true,
        frictionAir: 0.2,
        id: `coinMagnet_${Date.now()}`,
    });
};

// Ship creation (no pooling, as there’s only one)
export const createShip = () => {
    return Matter.Bodies.rectangle(width / 2, height - shipSize * 2, shipSize, shipSize, {
        isStatic: true,
        id: 'ship',
    });
};

// Boom effect (temporary entity, no pooling)
export const createBoom = (x, y) => {
    return Matter.Bodies.circle(x, y, 30, {
        isStatic: true,
        isSensor: true,
        id: `boom_${Date.now()}`,
    });
};

// Explosion effect for mega bomb (temporary entity, no pooling)
export const createExplosion = (x, y) => {
    return Matter.Bodies.circle(x, y, 100, {
        isStatic: true,
        isSensor: true,
        id: `explosion_${Date.now()}`,
    });
};

// Reset entity to pool (called by CleanupEntities or collision handler)
export const resetEntity = (entity) => {
    if (entity && entity.isActive) {
        Matter.Body.setPosition(entity, { x: -100, y: -100 }); // Move off-screen, not (0, 0)
        Matter.Body.setVelocity(entity, { x: 0, y: 0 });
        entity.isActive = false;
    }
};
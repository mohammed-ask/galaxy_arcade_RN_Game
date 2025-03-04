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
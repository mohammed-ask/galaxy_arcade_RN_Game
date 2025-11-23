export class ProgressiveDifficulty {
  constructor(gameStateRef) {
    this.gameStateRef = gameStateRef;
    this.difficultyMilestones = [
      {score: 0, enemySpeed: 0.02, spawnRate: 800, enemies: ['asteroid']},
      {score: 100, enemySpeed: 0.04, spawnRate: 700, enemies: ['asteroid']},
      {
        score: 200,
        enemySpeed: 0.06,
        spawnRate: 600,
        enemies: ['asteroid', 'meteor'],
      },
      {
        score: 300,
        enemySpeed: 0.08,
        spawnRate: 550,
        enemies: ['asteroid', 'meteor'],
      },
      {
        score: 500,
        enemySpeed: 0.1,
        spawnRate: 500,
        enemies: ['asteroid', 'meteor', 'mega'],
      },
      {
        score: 750,
        enemySpeed: 0.12,
        spawnRate: 450,
        enemies: ['asteroid', 'meteor', 'mega'],
      },
      {
        score: 1000,
        enemySpeed: 0.14,
        spawnRate: 400,
        enemies: ['asteroid', 'meteor', 'mega'],
      },
      {
        score: 1500,
        enemySpeed: 0.16,
        spawnRate: 350,
        enemies: ['asteroid', 'meteor', 'mega', 'boss'],
      },
      // Continue adding milestones infinitely...
    ];

    this.currentMilestone = 0;
    this.unlockedEnemies = new Set(['asteroid']);
  }

  updateDifficulty(score,setters) {
    // Find the highest milestone we've reached
    let newMilestone = 0;
    for (let i = 0; i < this.difficultyMilestones.length; i++) {
      if (score >= this.difficultyMilestones[i].score) {
        newMilestone = i;
      } else {
        break;
      }
    }

    // Check if we reached a new milestone
    if (newMilestone > this.currentMilestone) {
      this.currentMilestone = newMilestone;
      const milestone = this.difficultyMilestones[newMilestone];

      // Unlock new enemies
      milestone.enemies.forEach(enemy => this.unlockedEnemies.add(enemy));

      console.log(
        `Reached milestone: ${
          milestone.score
        } points - New enemies: ${milestone.enemies.join(', ')}`,
      );
      setters.openModal()
      setTimeout(() => {
          setters.closeModal()
      }, 1800);
      return true; // New milestone reached
    }

    return false;
  }

  resetProgressiveDifficulty() {
    this.currentMilestone = 0;
    this.unlockedEnemies = new Set(['asteroid']);
  }

  getCurrentSettings() {
    const milestone = this.difficultyMilestones[this.currentMilestone];

    // Calculate progressive values between milestones
    const nextMilestone =
      this.difficultyMilestones[
        Math.min(
          this.currentMilestone + 1,
          this.difficultyMilestones.length - 1,
        )
      ];
    const progress = this.calculateProgressBetweenMilestones();

    return {
      enemySpeed: this.lerp(
        milestone.enemySpeed,
        nextMilestone.enemySpeed,
        progress,
      ),
      spawnRate: this.lerp(
        milestone.spawnRate,
        nextMilestone.spawnRate,
        progress,
      ),
      unlockedEnemies: Array.from(this.unlockedEnemies),
      // Add more progressive values as needed
    };
  }

  calculateProgressBetweenMilestones() {
    const current = this.difficultyMilestones[this.currentMilestone];
    const next =
      this.difficultyMilestones[
        Math.min(
          this.currentMilestone + 1,
          this.difficultyMilestones.length - 1,
        )
      ];

    if (this.currentMilestone >= this.difficultyMilestones.length - 1) {
      return 1.0; // At max difficulty
    }

    const scoreRange = next.score - current.score;
    const currentProgress = this.gameStateRef.current.score - current.score;

    return Math.min(currentProgress / scoreRange, 1.0);
  }

  lerp(start, end, progress) {
    return start + (end - start) * progress;
  }

  canSpawnEnemy(enemyType) {
    return this.unlockedEnemies.has(enemyType);
  }

  getRandomEnemyType() {
    const enemies = Array.from(this.unlockedEnemies);
    return enemies[Math.floor(Math.random() * enemies.length)];
  }

  // For truly infinite progression after defined milestones
  getInfiniteProgressionSettings() {
    const baseSettings = this.getCurrentSettings();
    const baseScore = 2000; // Score where defined milestones end

    if (this.gameStateRef.current.score <= baseScore) {
      return baseSettings;
    }

    // Infinite scaling beyond baseScore
    const extraScore = this.gameStateRef.current.score - baseScore;
    const scalingFactor = 1 + extraScore / 5000; // Scale every 5000 points

    return {
      enemySpeed: baseSettings.enemySpeed,
      spawnRate: Math.max(200, baseSettings.spawnRate / scalingFactor), // Cap minimum spawn rate
      unlockedEnemies: baseSettings.unlockedEnemies,
    };
  }
}

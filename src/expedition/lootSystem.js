import { getRegionLootTable, getShardType } from "../data/lootTables.js";

let lootSeq = 0;

/**
 * 敵人死亡 → 生成地面碎晶（先 bounce，再 magnet 向夥伴）。
 */
export function spawnLootFromEnemy(session, enemy, regionId, rng = Math.random) {
  const table = getRegionLootTable(regionId);
  const count =
    table.dropCount.min +
    Math.floor(rng() * (table.dropCount.max - table.dropCount.min + 1));
  const shardId = table.primaryShard;
  const shard = getShardType(shardId);
  const drops = [];

  for (let i = 0; i < count; i += 1) {
    const angle = rng() * Math.PI * 2;
    const dist = 8 + rng() * 22;
    lootSeq += 1;
    drops.push({
      id: `loot_${lootSeq}`,
      shardId,
      label: shard.label.zh,
      color: shard.color,
      x: enemy.x + Math.cos(angle) * dist,
      y: enemy.y + Math.sin(angle) * dist,
      vx: Math.cos(angle) * (40 + rng() * 30),
      vy: Math.sin(angle) * (40 + rng() * 30) - 20,
      phase: "bounce",
      phaseMs: 0,
      amount: 1,
      collected: false
    });
  }

  session.loot = [...(session.loot || []), ...drops];
  return drops;
}

export function updateLootPhysics(session, deltaMs) {
  const companion = session.companion;
  const loot = session.loot || [];
  const dt = deltaMs / 1000;

  loot.forEach((piece) => {
    if (piece.collected) return;

    piece.phaseMs = (piece.phaseMs || 0) + deltaMs;

    if (piece.phase === "bounce") {
      piece.x += piece.vx * dt;
      piece.y += piece.vy * dt;
      piece.vy += 120 * dt;
      piece.vx *= 0.92;
      if (piece.phaseMs >= 480) {
        piece.phase = "idle";
        piece.vx = 0;
        piece.vy = 0;
        piece.phaseMs = 0;
      }
      return;
    }

    if (piece.phase === "idle" && piece.phaseMs >= 500) {
      piece.phase = "magnet";
      piece.phaseMs = 0;
    }

    if (piece.phase === "magnet") {
      const dx = companion.x - piece.x;
      const dy = companion.y - piece.y;
      const dist = Math.hypot(dx, dy) || 1;
      const speed = 220;
      piece.x += (dx / dist) * speed * dt;
      piece.y += (dy / dist) * speed * dt;
      if (dist < 18) {
        piece.collected = true;
        piece.phase = "collected";
        session.lootCollected[piece.shardId] =
          (session.lootCollected[piece.shardId] || 0) + (piece.amount || 1);
      }
    }
  });
}

export function countUncollectedLoot(session) {
  return (session.loot || []).filter((p) => !p.collected).length;
}

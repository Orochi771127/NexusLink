import { clamp } from "../utils/clamp.js";

/**
 * 簡化導航：圓形/矩形障礙碰撞 + 邊界 clamp。
 * Phase B 不做 A*，用 steering + slide 沿障礙滑動即可。
 */

function circleIntersects(cx, cy, r, px, py, pr = 10) {
  const dx = px - cx;
  const dy = py - cy;
  const minDist = r + pr;
  return dx * dx + dy * dy < minDist * minDist;
}

function rectIntersects(rx, ry, rw, rh, px, py, pr = 10) {
  const closestX = clamp(px, rx, rx + rw);
  const closestY = clamp(py, ry, ry + rh);
  const dx = px - closestX;
  const dy = py - closestY;
  return dx * dx + dy * dy < pr * pr;
}

export function createNavigationGrid(region) {
  const circles = region?.circleObstacles || [];
  const rects = region?.rectObstacles || [];
  const margin = 14;
  const agentRadius = 12;

  function isInsideWorld(x, y, worldWidth, worldHeight) {
    return x >= margin && y >= margin && x <= worldWidth - margin && y <= worldHeight - margin;
  }

  function isWalkable(x, y, worldWidth, worldHeight) {
    if (!isInsideWorld(x, y, worldWidth, worldHeight)) return false;
    for (const c of circles) {
      if (circleIntersects(c.x, c.y, c.r, x, y, agentRadius)) return false;
    }
    for (const r of rects) {
      if (rectIntersects(r.x, r.y, r.w, r.h, x, y, agentRadius)) return false;
    }
    return true;
  }

  /** 嘗試移動並沿障礙滑開（最多 3 次微調）。 */
  function moveWithCollision(fromX, fromY, dx, dy, worldWidth, worldHeight) {
    let x = fromX + dx;
    let y = fromY + dy;
    if (isWalkable(x, y, worldWidth, worldHeight)) {
      return { x, y, blocked: false };
    }

    // 分軸滑動：常見於俯視巡邏，足夠 Phase B。
    const slideX = isWalkable(fromX + dx, fromY, worldWidth, worldHeight)
      ? { x: fromX + dx, y: fromY }
      : null;
    const slideY = isWalkable(fromX, fromY + dy, worldWidth, worldHeight)
      ? { x: fromX, y: fromY + dy }
      : null;

    if (slideX && slideY) {
      return { ...slideX, blocked: true };
    }
    if (slideX) return { ...slideX, blocked: true };
    if (slideY) return { ...slideY, blocked: true };
    return { x: fromX, y: fromY, blocked: true };
  }

  function distance(ax, ay, bx, by) {
    const dx = bx - ax;
    const dy = by - ay;
    return Math.hypot(dx, dy);
  }

  return {
    isWalkable,
    moveWithCollision,
    distance,
    agentRadius
  };
}

export function pickNearestExplorePoint(session, region, nav) {
  const points = region?.explorePoints || [];
  if (!points.length) return null;

  const { x, y } = session.companion;
  let best = null;
  let bestScore = -Infinity;

  points.forEach((point) => {
    const visited = session.visitedExplorePoints.includes(point.id);
    const dist = nav.distance(x, y, point.x, point.y);
    // 未訪問優先；距離適中加分（太遠略減）。
    const score = (visited ? 0.2 : 1) - dist / (session.profile?.exploreRadius || 400);
    if (score > bestScore) {
      bestScore = score;
      best = point;
    }
  });

  return best;
}

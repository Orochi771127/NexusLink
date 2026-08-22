export function isChampionshipResearchEnabled(locationLike = window.location) {
  const params = new URLSearchParams(locationLike.search ?? "");
  return params.get("championshipResearch") === "r1";
}

import { clonePlainData, deepFreeze } from "../contracts/championshipContracts.js";
import { validateChampionshipCatalog } from "../../data/championship/validation/validateChampionshipCatalog.js";

export function createCanonicalCatalogAdapter(catalogBundle) {
  const copy = clonePlainData(catalogBundle);
  const validation = validateChampionshipCatalog(copy);
  if (!validation.valid) throw new Error(`Invalid Championship catalog: ${validation.errors.join("; ")}`);
  const catalog = deepFreeze(copy);
  return Object.freeze({
    read() {
      return catalog;
    },
    digest: validation.digest
  });
}

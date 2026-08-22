export function resolveShopTransaction(state, shopRecord) {
  if (!shopRecord || shopRecord.availabilityRule?.value?.available !== true) throw new Error("Research shop record is unavailable");
  const price = shopRecord.priceRule?.value?.amount;
  if (!Number.isInteger(price) || price < 0) throw new Error("Research shop price rule is invalid");
  const currentStock = state.economy.shopAvailabilityByRecordId[shopRecord.shopRecordId] ?? 0;
  if (currentStock <= 0) throw new Error("Research shop record is out of stock");
  if (state.economy.wallet < price) throw new Error("Research wallet balance is insufficient");

  const economy = {
    ...state.economy,
    wallet: state.economy.wallet - price,
    shopAvailabilityByRecordId: {
      ...state.economy.shopAvailabilityByRecordId,
      [shopRecord.shopRecordId]: currentStock - 1
    }
  };

  if (shopRecord.commitDomain === "INVENTORY") {
    economy.inventoryByItemId = {
      ...state.economy.inventoryByItemId,
      [shopRecord.itemId]: (state.economy.inventoryByItemId[shopRecord.itemId] ?? 0) + 1
    };
  } else if (shopRecord.commitDomain === "CAGE_OWNERSHIP") {
    economy.cageOwnershipById = {
      ...state.economy.cageOwnershipById,
      [shopRecord.itemId]: true
    };
  } else {
    throw new Error("Unknown research shop commit domain");
  }
  return { ...state, economy };
}

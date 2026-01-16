export function getChildrenByAreaId(data, areaId) {
  if (!data) return [];
  // Recursively search through the data
  for (const item of data) {
    if (item.id === areaId) {
      return item.children || [];
    }
    if (item.children?.length) {
      const found = getChildrenByAreaId(item.children, areaId);
      if (found) return found;
    }
  }
  return []; // if not found
}

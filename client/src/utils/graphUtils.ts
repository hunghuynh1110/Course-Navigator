/**
 * Graph utility functions for course prerequisite visualization
 */

/**
 * Sorts course IDs by:
 * 1. Alphabetical prefix (e.g., COMP before HUMN)
 * 2. Numerical code within the same prefix (e.g., COMP1200 before COMP3200)
 *
 * @param courseIds - Array of course IDs to sort
 * @returns Sorted array of course IDs
 *
 * @example
 * sortCourseIds(['HUMN3100', 'COMP1200', 'HUMN1100', 'COMP3200'])
 * // Returns: ['COMP1200', 'COMP3200', 'HUMN1100', 'HUMN3100']
 */
export function sortCourseIds(courseIds: string[]): string[] {
  return [...courseIds].sort((a, b) => {
    // Extract prefix (letters) and number parts
    const matchA = a.match(/^([A-Z]+)(\d+)$/);
    const matchB = b.match(/^([A-Z]+)(\d+)$/);

    if (!matchA || !matchB) {
      // Fallback to string comparison if pattern doesn't match
      return a.localeCompare(b);
    }

    const [, prefixA, numberA] = matchA;
    const [, prefixB, numberB] = matchB;

    // First, compare prefixes alphabetically
    const prefixComparison = prefixA.localeCompare(prefixB);
    if (prefixComparison !== 0) {
      return prefixComparison;
    }

    // If prefixes are the same, compare numbers numerically
    return parseInt(numberA, 10) - parseInt(numberB, 10);
  });
}

/**
 * Removes transitive edges from a prerequisite graph.
 *
 * A transitive edge is redundant if there's an indirect path between two nodes.
 * For example, if A → B → C and A → C both exist, then A → C is transitive and can be removed.
 *
 * @param prerequisiteMap - Map of course IDs to their direct prerequisite lists
 * @returns A new map with transitive edges removed
 *
 * @example
 * Input:
 * {
 *   "HUMN3300": ["HUMN3100", "HUMN2200"],
 *   "HUMN3100": ["HUMN2200"]
 * }
 *
 * Output:
 * {
 *   "HUMN3300": ["HUMN3100"],  // HUMN2200 removed (reachable via HUMN3100)
 *   "HUMN3100": ["HUMN2200"]
 * }
 */
export function removeTransitiveEdges(
  prerequisiteMap: Record<string, string[]>
): Record<string, string[]> {
  const result: Record<string, string[]> = {};

  /**
   * Helper function to check if 'target' can be reached from 'start'
   * by following the prerequisite chain
   */
  const canReach = (
    start: string,
    target: string,
    visited: Set<string> = new Set()
  ): boolean => {
    // Base case: we've reached the target
    if (start === target) return true;

    // Prevent infinite loops
    if (visited.has(start)) return false;
    visited.add(start);

    const prereqs = prerequisiteMap[start] || [];

    // Try to reach target through any prerequisite
    for (const prereq of prereqs) {
      if (canReach(prereq, target, visited)) {
        return true;
      }
    }

    return false;
  };

  // Process each course
  for (const [courseId, prerequisites] of Object.entries(prerequisiteMap)) {
    const filteredPrereqs: string[] = [];

    // For each prerequisite, check if it can be reached from OTHER prerequisites
    for (const prereq of prerequisites) {
      let isRedundant = false;

      // Check if this prereq can be reached from any OTHER prereq
      for (const otherPrereq of prerequisites) {
        if (otherPrereq === prereq) continue; // Skip self

        // Can we reach 'prereq' starting from 'otherPrereq'?
        if (canReach(otherPrereq, prereq, new Set())) {
          isRedundant = true;
          break;
        }
      }

      if (!isRedundant) {
        filteredPrereqs.push(prereq);
      }
    }

    result[courseId] = filteredPrereqs;
  }

  // Sort the result: sort keys and sort each prerequisite list
  const sortedResult: Record<string, string[]> = {};
  const sortedKeys = sortCourseIds(Object.keys(result));

  for (const key of sortedKeys) {
    sortedResult[key] = sortCourseIds(result[key]);
  }

  return sortedResult;
}

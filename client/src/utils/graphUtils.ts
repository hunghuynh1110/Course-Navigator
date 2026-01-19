/**
 * Graph utility functions for course prerequisite visualization
 */

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

  return result;
}

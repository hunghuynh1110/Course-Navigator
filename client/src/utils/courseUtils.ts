import { supabase } from "../supabaseClient";
import type { Course, Status } from "../types/course";
import { sortCourseIds } from "./graphUtils";

/**
 * Hàm nhận vào danh sách ID môn học gốc.
 * Trả về danh sách chứa các môn đó VÀ toàn bộ các môn tiên quyết của chúng.
 */
export async function fetchFullCourseTree(
  rootIds: string[]
): Promise<Course[]> {
  // Map để lưu các môn đã tìm thấy (tránh trùng lặp)
  const allCoursesMap = new Map<string, Course>();

  // Danh sách các ID cần tìm trong lượt tiếp theo (Queue)
  let nextIdsToFetch = [...rootIds];

  while (nextIdsToFetch.length > 0) {
    // 1. Gọi Supabase lấy thông tin các môn trong danh sách chờ
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .in("id", nextIdsToFetch);

    if (error || !data) {
      console.error("Lỗi lấy dữ liệu cây môn học:", error);
      break;
    }

    // Xóa danh sách chờ để chuẩn bị cho lượt mới
    nextIdsToFetch = [];

    // 2. Duyệt qua dữ liệu vừa lấy về
    const courses = data as unknown as Course[];

    for (const course of courses) {
      // Nếu môn này chưa có trong kho thì thêm vào
      if (!allCoursesMap.has(course.id)) {
        allCoursesMap.set(course.id, course);

        // 3. Kiểm tra xem môn này có môn tiên quyết không
        const prerequisites = course.raw_data.prerequisites_list || [];

        if (Array.isArray(prerequisites)) {
          for (const prereqId of prerequisites) {
            // Nếu môn tiên quyết này CHƯA từng lấy và CHƯA nằm trong hàng đợi
            if (
              !allCoursesMap.has(prereqId) &&
              !nextIdsToFetch.includes(prereqId)
            ) {
              nextIdsToFetch.push(prereqId);
            }
          }
        }
      }
    }
  }

  // Chuyển Map thành Array và sort theo course ID
  const sortedIds = sortCourseIds(Array.from(allCoursesMap.keys()));
  return sortedIds.map((id) => allCoursesMap.get(id)!);
}

/**
 * Hàm tính toán trạng thái thực tế của từng môn trong cây.
 * Logic:
 * - Nếu user tự set trạng thái (Passed/Failed), tôn trọng nó.
 * - Nếu môn X có môn tiên quyết bị Failed hoặc Blocked, môn X sẽ bị Blocked (trừ khi user đã set Passed/Failed).
 * - Mặc định là Not Started.
 */
export function getEffectiveStatusMap(
  courses: Course[],
  nodesStatus: Record<string, Status>
): Record<string, Status | "Blocked"> {
  const map: Record<string, Status | "Blocked"> = {};

  // Recursive function
  const getStatus = (cId: string): Status | "Blocked" => {
    // Cached result
    if (map[cId]) return map[cId];

    const userStatus = nodesStatus[cId] || "Not Started";

    // Find course object
    const courseObj = courses.find((c) => c.id === cId);
    if (!courseObj) return userStatus;

    // Check prerequisites
    const prerequisites = courseObj.raw_data.prerequisites_list || [];
    let isBlocked = false;

    for (const pid of prerequisites) {
      const pStatus = getStatus(pid); // Recursion
      if (pStatus === "Failed" || pStatus === "Blocked") {
        isBlocked = true;
        break;
      }
    }

    // If blocked, force Blocked.
    // Strict Logic: If a prerequisite is failed, you CANNOT take this course.
    // This overrides "Not Started", "Passed", or "Failed" (assuming the plan tracks validity).
    if (isBlocked) {
      map[cId] = "Blocked";
      return "Blocked";
    }

    map[cId] = userStatus;
    return userStatus;
  };

  // Run for all courses
  courses.forEach((c) => getStatus(c.id));
  return map;
}

export async function fetchCourseAssessments(
  courseId: string
): Promise<any[] | null> {
  const { data, error } = await supabase
    .from("courses")
    .select("raw_data")
    .eq("id", courseId)
    .single();

  if (error || !data) {
    console.error("Error fetching course data:", error);
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data.raw_data as any).assessments;
}

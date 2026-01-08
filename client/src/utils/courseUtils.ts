import { supabase } from "../supabaseClient";
import type { Course } from "../types/course";

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

  // Chuyển Map thành Array để trả về
  return Array.from(allCoursesMap.values());
}

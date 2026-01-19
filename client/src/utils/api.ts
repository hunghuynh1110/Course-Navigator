import { supabase } from "../supabaseClient";
import type { Course } from "../types/course";

export const api = {
  /**
   * Fetch courses with pagination and optional search
   */
  async fetchCourses({
    page = 1,
    pageSize = 12,
    search = "",
  }: {
    page?: number;
    pageSize?: number;
    search?: string;
  }) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("courses")
      .select("*", { count: "exact" })
      .order("id", { ascending: true }) // Using 'id' as per old schema
      .range(from, to);

    if (search) {
      // Search by id or title
      query = query.or(`id.ilike.%${search}%,title.ilike.%${search}%`);
    }

    const { data, count, error } = await query;

    if (error) throw error;

    return {
      data: (data as Course[]) || [],
      count: count || 0,
    };
  },

  /**
   * Fetch a single course by id
   */
  async fetchCourse(id: string) {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as Course;
  },

  /**
   * Fetch programs, optionally filtered by faculty
   */
  async fetchPrograms(faculty?: string) {
    let query = supabase
      .from("programs")
      .select("id, name, total_units, courses, faculty")
      .order("name");

    if (faculty && faculty !== "All") {
      query = query.eq("faculty", faculty);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  },
};

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "../supabaseClient";
import type { Course } from "../types/course";
import {
  Typography,
  Grid,
  CircularProgress,
  Box,
  Pagination,
  Container,
  TextField,
  InputAdornment,
} from "@mui/material";
// Import icon kính lúp
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "@tanstack/react-router";
import CourseCard from "../components/CourseCard";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

const PAGE_SIZE = 12;

function Dashboard() {
  const navigate = useNavigate();

  // --- STATE ---
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // State cho tìm kiếm
  const [searchTerm, setSearchTerm] = useState(""); // Những gì người dùng đang gõ
  const [debouncedSearch, setDebouncedSearch] = useState(""); // Những gì dùng để gọi API (sau khi delay)

  const [coursesCache, setCoursesCache] = useState<Record<number, Course[]>>(
    {}
  );

  // --- LOGIC DEBOUNCE (CHỜ NGƯỜI DÙNG GÕ XONG) ---
  useEffect(() => {
    const timer = setTimeout(() => {
      // Chỉ khi người dùng dừng gõ 500ms thì mới cập nhật từ khóa tìm kiếm chính thức
      setDebouncedSearch(searchTerm);

      // Quan trọng: Khi tìm kiếm thay đổi, phải Reset về trang 1 và Xóa Cache cũ
      setPage(1);
      setCoursesCache({});
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // --- HÀM GỌI API ---
  const fetchPageData = useCallback(
    async (pageNumber: number, searchStr: string) => {
      // Nếu có cache VÀ KHÔNG có tìm kiếm (hoặc logic cache phức tạp hơn), dùng cache
      // Ở đây đơn giản hóa: Nếu đang tìm kiếm thì tạm thời bỏ qua cache để đảm bảo chính xác,
      // hoặc bạn có thể lưu cache theo key "searchStr_page" (nâng cao).
      // Logic hiện tại: Chỉ cache khi KHÔNG tìm kiếm để tối ưu trải nghiệm mặc định.
      if (searchStr === "" && coursesCache[pageNumber]) {
        return { data: coursesCache[pageNumber], count: null };
      }

      const from = (pageNumber - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      // Bắt đầu chuỗi truy vấn
      let query = supabase.from("courses").select("*", { count: "exact" });

      // Nếu có từ khóa tìm kiếm thì thêm bộ lọc
      if (searchStr) {
        // ilike: tìm kiếm không phân biệt hoa thường (insensitive like)
        query = query.ilike("id", `%${searchStr}%`);
      }

      const { data, error, count } = await query
        .range(from, to)
        .order("id", { ascending: true });

      if (error || !data) return { data: [], count: 0 };

      return { data: data as unknown as Course[], count };
    },
    [coursesCache]
  );

  // --- EFFECT 1: LOAD DỮ LIỆU CHÍNH ---
  useEffect(() => {
    const loadCurrentPage = async () => {
      // Logic hiển thị Loading:
      // Nếu có cache và không search -> Hiện ngay (không load)
      // Nếu không -> Hiện Loading
      const hasCache = debouncedSearch === "" && coursesCache[page];

      if (hasCache) {
        setCourses(coursesCache[page]);
        setLoading(false);
      } else {
        setLoading(true);
        const { data, count } = await fetchPageData(page, debouncedSearch);

        if (data) {
          // Chỉ lưu cache khi không tìm kiếm (để giữ cache sạch cho danh sách gốc)
          if (debouncedSearch === "") {
            setCoursesCache((prev) => ({ ...prev, [page]: data }));
          }
          setCourses(data);
          if (count !== null) setTotalPages(Math.ceil(count / PAGE_SIZE));
        }
        setLoading(false);
      }
    };

    loadCurrentPage();
  }, [page, debouncedSearch, fetchPageData]); // Chạy khi trang đổi HOẶC từ khóa tìm kiếm (đã debounce) đổi

  // --- EFFECT 2: PREFETCH (Tải ngầm trang kế tiếp) ---
  useEffect(() => {
    // Chỉ prefetch khi không đang tìm kiếm (để tiết kiệm tài nguyên)
    if (!loading && page < totalPages && debouncedSearch === "") {
      const nextPage = page + 1;
      if (!coursesCache[nextPage]) {
        fetchPageData(nextPage, "").then(({ data }) => {
          if (data && data.length > 0) {
            setCoursesCache((prev) => ({ ...prev, [nextPage]: data }));
          }
        });
      }
    }
  }, [page, loading, totalPages, coursesCache, fetchPageData, debouncedSearch]);

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* THANH TÌM KIẾM */}
      <Box mb={4} display="flex" justifyContent="flex-end">
        <TextField
          label="Search Courses"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: { xs: "100%", sm: "50%" }, backgroundColor: "white" }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* DANH SÁCH KHÓA HỌC */}
      {loading ? (
        <Box display="flex" justifyContent="center" my={10}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {courses.length === 0 ? (
            <Box textAlign="center" py={5}>
              <Typography variant="h6" color="text.secondary">
                No courses found matching "{debouncedSearch}"
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {courses.map((course) => (
                <Grid sx={{ xs: 12, md: 6, lg: 4 }} key={course.id}>
                  <CourseCard
                    course={course}
                    onClick={() => {
                      navigate({ to: `/courses/${course.id}` });
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          )}

          {/* CHỈ HIỆN PHÂN TRANG NẾU CÓ DỮ LIỆU */}
          {courses.length > 0 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
}

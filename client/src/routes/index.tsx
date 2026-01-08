import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "../supabaseClient";
import type { Course } from "../types/course";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  CircularProgress,
  Box,
  Pagination,
  Container,
} from "@mui/material";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

const PAGE_SIZE = 12;

function Dashboard() {
  const navigate = useNavigate();

  // State hiển thị
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // KHO LƯU TRỮ (CACHE): Lưu các trang đã tải { 1: [...], 2: [...] }
  // Dùng useRef để giữ dữ liệu không bị mất khi re-render, nhưng ở đây dùng useState
  // để giao diện cập nhật khi cache thay đổi cũng ổn, nhưng tốt nhất là tách biệt.
  const [coursesCache, setCoursesCache] = useState<Record<number, Course[]>>(
    {}
  );

  // Hàm lấy dữ liệu (dùng chung cho cả hiển thị và tải ngầm)
  // Trả về dữ liệu để xử lý tiếp thay vì set state trực tiếp
  const fetchPageData = useCallback(
    async (pageNumber: number) => {
      // Nếu đã có trong cache rồi thì không gọi API nữa
      if (coursesCache[pageNumber]) {
        return { data: coursesCache[pageNumber], count: null };
      }

      const from = pageNumber > 1 ? (pageNumber - 2) * PAGE_SIZE : 0;

      const to = from + PAGE_SIZE - 1;

      const { data, error, count } = await supabase
        .from("courses")
        .select("*", { count: "exact" })
        .range(from, to)
        .order("id", { ascending: true });

      if (error || !data) return { data: [], count: 0 };

      return { data: data as unknown as Course[], count };
    },
    [coursesCache]
  );

  // EFFECT 1: Xử lý hiển thị trang hiện tại
  useEffect(() => {
    const loadCurrentPage = async () => {
      // 1. Kiểm tra Cache trước
      if (coursesCache[page]) {
        setCourses(coursesCache[page]);
        setLoading(false);
      } else {
        // 2. Nếu chưa có cache thì hiện loading và gọi API
        setLoading(true);
        const { data, count } = await fetchPageData(page);

        if (data.length > 0) {
          // Lưu vào Cache
          setCoursesCache((prev) => ({ ...prev, [page]: data }));
          setCourses(data);
          if (count) setTotalPages(Math.ceil(count / PAGE_SIZE));
        }
        setLoading(false);
      }
    };

    loadCurrentPage();
  }, [page, fetchPageData]); // Chạy lại khi page thay đổi

  // EFFECT 2: Tải ngầm trang kế tiếp (Prefetch)
  useEffect(() => {
    // Chỉ chạy khi trang hiện tại đã tải xong và không phải là trang cuối
    if (!loading && page < totalPages) {
      const nextPage = page + 1;

      // Chỉ tải nếu trang sau CHƯA có trong cache
      if (!coursesCache[nextPage]) {
        console.log(`Đang tải ngầm trang ${nextPage}...`);
        fetchPageData(nextPage).then(({ data }) => {
          if (data.length > 0) {
            setCoursesCache((prev) => ({ ...prev, [nextPage]: data }));
          }
        });
      }
    }
  }, [page, loading, totalPages, coursesCache, fetchPageData]);

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Chỗ này quan trọng: Nếu Loading = true (do chưa có cache), hiện vòng xoay.
        Nếu Loading = false (đã có cache hoặc mới tải xong), hiện Grid.
      */}
      {loading ? (
        <Box display="flex" justifyContent="center" my={10}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {courses.map((course) => (
              <Grid sx={{ xs: 12, md: 6, lg: 4 }} key={course.id}>
                {/* ... Giữ nguyên phần Card của bạn ... */}
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "0.3s",
                    "&:hover": {
                      boxShadow: 6,
                      transform: "translateY(-4px)",
                    },
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    navigate({ to: `/courses/${course.id}` });
                  }}
                >
                  <CardContent>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={1}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography
                          variant="h5"
                          color="primary"
                          fontWeight="bold"
                        >
                          {course.id}
                        </Typography>
                        <Typography
                          variant="h6"
                          color="text.secondary"
                          fontWeight="bold"
                          noWrap
                          sx={{ maxWidth: "200px" }}
                        >
                          {course.title}
                        </Typography>
                      </Box>
                      <Chip
                        label={`${course.raw_data.units} Units`}
                        size="small"
                      />
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        display: "-webkit-box",
                        overflow: "hidden",
                        WebkitBoxOrient: "vertical",
                        WebkitLineClamp: 3,
                        minHeight: "4.5em",
                      }}
                    >
                      {course.raw_data.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box display="flex" justifyContent="center" mt={4}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              size="large"
            />
          </Box>
        </>
      )}
    </Container>
  );
}

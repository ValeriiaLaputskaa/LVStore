import { Center, Spinner } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useEffect } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { getCurrentUser } from "../../api/authApi";
import { AdminThemeProvider } from "../admin/theme/AdminThemeContext";

export function SellerAuthGuard() {
  const navigate = useNavigate();
  const location = useLocation();
  const query = useQuery({
    queryKey: ["auth", "me"],
    queryFn: getCurrentUser,
    retry: false,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!query.isError) return;
    const status = isAxiosError(query.error) ? query.error.response?.status : undefined;
    if (status === 401 || status === 403 || status == null) {
      navigate("/login", { replace: true, state: { from: location.pathname } });
    }
  }, [query.isError, query.error, navigate, location.pathname]);

  if (query.isPending) {
    return (
      <Center minH="100vh" bg="#f4f6f9">
        <Spinner size="xl" color="#2274d4" />
      </Center>
    );
  }

  if (query.isError || !query.data) {
    return null;
  }

  if (query.data.role !== "SELLER") {
    return <Navigate to="/" replace />;
  }

  return (
    <AdminThemeProvider>
      <Outlet />
    </AdminThemeProvider>
  );
}

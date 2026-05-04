import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { logout } from "../../api/authApi";

export function useWarehouseLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: logout,
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      queryClient.removeQueries({ queryKey: ["products"] });
      queryClient.removeQueries({ queryKey: ["orders"] });
      queryClient.removeQueries({ queryKey: ["stocks"] });
      queryClient.removeQueries({ queryKey: ["warehouses"] });
      queryClient.removeQueries({ queryKey: ["warehouse-stocks"] });
      navigate("/login", { replace: true });
    },
  });
}

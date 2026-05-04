import {
  Box,
  Button,
  Dialog,
  Field,
  Flex,
  Input,
  Portal,
  Skeleton,
  Table,
  Text,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useState } from "react";
import {
  createWarehouse,
  deleteWarehouse,
  fetchWarehouses,
  updateWarehouse,
} from "../../../api/warehousesApi";
import { getCurrentUser } from "../../../api/authApi";
import type { Warehouse } from "../../../types";
import { getApiErrorMessage } from "../../../utils/apiError";
import { ConfirmDialog } from "../../admin/components/ConfirmDialog";
import {
  adminDialogContentProps,
  adminDialogOutlineButtonProps,
  adminTableColumnHeaderProps,
  adminThemedInputProps,
  useAdminTheme,
  useAdminThemeTokens,
} from "../../admin/theme/AdminThemeContext";

const tableActionBtnBase = {
  size: "sm" as const,
  h: "32px",
  px: "12px",
  rounded: "md",
  fontSize: "12px",
  fontWeight: "semibold",
};

export function WarehouseWarehousesPage() {
  const qc = useQueryClient();
  const t = useAdminThemeTokens();
  const { isDark } = useAdminTheme();
  const meQ = useQuery({ queryKey: ["auth", "me"], queryFn: getCurrentUser, staleTime: 30_000 });
  const listQ = useQuery({ queryKey: ["warehouses"], queryFn: fetchWarehouses });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Warehouse | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [managerIdStr, setManagerIdStr] = useState("");

  const openCreate = () => {
    setEditing(null);
    setName("");
    setLocation("");
    setManagerIdStr(meQ.data?.id != null ? String(meQ.data.id) : "");
    setFormError(null);
    setDialogOpen(true);
  };

  const openEdit = (w: Warehouse) => {
    setEditing(w);
    setName(w.name);
    setLocation(w.location ?? "");
    setManagerIdStr(String(w.manager?.id ?? meQ.data?.id ?? ""));
    setFormError(null);
    setDialogOpen(true);
  };

  const saveMut = useMutation({
    mutationFn: async () => {
      const managerId = Number(managerIdStr);
      if (!name.trim() || !location.trim() || Number.isNaN(managerId)) {
        throw new Error("Заповніть назву, локацію та коректний ID менеджера.");
      }
      if (editing) {
        return updateWarehouse({
          id: editing.id,
          name: name.trim(),
          location: location.trim(),
          managerId,
        });
      }
      return createWarehouse({
        name: name.trim(),
        location: location.trim(),
        managerId,
      });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["warehouses"] });
      setDialogOpen(false);
    },
    onError: (e) => {
      setFormError(
        e instanceof Error && !isAxiosError(e)
          ? e.message
          : getApiErrorMessage(e, "Не вдалося зберегти склад."),
      );
    },
  });

  const delMut = useMutation({
    mutationFn: (id: number) => deleteWarehouse(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["warehouses"] });
      setDeleteId(null);
    },
  });

  return (
    <Box>
      <Flex justify="flex-end" mb={4}>
        <Button colorPalette="blue" onClick={openCreate}>
          Додати склад
        </Button>
      </Flex>

      {listQ.isError ? <Text color="red.600">Не вдалося завантажити склади.</Text> : null}

      <Box bg={t.surface} rounded="md" borderWidth="1px" borderColor={t.surfaceBorder} overflow="hidden">
        <Box overflowX="auto">
          <Table.Root size="sm" variant="outline">
            <Table.Header>
              <Table.Row bg={t.tableHeaderBg} color={t.headingText}>
                <Table.ColumnHeader {...adminTableColumnHeaderProps(t)}>ID</Table.ColumnHeader>
                <Table.ColumnHeader {...adminTableColumnHeaderProps(t)}>Назва</Table.ColumnHeader>
                <Table.ColumnHeader {...adminTableColumnHeaderProps(t)}>Локація</Table.ColumnHeader>
                <Table.ColumnHeader {...adminTableColumnHeaderProps(t)}>Менеджер</Table.ColumnHeader>
                <Table.ColumnHeader {...adminTableColumnHeaderProps(t)}>Дії</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body bg={t.surface} color={t.headingText}>
              {listQ.isPending
                ? Array.from({ length: 5 }).map((_, i) => (
                    <Table.Row key={i}>
                      {Array.from({ length: 5 }).map((__, j) => (
                        <Table.Cell key={j}>
                          <Skeleton height="20px" />
                        </Table.Cell>
                      ))}
                    </Table.Row>
                  ))
                : null}
              {!listQ.isPending && (listQ.data?.length ?? 0) === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={5}>
                    <Text color={t.mutedText} py={4} textAlign="center">
                      Немає складів. Створіть перший запис.
                    </Text>
                  </Table.Cell>
                </Table.Row>
              ) : null}
              {!listQ.isPending &&
                (listQ.data ?? []).map((w) => (
                  <Table.Row key={w.id}>
                    <Table.Cell>{w.id}</Table.Cell>
                    <Table.Cell fontWeight="medium">{w.name}</Table.Cell>
                    <Table.Cell>{w.location?.trim() ? w.location : "—"}</Table.Cell>
                    <Table.Cell>{w.manager?.username ?? w.manager?.email ?? "—"}</Table.Cell>
                    <Table.Cell>
                      <Flex gap={2} flexWrap="wrap">
                        <Button
                          {...tableActionBtnBase}
                          variant="solid"
                          bg="#E2E8F0"
                          color="#334155"
                          _hover={{ bg: "#CBD5E1" }}
                          onClick={() => openEdit(w)}
                        >
                          Змінити
                        </Button>
                        <Button
                          {...tableActionBtnBase}
                          variant="solid"
                          bg="#FEE2E2"
                          color="#B91C1C"
                          _hover={{ bg: "#FECACA" }}
                          onClick={() => setDeleteId(w.id)}
                        >
                          Видалити
                        </Button>
                      </Flex>
                    </Table.Cell>
                  </Table.Row>
                ))}
            </Table.Body>
          </Table.Root>
        </Box>
      </Box>

      <Dialog.Root
        open={dialogOpen}
        onOpenChange={(d) => {
          setDialogOpen(d.open);
          if (!d.open) setFormError(null);
        }}
        lazyMount
        unmountOnExit
      >
        <Portal>
          <Dialog.Backdrop bg="blackAlpha.400" />
          <Dialog.Positioner>
            <Dialog.Content maxW="md" mx={4} {...adminDialogContentProps(t)}>
              <Dialog.Header>
                <Dialog.Title>{editing ? "Редагування складу" : "Новий склад"}</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                {formError ? (
                  <Text color="red.600" fontSize="sm" mb={3}>
                    {formError}
                  </Text>
                ) : null}
                <Text fontSize="sm" color={t.mutedText} mb={3}>
                  За замовчуванням <b>ID менеджера</b> — поточний користувач. Змінюйте лише за
                  потреби.
                </Text>
                <Field.Root mb={3}>
                  <Field.Label color={t.mutedText}>Назва *</Field.Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} {...adminThemedInputProps(t)} />
                </Field.Root>
                <Field.Root mb={3}>
                  <Field.Label color={t.mutedText}>Локація *</Field.Label>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    {...adminThemedInputProps(t)}
                  />
                </Field.Root>
                <Field.Root>
                  <Field.Label color={t.mutedText}>ID менеджера *</Field.Label>
                  <Input
                    type="number"
                    min={1}
                    value={managerIdStr}
                    onChange={(e) => setManagerIdStr(e.target.value)}
                    {...adminThemedInputProps(t)}
                  />
                </Field.Root>
              </Dialog.Body>
              <Dialog.Footer gap={2}>
                <Button {...adminDialogOutlineButtonProps(t, isDark)} onClick={() => setDialogOpen(false)}>
                  Скасувати
                </Button>
                <Button colorPalette="blue" loading={saveMut.isPending} onClick={() => saveMut.mutate()}>
                  Зберегти
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      <ConfirmDialog
        open={deleteId != null}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Видалити склад?"
        body="Цю дію неможливо скасувати."
        confirmLabel="Видалити"
        loading={delMut.isPending}
        onConfirm={() => {
          if (deleteId != null) delMut.mutate(deleteId);
        }}
      />
    </Box>
  );
}

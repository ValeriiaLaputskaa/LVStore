import {
  Badge,
  Box,
  Button,
  Dialog,
  Field,
  Flex,
  Input,
  NativeSelectField,
  NativeSelectRoot,
  Portal,
  Skeleton,
  Table,
  TabsContent,
  TabsList,
  TabsRoot,
  TabsTrigger,
  Text,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useEffect, useMemo, useState } from "react";
import {
  createStore,
  deleteStore,
  fetchStores,
  updateStore,
} from "../../../api/storesApi";
import {
  createUser,
  deleteUser,
  fetchUsers,
  updateUser,
} from "../../../api/usersApi";
import type {
  CreateStorePayload,
  CreateUserPayload,
  Store,
  UpdateStorePayload,
  UpdateUserPayload,
  User,
} from "../../../types";
import { Role } from "../../../types";
import { getApiErrorMessage } from "../../../utils/apiError";
import { ConfirmDialog } from "../components/ConfirmDialog";
import {
  ADMIN_TABLE_PAGE_SIZE,
  AdminTablePagination,
} from "../components/AdminTablePagination";
import {
  adminDialogContentProps,
  adminDialogOutlineButtonProps,
  adminNativeSelectFieldProps,
  adminTableColumnHeaderProps,
  adminThemedInputProps,
  useAdminTheme,
  useAdminThemeTokens,
} from "../theme/AdminThemeContext";

const ROLES: Role[] = [Role.SELLER, Role.STORE_ADMINISTRATOR, Role.WAREHOUSE_MANAGER];

/** Фони з ТЗ; текст і рамка під контраст як у бейджів статусу замовлень. */
const ROLE_STYLE: Record<
  Role,
  { bg: string; color: string; borderColor: string }
> = {
  [Role.SELLER]: {
    bg: "#DBEAFE",
    color: "#1E3A8A",
    borderColor: "#BFDBFE",
  },
  [Role.STORE_ADMINISTRATOR]: {
    bg: "#EDE9FE",
    color: "#5B21B6",
    borderColor: "#DDD6FE",
  },
  [Role.WAREHOUSE_MANAGER]: {
    bg: "#CCFBF1",
    color: "#115E59",
    borderColor: "#99F6E4",
  },
};

function roleBadgeProps(role: string): { bg: string; color: string; borderColor: string } {
  if (role === Role.SELLER) return ROLE_STYLE[Role.SELLER];
  if (role === Role.STORE_ADMINISTRATOR) return ROLE_STYLE[Role.STORE_ADMINISTRATOR];
  if (role === Role.WAREHOUSE_MANAGER) return ROLE_STYLE[Role.WAREHOUSE_MANAGER];
  return { bg: "#F3F4F6", color: "#374151", borderColor: "#E5E7EB" };
}

const tableActionBtnBase = {
  size: "sm" as const,
  h: "32px",
  px: "12px",
  rounded: "md",
  fontSize: "12px",
  fontWeight: "semibold",
};

function adminUsersForStore(users: User[] | undefined): User[] {
  return (users ?? []).filter((u) => u.role === Role.STORE_ADMINISTRATOR);
}

export function AdminStoresUsersPage() {
  const qc = useQueryClient();
  const t = useAdminThemeTokens();
  const { isDark } = useAdminTheme();
  const storesQ = useQuery({ queryKey: ["stores"], queryFn: fetchStores });
  const usersQ = useQuery({ queryKey: ["users"], queryFn: fetchUsers });

  const [storeDialog, setStoreDialog] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [sName, setSName] = useState("");
  const [sLocation, setSLocation] = useState("");
  const [sAdminId, setSAdminId] = useState("");
  const [storeFormErr, setStoreFormErr] = useState<string | null>(null);
  const [deleteStoreId, setDeleteStoreId] = useState<number | null>(null);

  const [userDialog, setUserDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [uUsername, setUUsername] = useState("");
  const [uEmail, setUEmail] = useState("");
  const [uRole, setURole] = useState<string>(Role.SELLER);
  const [uPassword, setUPassword] = useState("");
  const [userFormErr, setUserFormErr] = useState<string | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  const [storePage, setStorePage] = useState(1);
  const [userPage, setUserPage] = useState(1);

  const storesList = useMemo(() => storesQ.data ?? [], [storesQ.data]);
  const usersList = useMemo(() => usersQ.data ?? [], [usersQ.data]);

  const totalStores = storesList.length;
  const totalStoresPages =
    totalStores === 0 ? 0 : Math.ceil(totalStores / ADMIN_TABLE_PAGE_SIZE);
  const totalUsers = usersList.length;
  const totalUsersPages =
    totalUsers === 0 ? 0 : Math.ceil(totalUsers / ADMIN_TABLE_PAGE_SIZE);

  useEffect(() => {
    if (totalStoresPages > 0 && storePage > totalStoresPages) {
      setStorePage(totalStoresPages);
    }
  }, [totalStoresPages, storePage]);

  useEffect(() => {
    if (totalUsersPages > 0 && userPage > totalUsersPages) {
      setUserPage(totalUsersPages);
    }
  }, [totalUsersPages, userPage]);

  const pagedStores = useMemo(() => {
    const start = (storePage - 1) * ADMIN_TABLE_PAGE_SIZE;
    return storesList.slice(start, start + ADMIN_TABLE_PAGE_SIZE);
  }, [storesList, storePage]);

  const pagedUsers = useMemo(() => {
    const start = (userPage - 1) * ADMIN_TABLE_PAGE_SIZE;
    return usersList.slice(start, start + ADMIN_TABLE_PAGE_SIZE);
  }, [usersList, userPage]);

  const openCreateStore = () => {
    setEditingStore(null);
    setSName("");
    setSLocation("");
    const admins = adminUsersForStore(usersQ.data);
    setSAdminId(admins[0] ? String(admins[0].id) : "");
    setStoreFormErr(null);
    setStoreDialog(true);
  };

  const openEditStore = (s: Store) => {
    setEditingStore(s);
    setSName(s.name);
    setSLocation(s.location ?? "");
    setSAdminId(s.admin?.id != null ? String(s.admin.id) : "");
    setStoreFormErr(null);
    setStoreDialog(true);
  };

  const saveStoreMut = useMutation({
    mutationFn: async () => {
      const aid = Number(sAdminId);
      if (!sName.trim() || !sLocation.trim() || !Number.isFinite(aid)) {
        throw new Error("Заповніть назву, локацію та оберіть адміністратора.");
      }
      if (editingStore) {
        const body: UpdateStorePayload = {
          id: editingStore.id,
          name: sName.trim(),
          location: sLocation.trim(),
          adminId: aid,
        };
        return updateStore(body);
      }
      const body: CreateStorePayload = {
        name: sName.trim(),
        location: sLocation.trim(),
        adminId: aid,
      };
      return createStore(body);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["stores"] });
      setStoreDialog(false);
    },
    onError: (e) => {
      setStoreFormErr(
        e instanceof Error && !isAxiosError(e)
          ? e.message
          : getApiErrorMessage(e, "Не вдалося зберегти магазин."),
      );
    },
  });

  const delStoreMut = useMutation({
    mutationFn: (id: number) => deleteStore(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["stores"] });
      setDeleteStoreId(null);
    },
  });

  const openCreateUser = () => {
    setEditingUser(null);
    setUUsername("");
    setUEmail("");
    setURole(Role.SELLER);
    setUPassword("");
    setUserFormErr(null);
    setUserDialog(true);
  };

  const openEditUser = (u: User) => {
    setEditingUser(u);
    setUUsername(u.username);
    setUEmail(u.email);
    setURole(String(u.role));
    setUPassword("");
    setUserFormErr(null);
    setUserDialog(true);
  };

  const saveUserMut = useMutation({
    mutationFn: async () => {
      if (!uUsername.trim() || !uEmail.trim()) {
        throw new Error("Ім’я користувача та email обов’язкові.");
      }
      if (!editingUser && !uPassword.trim()) {
        throw new Error("Пароль обов’язковий при створенні.");
      }
      if (editingUser) {
        const body: UpdateUserPayload = {
          id: editingUser.id,
          username: uUsername.trim(),
          email: uEmail.trim(),
          role: uRole,
        };
        if (uPassword.trim() !== "") {
          body.password = uPassword.trim();
        }
        return updateUser(body);
      }
      const body: CreateUserPayload = {
        username: uUsername.trim(),
        email: uEmail.trim(),
        role: uRole,
        password: uPassword.trim(),
      };
      return createUser(body);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["users"] });
      await qc.invalidateQueries({ queryKey: ["stores"] });
      setUserDialog(false);
    },
    onError: (e) => {
      setUserFormErr(
        e instanceof Error && !isAxiosError(e)
          ? e.message
          : getApiErrorMessage(e, "Не вдалося зберегти користувача."),
      );
    },
  });

  const delUserMut = useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["users"] });
      await qc.invalidateQueries({ queryKey: ["stores"] });
      setDeleteUserId(null);
    },
  });

  const admins = adminUsersForStore(usersQ.data);

  return (
    <Box>
      <TabsRoot defaultValue="stores" variant="line" colorPalette="blue">
        <TabsList mb={4} borderBottomWidth="1px" borderColor={t.tabListBorder}>
          <TabsTrigger value="stores" color={t.mutedText} _selected={{ color: t.headingText }}>
            Магазини
          </TabsTrigger>
          <TabsTrigger value="users" color={t.mutedText} _selected={{ color: t.headingText }}>
            Користувачі
          </TabsTrigger>
        </TabsList>
        <TabsContent value="stores">
          <Flex mb={3} justify="flex-end">
            <Button colorPalette="blue" onClick={openCreateStore}>
              Додати магазин
            </Button>
          </Flex>
          {storesQ.isError ? (
            <Text color="red.600">Не вдалося завантажити магазини.</Text>
          ) : null}
          <Box bg={t.surface} rounded="md" borderWidth="1px" borderColor={t.surfaceBorder} overflow="hidden">
            <Box overflowX="auto">
              <Table.Root size="sm" variant="outline">
                <Table.Header>
                  <Table.Row bg={t.tableHeaderBg} color={t.headingText}>
                    <Table.ColumnHeader {...adminTableColumnHeaderProps(t)}>ID</Table.ColumnHeader>
                    <Table.ColumnHeader {...adminTableColumnHeaderProps(t)}>Назва</Table.ColumnHeader>
                    <Table.ColumnHeader {...adminTableColumnHeaderProps(t)}>Локація</Table.ColumnHeader>
                    <Table.ColumnHeader {...adminTableColumnHeaderProps(t)}>Адмін</Table.ColumnHeader>
                    <Table.ColumnHeader {...adminTableColumnHeaderProps(t)}>Дії</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body bg={t.surface} color={t.headingText}>
                  {storesQ.isPending
                    ? Array.from({ length: 3 }).map((_, i) => (
                        <Table.Row key={i}>
                          {Array.from({ length: 5 }).map((__, j) => (
                            <Table.Cell key={j}>
                              <Skeleton height="18px" />
                            </Table.Cell>
                          ))}
                        </Table.Row>
                      ))
                    : null}
                  {!storesQ.isPending && totalStores === 0 ? (
                    <Table.Row>
                      <Table.Cell colSpan={5}>
                        <Text color={t.mutedText} py={4} textAlign="center">
                          Немає магазинів.
                        </Text>
                      </Table.Cell>
                    </Table.Row>
                  ) : null}
                  {!storesQ.isPending &&
                    pagedStores.map((s) => (
                      <Table.Row key={s.id}>
                        <Table.Cell>{s.id}</Table.Cell>
                        <Table.Cell fontWeight="medium">{s.name}</Table.Cell>
                        <Table.Cell>{s.location ?? "—"}</Table.Cell>
                        <Table.Cell>{s.admin?.username ?? "—"}</Table.Cell>
                        <Table.Cell>
                          <Flex gap={2} flexWrap="wrap">
                            <Button
                              {...tableActionBtnBase}
                              variant="solid"
                              bg="#E2E8F0"
                              color="#334155"
                              _hover={{ bg: "#CBD5E1" }}
                              onClick={() => openEditStore(s)}
                            >
                              Змінити
                            </Button>
                            <Button
                              {...tableActionBtnBase}
                              variant="solid"
                              bg="#FEE2E2"
                              color="#B91C1C"
                              _hover={{ bg: "#FECACA" }}
                              onClick={() => setDeleteStoreId(s.id)}
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
            {!storesQ.isPending && totalStores > 0 ? (
              <AdminTablePagination
                page={storePage}
                pageSize={ADMIN_TABLE_PAGE_SIZE}
                total={totalStores}
                onPageChange={setStorePage}
                itemsLabel="магазинів"
              />
            ) : null}
          </Box>
        </TabsContent>
        <TabsContent value="users">
          <Flex mb={3} justify="flex-end">
            <Button colorPalette="blue" onClick={openCreateUser}>
              Додати користувача
            </Button>
          </Flex>
          {usersQ.isError ? (
            <Text color="red.600">Не вдалося завантажити користувачів.</Text>
          ) : null}
          <Box bg={t.surface} rounded="md" borderWidth="1px" borderColor={t.surfaceBorder} overflow="hidden">
            <Box overflowX="auto">
              <Table.Root size="sm" variant="outline">
                <Table.Header>
                  <Table.Row bg={t.tableHeaderBg} color={t.headingText}>
                    <Table.ColumnHeader {...adminTableColumnHeaderProps(t)}>ID</Table.ColumnHeader>
                    <Table.ColumnHeader {...adminTableColumnHeaderProps(t)}>Username</Table.ColumnHeader>
                    <Table.ColumnHeader {...adminTableColumnHeaderProps(t)}>Email</Table.ColumnHeader>
                    <Table.ColumnHeader {...adminTableColumnHeaderProps(t)}>Роль</Table.ColumnHeader>
                    <Table.ColumnHeader {...adminTableColumnHeaderProps(t)}>Дії</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body bg={t.surface} color={t.headingText}>
                  {usersQ.isPending
                    ? Array.from({ length: 3 }).map((_, i) => (
                        <Table.Row key={i}>
                          {Array.from({ length: 5 }).map((__, j) => (
                            <Table.Cell key={j}>
                              <Skeleton height="18px" />
                            </Table.Cell>
                          ))}
                        </Table.Row>
                      ))
                    : null}
                  {!usersQ.isPending && totalUsers === 0 ? (
                    <Table.Row>
                      <Table.Cell colSpan={5}>
                        <Text color={t.mutedText} py={4} textAlign="center">
                          Немає користувачів.
                        </Text>
                      </Table.Cell>
                    </Table.Row>
                  ) : null}
                  {!usersQ.isPending &&
                    pagedUsers.map((u) => {
                      const roleStyle = roleBadgeProps(String(u.role));
                      return (
                        <Table.Row key={u.id}>
                          <Table.Cell>{u.id}</Table.Cell>
                          <Table.Cell fontWeight="medium">{u.username}</Table.Cell>
                          <Table.Cell>{u.email}</Table.Cell>
                          <Table.Cell>
                            <Badge
                              bg={roleStyle.bg}
                              color={roleStyle.color}
                              borderWidth="1px"
                              borderColor={roleStyle.borderColor}
                              rounded="full"
                              px="10px"
                              py="4px"
                              fontSize="11px"
                              fontWeight="semibold"
                              textTransform="none"
                              lineHeight="1"
                            >
                              {String(u.role)}
                            </Badge>
                          </Table.Cell>
                          <Table.Cell>
                            <Flex gap={2} flexWrap="wrap">
                              <Button
                                {...tableActionBtnBase}
                                variant="solid"
                                bg="#E2E8F0"
                                color="#334155"
                                _hover={{ bg: "#CBD5E1" }}
                                onClick={() => openEditUser(u)}
                              >
                                Змінити
                              </Button>
                              <Button
                                {...tableActionBtnBase}
                                variant="solid"
                                bg="#FEE2E2"
                                color="#B91C1C"
                                _hover={{ bg: "#FECACA" }}
                                onClick={() => setDeleteUserId(u.id)}
                              >
                                Видалити
                              </Button>
                            </Flex>
                          </Table.Cell>
                        </Table.Row>
                      );
                    })}
                </Table.Body>
              </Table.Root>
            </Box>
            {!usersQ.isPending && totalUsers > 0 ? (
              <AdminTablePagination
                page={userPage}
                pageSize={ADMIN_TABLE_PAGE_SIZE}
                total={totalUsers}
                onPageChange={setUserPage}
                itemsLabel="користувачів"
              />
            ) : null}
          </Box>
        </TabsContent>
      </TabsRoot>

      <Dialog.Root
        open={storeDialog}
        onOpenChange={(d) => {
          setStoreDialog(d.open);
          if (!d.open) setStoreFormErr(null);
        }}
        lazyMount
        unmountOnExit
      >
        <Portal>
          <Dialog.Backdrop bg="blackAlpha.400" />
          <Dialog.Positioner>
            <Dialog.Content maxW="md" mx={4} {...adminDialogContentProps(t)}>
              <Dialog.Header>
                <Dialog.Title>{editingStore ? "Магазин" : "Новий магазин"}</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                {admins.length === 0 ? (
                  <Text fontSize="sm" color="orange.700" mb={2}>
                    Немає користувачів з роллю STORE_ADMINISTRATOR. Створіть такого користувача в
                    вкладці «Користувачі».
                  </Text>
                ) : null}
                {storeFormErr ? (
                  <Text color="red.600" fontSize="sm" mb={2}>
                    {storeFormErr}
                  </Text>
                ) : null}
                <Field.Root mb={3}>
                  <Field.Label color={t.mutedText}>Назва *</Field.Label>
                  <Input value={sName} onChange={(e) => setSName(e.target.value)} {...adminThemedInputProps(t)} />
                </Field.Root>
                <Field.Root mb={3}>
                  <Field.Label color={t.mutedText}>Локація *</Field.Label>
                  <Input
                    value={sLocation}
                    onChange={(e) => setSLocation(e.target.value)}
                    {...adminThemedInputProps(t)}
                  />
                </Field.Root>
                <Field.Root>
                  <Field.Label color={t.mutedText}>Адміністратор магазину *</Field.Label>
                  <NativeSelectRoot>
                    <NativeSelectField
                      value={sAdminId}
                      onChange={(e) => setSAdminId(e.target.value)}
                      {...adminNativeSelectFieldProps(t, isDark)}
                    >
                      <option value="">Оберіть…</option>
                      {admins.map((u) => (
                        <option key={u.id} value={String(u.id)}>
                          {u.username} ({u.email})
                        </option>
                      ))}
                    </NativeSelectField>
                  </NativeSelectRoot>
                </Field.Root>
              </Dialog.Body>
              <Dialog.Footer gap={2}>
                <Button {...adminDialogOutlineButtonProps(t, isDark)} onClick={() => setStoreDialog(false)}>
                  Скасувати
                </Button>
                <Button
                  colorPalette="blue"
                  loading={saveStoreMut.isPending}
                  disabled={admins.length === 0}
                  onClick={() => saveStoreMut.mutate()}
                >
                  Зберегти
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      <Dialog.Root
        open={userDialog}
        onOpenChange={(d) => {
          setUserDialog(d.open);
          if (!d.open) setUserFormErr(null);
        }}
        lazyMount
        unmountOnExit
      >
        <Portal>
          <Dialog.Backdrop bg="blackAlpha.400" />
          <Dialog.Positioner>
            <Dialog.Content maxW="md" mx={4} {...adminDialogContentProps(t)}>
              <Dialog.Header>
                <Dialog.Title>{editingUser ? "Користувач" : "Новий користувач"}</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                {userFormErr ? (
                  <Text color="red.600" fontSize="sm" mb={2}>
                    {userFormErr}
                  </Text>
                ) : null}
                <Field.Root mb={3}>
                  <Field.Label color={t.mutedText}>Username *</Field.Label>
                  <Input
                    value={uUsername}
                    onChange={(e) => setUUsername(e.target.value)}
                    {...adminThemedInputProps(t)}
                  />
                </Field.Root>
                <Field.Root mb={3}>
                  <Field.Label color={t.mutedText}>Email *</Field.Label>
                  <Input
                    type="email"
                    value={uEmail}
                    onChange={(e) => setUEmail(e.target.value)}
                    {...adminThemedInputProps(t)}
                  />
                </Field.Root>
                <Field.Root mb={3}>
                  <Field.Label color={t.mutedText}>Роль *</Field.Label>
                  <NativeSelectRoot>
                    <NativeSelectField
                      value={uRole}
                      onChange={(e) => setURole(e.target.value)}
                      {...adminNativeSelectFieldProps(t, isDark)}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </NativeSelectField>
                  </NativeSelectRoot>
                </Field.Root>
                <Field.Root>
                  <Field.Label color={t.mutedText}>
                    {editingUser ? "Новий пароль (необов’язково)" : "Пароль *"}
                  </Field.Label>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    value={uPassword}
                    onChange={(e) => setUPassword(e.target.value)}
                    placeholder={editingUser ? "Залиште порожнім, якщо не змінюєте" : ""}
                    {...adminThemedInputProps(t)}
                  />
                </Field.Root>
              </Dialog.Body>
              <Dialog.Footer gap={2}>
                <Button {...adminDialogOutlineButtonProps(t, isDark)} onClick={() => setUserDialog(false)}>
                  Скасувати
                </Button>
                <Button colorPalette="blue" loading={saveUserMut.isPending} onClick={() => saveUserMut.mutate()}>
                  Зберегти
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      <ConfirmDialog
        open={deleteStoreId != null}
        onOpenChange={(o) => !o && setDeleteStoreId(null)}
        title="Видалити магазин?"
        body="Переконайтеся, що немає залежних записів."
        confirmLabel="Видалити"
        loading={delStoreMut.isPending}
        onConfirm={() => deleteStoreId != null && delStoreMut.mutate(deleteStoreId)}
      />
      <ConfirmDialog
        open={deleteUserId != null}
        onOpenChange={(o) => !o && setDeleteUserId(null)}
        title="Видалити користувача?"
        body="Користувача буде видалено з системи."
        confirmLabel="Видалити"
        loading={delUserMut.isPending}
        onConfirm={() => deleteUserId != null && delUserMut.mutate(deleteUserId)}
      />
    </Box>
  );
}

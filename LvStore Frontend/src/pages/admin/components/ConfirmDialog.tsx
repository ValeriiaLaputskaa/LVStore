import { Button, Dialog, Portal } from "@chakra-ui/react";
import {
  adminDialogContentProps,
  adminDialogOutlineButtonProps,
  useAdminTheme,
  useAdminThemeTokens,
} from "../theme/AdminThemeContext";

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  body: string;
  confirmLabel?: string;
  onConfirm: () => void;
  loading?: boolean;
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  body,
  confirmLabel = "Підтвердити",
  onConfirm,
  loading = false,
}: ConfirmDialogProps) {
  const t = useAdminThemeTokens();
  const { isDark } = useAdminTheme();
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(d) => onOpenChange(d.open)}
      lazyMount
      unmountOnExit
    >
      <Portal>
        <Dialog.Backdrop bg="blackAlpha.400" />
        <Dialog.Positioner>
          <Dialog.Content maxW="md" mx={4} {...adminDialogContentProps(t)}>
            <Dialog.Header>
              <Dialog.Title fontWeight="semibold">{title}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body color={t.mutedText}>{body}</Dialog.Body>
            <Dialog.Footer gap={2}>
              <Button
                {...adminDialogOutlineButtonProps(t, isDark)}
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Скасувати
              </Button>
              <Button colorPalette="red" onClick={onConfirm} loading={loading}>
                {confirmLabel}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

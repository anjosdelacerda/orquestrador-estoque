import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { Product, useCheckout } from '../../../services/checkoutService';

interface Props {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}

type FeedbackState =
  | { kind: 'idle' }
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string };

const linkSx = {
  cursor: 'pointer',
  textDecoration: 'underline',
  color: 'primary.main',
  fontWeight: 'bold',
};

export function CheckoutModal({ product, open, onClose }: Props) {
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState<FeedbackState>({ kind: 'idle' });

  const quantityRef = useRef<HTMLInputElement>(null);

  const { mutate: checkout, isPending } = useCheckout();

  useEffect(() => {
    setQuantity(1);
    setFeedback({ kind: 'idle' });
  }, [product?.id]);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => quantityRef.current?.focus(), 150);
    return () => clearTimeout(timer);
  }, [open]);

  function handleClose() {
    setQuantity(1);
    setFeedback({ kind: 'idle' });
    onClose();
  }

  function handleConfirm() {
    if (!product) return;
    setFeedback({ kind: 'idle' });

    checkout(
      { productId: product.id, quantity },
      {
        onSuccess: (attempt) => {
          setFeedback({
            kind: 'success',
            message: `Pedido #${attempt.id.slice(0, 8)} concluído com sucesso!`,
          });
        },
        onError: (error) => {
          let msg = 'Erro inesperado.';
          if (axios.isAxiosError(error)) {
            const raw = error.response?.data?.message;
            msg = Array.isArray(raw) ? raw.join(', ') : (raw ?? msg);
          }
          setFeedback({ kind: 'error', message: msg });
        },
      },
    );
  }

  if (!product) return null;

  const totalFormatted = ((product.priceInCents * quantity) / 100).toLocaleString(
    'pt-BR',
    { style: 'currency', currency: 'BRL' },
  );

  const isIdle = feedback.kind === 'idle';

  return (
    <Dialog
      open={open}
      onClose={!isPending ? handleClose : undefined}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>{product.name}</DialogTitle>

      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} pt={1}>
          {feedback.kind === 'success' && (
            <Alert severity="success">{feedback.message}</Alert>
          )}

          {feedback.kind === 'error' && (
            <Alert severity="error">
              <Typography variant="body2">{feedback.message}</Typography>
              <Typography variant="body2" mt={0.5}>
                Tente novamente mais tarde.
              </Typography>
            </Alert>
          )}

          {isIdle && (
            <>
              <TextField
                inputRef={quantityRef}
                label="Quantidade"
                type="number"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, Number(e.target.value)))
                }
                inputProps={{ min: 1, max: product.stockQuantity }}
                disabled={isPending}
                fullWidth
              />
              <Typography variant="body1">
                Total: <strong>{totalFormatted}</strong>
              </Typography>
            </>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        {isIdle ? (
          <>
            <Button
              onClick={handleClose}
              disabled={isPending}
              variant="contained"
              color="error"
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleConfirm}
              disabled={isPending}
              startIcon={
                isPending ? (
                  <CircularProgress size={16} color="inherit" />
                ) : undefined
              }
            >
              {isPending ? 'Processando...' : 'Confirmar compra'}
            </Button>
          </>
        ) : feedback.kind === 'success' ? (
          <Typography component="span" onClick={handleClose} sx={linkSx}>
            Continue comprando
          </Typography>
        ) : (
          <Typography component="span" onClick={handleClose} sx={linkSx}>
            Home
          </Typography>
        )}
      </DialogActions>
    </Dialog>
  );
}

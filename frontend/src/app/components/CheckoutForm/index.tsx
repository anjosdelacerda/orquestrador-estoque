import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import axios from 'axios';
import { useState } from 'react';
import { useCheckout, useProducts } from '../../../services/checkoutService';

export function CheckoutForm() {
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: products, isLoading: loadingProducts } = useProducts();
  const { mutate: checkout, isPending } = useCheckout();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    checkout(
      { productId, quantity },
      {
        onSuccess: (attempt) => {
          setSuccessMessage(
            `Pedido #${attempt.id.slice(0, 8)} concluído com sucesso!`,
          );
          setProductId('');
          setQuantity(1);
        },
        onError: (error) => {
          if (axios.isAxiosError(error)) {
            const msg = error.response?.data?.message;
            setErrorMessage(
              Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Erro inesperado.'),
            );
          } else {
            setErrorMessage('Erro inesperado.');
          }
        },
      },
    );
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      display="flex"
      flexDirection="column"
      gap={3}
    >
      {successMessage && (
        <Alert severity="success" onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {errorMessage && (
        <Alert severity="error" onClose={() => setErrorMessage(null)}>
          {errorMessage}
        </Alert>
      )}

      <FormControl fullWidth disabled={isPending || loadingProducts} required>
        <InputLabel>Produto</InputLabel>
        <Select
          value={productId}
          label="Produto"
          onChange={(e) => setProductId(e.target.value)}
        >
          {products?.map((p) => (
            <MenuItem key={p.id} value={p.id}>
              {p.name} —{' '}
              {(p.priceInCents / 100).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}{' '}
              (estoque: {p.stockQuantity})
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        label="Quantidade"
        type="number"
        value={quantity}
        onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
        inputProps={{ min: 1 }}
        disabled={isPending}
        required
        fullWidth
      />

      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={isPending || !productId}
        startIcon={
          isPending ? <CircularProgress size={18} color="inherit" /> : undefined
        }
      >
        {isPending ? 'Processando...' : 'Finalizar Compra'}
      </Button>
    </Box>
  );
}

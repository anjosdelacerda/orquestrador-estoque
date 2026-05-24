import { Container, Paper, Typography } from '@mui/material';
import { CheckoutForm } from '../../components/CheckoutForm';

export function CheckoutPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Checkout
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={4}>
        Selecione um produto e a quantidade para finalizar a compra.
      </Typography>
      <Paper elevation={2} sx={{ p: 4 }}>
        <CheckoutForm />
      </Paper>
    </Container>
  );
}

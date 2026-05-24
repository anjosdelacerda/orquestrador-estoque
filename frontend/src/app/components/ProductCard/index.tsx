import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Tooltip,
  Typography,
} from '@mui/material';
import { Product } from '../../../services/checkoutService';

interface Props {
  product: Product;
  onBuy: () => void;
}

export function ProductCard({ product, onBuy }: Props) {
  const priceFormatted = (product.priceInCents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  const outOfStock = product.stockQuantity === 0;

  const displayName =
    product.name.length > 30
      ? `${product.name.slice(0, 27)}...`
      : product.name;

  return (
    <Card
      sx={{
        height: '100%',
        width: '100%',
        minWidth: '280px',
        display: 'flex',
        flexDirection: 'column',
      }}
      elevation={2}
    >
      <CardMedia
        component="img"
        height="220"
        image={product.image}
        alt={product.name}
        sx={{ objectFit: 'contain' }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Tooltip title={product.name}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            {displayName}
          </Typography>
        </Tooltip>
        <Typography variant="body2" color="text.secondary">
          {priceFormatted}
        </Typography>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button
          variant="contained"
          fullWidth
          onClick={onBuy}
          disabled={outOfStock}
        >
          {outOfStock ? 'Sem estoque' : 'Comprar'}
        </Button>
      </CardActions>
    </Card>
  );
}

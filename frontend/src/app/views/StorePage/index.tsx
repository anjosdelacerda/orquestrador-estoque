import { Box, Container, Grid, TextField } from '@mui/material';
import { useState } from 'react';
import { Product, useProducts } from '../../../services/checkoutService';
import { CheckoutModal } from '../../components/CheckoutModal';
import { Navbar } from '../../components/Navbar';
import { ProductCard } from '../../components/ProductCard';

export function StorePage() {
  const { data: products = [] } = useProducts();
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  function handleModalClose() {
    setSearch('');
    setSelectedProduct(null);
  }

  return (
    <Box>
      <Navbar />

      <Container maxWidth="lg" sx={{ mt: 10, minHeight: '100vh', py: 3 }}>
        <TextField
          placeholder="Buscar produto por nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
          size="small"
          sx={{ mb: 3 }}
        />

        <Grid container spacing={3} alignItems="flex-start">
          {filtered.map((product) => (
            <Grid item key={product.id} xs={12} md={4}>
              <ProductCard
                product={product}
                onBuy={() => setSelectedProduct(product)}
              />
            </Grid>
          ))}
        </Grid>
      </Container>

      <CheckoutModal
        product={selectedProduct}
        open={selectedProduct !== null}
        onClose={handleModalClose}
      />
    </Box>
  );
}

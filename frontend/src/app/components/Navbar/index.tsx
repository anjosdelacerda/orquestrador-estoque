import { AppBar, Toolbar, Typography } from '@mui/material';

export function Navbar() {
  return (
    <AppBar position="fixed" elevation={0} sx={{ bgcolor: '#1a1a1a', width: '100%' }}>
      <Toolbar>
        <Typography variant="h6" fontWeight="bold" letterSpacing={1}>
          CaseCellShop
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

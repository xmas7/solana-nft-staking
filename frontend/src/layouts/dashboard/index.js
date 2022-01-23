import { useState } from 'react';
import { Outlet } from 'react-router-dom';
// material
import { styled } from '@mui/material/styles';
//
import DashboardNavbar from './DashboardNavbar';
import { Wallets } from '../../components/wallet'

import { SnackbarProvider } from 'notistack';

// ----------------------------------------------------------------------

const APP_BAR_MOBILE = 64;
const APP_BAR_DESKTOP = 92;

const RootStyle = styled('div')({
  display: 'flex',
  minHeight: '100%',
  overflow: 'hidden'
});

const MainStyle = styled('div')(({ theme }) => ({
  flexGrow: 1,
  overflow: 'auto',
  minHeight: '100%',
  paddingTop: APP_BAR_MOBILE + 24,
  paddingBottom: theme.spacing(10),
  [theme.breakpoints.up('xl')]: {
    paddingTop: APP_BAR_DESKTOP + 24,
  }
}));

// ----------------------------------------------------------------------

export default function DashboardLayout() {
  const [open, setOpen] = useState(false);

  return (
    <RootStyle>
      
      <SnackbarProvider>
        <Wallets>
          <DashboardNavbar onOpenSidebar={() => setOpen(true)} />
          <MainStyle>
            <Outlet />
          </MainStyle>
        </Wallets>
      </SnackbarProvider>
    </RootStyle>
  );
}

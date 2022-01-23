import PropTypes from 'prop-types';
// material
import { alpha, styled } from '@mui/material/styles';
import { Box, AppBar, Toolbar, Grid } from '@mui/material';
// components

//
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@material-ui/core';

import {
  WalletDialogProvider as MaterialUIWalletDialogProvider,
  WalletMultiButton as MaterialUIWalletMultiButton,
} from '@solana/wallet-adapter-material-ui';


// ----------------------------------------------------------------------

const DRAWER_WIDTH = 0;
const APPBAR_MOBILE = 34;
const APPBAR_DESKTOP = 60;

const RootStyle = styled(AppBar)(({ theme }) => ({
  boxShadow: 'none',
  backdropFilter: 'blur(6px)',
  WebkitBackdropFilter: 'blur(6px)', // Fix on Mobile
  backgroundColor: alpha(theme.palette.background.default, 0.72),
  [theme.breakpoints.up('xl')]: {
    width: `calc(100% - ${DRAWER_WIDTH + 1}px)`
  }
}));

const ToolbarStyle = styled(Toolbar)(({ theme }) => ({
  minHeight: APPBAR_MOBILE,
  [theme.breakpoints.up('xl')]: {
    minHeight: APPBAR_DESKTOP,
    padding: theme.spacing(0, 5)
  }
}));

// ----------------------------------------------------------------------

DashboardNavbar.propTypes = {
  onOpenSidebar: PropTypes.func
};

export default function DashboardNavbar({ onOpenSidebar }) {
  return (
    <RootStyle>
      <ToolbarStyle>
          <Grid container>
            <Grid item xs={10}>
              <Box style={{ color: 'black', fontSize: '30px', fontWeight: 'bold' }}>Hall of Heros - Present your Hero Image Here</Box>
            </Grid>
            <Grid item xs={2}>
              
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <MaterialUIWalletMultiButton />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Grid>
          </Grid>
      </ToolbarStyle>
    </RootStyle>
  );
}

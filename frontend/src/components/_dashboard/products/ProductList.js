import PropTypes from 'prop-types';
// material
import { Grid } from '@mui/material';
import ShopProductCard from './ProductCard';
import {
  useModalContext
} from '../../../contexts/ProductModalContext';
// ----------------------------------------------------------------------

ProductList.propTypes = {
  products: PropTypes.array.isRequired
};

export default function ProductList({ ...other }) {
  
  const { contents } = useModalContext();
  return (
    <Grid container spacing={1} {...other}>
      {contents.map((product, i) => (
        <Grid key={/*product.id*/ i} item style={{width:'12%'}}>
          <ShopProductCard product={product} />
        </Grid>
      ))}
    </Grid>
  );
}

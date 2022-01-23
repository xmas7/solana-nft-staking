import PropTypes from 'prop-types';
import bs58 from 'bs58';
// material
import { Box, Card, Link, Typography, Stack, Button } from '@mui/material';
import { styled } from '@mui/material/styles';

import Label from '../../Label';
import { getFormattedPrice, decoratePubKey } from '../../../contexts/utils'
import {
  useModalContext
} from '../../../contexts/ProductModalContext';
import { InlineIcon } from '@iconify/react';

// ----------------------------------------------------------------------

const ProductImgStyle = styled('img')({
  top: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  position: 'absolute'
});

// ----------------------------------------------------------------------

ShopProductCard.propTypes = {
  product: PropTypes.object
};


export default function ShopProductCard({ product }) {
  const { toggleModal, setNftModalInfo } = useModalContext();
  const { last_price, listed_price, key_nft, hero_id, content_uri, image_uri, name, owner } = product;

  const onDetailClick = () => {
    console.log("on detail click");
    setNftModalInfo(product);
    toggleModal();
  }
  /*
  const onUpdateContent = () => {
    setNftModalInfo(product);
    toggleModal();
  }*/
  

  return (
    <Card>
        {
        <Link pt={1} href={owner === null || owner === undefined ? "#":"https://solscan.io/account/" + owner.toBase58() + "?cluster=devnet"} target="_blank" underline="none">
            <Typography variant="subtitle2" noWrap mt={2} style={{textAlign: 'left'}} >
            <Button variant="outlined" style={{width: '100%'}}>owner: { owner ? decoratePubKey(owner) : '----' }</Button>
            </Typography>
          
        </Link>
        }
        
      <Box sx={{ pt: '100%', position: 'relative' }}>

        <Link href={image_uri} target="_blank">
          <ProductImgStyle alt={name} src={image_uri} />
        </Link>
      </Box>

      <Stack spacing={1} sx={{ p: 3 }}>

        <Typography component="div" variant="subtitle2">
            Seat #{hero_id+1}
        </Typography>

        <Link href={key_nft == undefined ? '#': "https://solscan.io/account/" + key_nft.toBase58() + "?cluster=devnet"} target="_blank">
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="subtitle2" noWrap>
            {name}
            </Typography>
            <Typography variant="subtitle2">
              <InlineIcon icon="bi:arrow-right"/>
            </Typography>
          </Stack>
        </Link>

        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle1">
            <Typography
              component="span"
              variant="body1"
              sx={{
                color: 'text.disabled',
                textDecoration: 'line-through'
              }}
            >
              {getFormattedPrice(last_price ) + " SOL"}
            </Typography>
            &nbsp;
            {getFormattedPrice(listed_price) + " SOL"}
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Button
            variant="contained"
            onClick={() => {onDetailClick()}}
          >
              Details
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
}

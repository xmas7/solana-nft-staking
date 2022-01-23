import React, { useState, useEffect } from 'react';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import LoadingButton from '@mui/lab/LoadingButton'
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { toast } from 'react-toastify';
import BN from 'bn.js';
import { useWallet } from "@solana/wallet-adapter-react";
import { InlineIcon } from '@iconify/react';
import {
  useModalContext
} from '../contexts/ProductModalContext';
import { getFormattedPrice } from '../contexts/utils';
import { updateRecord, buyNFT } from '../contexts/helpers';
import { PublicKey } from '@solana/web3.js';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '70%',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

export default function TransitionsModal() {
  
  const { modalOpened, toggleModal, nftModalInfo, updateData } = useModalContext();
  const wallet = useWallet();
  const [newPrice, setNewPrice] = useState(0);
  const [updateEnabled, setUpdateEnabled] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [buyLoading, setBuyLoading] = useState(false);
  const [contentURI, setContentURI] = useState('');
  const { hero_id, key_nft, content_uri, last_price, listed_price, name, image_uri, owner } = nftModalInfo;

  useEffect(() => {
    setUpdateEnabled(false);
    setContentURI(content_uri);
  }, [content_uri]);

  const onListedPriceChange = (e) => {
    console.log(e.target.value);
    if (e.target.value.trim() !== '') {
      let newP = parseFloat(e.target.value);
      if (newP) {
        setNewPrice(newP);
        setUpdateEnabled(true);
      }
    } else {
      setNewPrice(0);
      setUpdateEnabled(false);
    }
  }
  const showToast = () => {
    toast.error('Connect your Wallet', {
      position: "bottom-left",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      type: toast.TYPE.ERROR,
      theme: 'colored'
    });
  }

  const onContentUriChange = (e) => {
    console.log(e.target.value);
    setContentURI(e.target.value);        
    setUpdateEnabled(true);
    setUpdateLoading(false);
  }
  

  const updateNFT = () => {
    if (wallet.connected) {
      console.log("wallet connected");
      setUpdateLoading(true);
      let priceToUpdate = (newPrice === 0?listed_price:new BN(newPrice * 1000_000_000));
      updateRecord(hero_id, key_nft, priceToUpdate, contentURI, wallet)
      .then((updateSucceed) => {
        setUpdateLoading(false);
        console.log("updateNFT updateSucceed=", updateSucceed);
        if (updateSucceed === true) {
          updateData(hero_id, priceToUpdate, contentURI, owner);
        }
      });
     // console.log("wallet connected. ", wallet.publicKey.toBase58());
    } else {
      showToast();
    }
  }

  const onBuyClick = () => {
    if (wallet.connected) {
      console.log("wallet connected");
      let nftkey = new PublicKey(key_nft);
      setBuyLoading(true);
      buyNFT(nftModalInfo, nftkey, wallet).then((buySucceed) => {
        setBuyLoading(false);
        if (buySucceed) {
          updateData(hero_id, listed_price, content_uri, wallet.publicKey);
        }
      });
    } else {
      showToast();
    }
  }
  return (
    <div>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={modalOpened}
        onClose={toggleModal}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={modalOpened}>
          <Box sx={style}>
            <Card sx={{ display: 'flex' }}>
              <CardMedia
                component="img"
                sx={{ width: '45%', maxHeight: '500px' }}
                image={image_uri}
                alt="nft image"
              />
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flex: '1 0 auto' }}>
                  <Typography component="div" variant="h4">
                    Seat #{hero_id+1}
                  </Typography>
                  <Typography component="div" variant="h6">
                    { name }
                  </Typography>
                  
                  <Typography variant="subtitle2" noWrap mt={1}>
                      <InlineIcon icon={"clarity:align-left-text-line"}/> Owner
                  </Typography>
                  {
                  <Link href={!owner? '#' : "https://solscan.io/account/" + owner.toBase58() + "?cluster=devnet"} target="_blank" underline="hover" key={0}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Typography variant="subtitle2" noWrap>
                      { !owner? '----': owner.toBase58() }
                      </Typography>
                      <Typography variant="subtitle2">
                        <InlineIcon icon="bi:arrow-right"/>
                      </Typography>
                    </Stack>
                  </Link>
                  }
                  <Stack direction="row"  alignItems="center" justifyContent="space-between" 
                        divider={<Divider orientation="vertical" flexItem />} spacing={2} mt={2}>
                    <Card style={{width: '50%'}}>
                      <CardHeader title="Last price"/>
                      <CardContent>
                      <h2>{ getFormattedPrice(last_price) } SOL</h2>
                      </CardContent>
                    </Card>
                    <Card  style={{width: '50%'}}>
                      <CardHeader title="Listed price"/>
                      <CardContent pt={0}>
                        <Stack direction="row" spacing={3}>
                          {
                            <TextField id="outlined-basic" label={getFormattedPrice(listed_price)} variant="outlined" onChange={(e) => onListedPriceChange(e)} />
                          }
                          <h2>SOL</h2>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Stack>
                  
                  <FormControl fullWidth  style={{width: '100%'}}>
                      <TextField
                        id="outlined-adornment-amount"
                        value={contentURI}
                        onChange={(e) => onContentUriChange(e)}
                        label="Content URI"
                        placeholder=''
                      />
                  </FormControl>

                </CardContent>
                <Box sx={{ display: 'flex', alignItems: 'right', pl: 1, pb: 1 }}>
                  <Stack direction="row" spacing={3} ml={2}>
                    
                    <LoadingButton
                      loading={buyLoading}
                      loadingPosition="start"
                      startIcon={<MonetizationOnIcon />}
                      onClick={() => {onBuyClick()}}
                      size="large"
                      variant="contained">
                      Buy NFT
                    </LoadingButton>
                  
                    {
                      updateEnabled ?
                      <LoadingButton
                        loading={updateLoading}
                        loadingPosition="start"
                        startIcon={<ArrowCircleUpIcon />}
                        onClick={() => {updateNFT()}}
                        size="large"
                        variant="outlined">
                        Update NFT
                      </LoadingButton>:
                      <Button variant="outlined" startIcon={<ArrowCircleUpIcon />} size="large" disabled> Update NFT</Button>
                    }
                    <Button size="large" onClick={() => toggleModal()}> Cancel </Button>
                  </Stack>
                </Box>
                
              </Box>

            </Card>
          </Box>
        </Fade>
      </Modal>
    </div>
  );
}

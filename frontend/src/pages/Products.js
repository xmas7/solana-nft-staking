
import { useState } from 'react';
import { useEffect } from 'react';
// material
import { Container, Stack } from '@mui/material';
// components
import Page from '../components/Page';
import {
  ProductSort,
  ProductList,
} from '../components/_dashboard/products';

import TransitionsModal from '../components/TransitionsModal';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {
  ModalContext
} from '../contexts/ProductModalContext';

import { getFormattedPrice } from '../contexts/utils'

import {
  getFullContents, getContent
} from '../contexts/helpers';

// ----------------------------------------------------------------------

export default function EcommerceShop() {
  
  const [openFilter, setOpenFilter] = useState(false);
  const [contents, setContents] = useState([]);
  const [modalOpened, setModalOpened] = useState(false);
  const [isDetailModal, setIsDetailModal] = useState(true);
  const toggleModal= ()=>{
    setModalOpened(!modalOpened);
  }
  const [nftModalInfo, setNftModalInfo] = useState({});

  useEffect(() => {
    getFullContents().then((arrRecords) => {
      setContents(arrRecords);
    });
  }, []);

  const updateData = (
    hero_id, listed_price, content_uri, owner 
  ) => {
    console.log("updateData ", hero_id, listed_price, content_uri, owner);
    let tempContents = contents;
    tempContents[hero_id].listed_price = listed_price;
    tempContents[hero_id].owner = owner;
    if (contents[hero_id].content_uri !== content_uri) {
      console.log("updateData content_uri not same");
      getContent(tempContents[hero_id]).then((tempRecord) => {
        tempContents[hero_id] = tempRecord;
        console.log("updateData content_uri fetched", tempRecord);
        setContents(tempContents);
      });
    } else {    
      tempContents[hero_id].content_uri = content_uri;
      setContents(tempContents);
    } 
    /*getFullContents().then((arrRecords) => {
      console.log("updateDAta =", arrRecords);
      console.log(arrRecords[2].listed_price.toNumber());
      console.log(getFormattedPrice(arrRecords[2].listed_price));
      setContents(arrRecords);
    });*/
    
  }

  return (
    <ModalContext.Provider 
      value = {{
        toggleModal,
        setNftModalInfo,
        modalOpened,
        nftModalInfo,
        isDetailModal,
        setIsDetailModal,
        updateData,
        contents
      }}>
      <Page title="Dashboard: Products | Minimal-UI" ml={5}>
          <Stack
            direction="row"
            flexWrap="wrap-reverse"
            alignItems="center"
            justifyContent="flex-end"
          >
            <Stack direction="row" spacing={1} flexShrink={0} sx={{ my: 1 }}>
              <ProductSort />
            </Stack>
          </Stack>

          <ProductList/>
          <TransitionsModal/>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
      </Page>
    </ModalContext.Provider>
  );
}

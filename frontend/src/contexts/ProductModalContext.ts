import { PublicKey } from '@solana/web3.js';
import React, { useContext } from 'react';
import { ContentRecord } from './utils.js';
import BN from 'bn.js';

interface IProductModalContext {
    modalOpened: boolean;
    toggleModal?: () => void;
    nftModalInfo: {};
    setNftModalInfo?: () => void;
    updateData?: (
      args: {
        hero_id : number, 
        listed_price: BN,
        content_uri: string,
        owner: PublicKey
      }) => void;
    contents: ContentRecord[];
  }
  
  const defaultState = {
    modalOpened: false,
    nftModalInfo: {},
    isDetailModal: true,
    contents: []
  };
  
  export const ModalContext = React.createContext<IProductModalContext>(defaultState);

  export const useModalContext = () => useContext(ModalContext);
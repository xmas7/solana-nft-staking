
import { useState } from 'react';
import { useEffect } from 'react';
import { Button, Stack, Grid } from '@mui/material';
import Page from '../components/Page';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useWallet } from "@solana/wallet-adapter-react";
import {
  initProject, 
  stakeToLottery, 
  withdrawFromLottery, 
  stakeToFixed, 
  withdrawFromFixed, 
  getLotteryState, 
  getFixedState, 
  getGlobalState
} from '../contexts/helpers';
import { getDateStr, getReward } from '../contexts/utils';

export default function EcommerceShop() {
  const [lotteryNftMint, setLotteryNFTMint] = useState("");
  const [fixedNftMint, setFixedNFTMint] = useState("");
  const [lotteryState, setLotteryState] = useState({ itemCount: 0, items: [] });
  const [fixedState, setFixedState] = useState({ itemCount: 0, items: [] });
  const [globalState, setGlobalState] = useState({ lotteryNftCount: 0, fixedNftCount: 0});
  const wallet = useWallet();

  useEffect(() => {
    updateLotteryPoolState(wallet.publicKey);
    updateFixedPoolState(wallet.publicKey);
  }, [wallet])

  const updateLotteryPoolState = (addr) => {
    console.log("updateLotteryPoolState");
    getLotteryState(addr).then(result => {
      if(result !== null) {
        setLotteryState({
          itemCount: result.itemCount.toNumber(),
          items: result.items.slice(0, result.itemCount.toNumber())
        })
      }
    })
    getGlobalState().then(result => {
      setGlobalState({
        lotteryNftCount: result.lotteryNftCount.toNumber(),
        fixedNftCount: result.fixedNftCount.toNumber()
      })
    })
  }
  const updateFixedPoolState = (addr) => {
    getFixedState(addr).then(result => {
      if(result !== null) {
        setFixedState({
          itemCount: result.itemCount.toNumber(),
          items: result.items.slice(0, result.itemCount.toNumber())
        })
      }
    })
    getGlobalState().then(result => {
      setGlobalState({
        lotteryNftCount: result.lotteryNftCount.toNumber(),
        fixedNftCount: result.fixedNftCount.toNumber()
      })
    })
  }
  
  const onInitClick = () => {
    initProject(wallet).then(() => {
      updateLotteryPoolState(wallet.publicKey);
      updateFixedPoolState(wallet.publicKey);
    });
  }
  const onStakeToLottery = () => {
    stakeToLottery(wallet, lotteryNftMint).then(() => {
      updateLotteryPoolState(wallet.publicKey)
    });
  }
  const onWithdrawFromLottery = () => {
    withdrawFromLottery(wallet, lotteryNftMint).then(() => {
      updateLotteryPoolState(wallet.publicKey)
    });
  }
  const onStakeToFixed = () => {
    stakeToFixed(wallet, fixedNftMint).then(() => {
      updateFixedPoolState(wallet.publicKey)
    });
  }
  const onWithdrawFromFixed = () => {
    withdrawFromFixed(wallet, fixedNftMint).then(() => {
      updateFixedPoolState(wallet.publicKey)
    });
  }
  return (
      <Page title="Dashboard: Products | Minimal-UI" ml={5}>
          <button onClick={() => onInitClick()}>Init Project</button>
          <Grid container spacing={2}>
            <Grid item xs={5}>
              <Stack direction="column" spacing={2}>
                <h3>Lottery Pool : Total {globalState.lotteryNftCount}</h3>
                <input type="text" id="nft_mint" value={lotteryNftMint} onChange={(e) => setLotteryNFTMint(e.target.value)}></input>
                <button onClick={() => onStakeToLottery()}>Stake To Lottery Pool</button>
                <button onClick={() => onWithdrawFromLottery()}>Withdraw From Lottery Pool</button>
                <h5>My Staked NFTs in Lottery: {lotteryState.itemCount}</h5>
                {
                  lotteryState.items.map((item, id) => (
                      <h6 key={id}>{getDateStr(item.stakeTime) + " >>> " + item.nftAddr.toBase58()}</h6>
                  ))
                }
              </Stack>
            </Grid>
            <Grid item xs={5}>  
              <Stack direction="column" spacing={2}>
                  <h3>Fixed Pool : Total {globalState.fixedNftCount}</h3>
                  <input type="text" id="nft_mint1" value={fixedNftMint}  onChange={(e) => setFixedNFTMint(e.target.value)}></input>
                  <button onClick={() => onStakeToFixed()}>Stake To Fixed Pool</button>
                  <button onClick={() => onWithdrawFromFixed()}>Withdraw From Fixed Pool</button>
                  <h5>My Staked NFTs in Fixed Pool: {fixedState.itemCount}</h5>
                  {
                    fixedState.items.map((item, id) => (
                        <h6 key={id}>{getDateStr(item.stakeTime) + "<<<  " + getReward(item.stakeTime) + "SOL  >>> " + item.nftAddr.toBase58()}</h6>
                    ))
                  }
              </Stack>
            </Grid>
          </Grid>
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
  );
}

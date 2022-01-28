
import { web3 } from '@project-serum/anchor';
import { Keypair, 
        PublicKey,
        SystemProgram,
        SYSVAR_RENT_PUBKEY,
        Transaction,
        TransactionInstruction,
        sendAndConfirmTransaction } from '@solana/web3.js';
import { Token, TOKEN_PROGRAM_ID, AccountLayout, MintLayout } from "@solana/spl-token";
import * as borsh from 'borsh';
import bs58 from 'bs58';
import * as anchor from '@project-serum/anchor';
import { showToast } from './utils';
import BN from 'bn.js';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { IDL } from './anchor_idl/idl/staking_program';

const solConnection = new web3.Connection(web3.clusterApiUrl("devnet"));

const ASSOCIATED_TOKEN_PROGRAM_ID: PublicKey = new PublicKey(
  'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
);
const PROGRAM_ID = "8bAT4L4Z42frstG3dFasUMRd96L4a7EjUUvRiF9EwGVN";
const GLOBAL_AUTHORITY_SEED = "global-authority";
const GLOBAL_LOTTERY_POOL_KEY = new PublicKey("JEEAt2Ask8RT68T47feDcNxnj7jvSmgeP4CCNFMvjMPy");
const POOL_WALLET_SEED = "pool-wallet";
const POOL_SIZE = 2064;
const GLOBAL_POOL_SIZE = 360_016;

export const initProject = async (
  wallet: WalletContextState
) => {
  console.log("on Init click");
  if (!wallet.publicKey) return;
  let cloneWindow: any = window;
  let provider = new anchor.Provider(solConnection, cloneWindow['solana'], anchor.Provider.defaultOptions())
  const program = new anchor.Program(IDL, PROGRAM_ID, provider);

  const [globalAuthority, bump] = await PublicKey.findProgramAddress(
    [Buffer.from(GLOBAL_AUTHORITY_SEED)],
    program.programId
  );
  const [poolWalletKey, walletBump] = await PublicKey.findProgramAddress(
    [Buffer.from(POOL_WALLET_SEED)],
    program.programId
  );
  let global_lottery = anchor.web3.Keypair.generate();
  let ix = SystemProgram.createAccount({
    fromPubkey: wallet.publicKey,
    newAccountPubkey: global_lottery.publicKey,
    lamports : await provider.connection.getMinimumBalanceForRentExemption(GLOBAL_POOL_SIZE),
    space: GLOBAL_POOL_SIZE,
    programId: program.programId,
  })

  console.log("globalLotteryPoolKey =", global_lottery.publicKey.toBase58())

  const tx = await program.rpc.initialize(
    bump, walletBump, {
      accounts: {
        admin: wallet.publicKey,
        globalAuthority,
        globalLotteryPool: global_lottery.publicKey,
        poolWallet: poolWalletKey,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY
      },
      instructions: [ix, 
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: poolWalletKey,
          lamports: 20000000
        })
      ],
      signers: [global_lottery]
    }
  );
  await solConnection.confirmTransaction(tx, "confirmed");

  showToast("Success. txHash=" + tx, 0);
  console.log("txHash =", tx);
  return false;
}

export const getLotteryState = async (
  userAddress: PublicKey
) : Promise<Object | null> => {
  console.log("getLotteryState userAddress =", userAddress);
  if (!userAddress) return null;
  let cloneWindow: any = window;
  let provider = new anchor.Provider(solConnection, cloneWindow['solana'], anchor.Provider.defaultOptions())
  const program = new anchor.Program(IDL, PROGRAM_ID, provider);
  
  let userLotteryPoolKey = await PublicKey.createWithSeed(
    userAddress,
    "user-lottery-pool",
    program.programId,
  );
  
  const [poolWalletKey, walletBump] = await PublicKey.findProgramAddress(
    [Buffer.from(POOL_WALLET_SEED)],
    program.programId
  );
  
  console.log("poolWalletKey = ", poolWalletKey.toBase58());
  //try {
    console.log("userAddress = ", userAddress.toBase58());
    console.log("userLotteryPoolKey = ", userLotteryPoolKey.toBase58());
    let lotteryPoolState = await program.account.userPool.fetch(userLotteryPoolKey);
    console.log("lotteryPoolState = ", lotteryPoolState);
    return lotteryPoolState;
  //} catch {
  //  console.log("catch error");
  //  return null;
  //}
}

export const getFixedState = async (
  userAddress: PublicKey
) : Promise<Object | null> => {
  if (!userAddress) return null;
  let cloneWindow: any = window;
  let provider = new anchor.Provider(solConnection, cloneWindow['solana'], anchor.Provider.defaultOptions())
  const program = new anchor.Program(IDL, PROGRAM_ID, provider);
  
  let userFixedPoolKey = await PublicKey.createWithSeed(
    userAddress,
    "user-fixed-pool",
    program.programId,
  );
  try {
    let fixedPoolState = await program.account.userPool.fetch(userFixedPoolKey);
    
    console.log("fixedPoolState.itemCount =", fixedPoolState.itemCount.toNumber());
    let data: any = fixedPoolState;
    console.log("fixedPoolState.items[0] =", data.items[0].stakeTime.toNumber());
    console.log("fixedPoolState.items[1] =", data.items[1].stakeTime.toNumber());
    console.log("fixedPoolState.rewardTime =", fixedPoolState.rewardTime.toNumber());
    return fixedPoolState;
  } catch {
    return null;
  }
}

export const getGlobalState = async (
) : Promise<Object | null> => {
  let cloneWindow: any = window;
  let provider = new anchor.Provider(solConnection, cloneWindow['solana'], anchor.Provider.defaultOptions())
  const program = new anchor.Program(IDL, PROGRAM_ID, provider);
  const [globalAuthority, bump] = await PublicKey.findProgramAddress(
    [Buffer.from(GLOBAL_AUTHORITY_SEED)],
    program.programId
  );
  try {
    let globalState = await program.account.globalPool.fetch(globalAuthority);
    return globalState;
  } catch {
    return { lotteryNftCount: new BN(0), fixedNftCount: new BN(0)};
  }
}

export const stakeToLottery = async (
  wallet: WalletContextState,
  mint: string
) => {
  if (!wallet.publicKey || mint === "") return;
  
  let cloneWindow: any = window;
  let provider = new anchor.Provider(solConnection, cloneWindow['solana'], anchor.Provider.defaultOptions())
  const program = new anchor.Program(IDL, PROGRAM_ID, provider);

  const nft_mint = new PublicKey(mint);
  const [globalAuthority, bump] = await PublicKey.findProgramAddress(
    [Buffer.from(GLOBAL_AUTHORITY_SEED)],
    program.programId
  );
  let userLotteryPoolKey = await PublicKey.createWithSeed(
    wallet.publicKey,
    "user-lottery-pool",
    program.programId,
  );

  let tx = new Transaction();

  let lotteryAccount = await solConnection.getAccountInfo(userLotteryPoolKey);
  if (lotteryAccount === null || lotteryAccount.data === null) {
    tx.add(SystemProgram.createAccountWithSeed({
      fromPubkey: wallet.publicKey,
      basePubkey: wallet.publicKey,
      seed: "user-lottery-pool",
      newAccountPubkey: userLotteryPoolKey,
      lamports : await provider.connection.getMinimumBalanceForRentExemption(POOL_SIZE),
      space: POOL_SIZE,
      programId: program.programId,
    }));
    tx.add(program.instruction.initializeLotteryPool(
      {
        accounts: {
          userLotteryPool: userLotteryPoolKey,
          owner: wallet.publicKey
        }
      }
    ))
  }

  const [staked_nft_address, nft_bump] = await PublicKey.findProgramAddress(
    [Buffer.from("staked-nft"), nft_mint.toBuffer()],
    program.programId
  );
  let userTokenAccount = await getNFTTokenAccount(nft_mint);

  console.log("program.programId =", program.programId.toBase58());
  console.log("userLotteryPool =", userLotteryPoolKey.toBase58());
  console.log("globalLotteryPoolKey =", GLOBAL_LOTTERY_POOL_KEY.toBase58());
  console.log("globalAuthority =", globalAuthority.toBase58());
  console.log("userTokenAccount =", userTokenAccount.toBase58());
  console.log("staked_nft_address =", staked_nft_address.toBase58());
  console.log("nft_mint =", nft_mint.toBase58());
  console.log("TOKEN_PROGRAM_ID =", TOKEN_PROGRAM_ID.toBase58());

  tx.add(program.instruction.stakeNftToLottery(
    bump, nft_bump, {
      accounts: {
        owner: wallet.publicKey,
        userLotteryPool: userLotteryPoolKey,
        globalLotteryPool: GLOBAL_LOTTERY_POOL_KEY,
        globalAuthority,
        userNftTokenAccount: userTokenAccount,
        destNftTokenAccount: staked_nft_address,
        nftMint: nft_mint,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY
      }
    }
  ));
  let txHash = await wallet.sendTransaction(tx, solConnection);
  await solConnection.confirmTransaction(txHash, "confirmed");
  showToast("Success. txHash=" + txHash, 0);
  console.log("txHash =", txHash);
  return false;
}

export const withdrawFromLottery = async (
  wallet: WalletContextState,
  mint: string
) => {
  if (!wallet.publicKey || mint === "") return;
  let cloneWindow: any = window;
  let provider = new anchor.Provider(solConnection, cloneWindow['solana'], anchor.Provider.defaultOptions())
  const program = new anchor.Program(IDL, PROGRAM_ID, provider);

  const nft_mint = new PublicKey(mint);
  const [globalAuthority, bump] = await PublicKey.findProgramAddress(
    [Buffer.from(GLOBAL_AUTHORITY_SEED)],
    program.programId
  );
  let userLotteryPoolKey = await PublicKey.createWithSeed(
    wallet.publicKey,
    "user-lottery-pool",
    program.programId,
  );

  let tx = new Transaction();
  const [staked_nft_address, nft_bump] = await PublicKey.findProgramAddress(
    [Buffer.from("staked-nft"), nft_mint.toBuffer()],
    program.programId
  );
  let globalLotteryPoolData: any = await program.account.globalLotteryPool.fetch(GLOBAL_LOTTERY_POOL_KEY);
  let nftIndex = 0;
  for(let i = 0; i < globalLotteryPoolData.itemCount.toNumber(); i ++) {
    if (globalLotteryPoolData.lotteryItems[i].nftAddr.toBase58() == nft_mint.toBase58()) {
      nftIndex = i;
      break;
    }
  }

  let userTokenAccount = await getTokenAccount(nft_mint, wallet.publicKey);
  tx.add(program.instruction.withdrawNftFromLottery(
    bump, nft_bump, new anchor.BN(nftIndex), {
      accounts: {
        owner: wallet.publicKey,
        userLotteryPool: userLotteryPoolKey,
        globalLotteryPool: GLOBAL_LOTTERY_POOL_KEY,
        globalAuthority,
        userNftTokenAccount: userTokenAccount,
        stakedNftTokenAccount: staked_nft_address,
        nftMint: nft_mint,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY
      }
    }
  ));
  let txHash = await wallet.sendTransaction(tx, solConnection);
  await solConnection.confirmTransaction(txHash, "confirmed");
  showToast("Success. txHash=" + txHash, 0);
  console.log("txHash =", txHash);
  return false;
}


export const stakeToFixed = async (
  wallet: WalletContextState,
  mint: string
) => {
  if (!wallet.publicKey || mint === "") return;
  
  let cloneWindow: any = window;
  let provider = new anchor.Provider(solConnection, cloneWindow['solana'], anchor.Provider.defaultOptions())
  const program = new anchor.Program(IDL, PROGRAM_ID, provider);

  const nft_mint = new PublicKey(mint);
  const [globalAuthority, bump] = await PublicKey.findProgramAddress(
    [Buffer.from(GLOBAL_AUTHORITY_SEED)],
    program.programId
  );
  let userFixedPoolKey = await PublicKey.createWithSeed(
    wallet.publicKey,
    "user-fixed-pool",
    program.programId,
  );

  let tx = new Transaction();

  let fixedAccount = await solConnection.getAccountInfo(userFixedPoolKey);
  if (fixedAccount === null || fixedAccount.data === null) {
    tx.add(SystemProgram.createAccountWithSeed({
      fromPubkey: wallet.publicKey,
      basePubkey: wallet.publicKey,
      seed: "user-fixed-pool",
      newAccountPubkey: userFixedPoolKey,
      lamports : await provider.connection.getMinimumBalanceForRentExemption(POOL_SIZE),
      space: POOL_SIZE,
      programId: program.programId,
    }));
    tx.add(program.instruction.initializeFixedPool(
      {
        accounts: {
          userFixedPool: userFixedPoolKey,
          owner: wallet.publicKey
        }
      }
    ))
  }

  const [staked_nft_address, nft_bump] = await PublicKey.findProgramAddress(
    [Buffer.from("staked-nft"), nft_mint.toBuffer()],
    program.programId
  );

  let userTokenAccount = await getNFTTokenAccount(nft_mint);
  tx.add(program.instruction.stakeNftToFixed(
    bump, nft_bump, {
      accounts: {
        owner: wallet.publicKey,
        userFixedPool: userFixedPoolKey,
        globalAuthority,
        userNftTokenAccount: userTokenAccount,
        destNftTokenAccount: staked_nft_address,
        nftMint: nft_mint,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY
      }
    }
  ));
  let txHash = await wallet.sendTransaction(tx, solConnection);
  await solConnection.confirmTransaction(txHash, "confirmed");
  showToast("Success. txHash=" + txHash, 0);
  console.log("txHash =", txHash);
  return false;
}

export const withdrawFromFixed = async (
  wallet: WalletContextState,
  mint: string
) => {
  if (!wallet.publicKey || mint === "") return;
  let cloneWindow: any = window;
  let provider = new anchor.Provider(solConnection, cloneWindow['solana'], anchor.Provider.defaultOptions())
  const program = new anchor.Program(IDL, PROGRAM_ID, provider);

  const nft_mint = new PublicKey(mint);
  const [globalAuthority, bump] = await PublicKey.findProgramAddress(
    [Buffer.from(GLOBAL_AUTHORITY_SEED)],
    program.programId
  );
  const [poolWalletKey, walletBump] = await PublicKey.findProgramAddress(
    [Buffer.from(POOL_WALLET_SEED)],
    program.programId
  );
  let userFixedPoolKey = await PublicKey.createWithSeed(
    wallet.publicKey,
    "user-fixed-pool",
    program.programId,
  );

  let tx = new Transaction();
  const [staked_nft_address, nft_bump] = await PublicKey.findProgramAddress(
    [Buffer.from("staked-nft"), nft_mint.toBuffer()],
    program.programId
  );

  let userTokenAccount = await getTokenAccount(nft_mint, wallet.publicKey);
  let txHash = await program.rpc.withdrawNftFromFixed(
    bump, nft_bump, walletBump, {
      accounts: {
        owner: wallet.publicKey,
        userFixedPool: userFixedPoolKey,
        globalAuthority,
        poolWallet: poolWalletKey,
        userNftTokenAccount: userTokenAccount,
        stakedNftTokenAccount: staked_nft_address,
        nftMint: nft_mint,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY
      }
    }
  );
  await solConnection.confirmTransaction(txHash, "confirmed");
  showToast("Success. txHash=" + txHash, 0);
  console.log("txHash =", txHash);
  return false;
}

export const claimReward = async (
  wallet: WalletContextState
) => {
  if (!wallet.publicKey) return;
  let cloneWindow: any = window;
  let provider = new anchor.Provider(solConnection, cloneWindow['solana'], anchor.Provider.defaultOptions())
  const program = new anchor.Program(IDL, PROGRAM_ID, provider);

  const [globalAuthority, bump] = await PublicKey.findProgramAddress(
    [Buffer.from(GLOBAL_AUTHORITY_SEED)],
    program.programId
  );
  const [poolWalletKey, walletBump] = await PublicKey.findProgramAddress(
    [Buffer.from(POOL_WALLET_SEED)],
    program.programId
  );
  let userFixedPoolKey = await PublicKey.createWithSeed(
    wallet.publicKey,
    "user-fixed-pool",
    program.programId,
  );

  let tx = new Transaction();

  let txHash = await program.rpc.claimReward(
    bump, 0, walletBump, {
      accounts: {
        owner: wallet.publicKey,
        userFixedPool: userFixedPoolKey,
        globalAuthority,
        poolWallet: poolWalletKey,
        systemProgram: SystemProgram.programId,
      }
    }
  );
  await solConnection.confirmTransaction(txHash, "confirmed");
  showToast("Success. txHash=" + txHash, 0);
  console.log("txHash =", txHash);
  return false;
}

const getOwnerOfNFT = async (nftMintPk : PublicKey) : Promise<PublicKey> => {
  let tokenAccountPK = await getNFTTokenAccount(nftMintPk);
  let tokenAccountInfo = await solConnection.getAccountInfo(tokenAccountPK);
  
  console.log("nftMintPk=", nftMintPk.toBase58());
  console.log("tokenAccountInfo =", tokenAccountInfo);

  if (tokenAccountInfo && tokenAccountInfo.data ) {
    let ownerPubkey = new PublicKey(tokenAccountInfo.data.slice(32, 64))
    console.log("ownerPubkey=", ownerPubkey.toBase58());
    return ownerPubkey;
  }
  return new PublicKey("");
}

const getTokenAccount = async (mintPk : PublicKey, userPk: PublicKey) : Promise<PublicKey> => {
  let tokenAccount = await solConnection.getProgramAccounts(
    TOKEN_PROGRAM_ID,
    {
      filters: [
        {
          dataSize: 165
        },
        {
          memcmp: {
            offset: 0,
            bytes: mintPk.toBase58()
          }
        },
        {
          memcmp: {
            offset: 32,
            bytes: userPk.toBase58()
          }
        },
      ]
    }
  );
  return tokenAccount[0].pubkey;
}

const getNFTTokenAccount = async (nftMintPk : PublicKey) : Promise<PublicKey> => {
  console.log("getNFTTokenAccount nftMintPk=", nftMintPk.toBase58());
  let tokenAccount = await solConnection.getProgramAccounts(
    TOKEN_PROGRAM_ID,
    {
      filters: [
        {
          dataSize: 165
        },
        {
          memcmp: {
            offset: 64,
            bytes: '2'
          }
        },
        {
          memcmp: {
            offset: 0,
            bytes: nftMintPk.toBase58()
          }
        },
      ]
    }
  );
  return tokenAccount[0].pubkey;
}


const getAssociatedTokenAccount = async (ownerPubkey : PublicKey, mintPk : PublicKey) : Promise<PublicKey> => {
  let associatedTokenAccountPubkey = (await PublicKey.findProgramAddress(
    [
        ownerPubkey.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        mintPk.toBuffer(), // mint address
    ],
    ASSOCIATED_TOKEN_PROGRAM_ID
  ))[0];
  return associatedTokenAccountPubkey;
}
const createReceiveTokenAccountIx = async (receiverPK : PublicKey, mintPk : PublicKey) => {
  const tempNFTTokenAccountKeypair = new Keypair();
  console.log("tempNFTTokenAccountKeypair =", tempNFTTokenAccountKeypair);
  const createTempTokenAccountIx = SystemProgram.createAccount({
    programId: TOKEN_PROGRAM_ID,
    space: AccountLayout.span,
    lamports: await solConnection.getMinimumBalanceForRentExemption(
      AccountLayout.span
    ),
    fromPubkey: receiverPK,
    newAccountPubkey: tempNFTTokenAccountKeypair.publicKey,
  });
  const initTempAccountIx = Token.createInitAccountInstruction(
    TOKEN_PROGRAM_ID,
    mintPk,
    tempNFTTokenAccountKeypair.publicKey,
    receiverPK
  );
  return {
    tempNFTTokenAccountKeypair, createTempTokenAccountIx, initTempAccountIx
  }
}


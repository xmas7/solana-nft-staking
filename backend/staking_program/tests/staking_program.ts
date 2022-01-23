import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { StakingProgram } from '../target/types/staking_program';
import { SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";

import { Token, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";

const PublicKey = anchor.web3.PublicKey;
const BN = anchor.BN;
const assert = require("assert");

const GLOBAL_AUTHORITY_SEED = "global-authority";
const POOL_WALLET_SEED = "pool-wallet";

describe('staking_program', () => {

  // Configure the client to use the local cluster.
  const provider = anchor.Provider.env();
  anchor.setProvider(provider);
  
  const program = anchor.workspace.StakingProgram as Program<StakingProgram>;
  const superOwner = anchor.web3.Keypair.generate();
  const user = anchor.web3.Keypair.generate();
  const lotteryPool = anchor.web3.Keypair.generate();
  const fixedPool = anchor.web3.Keypair.generate();

  const POOL_SIZE = 2048;//400 016;

  let nft_token_mint = null;
  let userTokenAccount = null;

  it('Is initialized!', async () => {
    // Add your test here.
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(superOwner.publicKey, 2000000000),
      "confirmed"
    );
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(user.publicKey, 2000000000),
      "confirmed"
    );
    
    console.log("super owner =", superOwner.publicKey.toBase58());
    console.log("user =", user.publicKey.toBase58());

    nft_token_mint = await Token.createMint(
      provider.connection,
      user,
      superOwner.publicKey,
      null,
      0,
      TOKEN_PROGRAM_ID
    );
    userTokenAccount = await nft_token_mint.createAccount(user.publicKey);
    
    await nft_token_mint.mintTo(
      userTokenAccount,
      superOwner,
      [],
      1
    );

    const [globalAuthority, bump] = await PublicKey.findProgramAddress(
      [Buffer.from(GLOBAL_AUTHORITY_SEED)],
      program.programId
    );
    
    console.log("globalAuthority =", globalAuthority.toBase58());

    const [poolWalletKey, walletBump] = await PublicKey.findProgramAddress(
      [Buffer.from(POOL_WALLET_SEED)],
      program.programId
    );
    
    console.log("poolWalletKey =", poolWalletKey.toBase58());

    const tx = await program.rpc.initialize(
      bump, walletBump, {
        accounts: {
          admin: superOwner.publicKey,
          globalAuthority,
          poolWallet: poolWalletKey,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY
        },
        signers: [superOwner]
      }
    );

    console.log("Your transaction signature", tx);
  });

  it('initialize lottery pool', async () => {
    /*let [userLotteryPool, lotteryBump] = await PublicKey.findProgramAddress(
      [Buffer.from("user-lottery-pool"), user.publicKey.toBuffer()],
      program.programId
    );*/

    let userLotteryPoolKey = await PublicKey.createWithSeed(
      user.publicKey,
      "user-lottery-pool",
      program.programId,
    );
    
    let ix = SystemProgram.createAccountWithSeed({
      fromPubkey: user.publicKey,
      basePubkey: user.publicKey,
      seed: "user-lottery-pool",
      newAccountPubkey: userLotteryPoolKey,
      lamports : await provider.connection.getMinimumBalanceForRentExemption(POOL_SIZE),
      space: POOL_SIZE,
      programId: program.programId,
    });
    console.log("userLotteryPool.pubk =", userLotteryPoolKey.toBase58())
    const tx = await program.rpc.initializeLotteryPool(
      {
        accounts: {
          userLotteryPool: userLotteryPoolKey,
          owner: user.publicKey
        },
        instructions: [
          ix
        ],
        signers: [user]
      }
    );

    console.log("Your transaction signature", tx);
  })

  it("Stake Nft To Lottery", async () => {

    const [globalAuthority, bump] = await PublicKey.findProgramAddress(
      [Buffer.from(GLOBAL_AUTHORITY_SEED)],
      program.programId
    );

    console.log("globalAuthority =", globalAuthority.toBase58());

    let userLotteryPoolKey = await PublicKey.createWithSeed(
      user.publicKey,
      "user-lottery-pool",
      program.programId,
    );

    /*let destNftTokenAccount = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID, 
      TOKEN_PROGRAM_ID,
      nft_token_mint.publicKey,
      user.publicKey
    );*/

    const [staked_nft_address, nft_bump] = await PublicKey.findProgramAddress(
      [Buffer.from("staked-nft"), nft_token_mint.publicKey.toBuffer()],
      program.programId
    );

    //let destNftTokenAccount = await nft_token_mint.createAccount(user.publicKey);

    const tx = await program.rpc.stakeNftToLottery(
      bump, nft_bump, {
        accounts: {
          owner: user.publicKey,
          userLotteryPool: userLotteryPoolKey,
          globalAuthority,
          userNftTokenAccount: userTokenAccount,
          destNftTokenAccount: staked_nft_address,
          nftMint: nft_token_mint.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY
        },
        signers: [user]
      }
    );
    
    console.log("Your transaction signature", tx); 
    
    let userLotteryPool = await program.account.userPool.fetch(userLotteryPoolKey);
    //console.log("userLotteryPool =", userLotteryPool);
  })

  it("Withdraw Nft From Lottery", async () => {

    const [globalAuthority, bump] = await PublicKey.findProgramAddress(
      [Buffer.from(GLOBAL_AUTHORITY_SEED)],
      program.programId
    );

    console.log("globalAuthority =", globalAuthority.toBase58());

    let userLotteryPoolKey = await PublicKey.createWithSeed(
      user.publicKey,
      "user-lottery-pool",
      program.programId,
    );

    const [staked_nft_address, nft_bump] = await PublicKey.findProgramAddress(
      [Buffer.from("staked-nft"), nft_token_mint.publicKey.toBuffer()],
      program.programId
    );

    const tx = await program.rpc.withdrawNftFromLottery(
      bump, nft_bump, {
        accounts: {
          owner: user.publicKey,
          userLotteryPool: userLotteryPoolKey,
          globalAuthority,
          userNftTokenAccount: userTokenAccount,
          stakedNftTokenAccount: staked_nft_address,
          nftMint: nft_token_mint.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY
        },
        signers: [user]
      }
    );
    
    console.log("Your transaction signature", tx); 
    
    let userLotteryPool = await program.account.userPool.fetch(userLotteryPoolKey);
    //console.log("userLotteryPool =", userLotteryPool);
  })

  it('initialize fixed pool', async () => {

    let userFixedPoolKey = await PublicKey.createWithSeed(
      user.publicKey,
      "user-fixed-pool",
      program.programId,
    );
    
    let ix = SystemProgram.createAccountWithSeed({
      fromPubkey: user.publicKey,
      basePubkey: user.publicKey,
      seed: "user-fixed-pool",
      newAccountPubkey: userFixedPoolKey,
      lamports : await provider.connection.getMinimumBalanceForRentExemption(POOL_SIZE),
      space: POOL_SIZE,
      programId: program.programId,
    });
    console.log("userFixedPool.pubk =", userFixedPoolKey.toBase58())
    const tx = await program.rpc.initializeFixedPool(
      {
        accounts: {
          userFixedPool: userFixedPoolKey,
          owner: user.publicKey
        },
        instructions: [
          ix
        ],
        signers: [user]
      }
    );

    console.log("Your transaction signature", tx);
  })

  it("Stake Nft To Fixed", async () => {

    const [globalAuthority, bump] = await PublicKey.findProgramAddress(
      [Buffer.from(GLOBAL_AUTHORITY_SEED)],
      program.programId
    );

    console.log("globalAuthority =", globalAuthority.toBase58());

    let userFixedPoolKey = await PublicKey.createWithSeed(
      user.publicKey,
      "user-fixed-pool",
      program.programId,
    );

    /*let destNftTokenAccount = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID, 
      TOKEN_PROGRAM_ID,
      nft_token_mint.publicKey,
      user.publicKey
    );*/

    const [staked_nft_address, nft_bump] = await PublicKey.findProgramAddress(
      [Buffer.from("staked-nft"), nft_token_mint.publicKey.toBuffer()],
      program.programId
    );

    //let destNftTokenAccount = await nft_token_mint.createAccount(user.publicKey);

    const tx = await program.rpc.stakeNftToFixed(
      bump, nft_bump, {
        accounts: {
          owner: user.publicKey,
          userFixedPool: userFixedPoolKey,
          globalAuthority,
          userNftTokenAccount: userTokenAccount,
          destNftTokenAccount: staked_nft_address,
          nftMint: nft_token_mint.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY
        },
        signers: [user]
      }
    );
    
    console.log("Your transaction signature", tx); 
    
    let userFixedPool = await program.account.userPool.fetch(userFixedPoolKey);
    //console.log("userFixedPool =", userFixedPool);
  })

  it("Withdraw Nft From Fixed", async () => {

    const [globalAuthority, bump] = await PublicKey.findProgramAddress(
      [Buffer.from(GLOBAL_AUTHORITY_SEED)],
      program.programId
    );

    console.log("globalAuthority =", globalAuthority.toBase58());

    const [poolWalletKey, walletBump] = await PublicKey.findProgramAddress(
      [Buffer.from(POOL_WALLET_SEED)],
      program.programId
    );
    
    console.log("poolWalletKey =", poolWalletKey.toBase58());

    let userFixedPoolKey = await PublicKey.createWithSeed(
      user.publicKey,
      "user-fixed-pool",
      program.programId,
    );

    const [staked_nft_address, nft_bump] = await PublicKey.findProgramAddress(
      [Buffer.from("staked-nft"), nft_token_mint.publicKey.toBuffer()],
      program.programId
    );

    const tx = await program.rpc.withdrawNftFromFixed(
      bump, nft_bump, walletBump, {
        accounts: {
          owner: user.publicKey,
          admin: superOwner.publicKey,
          userFixedPool: userFixedPoolKey,
          globalAuthority,
          poolWallet: poolWalletKey,
          userNftTokenAccount: userTokenAccount,
          stakedNftTokenAccount: staked_nft_address,
          nftMint: nft_token_mint.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY
        },
        signers: [user]
      }
    );
    
    console.log("Your transaction signature", tx); 
    
    let userFixedPool = await program.account.userPool.fetch(userFixedPoolKey);
    //console.log("userFixedPool =", userFixedPool);
  })
});
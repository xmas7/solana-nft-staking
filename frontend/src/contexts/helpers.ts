
import { web3 } from '@project-serum/anchor';
import { Keypair, 
        PublicKey,
        SystemProgram,
        Transaction,
        TransactionInstruction,
        sendAndConfirmTransaction } from '@solana/web3.js';

// for rest function
import { Token, TOKEN_PROGRAM_ID, AccountLayout, MintLayout } from "@solana/spl-token";
//import { TokenInfo } from '@solana/spl-token-registry';
import * as borsh from 'borsh';
import bs58 from 'bs58';
import * as anchor from '@project-serum/anchor';
import {
  NFTRecord1,
  RecordSchema1,
  UpdateNFTArgs,
  UpdateNFTSchema,
  BuyRecordArgs,
  BuyRecordSchema,
  chunks,
  ContentRecord,
  showToast
} from './utils';
import axios from 'axios';
import BN from 'bn.js';
import fs from 'fs';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { programs, Connection, actions } from '@metaplex/js';
import { Data, updateMetadata, Creator, createMetadata } from './metadata';

import { IDL } from './anchor_idl/idl/hall_of_hero';

const { metaplex: { Store, AuctionManager }, auction: { Auction }, vault: { Vault }, metadata: {Metadata} } = programs;

const solConnection = new web3.Connection(web3.clusterApiUrl("devnet"));

const PDA_SEED = "hallofheros";
const NFT_RECORD_SPACE = 250; // RECORD_MAX_SIZE
const RECORD_CNT = 16;
const REPO_PROGRAM_ID = new PublicKey(
  "5TTYCcZJG8nckYcSe5EUtABGzKXiMtNDg6SJNYhX5gwD"
);
const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);
const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID: PublicKey = new PublicKey(
  'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
);
const REPO_ACCOUNT_PUBKEY = new PublicKey(
  "B9tTWxpmRBDTFQDpu2EzLTk7v7QkdN3t3pgTKpLJMgzX"
);
const DEAD_NFT_URI = "https://arweave.net/RZc2Tofy92aiWDZcb574VXHGzJHMssvBPnCmr_Uo0UM";

const ADMIN_KEY_PAIR = Keypair.fromSecretKey(
  //bs58.decode("4o7bg2vu3TD8SY2M1rBZXtYvYAbXXUQSx8VU97BEQqoz4AfWAwmhzssLcxvxLXPctEcmCcap8Kd3iQrWnhgcMcgZ")
  new Uint8Array([166,131,100,248,20,124,18,55,184,173,190,64,234,175,37,130,60,128,135,120,228,183,27,65,69,76,209,208,53,79,220,17,31,165,240,23,153,231,78,125,144,127,227,98,175,2,129,5,191,45,52,105,72,143,174,90,65,128,144,232,80,176,75,21])
);
/*const ADMIN_KEY_PAIR = Keypair.fromSecretKey(
  bs58.decode("4o7bg2vu3TD8SY2M1rBZXtYvYAbXXUQSx8VU97BEQqoz4AfWAwmhzssLcxvxLXPctEcmCcap8Kd3iQrWnhgcMcgZ")
);*/ 

export const updateRecord = async (nftId: number, nftKey: PublicKey, price: BN, contentURI: string, wallet: WalletContextState) => {
  console.log(nftId + '  ' + nftKey.toBase58() + '  ' + price.toString() + '  uri=', contentURI);

  if (! wallet.publicKey) return;
  let cloneWindow: any = window;
  
  console.log("pubkey =",ADMIN_KEY_PAIR.publicKey.toBase58());
  console.log("updateRecord cloneWindow['solana'] = ", cloneWindow['solana']);
  
  //let anchor_wallet = new anchor.Wallet(ADMIN_KEY_PAIR);
  let provider = new anchor.Provider(solConnection, cloneWindow['solana'], anchor.Provider.defaultOptions())
  const program = new anchor.Program(IDL, REPO_PROGRAM_ID, provider);
  
  let associatedTokenAccount = await getNFTTokenAccount(nftKey);

  console.log("updater =", wallet.publicKey.toBase58());
  console.log("associatedTokenAccount =", associatedTokenAccount.toBase58());

  let result = await program.rpc.updateRecord(nftId, contentURI, new anchor.BN(price), {
    accounts: {
      updater: wallet.publicKey,
      repository: REPO_ACCOUNT_PUBKEY,
      nftMint: nftKey,
      associatedTokenAccount
    },
    signers: []
  }).catch(error => {
    showToast(error, 1);
  });
  if (result !== undefined) {
    showToast("Successfully changed. txHash=" + result, 0);
    return true;
  }
  return false;
}


export const getRecords = async () :Promise<ContentRecord[]> => {
  let records : NFTRecord1[] = await getRepoAccountInfo();
  let contents : ContentRecord[] = records.map(r => (new ContentRecord({
      hero_id: r.hero_id,
      content_uri: r.content_uri,
      key_nft: new PublicKey(r.key_nft),
      last_price: r.last_price,
      listed_price: r.listed_price,
      image_uri: '#',
      name: '-',
      owner: null
    })
  ));
  console.log("result of getRecords() =", contents);
  return contents;
}
export const getContents = async (records: ContentRecord[]) => {
  console.log("getContents records =", records);
  for (let i = 0; i<records.length; i++) {
    records[i].owner = await getOwnerOfNFT(records[i].key_nft);
    let offchain_data = await axios.get(records[i].content_uri).catch((err) => {
      console.log(err);
    });
    if (offchain_data != null) {
      records[i].image_uri = offchain_data.data.image;
      records[i].name = offchain_data.data.name;
    }
  }
  console.log("result of getContents() =", records);
  return records;
}
export const getFullContents = async () => {
  let records : ContentRecord[] = await getRecords();
  let contents = await getContents(records);
  //getOwnerOfNFT
  return contents;
}
export const getContent = async (record: ContentRecord) => {
  console.log("getContents");
  
  record.owner = await getOwnerOfNFT(record.key_nft);
  let offchain_data = await axios.get(record.content_uri).catch((err) => {
    console.log(err);
  });
  if (offchain_data != null) {
    record.image_uri = offchain_data.data.image;
    record.name = offchain_data.data.name;
  }
  return record;
}

const getRepoAccountInfo = async () : Promise<NFTRecord1[]> => {
  let recordsInfo = await solConnection.getAccountInfo(REPO_ACCOUNT_PUBKEY);
  if (recordsInfo === null) {
    console.log("There is no info registered.");
    return [];
  }
  const records = chunks(recordsInfo.data.slice(), NFT_RECORD_SPACE);
  let unpacked_records = records.slice(0, RECORD_CNT).map((packInfo, idx) => {
    let record = borsh.deserializeUnchecked(RecordSchema1, NFTRecord1, Buffer.from(packInfo)) as NFTRecord1;
    return record;
  })
  return unpacked_records;

  /*
  records.forEach((packInfo, idx) => {
    if (idx < 12) {
      console.log("packInfo.len =", packInfo.length);
      let record = borsh.deserializeUnchecked(RecordSchema1, NFTRecord1, Buffer.from(packInfo)) as NFTRecord1;
      console.log("record =", record);
      let key = new PublicKey(record.key_nft);
      console.log("record.key_nft =", key.toBase58());
      console.log("record.last_price =", record.last_price.toNumber());
      console.log("record.listed_price =", record.listed_price.toNumber());
    }
    //console.log("No." + idx, "NFT: " + record.nft_address, " Owner: " + record.nft_owner, " Date:", record.register_date);
  })*/
}

export const buyNFT = async (nftData: ContentRecord, nftKey: PublicKey, wallet: WalletContextState) => {
  if (!wallet.publicKey) return;

  console.log("buyNFT nftKey =", nftKey.toBase58());
  let { mintAccount, tokenAccount } = await mintNewNFT(nftData);

  //await updateMetadataV2(nftKey);
  
  const prevOwnerPK = await getOwnerOfNFT(nftKey);

  let nfts_metadata = await solConnection.getProgramAccounts(
    TOKEN_METADATA_PROGRAM_ID,
    {
      filters: [
        {
          memcmp: {
            offset: 33,
            bytes: nftKey.toBase58()
          }
        }
      ]
    }
  );
  if (nfts_metadata.length === 0) return;
  
  let old_nft_account_pk = await getNFTTokenAccount(nftKey); 
  let nft_account_pk_to_send = tokenAccount.publicKey;
  let {
    tempNFTTokenAccountKeypair, 
    createTempTokenAccountIx, 
    initTempAccountIx} = await createReceiveTokenAccountIx(wallet.publicKey, mintAccount.publicKey);

  //let tempNFTTokenAccountKeypair = await getToReceiveTokenAccount(buyerKeyPair.publicKey, mintAccount.publicKey);
  let nft_account_pk_to_receive = tempNFTTokenAccountKeypair.publicKey;//new PublicKey("DJNwjdLbeBpc9zZ4m1zRLDHbnjcw3yPbB8Gs3dSRReA4");//await getToReceiveTokenAccount(buyerKeyPair.publicKey, nftKey); 
  //let nft_account_pk_to_receive = await getToSendTokenAccount(buyerKeyPair.publicKey, nftKey); 

  let oldNFTmetadataAccount = await Metadata.getPDA(nftKey);

  console.log("before buy");
  console.log("walletKeyPair.publicKey =", ADMIN_KEY_PAIR.publicKey.toBase58());
  console.log("buyerKeyPair.publicKey =", wallet.publicKey.toBase58());
  console.log("prevOwnerPK =", prevOwnerPK.toBase58());
  console.log("nftKey =", nftKey.toBase58());
  console.log("old_nft_account_pk =", old_nft_account_pk.toBase58());
  console.log("oldNFTmetadataAccount =", oldNFTmetadataAccount.toBase58());

  console.log("newNftMint =", mintAccount.publicKey.toBase58());
  console.log("nft_account_pk_to_send =", nft_account_pk_to_send.toBase58());
  console.log("nft_account_pk_to_receive =", nft_account_pk_to_receive.toBase58());

  console.log("TOKEN_PROGRAM_ID =", TOKEN_PROGRAM_ID.toBase58());
  console.log("SystemProgram =", SystemProgram.programId.toBase58());


  let cloneWindow: any = window;
  let provider = new anchor.Provider(solConnection, cloneWindow['solana'], anchor.Provider.defaultOptions())
  const program = new anchor.Program(IDL, REPO_PROGRAM_ID, provider);
  
  let result = await program.rpc.buyRecord(nftData.hero_id, DEAD_NFT_URI, "DEAD Seat", {
    accounts: {
      initializer: ADMIN_KEY_PAIR.publicKey,
      buyer: wallet.publicKey,
      prevOwner: prevOwnerPK,
      repository: REPO_ACCOUNT_PUBKEY,
      deadNftMint: nftKey,
      deadNftTokenAccount: old_nft_account_pk,
      deadNftMetadataAccount: oldNFTmetadataAccount,

      newNftMint: mintAccount.publicKey,
      nftTokenAccountToSend: nft_account_pk_to_send,
      nftTokenAccountToReceive: nft_account_pk_to_receive,

      tokenProgram: TOKEN_PROGRAM_ID,
      tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
      systemProgram: SystemProgram.programId
    },
    instructions:[
      createTempTokenAccountIx,
      initTempAccountIx
    ],
    signers: [ADMIN_KEY_PAIR, tempNFTTokenAccountKeypair]
  }).catch(error => {
    showToast(error, 1);
  });
  if (result !== undefined) {
    showToast("Successfully bought. txHash=" + result, 0);
    return true;
  }
  return false;
}

export const buyNFT_ = async (nftData: ContentRecord, nftKey: PublicKey, wallet: WalletContextState) => {
  if (!wallet.publicKey) return;
  console.log("buyNFT nftKey =", nftKey.toBase58());
  let { mintAccount, tokenAccount } = await mintNewNFT(nftData);

  //await updateMetadataV2(nftKey);
  
  const prevOwnerPK = await getOwnerOfNFT(nftKey);

  let nfts_metadata = await solConnection.getProgramAccounts(
    TOKEN_METADATA_PROGRAM_ID,
    {
      filters: [
        {
          memcmp: {
            offset: 33,
            bytes: nftKey.toBase58()
          }
        }
      ]
    }
  );
  if (nfts_metadata.length === 0) return;
  
  let old_nft_account_pk = await getNFTTokenAccount(nftKey); 
  let nft_account_pk_to_send = tokenAccount.publicKey;
  let {
    tempNFTTokenAccountKeypair, 
    createTempTokenAccountIx, 
    initTempAccountIx} = await createReceiveTokenAccountIx(wallet.publicKey, mintAccount.publicKey);
  let nft_account_pk_to_receive = tempNFTTokenAccountKeypair.publicKey;//new PublicKey("DJNwjdLbeBpc9zZ4m1zRLDHbnjcw3yPbB8Gs3dSRReA4");//await getToReceiveTokenAccount(buyerKeyPair.publicKey, nftKey); 
  //let nft_account_pk_to_receive = await getToSendTokenAccount(buyerKeyPair.publicKey, nftKey); 

  const PDA = await PublicKey.findProgramAddress(
    [Buffer.from(PDA_SEED)],
    REPO_PROGRAM_ID
  );

  console.log("before buy");
  console.log("wallet.publicKey =", wallet.publicKey.toBase58());
  console.log("prevOwnerPK =", prevOwnerPK.toBase58());
  console.log("nftKey =", nftKey.toBase58());
  console.log("old_nft_account_pk =", old_nft_account_pk.toBase58());
  console.log("nft_account_pk_to_receive =", nft_account_pk_to_receive.toBase58());
  console.log("PDA[0] =", PDA[0].toBase58());
  console.log("TOKEN_PROGRAM_ID =", TOKEN_PROGRAM_ID.toBase58());
  console.log("SystemProgram =", SystemProgram.programId.toBase58());

  let oldNFTmetadataAccount = await Metadata.getPDA(nftKey);

  let args = new BuyRecordArgs({
    hero_id: nftData.hero_id,
    dead_uri: DEAD_NFT_URI,
    dead_name: "DEAD Seat"
  });

  let instructionInfo = borsh.serialize(BuyRecordSchema, args);
  let buffer = Buffer.concat([Buffer.from(Uint8Array.of(2)), Buffer.from(instructionInfo)]);

  const instruction = new TransactionInstruction({
    keys: [
      {pubkey: ADMIN_KEY_PAIR.publicKey, isSigner: true, isWritable: true},
      {pubkey: wallet.publicKey, isSigner: true, isWritable: true},
      {pubkey: prevOwnerPK, isSigner: false, isWritable: true},
      {pubkey: REPO_ACCOUNT_PUBKEY, isSigner: false, isWritable: true},
      {pubkey: nftKey, isSigner: false, isWritable: false}, // old NFT Key
      {pubkey: old_nft_account_pk, isSigner: false, isWritable: true},
      {pubkey: oldNFTmetadataAccount, isSigner: false, isWritable: true},

      {pubkey: mintAccount.publicKey, isSigner: false, isWritable: true}, // new NFT Key
      {pubkey: nft_account_pk_to_send, isSigner: false, isWritable: true},
      {pubkey: nft_account_pk_to_receive, isSigner: false, isWritable: true},

      {pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false},
      {pubkey: TOKEN_METADATA_PROGRAM_ID, isSigner: false, isWritable: false},
      {pubkey: SystemProgram.programId, isSigner: false, isWritable: false},
    ],
    programId: REPO_PROGRAM_ID,
    data: buffer,
  });
  console.log("buying nft...");
  
  let tx = new Transaction().add(
    createTempTokenAccountIx,
    initTempAccountIx,
    instruction
  );

  let block = await solConnection.getRecentBlockhash("max");
  tx.recentBlockhash = block.blockhash;

  await wallet.sendTransaction(tx, solConnection, {
    signers: [ADMIN_KEY_PAIR, tempNFTTokenAccountKeypair]
  }).then(result => {
    showToast("Successfully bought. Check your wallet", 0);
    return true;
  }).catch(error => {
    showToast(error, 1);
    return false;
  });
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
    SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
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


const mintNewToken = async (nftKey: PublicKey) => {
  // Create new token mint
  const mint = await Token.createMint(
    solConnection,
    ADMIN_KEY_PAIR,
    ADMIN_KEY_PAIR.publicKey,
    ADMIN_KEY_PAIR.publicKey,
    0,
    TOKEN_PROGRAM_ID,
  );

  // Get the token account of the fromWallet Solana address, if it does not exist, create it
  const fromTokenAccount = await mint.getOrCreateAssociatedAccountInfo(
    ADMIN_KEY_PAIR.publicKey,
  );

  // Minting 1 new token to the "fromTokenAccount" account we just returned/created
  await mint.mintTo(
    fromTokenAccount.address,
    ADMIN_KEY_PAIR.publicKey,
    [],
    1,
  );
  console.log("mint addr", mint.publicKey.toBase58());
  console.log("from account ",fromTokenAccount.address.toBase58());

  // creating metadata
  let { metadata : {Metadata, UpdateMetadata, MetadataDataData} } = programs;
  let nftMintAccount = new PublicKey(nftKey);
  let metadataAccount = await Metadata.getPDA(nftMintAccount);
  const metadat = await Metadata.load(solConnection, metadataAccount);
  let metadataData = metadat.data.data;
  console.log("metadataData =", metadataData);
  const creators = [
    new Creator({
        address: ADMIN_KEY_PAIR.publicKey.toBase58(),
        share: 100,
        verified: true
    }),
  ];
  let data = new Data({
    name: metadataData.name,
    symbol: metadataData.symbol,
    uri: metadataData.uri,
    creators,
    sellerFeeBasisPoints: metadataData.sellerFeeBasisPoints,
  });
  let instructions : TransactionInstruction[] = [];
  await createMetadata(
    data,
    ADMIN_KEY_PAIR.publicKey.toBase58(),
    mint.publicKey.toBase58(),
    ADMIN_KEY_PAIR.publicKey.toBase58(),
    instructions,
    ADMIN_KEY_PAIR.publicKey.toBase58()
  );
  
  let result = await sendAndConfirmTransaction(solConnection, new Transaction().add(instructions[0]), [ADMIN_KEY_PAIR]);
  console.log("result =", result);
  return { newMintPubkey: mint.publicKey, tokenAccountPubKey: fromTokenAccount.address };
};

const mintNewNFT = async (nftData: ContentRecord) => {
  // Create new token mint
  const mintAccount = new Keypair();
  const tokenAccount = new Keypair();
  const mintRent = await solConnection.getMinimumBalanceForRentExemption(
    MintLayout.span,
  );
  const accountRent = await solConnection.getMinimumBalanceForRentExemption(
    AccountLayout.span,
  );

  let transaction = new Transaction();
  const signers = [mintAccount, tokenAccount];
  transaction.recentBlockhash = (
    await solConnection.getRecentBlockhash('max')
  ).blockhash;
  transaction.add(
    SystemProgram.createAccount({
      fromPubkey: ADMIN_KEY_PAIR.publicKey,
      newAccountPubkey: mintAccount.publicKey,
      lamports: mintRent,
      space: MintLayout.span,
      programId: TOKEN_PROGRAM_ID,
    }),
  );
  transaction.add(
    SystemProgram.createAccount({
      fromPubkey: ADMIN_KEY_PAIR.publicKey,
      newAccountPubkey: tokenAccount.publicKey,
      lamports: accountRent,
      space: AccountLayout.span,
      programId: TOKEN_PROGRAM_ID,
    }),
  );
  transaction.add(
    Token.createInitMintInstruction(
      TOKEN_PROGRAM_ID,
      mintAccount.publicKey,
      0,
      ADMIN_KEY_PAIR.publicKey,
      ADMIN_KEY_PAIR.publicKey,
    ),
  );
  transaction.add(
    Token.createInitAccountInstruction(
      TOKEN_PROGRAM_ID,
      mintAccount.publicKey,
      tokenAccount.publicKey,
      ADMIN_KEY_PAIR.publicKey,
    ),
  );
  transaction.add(
    Token.createMintToInstruction(
      TOKEN_PROGRAM_ID,
      mintAccount.publicKey,
      tokenAccount.publicKey,
      ADMIN_KEY_PAIR.publicKey,
      [],
      1,
    ),
  );
  const creators = [
    new Creator({
        address: ADMIN_KEY_PAIR.publicKey.toBase58(),
        share: 100,
        verified: true
    }),
  ];
  let data = new Data({
    name: nftData.name,
    symbol: "",
    uri: nftData.content_uri,
    creators,
    sellerFeeBasisPoints: 1000
  });
  let instructions : TransactionInstruction[] = [];

  await createMetadata(
    data,
    ADMIN_KEY_PAIR.publicKey.toBase58(),
    mintAccount.publicKey.toBase58(),
    ADMIN_KEY_PAIR.publicKey.toBase58(),
    instructions,
    ADMIN_KEY_PAIR.publicKey.toBase58()
  );

  transaction.add(instructions[0]);
  
  let result = await sendAndConfirmTransaction(solConnection, transaction, [ADMIN_KEY_PAIR, mintAccount, tokenAccount]);
  console.log("mintNewNFT tx result =", result);
  return { mintAccount, tokenAccount };
};


export const updateMetadataV2 = async (nftMintAccount: PublicKey) => {

  // wolf #3 - 9kaa4ComxWXxa7hSUWUZon5UkkK2QurJ5xe9iqs9EvsF
  // seat #7 - Br9cYGi8zUL129H6VHPPLuZNCBbP9siCMwRuLEynCV76
  //let nftMintAccount = new PublicKey("Br9cYGi8zUL129H6VHPPLuZNCBbP9siCMwRuLEynCV76");
  let metadataAccount = await Metadata.getPDA(nftMintAccount);
  const metadat = await Metadata.load(solConnection, metadataAccount);
  let metadataData = metadat.data.data;

  if (metadataData.creators === null) {
    console.log("metadataData.creators is null");
    return;
  }
  console.log("original metadata =", metadataData);

  const creators = metadataData.creators.map(
    (el) =>
        new Creator({
            address: new PublicKey(el.address).toBase58(),
            share: el.share,
            verified: el.verified
        }),
  );
  
  console.log("creators =", creators);

  let data = new Data({
      name: metadataData.name,
      symbol: metadataData.symbol,
      uri: DEAD_NFT_URI,
      creators: [...creators],
      sellerFeeBasisPoints: metadataData.sellerFeeBasisPoints,
  });

  console.log("data=", data);

  let instructions: TransactionInstruction[] = [];

  let res = await updateMetadata(
      data,
      ADMIN_KEY_PAIR.publicKey.toBase58(),
      true,
      nftMintAccount.toBase58(),
      ADMIN_KEY_PAIR.publicKey.toBase58(),
      instructions,
      metadataAccount.toBase58()
  );

  let result = await sendAndConfirmTransaction(solConnection, new Transaction().add(instructions[0]), [ADMIN_KEY_PAIR]);
  console.log("result =", result);
}
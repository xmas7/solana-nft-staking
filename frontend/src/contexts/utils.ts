
import BN from 'bn.js';
import {PublicKey, Keypair, AccountInfo} from '@solana/web3.js';
import { METADATA_SCHEMA, Metadata } from './processMetaplexAccounts';
import * as borsh from 'borsh';
import fs from 'fs';
import { toast, ToastContainer } from 'react-toastify';
import { String } from 'lodash';

export class NFTRecord {
    hero_id: number; //
    content_uri: string;  //  
    key_nft: string;  // 
    last_price: BN;
    listed_price: BN;
  
    constructor(args: {
      hero_id: number,
      content_uri: string,
      key_nft: string,
      last_price: BN,
      listed_price: BN
    }) {
      this.hero_id = args.hero_id;
      this.content_uri = args.content_uri;
      this.key_nft = args.key_nft;
      this.last_price = args.last_price;
      this.listed_price = args.listed_price;
    }
  }
  export const RecordSchema = new Map([
    [NFTRecord, {kind: 'struct', fields: [
      ['hero_id', 'u8'], 
      ['content_uri', 'string'], 
      ['key_nft', 'string'], 
      ['last_price', 'u64'],
      ['listed_price', 'u64'],
    ]}],
  ]);
  
  export class NFTRecord1 {
    hero_id: number; //
    content_uri: string;  //  
    key_nft: PublicKey;  // 
    last_price: BN;
    listed_price: BN;
  
    constructor(args: {
      hero_id: number,
      content_uri: string,
      key_nft: PublicKey,
      last_price: BN,
      listed_price: BN
    }) {
      this.hero_id = args.hero_id;
      this.content_uri = args.content_uri;
      this.key_nft = args.key_nft;
      this.last_price = args.last_price;
      this.listed_price = args.listed_price;
    }
  }
  export const RecordSchema1 = new Map([
    [NFTRecord1, {kind: 'struct', fields: [
      ['hero_id', 'u8'], 
      ['content_uri', 'string'], 
      ['key_nft', [32]], 
      ['last_price', 'u64'],
      ['listed_price', 'u64'],
    ]}],
  ]);
  
export class ContentRecord {
    hero_id: number; //
    content_uri: string;  //  
    key_nft: PublicKey;  // 
    last_price: BN;
    listed_price: BN;
    image_uri: string;
    name: string;
    owner: PublicKey | null;
    constructor(args: {
      hero_id: number,
      content_uri: string,
      key_nft: PublicKey,
      last_price: BN,
      listed_price: BN,
      image_uri: string,
      name: string,
      owner: PublicKey | null
    }) {
      this.hero_id = args.hero_id;
      this.content_uri = args.content_uri;
      this.key_nft = args.key_nft;
      this.last_price = args.last_price;
      this.listed_price = args.listed_price;
      this.image_uri = args.image_uri;
      this.name = args.name;
      this.owner = args.owner;
    }
};

  export class UpdateNFTArgs {
    hero_id: number; //
    key_nft: Uint8Array;  // 
    new_price: BN;
    content_uri: string;
  
    constructor(args: {
      hero_id: number,
      key_nft: Uint8Array,
      new_price: BN,
      content_uri: string,
    }) {
      this.hero_id = args.hero_id;
      this.key_nft = args.key_nft;
      this.new_price = args.new_price;
      this.content_uri = args.content_uri;
    }
  }
  export const UpdateNFTSchema = new Map([
    [UpdateNFTArgs, {kind: 'struct', fields: [
      ['hero_id', 'u8'], 
      ['key_nft', [32]], 
      ['new_price', 'u64'],
      ['content_uri', 'string'],
    ]}],
  ]);

  export class BuyRecordArgs {
    hero_id: number; //
    dead_uri: string;
    dead_name: string;
  
    constructor(args: {
      hero_id: number,
      dead_uri: string,
      dead_name: string,
    }) {
      this.hero_id = args.hero_id;
      this.dead_uri = args.dead_uri;
      this.dead_name = args.dead_name;
    }
  }
  export const BuyRecordSchema = new Map([
    [BuyRecordArgs, {kind: 'struct', fields: [
      ['hero_id', 'u8'], 
      ['dead_uri', 'string'],
      ['dead_name', 'string'],
    ]}],
  ]);
  
  
  export class RecordList {
    records: NFTRecord[];
    constructor(args: {
      records: NFTRecord[],
    }) {
      this.records = args.records;
    }
  }
  
  export class SetContentUriArgs {
    hero_id: number; //
    contentUri: string;
  
    constructor(args: {
      hero_id: number,
      contentUri: string
    }) {
      this.hero_id = args.hero_id;
      this.contentUri = args.contentUri;
    }
  }
  export const SetContentUriArgsSchema = new Map([
    [SetContentUriArgs, {kind: 'struct', fields: [
      ['hero_id', 'u8'], 
      ['contentUri', 'string'],
    ]}],
  ]);

const METADATA_REPLACE = new RegExp("\u0000", "g");
export function decodeMetadata(buffer: any) {
  console.log("check");
  // return borsh.deserializeUnchecked(METADATA_SCHEMA, Metadata, buffer);

  const metadata = borsh.deserializeUnchecked(
    METADATA_SCHEMA,
    Metadata,
    buffer
  );

  metadata.data.name = metadata.data.name.replace(METADATA_REPLACE, "");
  metadata.data.uri = metadata.data.uri.replace(METADATA_REPLACE, "");
  metadata.data.symbol = metadata.data.symbol.replace(METADATA_REPLACE, "");
  return metadata;
}

export function chunks(array: Uint8Array, size: number) {
    return Array.apply(0, new Array(Math.ceil(array.length / size))).map(
      (_, index) => array.slice(index * size, (index + 1) * size),
    );
  }
  
export const loadWalletKey = (keypair: string): Keypair => {
    if (!keypair || keypair === '') {
      throw new Error('Keypair is required!');
    }
    const loaded = Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(fs.readFileSync(keypair).toString())),
    );
    return loaded;
  }
  
  export const writePublicKey = (publicKey: PublicKey, name: string) => {
    fs.writeFileSync(
      `./keys/${name}_pub.json`,
      JSON.stringify(publicKey.toString())
    );
  };
  
  export const getPublicKey = (name: string) =>
    new PublicKey(
      JSON.parse(fs.readFileSync(`./keys/${name}_pub.json`) as unknown as string)
    );
  
    export const getFormattedPrice = (price: BN) => {
        if (price === undefined) return "---";
        let priceStr = price.toString();
        if (priceStr.length < 6) return "0";
        let floatStr = priceStr.substring(priceStr.length - 9, priceStr.length);
        if (floatStr.length === 6) floatStr = '0.000' + floatStr;
        else if (floatStr.length === 7) floatStr = '0.00' + floatStr;
        else if (floatStr.length === 8) floatStr = '0.0' + floatStr;
        else if (priceStr.length === 9) floatStr = '0.' + floatStr;
        else floatStr = priceStr.substring(0, priceStr.length - 9 ) + '.' + floatStr;
      
        let cutIdx = floatStr.length-1;
        for (; cutIdx >= 0 ; cutIdx--)
          if (floatStr[cutIdx] !== '0') break;
        return floatStr.substring(0, cutIdx+1);
      }

      export const showToast = (txt: string, ty: number) => {
        let type = toast.TYPE.SUCCESS;
        if (ty === 1) type = toast.TYPE.ERROR;
        toast.error(txt, {
          position: "bottom-left",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          type,
          theme: 'colored'
        });
      }

      export const decoratePubKey = (key: PublicKey) => {
        let str = key.toBase58();
        let len = str.length;
        return str.substring(0, 5) + '...' + str.substring(len - 5, len);
      }



export type StringPublicKey = string;

export class LazyAccountInfoProxy<T> {
  executable: boolean = false;
  owner: StringPublicKey = '';
  lamports: number = 0;

  get data() {
    //
    return undefined as unknown as T;
  }
}

export interface LazyAccountInfo {
  executable: boolean;
  owner: StringPublicKey;
  lamports: number;
  data: [string, string];
}

const PubKeysInternedMap = new Map<string, PublicKey>();

export const toPublicKey = (key: string | PublicKey) => {
  if (typeof key !== 'string') {
    return key;
  }

  let result = PubKeysInternedMap.get(key);
  if (!result) {
    result = new PublicKey(key);
    PubKeysInternedMap.set(key, result);
  }

  return result;
};

export const pubkeyToString = (key: PublicKey | null | string = '') => {
  return typeof key === 'string' ? key : key?.toBase58() || '';
};

export interface PublicKeyStringAndAccount<T> {
  pubkey: string;
  account: AccountInfo<T>;
}

export const WRAPPED_SOL_MINT = new PublicKey(
  'So11111111111111111111111111111111111111112',
);

export const TOKEN_PROGRAM_ID = new PublicKey(
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
);

export const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = new PublicKey(
  'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
);

export const BPF_UPGRADE_LOADER_ID = new PublicKey(
  'BPFLoaderUpgradeab1e11111111111111111111111',
);

export const MEMO_ID = new PublicKey(
  'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr',
);

export const METADATA_PROGRAM_ID =
  'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s' as StringPublicKey;

export const VAULT_ID =
  'vau1zxA2LbssAUEF7Gpw91zMM1LvXrvpzJtmZ58rPsn' as StringPublicKey;

export const AUCTION_ID =
  'auctxRXPeJoc4817jDhf4HbjnhEcr1cCXenosMhK5R8' as StringPublicKey;

export const METAPLEX_ID =
  'p1exdMJcjVao65QdewkaZRUnU6VPSXhus9n2GzWfh98' as StringPublicKey;

export const SYSTEM = new PublicKey('11111111111111111111111111111111');
      
export const setProgramIds = async (store?: string) => {
  STORE = store ? toPublicKey(store) : undefined;
};

let STORE: PublicKey | undefined;

export const programIds = () => {
  return {
    token: TOKEN_PROGRAM_ID,
    associatedToken: SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
    bpf_upgrade_loader: BPF_UPGRADE_LOADER_ID,
    system: SYSTEM,
    metadata: METADATA_PROGRAM_ID,
    memo: MEMO_ID,
    vault: VAULT_ID,
    auction: AUCTION_ID,
    metaplex: METAPLEX_ID,
    store: STORE,
  };
};

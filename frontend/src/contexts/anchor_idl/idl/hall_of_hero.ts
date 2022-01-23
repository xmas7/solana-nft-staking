export type HallOfHero = {
  "version": "0.0.0",
  "name": "hall_of_hero",
  "instructions": [
    {
      "name": "addRecord",
      "accounts": [
        {
          "name": "initializer",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "repository",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftMint",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "heroId",
          "type": "u8"
        },
        {
          "name": "contentUri",
          "type": "string"
        },
        {
          "name": "price",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updateRecord",
      "accounts": [
        {
          "name": "updater",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "repository",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenAccount",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "heroId",
          "type": "u8"
        },
        {
          "name": "contentUri",
          "type": "string"
        },
        {
          "name": "newPrice",
          "type": "u64"
        }
      ]
    },
    {
      "name": "buyRecord",
      "accounts": [
        {
          "name": "initializer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "buyer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "prevOwner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "repository",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "deadNftMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "deadNftTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "deadNftMetadataAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "newNftMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftTokenAccountToSend",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftTokenAccountToReceive",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMetadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "heroId",
          "type": "u8"
        },
        {
          "name": "deadUri",
          "type": "string"
        },
        {
          "name": "deadName",
          "type": "string"
        }
      ]
    }
  ]
};

export const IDL: HallOfHero = {
  "version": "0.0.0",
  "name": "hall_of_hero",
  "instructions": [
    {
      "name": "addRecord",
      "accounts": [
        {
          "name": "initializer",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "repository",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftMint",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "heroId",
          "type": "u8"
        },
        {
          "name": "contentUri",
          "type": "string"
        },
        {
          "name": "price",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updateRecord",
      "accounts": [
        {
          "name": "updater",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "repository",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenAccount",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "heroId",
          "type": "u8"
        },
        {
          "name": "contentUri",
          "type": "string"
        },
        {
          "name": "newPrice",
          "type": "u64"
        }
      ]
    },
    {
      "name": "buyRecord",
      "accounts": [
        {
          "name": "initializer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "buyer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "prevOwner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "repository",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "deadNftMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "deadNftTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "deadNftMetadataAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "newNftMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftTokenAccountToSend",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftTokenAccountToReceive",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMetadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "heroId",
          "type": "u8"
        },
        {
          "name": "deadUri",
          "type": "string"
        },
        {
          "name": "deadName",
          "type": "string"
        }
      ]
    }
  ]
};

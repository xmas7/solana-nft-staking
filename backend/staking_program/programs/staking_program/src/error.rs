use anchor_lang::prelude::*;

#[error]
pub enum StakingError {
    #[msg("Invalid pool number")]
    InvalidPoolError,
    #[msg("No Matching NFT to withdraw")]
    InvalidNFTAddress,
    #[msg("NFT Owner key mismatch")]
    InvalidOwner,
    #[msg("Staking Locked Now")]
    InvalidWithdrawTime
}
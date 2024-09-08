module AptosInstitute {

    use aptos_framework::token::{Token, TokenStore};
    use aptos_framework::coin::Coin;
    use aptos_framework::account;
    use aptos_framework::signer;
    
    struct Admin has store {
        address: address,
    }

    public fun initialize_admin(account: &signer) {
        let admin = Admin { address: signer::address_of(account) };
        move_to(account, admin);
    }

    public fun get_admin_address(): address {
        return borrow_global<Admin>(@AdminResource).address;
    }
}

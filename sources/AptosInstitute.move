module aptos_institute::developer_cv {
    use std::error;
    use std::signer;
    use std::string::{Self, String};
    use std::vector;
    use aptos_framework::account;
    use aptos_framework::event;
    use aptos_framework::timestamp;
    use aptos_std::ed25519;
    use aptos_token::token::{Self, TokenDataId};
    use aptos_framework::resource_account;

    struct ModuleData has key {
        admin_public_key: ed25519::ValidatedPublicKey,
        signer_cap: account::SignerCapability,
        token_data_id: TokenDataId,
        minting_enabled: bool,
    }

    const EINVALID_ADMIN_SIGNATURE: u64 = 1;
    const ENOT_AUTHORIZED: u64 = 2;

    /// Initialize the module with a hardcoded public key
    fun init_module(resource_signer: &signer) {
        let signer_cap = resource_account::retrieve_resource_account_cap(resource_signer, @source_addr);

        // Hardcoded public key - this will be updated later by calling `set_public_key`
        let pk_bytes = x"f66bf0ce5ceb582b93d6780820c2025b9967aedaa259bdbb9f3d0297eced0e18";
        let public_key = std::option::extract(&mut ed25519::new_validated_public_key_from_bytes(pk_bytes));

        // Create a token data id to specify the dynamic NFT to be minted
        let token_data_id = token::create_tokendata(
            resource_signer,
            string::utf8(b"Aptos Developer CV"),
            string::utf8(b"Dynamic Developer Resume"),
            string::utf8(b""),
            0,
            string::utf8(b"https://nft-uri.com"), // Placeholder URI
            signer::address_of(resource_signer),
            1,
            0,
            token::create_token_mutability_config(&vector<bool>[false, false, true]),
            vector<String>[string::utf8(b"developer_address")],
            vector<vector<u8>>[b""],
            vector<String>[string::utf8(b"address")]
        );

        // Store module data
        move_to(resource_signer, ModuleData {
            admin_public_key: public_key,
            signer_cap,
            token_data_id,
            minting_enabled: true,
        });
    }

    /// Function to set the public key for the admin after module initialization
    public entry fun set_public_key(admin: &signer, pk_bytes: vector<u8>) acquires ModuleData {
        let admin_address = signer::address_of(admin);
        assert!(admin_address == @admin_addr, error::permission_denied(ENOT_AUTHORIZED));

        let module_data = borrow_global_mut<ModuleData>(@aptos_institute);
        module_data.admin_public_key = std::option::extract(&mut ed25519::new_validated_public_key_from_bytes(pk_bytes));
    }
}

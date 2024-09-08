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


    #[event]
    struct DeveloperNftMintedEvent has drop, store {
        developer_address: address,
        token_data_id: TokenDataId,
    }

    #[event]
    struct DeveloperStatsUpdatedEvent has drop, store {
        developer_address: address,
        updated_points: u64,
        quest_status: bool,
    }

    struct ModuleData has key {
        admin_public_key: ed25519::ValidatedPublicKey,
        signer_cap: account::SignerCapability,
        token_data_id: TokenDataId,
        minting_enabled: bool,
    }

    struct DeveloperCV has key, store {
        points: u64,
        quest_progress: vector<bool>,  // Track quest completions (true for complete, false for failed)
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

    /// Mint an NFT for a new developer starting the curriculum
    public entry fun mint_developer_cv(developer: &signer) acquires ModuleData {
        let developer_address = signer::address_of(developer);
        let module_data = borrow_global<ModuleData>(@aptos_institute);

        // Check if minting is enabled
        assert!(module_data.minting_enabled, error::permission_denied(ENOT_AUTHORIZED));

        // Mint the developer's CV (NFT)
        let resource_signer = account::create_signer_with_capability(&module_data.signer_cap);
        let token_id = token::mint_token(&resource_signer, module_data.token_data_id, 1);
        token::direct_transfer(&resource_signer, developer, token_id, 1);

        // Initialize developer's stats
        move_to(developer, DeveloperCV {
            points: 0,
            quest_progress: vector::empty<bool>(),  // No quests completed at the start
        });

        // Emit the event for tracking the minted NFT
        event::emit(DeveloperNftMintedEvent {
            developer_address,
            token_data_id: module_data.token_data_id,
        });
    }

    /// Admin updates the developer's CV after quest completion
    public entry fun update_developer_stats(
        admin: &signer,
        developer_address: address,
        quest_completed: bool,
        points_earned: u64,
        admin_signature: vector<u8>
    ) acquires ModuleData, DeveloperCV {
        let admin_address = signer::address_of(admin);
        let module_data = borrow_global<ModuleData>(@aptos_institute);

        // Verify admin's signature
        let sequence_number = account::get_sequence_number(admin_address);
        let challenge = b"update_developer_stats";
        let signature = ed25519::new_signature_from_bytes(admin_signature);
        let public_key = ed25519::public_key_to_unvalidated(&module_data.admin_public_key);

        assert!(
            ed25519::signature_verify_strict_t(&signature, &public_key, challenge),
            error::invalid_argument(EINVALID_ADMIN_SIGNATURE)
        );

        // Update developer stats
        let dev_cv = borrow_global_mut<DeveloperCV>(developer_address);
        dev_cv.points = dev_cv.points + points_earned;
        vector::push_back(&mut dev_cv.quest_progress, quest_completed);

        // Emit an event for tracking the stats update
        event::emit(DeveloperStatsUpdatedEvent {
            developer_address,
            updated_points: dev_cv.points,
            quest_status: quest_completed,
        });
    }

    /// Enable/Disable NFT minting (Admin Only)
    public entry fun set_minting_enabled(admin: &signer, enabled: bool) acquires ModuleData {
        let admin_address = signer::address_of(admin);
        assert!(admin_address == @admin_addr, error::permission_denied(ENOT_AUTHORIZED));
        let module_data = borrow_global_mut<ModuleData>(@aptos_institute);
        module_data.minting_enabled = enabled;
    }
}

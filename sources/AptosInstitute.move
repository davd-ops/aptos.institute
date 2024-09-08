module aptos_institute::developer_cv {
    use std::error;
    use std::signer;
    use std::string::{Self, String};
    use std::vector;
    use aptos_framework::account;
    use aptos_framework::event;
    use aptos_std::ed25519;
    use aptos_token::token::{Self, TokenDataId};
    use aptos_framework::resource_account;
    use aptos_framework::object;
    use aptos_framework::fungible_asset::{Self as FA, MintRef};
    use aptos_framework::primary_fungible_store;
    use std::option;

    #[event]
    struct DeveloperNftMintedEvent has drop, store {
        developer_address: address,
        token_data_id: TokenDataId,
    }

    #[event]
    struct DeveloperStatsUpdatedEvent has drop, store {
        developer_address: address,
        quest_id: u64,
        points: u64,
        tokens_earned: u64,
    }

    struct ModuleData has key {
        admin_public_key: ed25519::ValidatedPublicKey,
        signer_cap: account::SignerCapability,
        token_data_id: TokenDataId,
        minting_enabled: bool,
        quest_token_mint_ref: MintRef, // Using MintRef from FA standard
    }

    struct DeveloperCV has key, store {
        points: u64,  // Total points across all quests
        quest_points: vector<u64>,  // Points for each quest (indexed by quest ID)
    }

    /// Quest Token struct (Fungible Token)
    struct QuestToken has key { }

    const EINVALID_ADMIN_SIGNATURE: u64 = 1;
    const ENOT_AUTHORIZED: u64 = 2;
    const EINVALID_QUEST_ID: u64 = 3;
    const EPOINTS_EXCEED_LIMIT: u64 = 4;

    /// Initialize the module with a hardcoded public key and create fungible asset (FA)
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

        // Create the fungible asset (FA) metadata object using FA standard
        let constructor_ref = object::create_sticky_object(signer::address_of(resource_signer));

        primary_fungible_store::create_primary_store_enabled_fungible_asset(
            &constructor_ref,
            option::none(), // No maximum supply
            string::utf8(b"Quest Token"), // Name
            string::utf8(b"QT"), // Symbol
            8, // Decimals
            string::utf8(b"https://example.com/token.png"), // Icon URL
            string::utf8(b"https://example.com") // Project URL
        );

        // Generate the MintRef to enable minting
        let mint_ref = FA::generate_mint_ref(&constructor_ref);

        // Store module data
        move_to(resource_signer, ModuleData {
            admin_public_key: public_key,
            signer_cap,
            token_data_id,
            minting_enabled: true,
            quest_token_mint_ref: mint_ref, // Store the MintRef for future minting
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

        // Initialize developer's stats with 0 points and an empty quest vector
        move_to(developer, DeveloperCV {
            points: 0,
            quest_points: vector::empty<u64>(),
        });

        // Emit the event for tracking the minted NFT
        event::emit(DeveloperNftMintedEvent {
            developer_address,
            token_data_id: module_data.token_data_id,
        });
    }

    /// Admin updates the developer's CV after quest completion and awards tokens
    public entry fun update_developer_stats(
        developer_address: address,
        quest_id: u64,
        points_earned: u64,
        admin_signature: vector<u8>
    ) acquires ModuleData, DeveloperCV {
        let module_data = borrow_global<ModuleData>(@aptos_institute);

        // Verify admin's signature
        let challenge = b"update_developer_stats";
        let signature = ed25519::new_signature_from_bytes(admin_signature);
        let public_key = ed25519::public_key_to_unvalidated(&module_data.admin_public_key);

        assert!(
            ed25519::signature_verify_strict_t(&signature, &public_key, challenge),
            error::invalid_argument(EINVALID_ADMIN_SIGNATURE)
        );

        // Update developer stats
        let dev_cv = borrow_global_mut<DeveloperCV>(developer_address);

        // Ensure the quest_id is valid (if it doesn't exist, expand the vector)
        if (quest_id >= vector::length(&dev_cv.quest_points)) {
            vector::push_back(&mut dev_cv.quest_points, 0);
        };

        // Get the current points for the quest
        let current_points = *vector::borrow(&dev_cv.quest_points, quest_id);

        // If the new score is less than or equal to the current score, do nothing
        if (points_earned <= current_points) {
            return;
        };

        // Ensure the total points for this quest do not exceed 10
        let new_points = points_earned;
        assert!(new_points <= 10, error::invalid_argument(EPOINTS_EXCEED_LIMIT));
    
        // Calculate points improvement and award tokens
        let points_improved = new_points - current_points;
        let tokens_to_award = points_improved * 10;

        // Update quest-specific points and total points
        *vector::borrow_mut(&mut dev_cv.quest_points, quest_id) = new_points;
        dev_cv.points = dev_cv.points + points_improved;

        // Mint tokens to developer
        let minted_tokens = FA::mint(&module_data.quest_token_mint_ref, tokens_to_award);

        // Deposit the minted tokens into the developer's account
        primary_fungible_store::deposit(developer_address, minted_tokens);

        // Emit an event for tracking the stats update and token award
        event::emit(DeveloperStatsUpdatedEvent {
            developer_address,
            quest_id,
            points: new_points,
            tokens_earned: tokens_to_award,
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

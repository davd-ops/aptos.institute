module AptosInstitute::developer_resume {
    use std::error;
    use std::option;
    use std::string::{Self, String};
    use std::signer;
    use std::vector;

    use aptos_framework::object::{Self, Object};
    use aptos_token_objects::collection;
    use aptos_token_objects::token;
    use aptos_token_objects::property_map;
    use aptos_framework::event;

    /// The token does not exist
    const ETOKEN_DOES_NOT_EXIST: u64 = 1;
    /// The provided signer is not the creator
    const ENOT_CREATOR: u64 = 2;

    /// The resume collection name
    const COLLECTION_NAME: vector<u8> = b"Developer Resume Collection";
    /// The resume collection description
    const COLLECTION_DESCRIPTION: vector<u8> = b"Dynamic Developer Resume NFT";
    /// The resume collection URI
    const COLLECTION_URI: vector<u8> = b"https://developer-resume-uri.com";

    #[resource_group_member(group = aptos_framework::object::ObjectGroup)]
    /// The developer resume token
    struct DeveloperResumeToken has key {
        /// Used to mutate the token URI
        mutator_ref: token::MutatorRef,
        /// Used to burn
        burn_ref: token::BurnRef,
        /// Used to mutate properties
        property_mutator_ref: property_map::MutatorRef,
        /// The base URI of the token
        base_uri: String,
    }

    /// Initializes the module, creating the developer resume collection.
    fun init_module(sender: &signer) {
        create_resume_collection(sender);
    }

    /// Creates the developer resume collection.
    fun create_resume_collection(creator: &signer) {
        let description = string::utf8(COLLECTION_DESCRIPTION);
        let name = string::utf8(COLLECTION_NAME);
        let uri = string::utf8(COLLECTION_URI);

        collection::create_unlimited_collection(
            creator,
            description,
            name,
            option::none(),
            uri,
        );
    }

    inline fun authorize_creator<T: key>(creator: &signer, token: &Object<T>) {
        let token_address = object::object_address(token);
        assert!(
            exists<T>(token_address),
            error::not_found(ETOKEN_DOES_NOT_EXIST),
        );
        assert!(
            token::creator(*token) == signer::address_of(creator),
            error::permission_denied(ENOT_CREATOR),
        );
    }
}
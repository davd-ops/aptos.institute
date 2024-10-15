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
    const COLLECTION_URI: vector<u8> = b"https://aptos-institute.vercel.app/collection";

    /// Developer ranks based on completed courses
    const RANK_BEGINNER: vector<u8> = b"Beginner";
    const RANK_INTERMEDIATE: vector<u8> = b"Intermediate";
    const RANK_EXPERT: vector<u8> = b"Expert";

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

    #[resource_group_member(group = aptos_framework::object::ObjectGroup)]
    /// The developer's progress across courses and challenges
    struct DeveloperProgress has key {
        total_points: u64,
        completed_courses: vector<u64>,  // Stores course completion as course IDs
        course_scores: vector<u64>,      // Stores numerical scores per course
    }

    #[event]
    /// The developer progress update event
    struct ProgressUpdate has drop, store {
        token: Object<DeveloperResumeToken>,
        course_id: u64,
        score_u64: u64,
    }

    /// Initializes the module, creating the developer resume collection.
    fun init_module(sender: &signer) {
        create_resume_collection(sender);
    }

    #[view]
    /// Returns the total points of the resume
    public fun resume_total_points(token: Object<DeveloperResumeToken>): u64 acquires DeveloperProgress {
        let progress = borrow_global<DeveloperProgress>(object::object_address(&token));
        progress.total_points
    }

    #[view]
    /// Returns the list of completed courses and scores
    public fun resume_course_scores(token: Object<DeveloperResumeToken>): (vector<u64>, vector<u64>) acquires DeveloperProgress {
        let progress = borrow_global<DeveloperProgress>(object::object_address(&token));
        (progress.completed_courses, progress.course_scores)
    }

    #[view]
    /// Returns the resume rank based on completed courses
    public fun resume_rank(token: Object<DeveloperResumeToken>): String {
        property_map::read_string(&token, &string::utf8(b"Rank"))
    }

    #[view]
    /// Returns the course details for a given course ID
    public fun get_course_details(
        token: Object<DeveloperResumeToken>, 
        course_id: String
    ): String {
        let course_property_name = string::utf8(b"CourseID_");
        string::append(&mut course_property_name, course_id);

        // Use the `token` object directly with `property_map::read_string`
        let course_details = property_map::read_string(&token, &course_property_name);

        course_details
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

    /// Mints a developer resume token without initial course data and transfers it to the soul_bound_to address.
    public entry fun mint_resume(
        creator: &signer,
        description: String,
        name: String,
        base_uri: String,
        soul_bound_to: address,
    ) {
        let collection = string::utf8(COLLECTION_NAME);
        let uri = base_uri;
        string::append(&mut uri, string::utf8(RANK_BEGINNER));
        let constructor_ref = token::create_named_token(
            creator,
            collection,
            description,
            name,
            option::none(),
            uri,
        );

        let object_signer = object::generate_signer(&constructor_ref);
        let transfer_ref = object::generate_transfer_ref(&constructor_ref);
        let mutator_ref = token::generate_mutator_ref(&constructor_ref);
        let burn_ref = token::generate_burn_ref(&constructor_ref);
        let property_mutator_ref = property_map::generate_mutator_ref(&constructor_ref);

        let linear_transfer_ref = object::generate_linear_transfer_ref(&transfer_ref);
        object::transfer_with_ref(linear_transfer_ref, soul_bound_to);
        object::disable_ungated_transfer(&transfer_ref);

        move_to(&object_signer, DeveloperProgress { total_points: 0, completed_courses: vector::empty(), course_scores: vector::empty() });

        let properties = property_map::prepare_input(vector[], vector[], vector[]);
        property_map::init(&constructor_ref, properties);
        property_map::add_typed(&property_mutator_ref, string::utf8(b"Rank"), string::utf8(RANK_BEGINNER));

        let resume_token = DeveloperResumeToken {
            mutator_ref,
            burn_ref,
            property_mutator_ref,
            base_uri,
        };
        move_to(&object_signer, resume_token);
    }

    /// Burns a developer resume token
    public entry fun burn_resume(creator: &signer, token: Object<DeveloperResumeToken>) acquires DeveloperResumeToken, DeveloperProgress {
        authorize_creator(creator, &token);
        let resume_token = move_from<DeveloperResumeToken>(object::object_address(&token));
        let DeveloperResumeToken { mutator_ref: _, burn_ref, property_mutator_ref, base_uri: _ } = resume_token;

        let DeveloperProgress { total_points: _, completed_courses: _, course_scores: _ } = move_from<DeveloperProgress>(object::object_address(&token));

        property_map::burn(property_mutator_ref);
        token::burn(burn_ref);
    }

    /// Function to sum the elements of a vector<u64>
    fun sum_vector(scores: &vector<u64>): u64 {
        let total: u64 = 0;
        let length = vector::length(scores);
        let i: u64 = 0;

        while (i < length) {
            let score = *vector::borrow(scores, i);
            total = total + score;
            i = i + 1;
        };
        total
    }

    /// Updates the developer resume rank based on the number of completed courses
    fun update_resume_rank(
        token: Object<DeveloperResumeToken>,
        completed_courses: u64
    ) acquires DeveloperResumeToken {
        let new_rank = if (completed_courses < 3) {
            RANK_BEGINNER
        } else if (completed_courses < 5) {
            RANK_INTERMEDIATE
        } else {
            RANK_EXPERT
        };

        let token_address = object::object_address(&token);
        let resume_token = borrow_global<DeveloperResumeToken>(token_address);
        let property_mutator_ref = &resume_token.property_mutator_ref;

        property_map::update_typed(property_mutator_ref, &string::utf8(b"Rank"), string::utf8(new_rank));
        
        let uri = resume_token.base_uri;
        string::append(&mut uri, string::utf8(new_rank));
        token::set_uri(&resume_token.mutator_ref, uri);
    }

    public entry fun update_resume_progress(
        creator: &signer,
        token: Object<DeveloperResumeToken>,
        course_name: String,
        challenges: String,
        course_id: String,
        course_id_u64: u64,
        score: String,
        score_u64: u64,
        attempts: String,
        hints: String
    ) acquires DeveloperProgress, DeveloperResumeToken {
        authorize_creator(creator, &token);

        let token_address = object::object_address(&token);
        let progress = borrow_global_mut<DeveloperProgress>(token_address);

        // Check if the course is already completed
        let (found, index) = vector::index_of(&progress.completed_courses, &course_id_u64);
        if (!found) {
            vector::push_back(&mut progress.completed_courses, course_id_u64);
            vector::push_back(&mut progress.course_scores, score_u64);
        } else {
            // If already completed, update the u64 score
            *vector::borrow_mut(&mut progress.course_scores, index) = score_u64;
        };

        // Recalculate total points by summing the course scores
        let total_score = sum_vector(&progress.course_scores);
        progress.total_points = total_score;

        // Emit event for progress update
        event::emit(ProgressUpdate {
            token,
            course_id: course_id_u64,
            score_u64,
        });

        // Perform rank update before we borrow the token mutably for property update
        update_resume_rank(token, vector::length(&progress.completed_courses));

        // Now proceed to update the token properties with course details, attempts, and hints
        let course_property_name = string::utf8(b"CourseID_");
        string::append(&mut course_property_name, course_id);
        let course_property_value = string::utf8(b"Course: ");
        string::append(&mut course_property_value, course_name);
        string::append(&mut course_property_value, string::utf8(b", Challenges: "));
        string::append(&mut course_property_value, challenges);
        string::append(&mut course_property_value, string::utf8(b", Score: "));
        string::append(&mut course_property_value, score);
        string::append(&mut course_property_value, string::utf8(b", Attempts: "));
        string::append(&mut course_property_value, attempts);
        string::append(&mut course_property_value, string::utf8(b", Hints: "));
        string::append(&mut course_property_value, hints);

        // Borrow token mutably for property mutation
        let resume_token = borrow_global_mut<DeveloperResumeToken>(token_address);
        let property_mutator_ref = &resume_token.property_mutator_ref;

        // Add or update the property directly
        property_map::add_typed(property_mutator_ref, course_property_name, course_property_value);
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
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";
import { Challenge } from "@/app/models/Challenges";

const challenges = [
  {
    courseId: "course_1",
    challengeId: "challenge_1_1",
    defaultCode: `module <Account>::<Module> { 
  use std::signer;
  use std::string::{Self, String};
  use aptos_framework::object::{Self, ObjectCore};
 
  // Define a struct MyStruct1 with a field message of type String
  struct MyStruct1 has key {
    message: String,
  }
 
  // Define a struct MyStruct2 with a field message of type String
 
 // Define an entry function that takes a signer reference and an address as arguments
  entry fun <function_name>(caller: &signer, destination: address) { 
    // Create object
    let caller_address = signer::address_of(caller); // Get the address of the caller
    let constructor_ref = object::create_object(caller_address); // Create an object with the caller's address
    let object_signer = object::generate_signer(&constructor_ref); // Generate a signer for the object
 
    // Set up the object by creating 2 resources in it
    move_to(&object_signer, MyStruct1 {
      message: string::utf8(b"hello")
    });
    move_to(&object_signer, MyStruct2 {
      // Initialize the message field with the string "world"
    });
 
    // Transfer to destination
    let object = object::object_from_constructor_ref<ObjectCore>(
      &constructor_ref
    );
    // object::transfer accept the caller, object, and destination as arguments
    object::transfer();
  }
}`,
    correctCode: `module AptosInstitute::object_playground {
  use std::signer;
  use std::string::{Self, String};
  use aptos_framework::object::{Self, ObjectCore};
   
   // Define a struct MyStruct1 with a field message of type String
  struct MyStruct1 has key {
    message: String,
  }

// Define a struct MyStruct2 with a field message of type String
  struct MyStruct2 has key {
    message: String,
  }
  
  // Define an entry function that takes a signer reference and an address as arguments
  entry fun create_and_transfer(caller: &signer, destination: address) {
    // Create object
    let caller_address = signer::address_of(caller); // Get the address of the caller
    let constructor_ref = object::create_object(caller_address); // Create an object with the caller's address
    let object_signer = object::generate_signer(&constructor_ref); // Generate a signer for the object
 
    // Set up the object by creating 2 resources in it
    move_to(&object_signer, MyStruct1 {
      message: string::utf8(b"hello")
    });
    move_to(&object_signer, MyStruct2 {
      message: string::utf8(b"world") // Initialize the message field with the string "world"
    });
 
    // Transfer to destination
    let object = object::object_from_constructor_ref<ObjectCore>(
      &constructor_ref
    );
    // object::transfer accept the caller, object, and destination as arguments
    object::transfer(caller, object, destination);
  }
}`,
    explanation: `In this module, you're tasked with defining two structs (MyStruct1 and MyStruct2) that hold simple String values`,
    task: `
  <ol>
    <li><strong>Initialize the Contract:</strong> Make sure the contract is initialized with the <code>AptosInstitute</code> account, and the module name is <code>object_playground</code>.</li>
    <li><strong>Define the Structs:</strong> Define and initialize two structs, <code>MyStruct1</code> and <code>MyStruct2</code>, each having a field of type <code>String</code>:
      <ul>
        <li><code>MyStruct1</code> should have the message <strong>"hello"</strong>.</li>
        <li><code>MyStruct2</code> should have the message <strong>"world"</strong>.</li>
      </ul>
    </li>
    <li><strong>Implement create_and_transfer Function:</strong>
      <ul>
        <li>Create an object using the caller's address.</li>
        <li>Move <code>MyStruct1</code> and <code>MyStruct2</code> to the object with their respective messages.</li>
        <li>Implement the object transfer using the <code>object::transfer</code> function, passing the caller, object, and destination address.</li>
      </ul>
    </li>
  </ol>
`,
    name: "Object Playground",
  },
  {
    courseId: "course_1",
    challengeId: "challenge_1_2",
    defaultCode: `module <Account>::<Module> {
  use std::signer;
  use aptos_framework::table::{Self, Table};

  // Define a struct MyTable to store key-value pairs
  struct MyTable has key {
    table: Table<u64, String>
  }

  // Define an entry function that initializes a table and adds an entry to it
  entry fun <function_name>(caller: &signer) {
    let <tableName> = Table::new(); // Initialize a table my_table
    table::add(&mut my_table, 1, ); // Insert key-value pair 1 and string "hello"
    move_to(caller, <Struct> { table: <tableName> }); // Store the table in the caller's account
  }
}`,
    correctCode: `module AptosInstitute::table_playground {
  use std::signer;
  use aptos_framework::table::{Self, Table};

  // Define a struct MyTable to store key-value pairs
  struct MyTable has key {
    table: Table<u64, String>
  }

  // Define an entry function that initializes a table and adds an entry to it
  entry fun create_and_store(caller: &signer) {
    let my_table = Table::new(); // Initialize a table my_table
    table::add(&mut my_table, 1, string::utf8(b"hello")); // Insert key-value pair 1 and string "hello"
    move_to(caller, MyTable { table: my_table }); // Store the table in the caller's account
  }
}`,
    explanation: `In this module, you're tasked with creating a table that stores key-value pairs and adding an entry to it.`,
    task: `
  <ol>
    <li><strong>Initialize the Contract:</strong> Make sure the contract is initialized with the <code>AptosInstitute</code> account, and the module name is <code>table_playground</code>.</li>
    <li><strong>Define the Table:</strong> Create a struct <code>MyTable</code> that holds a <code>Table<u64, String></code>.</li>
    <li><strong>Implement create_and_store Function:</strong>
      <ul>
        <li>Initialize a table.</li>
        <li>Add an entry with key <strong>1</strong> and string value <strong>"hello"</strong>.</li>
        <li>Move the table to the caller's account.</li>
      </ul>
    </li>
  </ol>
`,
    name: "Working with Tables",
  },
  {
    courseId: "course_1",
    challengeId: "challenge_1_3",
    defaultCode: `module <Account>::<Module> {
  use std::signer;
  use std::string::{Self, String};

  // Define a struct MyStruct with multiple fields: name, age, and email
  struct MyStruct has key {
    name: String,
    age: u64,
    email: String
  }

  // Define an entry function that initializes the struct
  entry fun <function_name>(caller: &signer) {
    // Initialize MyStruct
  }
}`,
    correctCode: `module AptosInstitute::struct_playground {
  use std::signer;
  use std::string::{Self, String};

  // Define a struct MyStruct with multiple fields: name, age, and email
  struct MyStruct has key {
    name: String,
    age: u64,
    email: String
  }

  // Define an entry function that initializes the struct
  entry fun create_struct(caller: &signer) {
    let my_struct = MyStruct {
      name: string::utf8(b"John Doe"),
      age: 30,
      email: string::utf8(b"john@example.com")
    };
    move_to(caller, my_struct); // Store MyStruct in the caller's account
  }
}`,
    explanation: `In this module, you're tasked with defining a struct with multiple fields and initializing it with sample data.`,
    task: `
  <ol>
    <li><strong>Initialize the Contract:</strong> Make sure the contract is initialized with the <code>AptosInstitute</code> account, and the module name is <code>struct_playground</code>.</li>
    <li><strong>Define the Struct:</strong> Create a struct <code>MyStruct</code> with three fields:
      <ul>
        <li><code>name</code> of type <code>String</code></li>
        <li><code>age</code> of type <code>u64</code></li>
        <li><code>email</code> of type <code>String</code></li>
      </ul>
    </li>
    <li><strong>Implement create_struct Function:</strong>
      <ul>
        <li>Initialize <code>MyStruct</code> with sample data ("John Doe", 30, "john@example.com").</li>
        <li>Store <code>MyStruct</code> in the caller's account.</li>
      </ul>
    </li>
  </ol>
`,
    name: "Structs with Multiple Fields",
  },
  {
    courseId: "course_1",
    challengeId: "challenge_1_4",
    defaultCode: `module <Account>::<Module> {
  use std::signer;
  use std::vector::{Self, Vector};

  // Define a struct MyVectorStruct that stores a vector of u64 values
  struct MyVectorStruct has key {
    values: Vector<u64>
  }

  // Define an entry function that initializes a vector and adds values to it
  entry fun <function_name>(caller: &signer) {
    // Initialize the vector and add values
  }
}`,
    correctCode: `module AptosInstitute::vector_playground {
  use std::signer;
  use std::vector::{Self, Vector};

  // Define a struct MyVectorStruct that stores a vector of u64 values
  struct MyVectorStruct has key {
    values: Vector<u64>
  }

  // Define an entry function that initializes a vector and adds values to it
  entry fun create_and_add_to_vector(caller: &signer) {
    let my_vector = vector::empty<u64>(); // Initialize an empty vector
    vector::push_back(&mut my_vector, 10); // Add value 10
    vector::push_back(&mut my_vector, 20); // Add value 20
    move_to(caller, MyVectorStruct { values: my_vector }); // Store the vector in the caller's account
  }
}`,
    explanation: `In this module, you're tasked with creating a vector of u64 values and adding elements to it.`,
    task: `
  <ol>
    <li><strong>Initialize the Contract:</strong> Make sure the contract is initialized with the <code>AptosInstitute</code> account, and the module name is <code>vector_playground</code>.</li>
    <li><strong>Define the Vector:</strong> Create a struct <code>MyVectorStruct</code> that holds a <code>Vector<u64></code>.</li>
    <li><strong>Implement create_and_add_to_vector Function:</strong>
      <ul>
        <li>Initialize a vector.</li>
        <li>Add two values to the vector: <strong>10</strong> and <strong>20</strong>.</li>
        <li>Store the vector in the caller's account.</li>
      </ul>
    </li>
  </ol>
`,
    name: "Vectors in Move",
  },
  {
    courseId: "course_1",
    challengeId: "challenge_1_5",
    defaultCode: `module <Account>::<Module> {
  use std::signer;
  use std::option::{Self, Option};

  // Define a struct Counter to store a count value
  struct Counter has key {
    value: u64
  }

  // Define an entry function to initialize the counter
  entry fun <function_name>(caller: &signer) {
    // Initialize the counter with value 0
  }
}`,
    correctCode: `module AptosInstitute::counter_playground {
  use std::signer;
  use std::option::{Self, Option};

  // Define a struct Counter to store a count value
  struct Counter has key {
    value: u64
  }

  // Define an entry function to initialize the counter
  entry fun initialize_counter(caller: &signer) {
    let counter = Counter { value: 0 }; // Initialize the counter with value 0
    move_to(caller, counter); // Store the counter in the caller's account
  }
}`,
    explanation: `In this module, you're tasked with creating a simple counter that initializes with a value of 0.`,
    task: `
  <ol>
    <li><strong>Initialize the Contract:</strong> Make sure the contract is initialized with the <code>AptosInstitute</code> account, and the module name is <code>counter_playground</code>.</li>
    <li><strong>Define the Struct:</strong> Create a struct <code>Counter</code> that holds a single field <code>value</code> of type <code>u64</code>.</li>
    <li><strong>Implement initialize_counter Function:</strong>
      <ul>
        <li>Initialize the counter with value <strong>0</strong>.</li>
        <li>Store the counter in the caller's account.</li>
      </ul>
    </li>
  </ol>
`,
    name: "Simple Counter",
  },
  {
    courseId: "course_2",
    challengeId: "challenge_2_1",
    defaultCode: `module <Account>::<Module> {
  use aptos_framework::fungible_asset::{Self, MintRef, TransferRef, BurnRef, Metadata, FungibleAsset};
  use aptos_framework::object::{Self, Object};
  use aptos_framework::primary_fungible_store;
  use std::signer;

  struct ManagedFungibleAsset has key {
    mint_ref: MintRef,
    transfer_ref: TransferRef,
    burn_ref: BurnRef
  }

  // Define a function to initialize the fungible asset
  entry fun <function_name>(admin: &signer) {
    let constructor_ref = object::create_named_object(admin, b"QUEST");
    primary_fungible_store::create_primary_store_enabled_fungible_asset(
      constructor_ref,
      utf8(b"Quest Token"), // name
      utf8(b"QUEST"), // symbol
      7, // decimals
      utf8(b"http://aptos-institute.vercel.app/favicon.ico"), // icon URL
      utf8(b"http://aptos-institute.vercel.app") // website URL
    );

    // Initialize mint_ref
    let mint_ref = fungible_asset::generate_mint_ref(constructor_ref);

    // Initialize also burn_ref, and transfer_ref

    // Move the ManagedFungibleAsset to the admin account
    move_to(admin, ManagedFungibleAsset { mint_ref, ... });
  }
}`,
    correctCode: `module AptosInstitute::quest_token {
  use aptos_framework::fungible_asset::{Self, MintRef, TransferRef, BurnRef, Metadata, FungibleAsset};
  use aptos_framework::object::{Self, Object};
  use aptos_framework::primary_fungible_store;
  use std::signer;

  struct ManagedFungibleAsset has key {
    mint_ref: MintRef,
    transfer_ref: TransferRef,
    burn_ref: BurnRef
  }

  entry fun init_module(admin: &signer) {
    let constructor_ref = object::create_named_object(admin, b"QUEST");
    primary_fungible_store::create_primary_store_enabled_fungible_asset(
      constructor_ref,
      utf8(b"Quest Token"), // name
      utf8(b"QUEST"), // symbol
      7, // decimals
      utf8(b"http://aptos-institute.vercel.app/favicon.ico"), // icon URL
      utf8(b"http://aptos-institute.vercel.app") // website URL
    );

    let mint_ref = fungible_asset::generate_mint_ref(constructor_ref);
    let burn_ref = fungible_asset::generate_burn_ref(constructor_ref);
    let transfer_ref = fungible_asset::generate_transfer_ref(constructor_ref);
    move_to(admin, ManagedFungibleAsset { mint_ref, transfer_ref, burn_ref });
  }
}`,
    explanation: `In this challenge, you're tasked with initializing a fungible asset. The function will set up the token's metadata and prepare the mint, burn, and transfer capabilities.`,
    task: `
  <ol>
    <li><strong>Initialize the Contract:</strong> Make sure the contract is initialized with the <code>AptosInstitute</code> account, and the module name is <code>quest_token</code>.</li>
    <li><strong>Fill in the missing fields:</strong>
      <ul>
        <li>Complete the initialization of the <code>mint_ref</code>, <code>burn_ref</code>, and <code>transfer_ref</code>.</li>
        <li>Ensure that the metadata object for the fungible asset is properly created.</li>
      </ul>
    </li>
  </ol>
`,
    name: "Initialize Fungible Asset",
  },
  {
    courseId: "course_2",
    challengeId: "challenge_2_2",
    defaultCode: `module <Account>::<Module> {
  use aptos_framework::fungible_asset::{Self, MintRef, TransferRef, FungibleAsset};
  use aptos_framework::primary_fungible_store;
  use aptos_framework::object::{Self, Object};
  use std::signer;

  struct ManagedFungibleAsset has key {
    mint_ref: MintRef,
    transfer_ref: TransferRef
  }

  // Define a function to mint tokens
  entry fun <function_name>(admin: &signer, to: address, amount: u64) acquires ManagedFungibleAsset {
    let asset = <get_metadata_function>();
    let managed_fungible_asset = <borrow_refs_function>(admin, asset);
    
    let to_wallet = primary_fungible_store::ensure_primary_store_exists(to, asset);
    let fa = fungible_asset::mint(&managed_fungible_asset.mint_ref, amount);
    <deposit_function>(&managed_fungible_asset.transfer_ref, to_wallet, fa);
  }
}`,
    correctCode: `module AptosInstitute::quest_token {
  use aptos_framework::fungible_asset::{Self, MintRef, TransferRef, FungibleAsset};
  use aptos_framework::primary_fungible_store;
  use aptos_framework::object::{Self, Object};
  use std::signer;

  struct ManagedFungibleAsset has key {
    mint_ref: MintRef,
    transfer_ref: TransferRef
  }

  entry fun mint(admin: &signer, to: address, amount: u64) acquires ManagedFungibleAsset {
    let asset = get_metadata();
    let managed_fungible_asset = authorized_borrow_refs(admin, asset);

    let to_wallet = primary_fungible_store::ensure_primary_store_exists(to, asset);
    let fa = fungible_asset::mint(&managed_fungible_asset.mint_ref, amount);
    fungible_asset::deposit_with_ref(&managed_fungible_asset.transfer_ref, to_wallet, fa);
  }
}`,
    explanation: `In this challenge, you will implement the mint function to mint tokens and deposit them into a specified account.`,
    task: `
  <ol>
    <li><strong>Initialize the Contract:</strong> Make sure the contract is initialized with the <code>AptosInstitute</code> account, and the module name is <code>quest_token</code>.</li>
    <li><strong>Complete the function:</strong>
      <ul>
        <li>Implement the minting logic by calling the appropriate functions to generate tokens and deposit them to the destination address.</li>
      </ul>
    </li>
  </ol>
`,
    name: "Mint Tokens",
  },
  {
    courseId: "course_2",
    challengeId: "challenge_2_3",
    defaultCode: `module <Account>::<Module> {
  use aptos_framework::fungible_asset::{Self, TransferRef};
  use aptos_framework::primary_fungible_store;
  use aptos_framework::object::{Self, Object};
  use std::signer;

  struct ManagedFungibleAsset has key {
    transfer_ref: TransferRef
  }

  // Define a function to transfer tokens
  entry fun <function_name>(from: &signer, to: address, amount: u64) acquires ManagedFungibleAsset {
    let asset = <get_metadata_function>();
    let from_wallet = primary_fungible_store::primary_store(signer::address_of(from), asset);
    let to_wallet = primary_fungible_store::ensure_primary_store_exists(to, asset);
    <transfer_function>(&<borrow_refs_function>().transfer_ref, from_wallet, to_wallet, amount);
  }
}`,
    correctCode: `module AptosInstitute::quest_token {
  use aptos_framework::fungible_asset::{Self, TransferRef};
  use aptos_framework::primary_fungible_store;
  use aptos_framework::object::{Self, Object};
  use std::signer;

  struct ManagedFungibleAsset has key {
    transfer_ref: TransferRef
  }

  entry fun transfer(from: &signer, to: address, amount: u64) acquires ManagedFungibleAsset {
    let asset = get_metadata();
    let from_wallet = primary_fungible_store::primary_store(signer::address_of(from), asset);
    let to_wallet = primary_fungible_store::ensure_primary_store_exists(to, asset);
    fungible_asset::transfer_with_ref(&borrow_global<ManagedFungibleAsset>(object::object_address(&asset)).transfer_ref, from_wallet, to_wallet, amount);
  }
}`,
    explanation: `In this challenge, you will implement the logic for transferring tokens from one account to another.`,
    task: `
  <ol>
    <li><strong>Initialize the Contract:</strong> Make sure the contract is initialized with the <code>AptosInstitute</code> account, and the module name is <code>quest_token</code>.</li>
    <li><strong>Complete the function:</strong>
      <ul>
        <li>Transfer tokens by retrieving the source and destination wallets and moving the specified amount of tokens.</li>
      </ul>
    </li>
  </ol>
`,
    name: "Transfer Tokens",
  },
  {
    courseId: "course_2",
    challengeId: "challenge_2_4",
    defaultCode: `module <Account>::<Module> {
  use aptos_framework::fungible_asset::{Self, BurnRef};
  use aptos_framework::primary_fungible_store;
  use aptos_framework::object::{Self, Object};
  use std::signer;

  struct ManagedFungibleAsset has key {
    burn_ref: BurnRef
  }

  // Define a function to burn tokens
  entry fun <function_name>(from: &signer, amount: u64) acquires ManagedFungibleAsset {
    let asset = <get_metadata_function>();
    let from_wallet = primary_fungible_store::primary_store(signer::address_of(from), asset);
    <burn_function>(&<borrow_refs_function>().burn_ref, from_wallet, amount);
  }
}`,
    correctCode: `module AptosInstitute::quest_token {
  use aptos_framework::fungible_asset::{Self, BurnRef};
  use aptos_framework::primary_fungible_store;
  use aptos_framework::object::{Self, Object};
  use std::signer;

  struct ManagedFungibleAsset has key {
    burn_ref: BurnRef
  }

  entry fun burn(from: &signer, amount: u64) acquires ManagedFungibleAsset {
    let asset = get_metadata();
    let from_wallet = primary_fungible_store::primary_store(signer::address_of(from), asset);
    fungible_asset::burn_from(&borrow_global<ManagedFungibleAsset>(object::object_address(&asset)).burn_ref, from_wallet, amount);
  }
}`,
    explanation: `In this challenge, you will implement the logic to burn tokens, which permanently removes them from circulation.`,
    task: `
  <ol>
    <li><strong>Initialize the Contract:</strong> Make sure the contract is initialized with the <code>AptosInstitute</code> account, and the module name is <code>quest_token</code>.</li>
    <li><strong>Complete the function:</strong>
      <ul>
        <li>Burn tokens from the caller's wallet by implementing the appropriate function to remove the specified amount of tokens.</li>
      </ul>
    </li>
  </ol>
`,
    name: "Burn Tokens",
  },
  {
    courseId: "course_2",
    challengeId: "challenge_2_5",
    defaultCode: `module <Account>::<Module> {
  use aptos_framework::fungible_asset::{Self, TransferRef};
  use aptos_framework::primary_fungible_store;
  use aptos_framework::object::{Self, Object};
  use std::signer;

  struct ManagedFungibleAsset has key {
    transfer_ref: TransferRef
  }

  // Define functions to freeze and unfreeze accounts
  entry fun <freeze_function>(admin: &signer, account: address) acquires ManagedFungibleAsset {
    let asset = <get_metadata_function>();
    let wallet = primary_fungible_store::ensure_primary_store_exists(account, asset);
    <freeze_account_function>(&<borrow_refs_function>().transfer_ref, wallet, true);
  }

  entry fun <unfreeze_function>(admin: &signer, account: address) acquires ManagedFungibleAsset {
    let asset = <get_metadata_function>();
    let wallet = primary_fungible_store::ensure_primary_store_exists(account, asset);
    <freeze_account_function>(&<borrow_refs_function>().transfer_ref, wallet, false);
  }
}`,
    correctCode: `module AptosInstitute::quest_token {
  use aptos_framework::fungible_asset::{Self, TransferRef};
  use aptos_framework::primary_fungible_store;
  use aptos_framework::object::{Self, Object};
  use std::signer;

  struct ManagedFungibleAsset has key {
    transfer_ref: TransferRef
  }

  entry fun freeze_account(admin: &signer, account: address) acquires ManagedFungibleAsset {
    let asset = get_metadata();
    let wallet = primary_fungible_store::ensure_primary_store_exists(account, asset);
    fungible_asset::set_frozen_flag(&authorized_borrow_refs(admin, asset).transfer_ref, wallet, true);
  }

  entry fun unfreeze_account(admin: &signer, account: address) acquires ManagedFungibleAsset {
    let asset = get_metadata();
    let wallet = primary_fungible_store::ensure_primary_store_exists(account, asset);
    fungible_asset::set_frozen_flag(&authorized_borrow_refs(admin, asset).transfer_ref, wallet, false);
  }
}`,
    explanation: `In this challenge, you will implement the logic to freeze and unfreeze an account, preventing or allowing token transfers.`,
    task: `
  <ol>
    <li><strong>Initialize the Contract:</strong> Make sure the contract is initialized with the <code>AptosInstitute</code> account, and the module name is <code>quest_token</code>.</li>
    <li><strong>Complete the functions:</strong>
      <ul>
        <li>Implement the logic to freeze and unfreeze accounts, preventing or enabling transfers.</li>
      </ul>
    </li>
  </ol>
`,
    name: "Freeze and Unfreeze Accounts",
  },
  {
    courseId: "course_2",
    challengeId: "challenge_2_6",
    defaultCode: `module <Account>::<Module> {
  use aptos_framework::fungible_asset::{Self, FungibleAsset, TransferRef};
  use aptos_framework::primary_fungible_store;
  use aptos_framework::object::{Self, Object};
  use std::signer;

  struct ManagedFungibleAsset has key {
    transfer_ref: TransferRef
  }

  // Define a function to withdraw tokens
  public fun <withdraw_function>(admin: &signer, amount: u64, from: address): FungibleAsset acquires ManagedFungibleAsset {
    let asset = <get_metadata_function>();
    let from_wallet = primary_fungible_store::primary_store(from, asset);
    <withdraw_function>(&<borrow_refs_function>().transfer_ref, from_wallet, amount)
  }

  // Define a function to deposit tokens
  public fun <deposit_function>(admin: &signer, to: address, fa: FungibleAsset) acquires ManagedFungibleAsset {
    let asset = <get_metadata_function>();
    let to_wallet = primary_fungible_store::ensure_primary_store_exists(to, asset);
    <deposit_function>(&<borrow_refs_function>().transfer_ref, to_wallet, fa);
  }
}`,
    correctCode: `module AptosInstitute::quest_token {
  use aptos_framework::fungible_asset::{Self, FungibleAsset, TransferRef};
  use aptos_framework::primary_fungible_store;
  use aptos_framework::object::{Self, Object};
  use std::signer;

  struct ManagedFungibleAsset has key {
    transfer_ref: TransferRef
  }

  public fun withdraw(admin: &signer, amount: u64, from: address): FungibleAsset acquires ManagedFungibleAsset {
    let asset = get_metadata();
    let from_wallet = primary_fungible_store::primary_store(from, asset);
    fungible_asset::withdraw_with_ref(&authorized_borrow_refs(admin, asset).transfer_ref, from_wallet, amount)
  }

  public fun deposit(admin: &signer, to: address, fa: FungibleAsset) acquires ManagedFungibleAsset {
    let asset = get_metadata();
    let to_wallet = primary_fungible_store::ensure_primary_store_exists(to, asset);
    fungible_asset::deposit_with_ref(&authorized_borrow_refs(admin, asset).transfer_ref, to_wallet, fa);
  }
}`,
    explanation: `In this final challenge, you will implement the logic to withdraw tokens from an account and deposit tokens into an account.`,
    task: `
  <ol>
    <li><strong>Initialize the Contract:</strong> Make sure the contract is initialized with the <code>AptosInstitute</code> account, and the module name is <code>quest_token</code>.</li>
    <li><strong>Complete the functions:</strong>
      <ul>
        <li>Implement the logic to withdraw tokens from a specified account.</li>
        <li>Implement the logic to deposit tokens into a specified account.</li>
      </ul>
    </li>
  </ol>
`,
    name: "Deposit and Withdraw Tokens",
  },
  {
    courseId: "course_3",
    challengeId: "challenge_3_1",
    defaultCode: `first challenge`,
    correctCode: `first challenge`,
    explanation: `explanation`,
    task: `task`,
    name: "name",
  },
  {
    courseId: "course_3",
    challengeId: "challenge_3_2",
    defaultCode: `second challenge`,
    correctCode: `second challenge`,
    explanation: `explanation`,
    task: `task`,
    name: "name",
  },
  {
    courseId: "course_3",
    challengeId: "challenge_3_3",
    defaultCode: `third challenge`,
    correctCode: `third challenge`,
    explanation: `explanation`,
    task: `task`,
    name: "name",
  },
];

export async function POST() {
  try {
    await connectToDatabase();

    for (const challenge of challenges) {
      const existingChallenge = await Challenge.findOne({
        challengeId: challenge.challengeId,
      });

      if (!existingChallenge) {
        await Challenge.create(challenge);
      }
    }

    return NextResponse.json(
      { message: "Challenges created" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating challenges:", error);
    return NextResponse.json(
      { message: "Error creating challenges" },
      { status: 500 }
    );
  }
}

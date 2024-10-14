import {
  Account,
  Aptos,
  AptosConfig,
  Network,
  NetworkToNetworkName,
  AccountAddress,
  Ed25519PrivateKey,
  HexInput,
} from "@aptos-labs/ts-sdk";

const APTOS_NETWORK: Network = NetworkToNetworkName[Network.DEVNET];
const config = new AptosConfig({ network: APTOS_NETWORK });
const aptos = new Aptos(config);

const adminPrivateKey = new Ed25519PrivateKey(
  process.env.APTOS_ADMIN_PRIVATE_KEY as HexInput
);
const admin = Account.fromPrivateKey({ privateKey: adminPrivateKey });

const DECIMALS = 10_000_000; // 1 token = 10^7

// Function to mint tokens for a user
export async function mintTokens(
  receiverAddress: string,
  amount: number
): Promise<string> {
  const receiver = AccountAddress.from(receiverAddress);
  const scaledAmount = amount * DECIMALS;

  const transaction = await aptos.transaction.build.simple({
    sender: admin.accountAddress,
    data: {
      function: `${admin.accountAddress}::quest_token::mint`,
      functionArguments: [receiver, scaledAmount],
    },
  });

  const signedTransaction = aptos.transaction.sign({
    signer: admin,
    transaction,
  });

  const pendingTxn = await aptos.transaction.submit.simple({
    transaction,
    senderAuthenticator: signedTransaction,
  });

  await aptos.transaction.waitForTransaction({
    transactionHash: pendingTxn.hash,
  });
  return pendingTxn.hash;
}

// Function to mint a developer resume NFT
export async function mintResume(
  description: string,
  name: string,
  baseUri: string,
  recipientAddress: string
): Promise<string> {
  const recipient = AccountAddress.from(recipientAddress);

  const transaction = await aptos.transaction.build.simple({
    sender: admin.accountAddress,
    data: {
      function: `${admin.accountAddress}::developer_resume::mint_resume`,
      functionArguments: [description, name, baseUri, recipient],
    },
  });

  const signedTransaction = aptos.transaction.sign({
    signer: admin,
    transaction,
  });

  const pendingTxn = await aptos.transaction.submit.simple({
    transaction,
    senderAuthenticator: signedTransaction,
  });

  await aptos.transaction.waitForTransaction({
    transactionHash: pendingTxn.hash,
  });
  return pendingTxn.hash;
}

// Function to get the developer resume token address from the user's wallet
export async function getDeveloperResumeTokenAddress(
  userAddress: string
): Promise<{ tokenId: string }> {
  const address = AccountAddress.from(userAddress);

  // Fetch the owned tokens of the account
  const tokens = await aptos.getAccountOwnedTokens({
    accountAddress: address,
  });

  // Find the developer resume token from the owned tokens list
  const developerResumeToken = tokens.find(
    (token) =>
      token.current_token_data?.collection_id ===
      "0xb63590536f388b1ed8d12a1858dc51a76161afcfabb8e780f249c61de853f872"
  );

  if (!developerResumeToken) {
    throw new Error("No Developer Resume token found for this user.");
  }

  const tokenId = developerResumeToken.token_data_id;

  console.log("Token ID:", tokenId);

  return { tokenId };
}

// Function to update the developer's resume progress
export async function updateResumeProgress(
  userAddress: string,
  courseName: string,
  challenges: string,
  courseId: string,
  courseIdU64: number,
  score: string,
  scoreU64: number,
  attempts: string,
  hints: string
): Promise<string> {
  const tokenAddress = await getDeveloperResumeTokenAddress(userAddress);
  const token = AccountAddress.from(tokenAddress.tokenId);

  const transaction = await aptos.transaction.build.simple({
    sender: admin.accountAddress,
    data: {
      function: `${admin.accountAddress}::developer_resume::update_resume_progress`,
      functionArguments: [
        token,
        courseName,
        challenges,
        courseId,
        courseIdU64,
        score,
        scoreU64,
        attempts,
        hints,
      ],
    },
  });

  const signedTransaction = aptos.transaction.sign({
    signer: admin,
    transaction,
  });

  const pendingTxn = await aptos.transaction.submit.simple({
    transaction,
    senderAuthenticator: signedTransaction,
  });

  await aptos.transaction.waitForTransaction({
    transactionHash: pendingTxn.hash,
  });

  return pendingTxn.hash;
}

// Function to get user balance of QUEST token (Fungible Asset)
export async function getQuestTokenBalance(
  userAddress: string
): Promise<number> {
  const address = AccountAddress.from(userAddress);

  const resources = await aptos.getAccountCoinsData({
    accountAddress: address,
  });

  const questToken = resources.find(
    (resource) => resource.metadata?.symbol === "QUEST"
  );

  if (!questToken) {
    throw new Error("QUEST token not found for this user.");
  }

  const questBalance = parseInt(questToken.amount, 10) / Math.pow(10, 7);

  console.log("QUEST Token Balance:", questBalance);
  return questBalance;
}

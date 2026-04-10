import algosdk from "algosdk";
import { ALGOD_SERVER, ALGOD_PORT, ALGOD_TOKEN } from "../config/constants";

const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT);

// Sign a group of payments via Pera and submit
export async function signAndSubmitPayment(txnsContainer, wallet) {
  // Decode the unsigned payments from base64
  const txnsToSign = txnsContainer.map(({ txn }) => {
    const txnBytes = Uint8Array.from(atob(txn), (c) => c.charCodeAt(0));
    const decodedTxn = algosdk.decodeUnsignedTransaction(txnBytes);
    return { txn: decodedTxn, signers: [wallet.address] };
  });

  // Ask Pera to sign
  const signedTxns = await wallet.signTransactions(txnsToSign);

  // Submit signed payment to Algorand
  const result = await algodClient.sendRawTransaction(signedTxns).do();
  const txId = result.txId || result.txid;
  await algosdk.waitForConfirmation(algodClient, txId, 10);
  return txId;
}

import { ethers } from "ethers";
// @ts-ignore
import config from "../../config.json";
import { PrimeSdk } from "../../../src";
import { printOp } from "../../../src/sdk/common/OperationUtils";

export default async function main(
  tknid: number,
  t: string,
  tkn: string,
) {
  const primeSdk = new PrimeSdk({ privateKey: config.signingKey }, { chainId: config.chainId, rpcProviderUrl: config.rpcProviderUrl })

  const address = await primeSdk.getCounterFactualAddress();

  const tokenId = tknid;
  const tokenAddress = ethers.utils.getAddress(tkn);
  const to = ethers.utils.getAddress(t);
  console.log(`Transferring NFT ${tknid} ...`);

  const erc721Interface = new ethers.utils.Interface([
    'function safeTransferFrom(address _from, address _to, uint256 _tokenId)'
  ])

  const erc721Data = erc721Interface.encodeFunctionData('safeTransferFrom', [address, to, tokenId]);

  // clear the transaction batch
  await primeSdk.clearUserOpsFromBatch();

  
  await primeSdk.addUserOpsToBatch({to: tokenAddress, data: erc721Data});
  console.log(`Added transaction to batch`);

  const op = await primeSdk.sign();
  console.log(`Signed UserOp: ${await printOp(op)}`);

  // sending to the bundler...
  const uoHash = await primeSdk.send(op);
  console.log(`UserOpHash: ${uoHash}`);

  // get transaction hash...
  console.log('Waiting for transaction...');
  const txHash = await primeSdk.getUserOpReceipt(uoHash);
  console.log('\x1b[33m%s\x1b[0m', `Transaction hash: ${txHash}`);
}

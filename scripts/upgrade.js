const hre = require("hardhat");
const { encryptDataField, decryptNodeResponse } = require("@swisstronik/utils");

const sendShieldedTransaction = async (signer, destination, data, value) => {
  const rpclink = hre.network.config.url;
  const [encryptedData] = await encryptDataField(rpclink, data);
  return await signer.sendTransaction({
    from: signer.address,
    to: destination,
    data: encryptedData,
    value,
  });
};

async function main() {
  // Replace with the address of your deployed proxy contract
  const proxyAddress = "0x70B113Fa02B3E86d5be0a5995D4708EE8c93f323";

  // Replace with the address of your new implementation contract
  const newImplementationAddress = "0x954013AeeB7e437c8933eFD891Eb48883B8439A1";

  const [signer] = await hre.ethers.getSigners();
  const contractFactory = await hre.ethers.getContractFactory(
    "SwisstronikProxy"
  );
  const proxyContract = contractFactory.attach(proxyAddress);

  // Prepare the data for the upgradeTo function call
  const functionName = "upgradeTo";
  const upgradeToTxData = proxyContract.interface.encodeFunctionData(
    functionName,
    [newImplementationAddress]
  );

  // Send the shielded transaction to upgrade the proxy to the new implementation
  const upgradeTx = await sendShieldedTransaction(
    signer,
    proxyAddress,
    upgradeToTxData,
    0
  );
  await upgradeTx.wait();

  console.log("Proxy upgraded successfully. Transaction Receipt: ", upgradeTx);
}

main().catch((error) => {
  console.error("Error during upgrade:", error);
  process.exitCode = 1;
});

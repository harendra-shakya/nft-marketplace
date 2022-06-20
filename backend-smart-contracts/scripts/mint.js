const { ethers, network } = require("hardhat");

const PRICE = ethers.utils.parseEther("0.1");

async function mint() {
    const basicNft = await ethers.getContract("BasicNftTwo");
    console.log("Minting NFT...");
    const mintTx = await basicNft.mintNft();
    console.log("waiting for receipts");
    const mintTxReceipt = await mintTx.wait(1);
    const tokenId = mintTxReceipt.events[0].args.tokenId;
    console.log("Got token id", parseInt(tokenId));
    console.log("Got nft address", basicNft.address);
}

mint()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

const { ethers } = require("hardhat");
const { moveBlocks} = require("../utils/move-blocks");

const Token_ID = 4;

async function cancel() {
    const nftMarketplace = await ethers.getContract("NftMarketplace");
    const basicNft = await ethers.getContract("BasicNft");
    const tx = await nftMarketplace.cancelListing(basicNft.address, Token_ID);
    await tx.wait(1);
    console.log("Nft canceled");
    if(network.config.chainId == "31337"){
        moveBlocks(2, (sleepAmount = 1000));
    }
}

cancel()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
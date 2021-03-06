const { verify } = require("../utils/verify");
const { network } = require("hardhat");
const {
    VERIFICATION_BLOCK_CONFIRMATIONS,
    developmentChains,
} = require("../helper-hardhat-config");

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deployer } = await getNamedAccounts();
    const { deploy, log } = deployments;
    const waitBlockConfirmations = developmentChains.includes(network.name)
        ? 1
        : VERIFICATION_BLOCK_CONFIRMATIONS;

    log("---------------------------------------");

    const nftMarketplace = await deploy("NftMarketplace", {
        from: deployer,
        args: [],
        log: true,
        waitConfirmations: waitBlockConfirmations,
    });

    log("---------------------------------------");

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("------Verifying-----");
        await verify(nftMarketplace.address, []);
        log("------Verified------");
    }
};

module.exports.tags = ["all", "nftMarketplace"];

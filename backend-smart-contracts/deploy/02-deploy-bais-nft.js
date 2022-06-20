const { verify } = require("../utils/verify");
const { network } = require("hardhat");
const {
    VERIFICATION_BLOCK_CONFIRMATIONS,
    developmentChains
} = require("../helper-hardhat-config");

module.exports = async function({ getNamedAccounts, deployments }) {
    const { deployer } = await getNamedAccounts();
    const { deploy, log } = deployments;
    const waitConfirmations = developmentChains.includes(network.name)
        ? 1
        : VERIFICATION_BLOCK_CONFIRMATIONS;

    const basicNft = await deploy("BasicNft", {
        from: deployer,
        args: [],
        log: true,
        waitConfirmations: waitConfirmations
    });

    const basicNftTwo = await deploy("BasicNftTwo", {
        from: deployer,
        args: [],
        log: true,
        waitConfirmations: waitConfirmations
    });

    if (!developmentChains.includes(network.name) && process.env.POLYGONSCAN_API_KEY) {
        log("-------Verifying--------");
        await verify(basicNft.address, []);
        await verify(basicNftTwo.address, []);
        log("-------Verified--------");
    }
};

module.exports.tags = ["all", "basicNft"];

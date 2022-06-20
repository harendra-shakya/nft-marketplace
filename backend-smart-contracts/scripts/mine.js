const {moveBlocks} = require("../utils/move-blocks")

const BLOCKS = 2;

async function mine() {
    await moveBlocks(BLOCKS, (sleepAmount = 1000))
}

mine()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
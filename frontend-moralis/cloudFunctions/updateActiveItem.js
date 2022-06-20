Moralis.Cloud.afterSave("ItemListed", async (request) => {
    const confirmed = request.object.get("confirmed");
    const logger = Moralis.Cloud.getLogger();
    logger.info("Looking for confirmed Tx");
    if (confirmed) {
        logger.info("Item Found");
        const ActiveItem = Moralis.Object.extend("ActiveItem");

        const query = new Moralis.Query(ActiveItem);
        query.equalTo("marketplaceAddress", request.object.get("address"));
        query.equalTo("nftAddress", request.object.get("nftAddress"));
        query.equalTo("tokenId", request.object.get("tokenId"));
        const alreadyListedItem = await query.first();
        if (alreadyListedItem) {
            logger.info(
                `Deleting already listed item, ObjectId: ${request.object.get("objectId")}`
            );
            await alreadyListedItem.destroy();
            logger.info(
                `Deleted already listed item with tokenId ${request.object.get("tokenId")}`
            );
        }

        const activeItem = new ActiveItem();
        activeItem.set("marketplaceAddress", request.object.get("address"));
        activeItem.set("nftAddress", request.object.get("nftAddress"));
        activeItem.set("price", request.object.get("price"));
        activeItem.set("tokenId", request.object.get("tokenId"));
        activeItem.set("seller", request.object.get("seller"));
        logger.info(
            `Addind Address: ${request.object.get("address")}, TokenId: ${request.object.get(
                "tokenId"
            )}`
        );
        logger.info("Saving....");
        await activeItem.save();
    }
});

Moralis.Cloud.afterSave("ItemCanceled", async (request) => {
    const confirmed = request.object.get("confirmed");
    const logger = Moralis.Cloud.getLogger();
    logger.info("Looking for confirmed tx");
    if (confirmed) {
        const ActiveItem = Moralis.Object.extend("ActiveItem");
        const query = new Moralis.Query(ActiveItem);
        query.equalTo("marketplaceAddress", request.object.get("address"));
        query.equalTo("nftAddress", request.object.get("nftAddress"));
        query.equalTo("tokenId", request.object.get("tokenId"));
        logger.info(`Marketplace | Query ${query}`);
        const canceledItem = await query.first();
        if (canceledItem) {
            logger.info(
                `Deleting item with token id ${request.object.get(
                    "tokenId"
                )} at address ${request.object.get("address")} since item is canceled`
            );
            await canceledItem.destroy();
        } else {
            logger.info(
                `No item found for canceling with token Id ${request.object.get(
                    "tokenId"
                )} at address ${request.object.get("address")}`
            );
        }
    }
});

Moralis.Cloud.afterSave("ItemBought", async (request) => {
    const confirmed = request.object.get("confirmed");
    const logger = Moralis.Cloud.getLogger();
    logger.info("Looking for confirmed tx");
    if (confirmed) {
        const ActiveItem = Moralis.Object.extend("ActiveItem");
        const query = new Moralis.Query(ActiveItem);
        query.equalTo("marketplaceAddress", request.object.get("address"));
        query.equalTo("nftAddress", request.object.get("nftAddress"));
        query.equalTo("tokenId", request.object.get("tokenId"));
        const boughtItem = await query.first();
        logger.info(`Marketplace | Query ${query}`);
        if (boughtItem) {
            logger.info(
                `Deleting item with token id ${request.object.get(
                    "tokenId"
                )} at address ${request.object.get("address")} since item is bought`
            );
            await boughtItem.destroy();
        } else {
            logger.info(
                `N item found with token Id ${request.object.get(
                    "tokenId"
                )} at address ${request.object.get("address")}`
            );
        }
    }
});

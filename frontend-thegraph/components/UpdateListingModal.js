import { Modal, Input, useNotification } from "web3uikit";
import { useState } from "react";
import { useWeb3Contract } from "react-moralis";
import nftMarketplaceAbi from "../constants/NftMarketplace.json";
import { ethers } from "ethers";

export default function UpdateListingModal({
    nftAddress,
    tokenId,
    isVisible,
    marketplaceAddress,
    onClose,
}) {
    const [priceToUpdateListingWith, setPriceToUpdateListingWith] = useState(0);
    const dispatch = useNotification();

    const { runContractFunction: updateListing } = useWeb3Contract({
        abi: nftMarketplaceAbi,
        contractAddress: marketplaceAddress,
        functionName: "updateListing",
        params: {
            nftAddress: nftAddress,
            tokenId: tokenId,
            newPrice: ethers.utils.parseEther(priceToUpdateListingWith || "0"),
        },
    });

    const handleUpdateListing = async (tx) => {
        onClose && onClose();
        await tx.wait(1);
        dispatch({
            type: "success",
            message: "Listing Updated!",
            title: "Listing Updated please refresh",
            position: "topR",
        });

        setPriceToUpdateListingWith("0");
    };

    return (
        <Modal
            isVisible={isVisible}
            onCancel={onClose}
            onCloseButtonPressed={onClose}
            onOk={() => {
                updateListing({
                    onError: (err) => {
                        console.error(err);
                    },
                    onSuccess: handleUpdateListing,
                });
            }}
        >
            <Input
                label="Update listing price in ETH"
                name="New Listing Price"
                type="number"
                onChange={(event) => {
                    setPriceToUpdateListingWith(event.target.value);
                }}
            />
        </Modal>
    );
}

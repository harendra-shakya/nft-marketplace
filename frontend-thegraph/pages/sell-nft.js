import styles from "../styles/Home.module.css";
import { Form, useNotification, Button } from "web3uikit";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { ethers } from "ethers";
import nftAbi from "../constants/BasicNft.json";
import nftMarketplaceAbi from "../constants/NftMarketplace.json";
import networkMapping from "../constants/networkMapping.json";
import { useEffect, useState } from "react";

export default function Home() {
    const { chainId, account, isWeb3Enabled } = useMoralis();
    const chainString = chainId ? parseInt(chainId).toString() : "31337";
    const marketplaceAddress = networkMapping[chainString].NftMarketplace[0];
    const dispatch = useNotification();
    const [proceeds, setProceeds] = useState("0");

    const { runContractFunction } = useWeb3Contract();

    async function approveAndList(data) {
        console.log("Approving....");
        const nftAddress = data.data[0].inputResult;
        const tokenId = data.data[1].inputResult;
        const price = ethers.utils.parseUnits(data.data[2].inputResult, "ether").toString();

        const approveOptions = {
            abi: nftAbi,
            contractAddress: nftAddress,
            functionName: "approve",
            params: {
                to: marketplaceAddress,
                tokenId: tokenId,
            },
        };

        await runContractFunction({
            params: approveOptions,
            onSuccess: () => handleApproveSuccess(nftAddress, tokenId, price),
            onError: (e) => console.error(e),
        });
    }

    async function handleApproveSuccess(nftAddress, tokenId, price) {
        console.log("Ok it's time to list");
        const listOptions = {
            abi: nftMarketplaceAbi,
            contractAddress: marketplaceAddress,
            functionName: "listItem",
            params: {
                nftAddress: nftAddress,
                tokenId: tokenId,
                price: price,
            },
        };

        await runContractFunction({
            params: listOptions,
            onSuccess: handleListSuccess,
            onError: (e) => console.error(e),
        });
    }

    async function handleListSuccess(tx) {
        await tx.wait(1);
        dispatch({
            type: "success",
            message: "NFT listed - please refresh",
            title: "NFT Listed!",
            position: "topR",
        });
    }

    async function handleWithdrawSuccess(tx) {
        await tx.wait(1);
        dispatch({
            type: "success",
            title: "Withdrawing proceeds",
            position: "topR",
        });
    }

    async function updateUI() {
        const returnedProceeds = await runContractFunction({
            params: {
                abi: nftMarketplaceAbi,
                contractAddress: marketplaceAddress,
                functionName: "getProceeds",
                params: {
                    seller: account,
                },
            },
            onError: (e) => console.error(e),
        });

        if (returnedProceeds) {
            setProceeds(returnedProceeds.toString());
        }
    }

    useEffect(() => {
        updateUI();
    }, [proceeds, isWeb3Enabled, chainId, account]);

    return (
        <div className={styles.container}>
            <Form
                onSubmit={approveAndList}
                data={[
                    {
                        name: "NFT Address",
                        type: "text",
                        inputWidth: "50%",
                        value: "",
                        key: "nftAddress",
                    },
                    {
                        name: "Token ID",
                        type: "number",
                        value: "",
                        key: "tokenId",
                    },
                    {
                        name: "Price in ETH",
                        type: "number",
                        value: "",
                        key: "price",
                    },
                ]}
                title="Sell Your NFT"
                id="Main Form"
            />
            <div className="flex flex-wrap text-xl pt-20">
                Your Proceeds: {ethers.utils.formatUnits(proceeds, "ether")} ETH
            </div>
            {proceeds != 0 ? (
                <Button
                    onClick={() => {
                        runContractFunction({
                            params: {
                                abi: nftMarketplaceAbi,
                                contractAddress: marketplaceAddress,
                                functionName: "withdrawProceeds",
                                params: {},
                            },
                            onError: (error) => console.log(error),
                            onSuccess: handleWithdrawSuccess,
                        });
                    }}
                    text="Withdraw"
                    type="button"
                />
            ) : (
                <div>You Currently have 0 proceeds</div>
            )}

            <footer className="absolute bottom-0 left-2 ">
                <p className="footer__copyright">
                    <a target="_blank" href="https://twitter.com/harendrashakya_">
                        © Harendra Shakya
                    </a>
                </p>
            </footer>
        </div>
    );
}

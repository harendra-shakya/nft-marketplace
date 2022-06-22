import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useMoralisQuery, useMoralis } from "react-moralis";
import NFTBox from "../components/NFTBox";
import networkMapping from "../constants/networkMapping.json";
import { useQuery } from "@apollo/client";
import GET_ACTIVE_ITEMS from "../constants/subgraphQueries";

export default function Home() {
    const { chainId, isWeb3Enabled } = useMoralis();
    const chainString = chainId ? parseInt(chainId).toString() : "31337";
    const marketplaceAddress = networkMapping[chainString].NftMarketplace[0];

    const { loading, error, data: listedNfts } = useQuery(GET_ACTIVE_ITEMS);

    console.log(listedNfts);

    return (
        <div className="container mx-auto pt-4">
            <h1 className="py-4 px-3 font-bold text-2xl">Recently Listed</h1>

            <div className="flex flex-wrap pt-5">
                {isWeb3Enabled ? (
                    loading || !listedNfts ? (
                        <div>Loading...</div>
                    ) : (
                        listedNfts.activeItems.map((nft) => {
                            console.log(nft);
                            const { price, nftAddress, tokenId, seller } = nft;
                            return (
                                <div>
                                    <NFTBox
                                        price={price}
                                        nftAddress={nftAddress}
                                        tokenId={tokenId}
                                        marketplaceAddress={marketplaceAddress}
                                        seller={seller}
                                        key={`${nftAddress}${tokenId}`}
                                    />
                                </div>
                            );
                        })
                    )
                ) : (
                    <div>Please connect your wallet</div>
                )}
            </div>
            <footer className="flex bottom-0 right-2 ">
                <p className="footer__copyright">
                    <a target="_blank" href="https://twitter.com/harendrashakya_">
                        © Harendra Shakya
                    </a>
                </p>
            </footer>
        </div>
    );
}

import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useMoralisQuery, useMoralis } from "react-moralis";
import NFTBox from "../components/NFTBox";

export default function Home() {
    const { isWeb3Enabled } = useMoralis();
    const { data: listedNfts, isFetching: fetchingListedNfts } = useMoralisQuery(
        "ActiveItem", // tableName
        (query) => query.limit(10).descending("tokenId") // Func. of query
    );

    console.log(listedNfts);

    return (
        <div className="container mx-auto pt-4">
            <h1 className="py-4 px-3 font-bold text-2xl">Recently Listed</h1>

            <div className="flex flex-wrap pt-5">
                {isWeb3Enabled ? (
                    fetchingListedNfts ? (
                        <div>Loading...</div>
                    ) : (
                        listedNfts.map((nft) => {
                            console.log(nft.attributes);
                            const { price, nftAddress, tokenId, marketplaceAddress, seller } =
                                nft.attributes;
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

import { ConnectButton } from "web3uikit";
import Link from "next/link";
import Image from "next/image";

export default function Header() {
    return (
        <nav className="p-5 border-b-2 flex flex-row items-center">
            <Image src="/logo.ico" height="75" width="75" />
            <h1 className="font-bold text-3xl left-5">OpenOcean</h1>
            <div className="flex flex-row justify-between absolute top-8 right-10 items-center">
                <Link href="/">
                    <a className="mr-4 p-6">Home</a>
                </Link>

                <Link href="/sell-nft">
                    <a className="mr-4 p-6">Sell Nft</a>
                </Link>
                <ConnectButton moralisAuth={false} />
            </div>
        </nav>
    );
}

const { developmentChains } = require("../../helper-hardhat-config");
const { deployments, ethers, network } = require("hardhat");
const { assert, expect } = require("chai");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("unit test for nftMarketplace", function () {
          const PRICE = ethers.utils.parseEther("10");
          const tokenId = 0;
          let nftMarketplace, basicNft, seller, buyer, sellerAc, buyerAc;
          beforeEach(async function () {
              await deployments.fixture(["all"]);
              const accounts = await ethers.getSigners(3);

              sellerAc = accounts[0];
              buyerAc = accounts[1];
              seller = sellerAc.address;
              buyer = buyerAc.address;
              nftMarketplace = await ethers.getContract("NftMarketplace");
              basicNft = await ethers.getContract("BasicNft");
              await basicNft.connect(sellerAc);
              await basicNft.mintNft();
          });
          describe("listItem", function () {
              it("reverts if not approved", async function () {
                  await expect(nftMarketplace.listItem(basicNft.address, tokenId, PRICE)).to.be
                      .reverted;
              });
              it("reverts if price is lower or equal to 0", async function () {
                  await basicNft.approve(nftMarketplace.address, tokenId);
                  await expect(nftMarketplace.listItem(basicNft.address, tokenId, 0)).to.be
                      .reverted;
              });
              it("expects to emit a ItemListed event", async function () {
                  await basicNft.approve(nftMarketplace.address, tokenId);
                  await expect(nftMarketplace.listItem(basicNft.address, tokenId, PRICE)).to.emit(
                      nftMarketplace,
                      "ItemListed"
                  );
              });
              it("reverts if not owner", async function () {
                  await basicNft.approve(nftMarketplace.address, tokenId);
                  await expect(nftMarketplace.listItem(basicNft.address, tokenId, PRICE, buyer)).to
                      .be.reverted;
              });
              it("reverts if already listed", async function () {
                  await basicNft.approve(nftMarketplace.address, tokenId);
                  await nftMarketplace.listItem(basicNft.address, tokenId, PRICE);
                  await expect(nftMarketplace.listItem(basicNft.address, tokenId, PRICE)).to.be
                      .reverted;
              });

              it("sets listings correctly", async function () {
                  await basicNft.approve(nftMarketplace.address, tokenId);
                  await nftMarketplace.listItem(basicNft.address, tokenId, PRICE);
                  const Listing = await nftMarketplace.getListing(basicNft.address, tokenId);
                  expect(Listing.price).to.equal(PRICE);
                  assert.equal(seller, Listing.seller);
              });
          });
          describe("buyItem", function () {
              beforeEach(async function () {
                  await basicNft.approve(nftMarketplace.address, tokenId);
              });
              it("revert if not listed", async function () {
                  await expect(nftMarketplace.buyItem(basicNft.address, tokenId)).to.be.reverted;
              });
              it("reverts if amount is less than price", async function () {
                  await nftMarketplace.listItem(basicNft.address, tokenId, PRICE);
                  const lowerPrice = ethers.utils.parseEther("0.05");
                  await expect(
                      nftMarketplace.buyItem(basicNft.address, tokenId, { value: lowerPrice })
                  ).to.be.reverted;
              });
              it("adds money in seller proceeds", async function () {
                  const tx = await nftMarketplace.listItem(basicNft.address, tokenId, PRICE);
                  const txReceipt = await tx.wait(1);
                  const gas = txReceipt.cumulativeGasUsed.mul(txReceipt.effectiveGasPrice);
                  const totalCost = PRICE.add(gas);
                  await nftMarketplace.buyItem(basicNft.address, tokenId, { value: totalCost });
                  const proceeds = await nftMarketplace.getProceeds(seller);
                  expect(proceeds).to.equal(totalCost);
              });
              it("deletes listing", async function () {
                  const tx = await nftMarketplace.listItem(basicNft.address, tokenId, PRICE);
                  const txReceipt = await tx.wait(1);
                  const gas = txReceipt.cumulativeGasUsed.mul(txReceipt.effectiveGasPrice);
                  const totalCost = PRICE.add(gas);
                  await nftMarketplace.buyItem(basicNft.address, tokenId, { value: totalCost });
                  const listing = await nftMarketplace.getListing(basicNft.address, tokenId);
                  assert.equal(listing.price, "0");
              });
              it("emits a item bought event", async function () {
                  const tx = await nftMarketplace.listItem(basicNft.address, tokenId, PRICE);
                  const txReceipt = await tx.wait(1);
                  const gas = txReceipt.cumulativeGasUsed.mul(txReceipt.effectiveGasPrice);
                  const totalCost = PRICE.add(gas);
                  await expect(
                      nftMarketplace.buyItem(basicNft.address, tokenId, {
                          value: totalCost,
                      })
                  ).to.emit(nftMarketplace, "ItemBought");
              });
          });
          describe("cancelLisings", function () {
              beforeEach(async function () {
                  await basicNft.approve(nftMarketplace.address, tokenId);
                  await nftMarketplace.listItem(basicNft.address, tokenId, PRICE);
              });
              it("deletes listings", async function () {
                  await nftMarketplace.cancelListing(basicNft.address, tokenId);
                  const listing = await nftMarketplace.getListing(basicNft.address, tokenId);
                  await assert.equal(listing.price, "0");
              });
              it("it emits an CancenListing event", async function () {
                  await expect(nftMarketplace.cancelListing(basicNft.address, tokenId)).to.emit(
                      nftMarketplace,
                      "ItemCanceled"
                  );
              });
          });
          describe("update listing", function () {
              let newPrice;
              beforeEach(async function () {
                  await basicNft.approve(nftMarketplace.address, tokenId);
                  await nftMarketplace.listItem(basicNft.address, tokenId, PRICE);
              });
              it("updates the listings", async function () {
                  newPrice = ethers.utils.parseEther("1.5");
                  await nftMarketplace.updateListing(basicNft.address, tokenId, newPrice);
                  const listing = await nftMarketplace.getListing(basicNft.address, tokenId);
                  await expect(listing.price).to.equal(newPrice);
              });
              it("emits item listed event", async function () {
                  await expect(
                      nftMarketplace.updateListing(basicNft.address, tokenId, newPrice)
                  ).to.emit(nftMarketplace, "ItemListed");
              });
          });
          describe("withdraw proceeds", function () {
              beforeEach(async function () {
                  await basicNft.approve(nftMarketplace.address, tokenId);
              });
              it("reverts if no proceeds", async function () {
                  await expect(nftMarketplace.withdrawProceeds(basicNft.address, tokenId)).to.be
                      .reverted;
              });
              it("withdraws procceds successfully", async function () {
                  const tx = await nftMarketplace.listItem(basicNft.address, tokenId, PRICE);
                  const txReceipt = await tx.wait(1);
                  const gas = txReceipt.cumulativeGasUsed.mul(txReceipt.effectiveGasPrice);

                  nftMarketplace = await nftMarketplace.connect(buyerAc);
                  await nftMarketplace.buyItem(basicNft.address, tokenId, {
                      value: gas.add(PRICE),
                  });

                  nftMarketplace = await nftMarketplace.connect(sellerAc);
                  const startingSellerBalance = await sellerAc.getBalance();
                  const proceedsBefore = await nftMarketplace.getProceeds(seller);

                  const withdrawTx = await nftMarketplace.withdrawProceeds(
                      basicNft.address,
                      tokenId
                  );
                  const withdrawTxReceipt = await withdrawTx.wait(1);
                  const withdrawGas = withdrawTxReceipt.cumulativeGasUsed.mul(
                      withdrawTxReceipt.effectiveGasPrice
                  );
                  const endingSellerBalance = await sellerAc.getBalance();

                  await expect(endingSellerBalance.toString()).to.equal(
                      startingSellerBalance.add(proceedsBefore).sub(withdrawGas).toString()
                  );
                  const endProceeds = await nftMarketplace.getProceeds(seller);
                  assert.equal(endProceeds, "0");
              });
          });
      });

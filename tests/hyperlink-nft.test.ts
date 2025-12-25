import { Cl } from "@stacks/transactions";
import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const user1 = accounts.get("wallet_1")!;
const user2 = accounts.get("wallet_2")!;

describe("Hyperlink NFT (ERC-5489 inspired)", () => {

  it("should mint an NFT without hyperlink", () => {
    const mintResult = simnet.callPublicFn("hyperlink-nft", "mint", [
      Cl.principal(user1),
      Cl.uint(1),
      Cl.none()
    ], deployer);
    expect(mintResult.result).toBeOk(Cl.bool(true));

    const owner = simnet.callReadOnlyFn("hyperlink-nft", "owner-of", [
      Cl.uint(1)
    ], deployer);
    expect(owner.result).toBeOk(Cl.some(Cl.principal(user1)));
  });

  it("should mint an NFT with hyperlink", () => {
    const hyperlink = new Uint8Array(32).fill(1);
    const mintResult = simnet.callPublicFn("hyperlink-nft", "mint", [
      Cl.principal(user1),
      Cl.uint(1),
      Cl.some(Cl.buffer(hyperlink))
    ], deployer);
    expect(mintResult.result).toBeOk(Cl.bool(true));

    const hyperlinkResult = simnet.callReadOnlyFn("hyperlink-nft", "get-hyperlink", [
      Cl.uint(1)
    ], deployer);
    expect(hyperlinkResult.result).toBeOk(Cl.some(Cl.buffer(hyperlink)));
  });

  it("should fail to mint duplicate token id", () => {
    simnet.callPublicFn("hyperlink-nft", "mint", [
      Cl.principal(user1),
      Cl.uint(1),
      Cl.none()
    ], deployer);

    const mintResult = simnet.callPublicFn("hyperlink-nft", "mint", [
      Cl.principal(user2),
      Cl.uint(1),
      Cl.none()
    ], deployer);
    expect(mintResult.result).toBeErr(Cl.uint(101));
  });

  it("should set hyperlink on existing token", () => {
    simnet.callPublicFn("hyperlink-nft", "mint", [
      Cl.principal(user1),
      Cl.uint(1),
      Cl.none()
    ], deployer);

    const hyperlink = new Uint8Array(64).fill(2);
    const setResult = simnet.callPublicFn("hyperlink-nft", "set-hyperlink", [
      Cl.uint(1),
      Cl.buffer(hyperlink)
    ], user1);
    expect(setResult.result).toBeOk(Cl.bool(true));

    const hyperlinkResult = simnet.callReadOnlyFn("hyperlink-nft", "get-hyperlink", [
      Cl.uint(1)
    ], deployer);
    expect(hyperlinkResult.result).toBeOk(Cl.some(Cl.buffer(hyperlink)));
  });

  it("should check get-restrict-assets", () => {
    const restricted = simnet.callReadOnlyFn("hyperlink-nft", "get-restrict-assets", [], deployer);
    expect(restricted.result).toStrictEqual(Cl.bool(true));
  });
});

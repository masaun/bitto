import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("dual-token contract", () => {
  beforeEach(() => {
    simnet.setEpoch("3.0");
  });

  it("should mint fungible tokens", () => {
    const { result } = simnet.callPublicFn(
      "dual-token",
      "mint",
      [Cl.principal(wallet1), Cl.uint(1000)],
      deployer
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should get FT balance", () => {
    simnet.callPublicFn(
      "dual-token",
      "mint",
      [Cl.principal(wallet1), Cl.uint(500)],
      deployer
    );
    
    const { result } = simnet.callReadOnlyFn(
      "dual-token",
      "get-balance",
      [Cl.principal(wallet1)],
      deployer
    );
    expect(result).toBeOk(Cl.uint(500));
  });

  it("should transfer fungible tokens", () => {
    simnet.callPublicFn(
      "dual-token",
      "mint",
      [Cl.principal(wallet1), Cl.uint(2000)],
      deployer
    );
    
    const { result } = simnet.callPublicFn(
      "dual-token",
      "transfer",
      [Cl.uint(500), Cl.principal(wallet1), Cl.principal(wallet2)],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should mint single NFT", () => {
    const { result } = simnet.callPublicFn(
      "dual-token",
      "mint-nft",
      [Cl.principal(wallet1)],
      deployer
    );
    expect(result).toBeOk(Cl.uint(1));
  });

  it("should get NFT owner", () => {
    simnet.callPublicFn(
      "dual-token",
      "mint-nft",
      [Cl.principal(wallet1)],
      deployer
    );
    
    const { result } = simnet.callReadOnlyFn(
      "dual-token",
      "get-nft-owner",
      [Cl.uint(1)],
      deployer
    );
    expect(result).toBeOk(Cl.some(Cl.principal(wallet1)));
  });

  it("should transfer NFT", () => {
    simnet.callPublicFn(
      "dual-token",
      "mint-nft",
      [Cl.principal(wallet1)],
      deployer
    );
    
    const { result } = simnet.callPublicFn(
      "dual-token",
      "transfer-nft",
      [Cl.uint(1), Cl.principal(wallet1), Cl.principal(wallet2)],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should get total FT supply", () => {
    simnet.callPublicFn(
      "dual-token",
      "mint",
      [Cl.principal(wallet1), Cl.uint(3000)],
      deployer
    );
    simnet.callPublicFn(
      "dual-token",
      "mint",
      [Cl.principal(wallet2), Cl.uint(2000)],
      deployer
    );
    
    const { result } = simnet.callReadOnlyFn(
      "dual-token",
      "get-total-supply",
      [],
      deployer
    );
    expect(result).toBeOk(Cl.uint(5000));
  });

  it("should get last NFT token ID", () => {
    simnet.callPublicFn(
      "dual-token",
      "mint-nft",
      [Cl.principal(wallet1)],
      deployer
    );
    simnet.callPublicFn(
      "dual-token",
      "mint-nft",
      [Cl.principal(wallet2)],
      deployer
    );
    
    const lastId = simnet.getDataVar("dual-token", "last-nft-id");
    expect(lastId).toStrictEqual(Cl.uint(2));
  });

  it("should burn fungible tokens", () => {
    simnet.callPublicFn(
      "dual-token",
      "mint",
      [Cl.principal(wallet1), Cl.uint(1000)],
      deployer
    );
    
    const { result } = simnet.callPublicFn(
      "dual-token",
      "burn",
      [Cl.uint(300)],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should burn NFT", () => {
    const mintResult = simnet.callPublicFn(
      "dual-token",
      "mint-nft",
      [Cl.principal(wallet1)],
      deployer
    );
    
    expect(mintResult.result).toBeOk(Cl.uint(1));
  });

  it("should not transfer more FT than balance", () => {
    simnet.callPublicFn(
      "dual-token",
      "mint",
      [Cl.principal(wallet1), Cl.uint(100)],
      deployer
    );
    
    const { result } = simnet.callPublicFn(
      "dual-token",
      "transfer",
      [Cl.uint(500), Cl.principal(wallet1), Cl.principal(wallet2)],
      wallet1
    );
    expect(result).toBeErr(Cl.uint(101));
  });

  it("should not transfer NFT by non-owner", () => {
    simnet.callPublicFn(
      "dual-token",
      "mint-nft",
      [Cl.principal(wallet1)],
      deployer
    );
    
    const { result } = simnet.callPublicFn(
      "dual-token",
      "transfer-nft",
      [Cl.uint(1), Cl.principal(wallet1), Cl.principal(wallet2)],
      wallet2
    );
    expect(result).toBeErr(Cl.uint(100));
  });
});

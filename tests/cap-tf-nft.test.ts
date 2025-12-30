import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("cap-tf-nft contract", () => {
  beforeEach(() => {
    simnet.setEpoch("3.0");
  });

  it("should mint NFT with transfer limit", () => {
    const { result } = simnet.callPublicFn(
      "cap-tf-nft",
      "mint",
      [Cl.principal(wallet1), Cl.uint(5)],
      deployer
    );
    expect(result).toBeOk(Cl.uint(1));
  });

  it("should get transfer count", () => {
    simnet.callPublicFn(
      "cap-tf-nft",
      "mint",
      [Cl.principal(wallet1), Cl.uint(5)],
      deployer
    );
    
    const { result } = simnet.callReadOnlyFn(
      "cap-tf-nft",
      "transfer-count-of",
      [Cl.uint(1)],
      deployer
    );
    expect(result).toBeUint(0);
  });

  it("should set transfer limit", () => {
    simnet.callPublicFn(
      "cap-tf-nft",
      "mint",
      [Cl.principal(wallet1), Cl.uint(5)],
      deployer
    );
    
    const { result } = simnet.callPublicFn(
      "cap-tf-nft",
      "set-transfer-limit",
      [Cl.uint(1), Cl.uint(10)],
      deployer
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should transfer NFT and increment count", () => {
    simnet.callPublicFn(
      "cap-tf-nft",
      "mint",
      [Cl.principal(wallet1), Cl.uint(5)],
      deployer
    );
    
    const { result } = simnet.callPublicFn(
      "cap-tf-nft",
      "transfer",
      [Cl.uint(1), Cl.principal(wallet1), Cl.principal(wallet2)],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should increment transfer count after transfer", () => {
    simnet.callPublicFn(
      "cap-tf-nft",
      "mint",
      [Cl.principal(wallet1), Cl.uint(5)],
      deployer
    );
    
    simnet.callPublicFn(
      "cap-tf-nft",
      "transfer",
      [Cl.uint(1), Cl.principal(wallet1), Cl.principal(wallet2)],
      wallet1
    );
    
    const { result } = simnet.callReadOnlyFn(
      "cap-tf-nft",
      "transfer-count-of",
      [Cl.uint(1)],
      deployer
    );
    expect(result).toBeUint(1);
  });

  it("should prevent transfer when limit reached", () => {
    simnet.callPublicFn(
      "cap-tf-nft",
      "mint",
      [Cl.principal(wallet1), Cl.uint(1)],
      deployer
    );
    
    simnet.callPublicFn(
      "cap-tf-nft",
      "transfer",
      [Cl.uint(1), Cl.principal(wallet1), Cl.principal(wallet2)],
      wallet1
    );
    
    const { result } = simnet.callPublicFn(
      "cap-tf-nft",
      "transfer",
      [Cl.uint(1), Cl.principal(wallet2), Cl.principal(wallet1)],
      wallet2
    );
    expect(result).toBeErr(Cl.uint(103));
  });

  it("should get owner", () => {
    simnet.callPublicFn(
      "cap-tf-nft",
      "mint",
      [Cl.principal(wallet1), Cl.uint(5)],
      deployer
    );
    
    const { result } = simnet.callReadOnlyFn(
      "cap-tf-nft",
      "get-owner",
      [Cl.uint(1)],
      deployer
    );
    expect(result).toBeOk(Cl.some(Cl.principal(wallet1)));
  });

  it("should get contract hash", () => {
    const { result } = simnet.callReadOnlyFn(
      "cap-tf-nft",
      "get-contract-hash",
      [],
      deployer
    );
    expect(result).toBeSome(Cl.buffer(new Uint8Array(32)));
  });
});

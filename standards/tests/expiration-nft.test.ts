import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("expiration-nft contract", () => {
  beforeEach(() => {
    simnet.setEpoch("3.0");
  });

  it("should mint NFT with expiration", () => {
    const { result } = simnet.callPublicFn(
      "expiration-nft",
      "mint",
      [Cl.principal(wallet1)],
      deployer
    );
    expect(result).toBeOk(Cl.uint(1));
  });

  it("should get start time", () => {
    simnet.callPublicFn(
      "expiration-nft",
      "mint",
      [Cl.principal(wallet1)],
      deployer
    );
    
    const { result } = simnet.callReadOnlyFn(
      "expiration-nft",
      "get-start-time",
      [Cl.uint(1)],
      deployer
    );
    expect(result).toBeSome(Cl.uint(0));
  });

  it("should get end time", () => {
    simnet.callPublicFn(
      "expiration-nft",
      "mint",
      [Cl.principal(wallet1)],
      deployer
    );
    
    const { result } = simnet.callReadOnlyFn(
      "expiration-nft",
      "get-end-time",
      [Cl.uint(1)],
      deployer
    );
    expect(result).toBeSome(Cl.uint(1000));
  });

  it("should check if token is expired", () => {
    simnet.callPublicFn(
      "expiration-nft",
      "mint",
      [Cl.principal(wallet1)],
      deployer
    );
    
    const { result } = simnet.callReadOnlyFn(
      "expiration-nft",
      "is-token-expired",
      [Cl.uint(1)],
      deployer
    );
    expect(result).toBeBool(false);
  });

  it("should transfer NFT before expiration", () => {
    simnet.callPublicFn(
      "expiration-nft",
      "mint",
      [Cl.principal(wallet1)],
      deployer
    );
    
    const { result } = simnet.callPublicFn(
      "expiration-nft",
      "transfer",
      [Cl.uint(1), Cl.principal(wallet1), Cl.principal(wallet2)],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should get owner", () => {
    simnet.callPublicFn(
      "expiration-nft",
      "mint",
      [Cl.principal(wallet1)],
      deployer
    );
    
    const { result } = simnet.callReadOnlyFn(
      "expiration-nft",
      "get-owner",
      [Cl.uint(1)],
      deployer
    );
    expect(result).toBeOk(Cl.some(Cl.principal(wallet1)));
  });

  it("should get contract hash", () => {
    const { result } = simnet.callReadOnlyFn(
      "expiration-nft",
      "get-contract-hash",
      [],
      deployer
    );
    expect(result).toBeSome(Cl.buffer(new Uint8Array(32)));
  });

  it("should get block time", () => {
    const { result } = simnet.callReadOnlyFn(
      "expiration-nft",
      "get-block-time",
      [],
      deployer
    );
    expect(result).toBeUint(0);
  });
});

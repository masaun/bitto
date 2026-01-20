import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("sb-badge contract", () => {
  beforeEach(() => {
    simnet.setEpoch("3.0");
  });

  it("should mint soulbound badge", () => {
    const { result } = simnet.callPublicFn(
      "sb-badge",
      "mint",
      [Cl.principal(wallet1), Cl.uint(1), Cl.stringAscii("ipfs://badge1")],
      deployer
    );
    expect(result).toBeOk(Cl.uint(1));
  });

  it("should get badge soul binding", () => {
    simnet.callPublicFn(
      "sb-badge",
      "mint",
      [Cl.principal(wallet1), Cl.uint(1), Cl.stringAscii("ipfs://badge1")],
      deployer
    );
    
    const { result } = simnet.callReadOnlyFn(
      "sb-badge",
      "get-badge-soul",
      [Cl.uint(1)],
      deployer
    );
    expect(result).toBeSome(Cl.tuple({
      "nft-contract": Cl.principal(wallet1),
      "nft-token-id": Cl.uint(1)
    }));
  });

  it("should get badge URI", () => {
    simnet.callPublicFn(
      "sb-badge",
      "mint",
      [Cl.principal(wallet1), Cl.uint(1), Cl.stringAscii("ipfs://badge1")],
      deployer
    );
    
    const { result } = simnet.callReadOnlyFn(
      "sb-badge",
      "get-badge-uri",
      [Cl.uint(1)],
      deployer
    );
    expect(result).toBeSome(Cl.stringAscii("ipfs://badge1"));
  });

  it("should get owner of badge", () => {
    simnet.callPublicFn(
      "sb-badge",
      "mint",
      [Cl.principal(wallet1), Cl.uint(1), Cl.stringAscii("ipfs://badge1")],
      deployer
    );
    
    const { result } = simnet.callReadOnlyFn(
      "sb-badge",
      "get-owner-of",
      [Cl.uint(1)],
      deployer
    );
    expect(result).toBeOk(Cl.some(Cl.principal(deployer)));
  });

  it("should not allow transfer of soulbound badge", () => {
    simnet.callPublicFn(
      "sb-badge",
      "mint",
      [Cl.principal(wallet1), Cl.uint(1), Cl.stringAscii("ipfs://badge1")],
      deployer
    );
    
    const { result } = simnet.callPublicFn(
      "sb-badge",
      "transfer",
      [Cl.uint(1), Cl.principal(deployer), Cl.principal(wallet2)],
      deployer
    );
    expect(result).toBeErr(Cl.uint(103));
  });

  it("should get contract hash", () => {
    const { result } = simnet.callReadOnlyFn(
      "sb-badge",
      "get-contract-hash",
      [],
      deployer
    );
    expect(result).toBeSome(Cl.buffer(new Uint8Array(32)));
  });

  it("should get block time", () => {
    const { result } = simnet.callReadOnlyFn(
      "sb-badge",
      "get-block-time",
      [],
      deployer
    );
    expect(result).toBeUint(0);
  });
});

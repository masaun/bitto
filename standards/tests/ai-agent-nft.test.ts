import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;
const wallet3 = accounts.get("wallet_3")!;

describe("ai-agent-nft contract", () => {
  beforeEach(() => {
    simnet.setEpoch("3.0");
  });

  it("should mint NFT with data hash", () => {
    const dataHash = new Uint8Array(32);
    dataHash[0] = 1;
    
    const { result } = simnet.callPublicFn(
      "ai-agent-nft",
      "mint",
      [Cl.principal(wallet1), Cl.buffer(dataHash), Cl.stringAscii("AI Agent #1")],
      deployer
    );
    expect(result).toBeOk(Cl.uint(1));
  });

  it("should get token data", () => {
    const dataHash = new Uint8Array(32);
    dataHash[0] = 1;
    
    simnet.callPublicFn(
      "ai-agent-nft",
      "mint",
      [Cl.principal(wallet1), Cl.buffer(dataHash), Cl.stringAscii("AI Agent #1")],
      deployer
    );
    
    const { result } = simnet.callReadOnlyFn(
      "ai-agent-nft",
      "get-token-data",
      [Cl.uint(1)],
      deployer
    );
    expect(result).toBeSome(Cl.tuple({
      "data-hash": Cl.buffer(dataHash),
      description: Cl.stringAscii("AI Agent #1")
    }));
  });

  it("should authorize user for token usage", () => {
    const dataHash = new Uint8Array(32);
    dataHash[0] = 1;
    
    simnet.callPublicFn(
      "ai-agent-nft",
      "mint",
      [Cl.principal(wallet1), Cl.buffer(dataHash), Cl.stringAscii("AI Agent #1")],
      deployer
    );
    
    const { result } = simnet.callPublicFn(
      "ai-agent-nft",
      "authorize-usage",
      [Cl.uint(1), Cl.principal(wallet2)],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should check if user is authorized", () => {
    const dataHash = new Uint8Array(32);
    dataHash[0] = 1;
    
    simnet.callPublicFn(
      "ai-agent-nft",
      "mint",
      [Cl.principal(wallet1), Cl.buffer(dataHash), Cl.stringAscii("AI Agent #1")],
      deployer
    );
    
    simnet.callPublicFn(
      "ai-agent-nft",
      "authorize-usage",
      [Cl.uint(1), Cl.principal(wallet2)],
      wallet1
    );
    
    const { result } = simnet.callReadOnlyFn(
      "ai-agent-nft",
      "is-authorized-user",
      [Cl.uint(1), Cl.principal(wallet2)],
      deployer
    );
    expect(result).toBeBool(true);
  });

  it("should revoke authorization", () => {
    const dataHash = new Uint8Array(32);
    dataHash[0] = 1;
    
    simnet.callPublicFn(
      "ai-agent-nft",
      "mint",
      [Cl.principal(wallet1), Cl.buffer(dataHash), Cl.stringAscii("AI Agent #1")],
      deployer
    );
    
    simnet.callPublicFn(
      "ai-agent-nft",
      "authorize-usage",
      [Cl.uint(1), Cl.principal(wallet2)],
      wallet1
    );
    
    const { result } = simnet.callPublicFn(
      "ai-agent-nft",
      "revoke-authorization",
      [Cl.uint(1), Cl.principal(wallet2)],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should approve spender", () => {
    const dataHash = new Uint8Array(32);
    dataHash[0] = 1;
    
    simnet.callPublicFn(
      "ai-agent-nft",
      "mint",
      [Cl.principal(wallet1), Cl.buffer(dataHash), Cl.stringAscii("AI Agent #1")],
      deployer
    );
    
    const { result } = simnet.callPublicFn(
      "ai-agent-nft",
      "approve",
      [Cl.principal(wallet2), Cl.uint(1)],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should transfer NFT", () => {
    const dataHash = new Uint8Array(32);
    dataHash[0] = 1;
    
    simnet.callPublicFn(
      "ai-agent-nft",
      "mint",
      [Cl.principal(wallet1), Cl.buffer(dataHash), Cl.stringAscii("AI Agent #1")],
      deployer
    );
    
    const { result } = simnet.callPublicFn(
      "ai-agent-nft",
      "transfer",
      [Cl.uint(1), Cl.principal(wallet1), Cl.principal(wallet2)],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should delegate access", () => {
    const { result } = simnet.callPublicFn(
      "ai-agent-nft",
      "delegate-access-to",
      [Cl.principal(wallet2)],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should get contract hash", () => {
    const { result } = simnet.callReadOnlyFn(
      "ai-agent-nft",
      "get-contract-hash",
      [],
      deployer
    );
    expect(result).toBeSome(Cl.buffer(new Uint8Array(32)));
  });
});

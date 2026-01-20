import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("acc-bounded-token contract", () => {
  beforeEach(() => {
    simnet.setEpoch("3.0");
  });

  it("should give token to recipient", () => {
    const metadata = new Uint8Array(256);
    metadata[0] = 1;
    
    const signature = new Uint8Array(64);
    signature[0] = 2;
    
    const { result } = simnet.callPublicFn(
      "acc-bounded-token",
      "give",
      [
        Cl.principal(wallet1),
        Cl.buffer(metadata),
        Cl.buffer(signature),
        Cl.stringAscii("ipfs://token1")
      ],
      deployer
    );
    expect(result).toBeOk(Cl.uint(1));
  });

  it("should take token from sender", () => {
    const metadata = new Uint8Array(256);
    metadata[0] = 1;
    
    const signature = new Uint8Array(64);
    signature[0] = 2;
    
    const { result } = simnet.callPublicFn(
      "acc-bounded-token",
      "take",
      [
        Cl.principal(wallet1),
        Cl.buffer(metadata),
        Cl.buffer(signature),
        Cl.stringAscii("ipfs://token2")
      ],
      deployer
    );
    expect(result).toBeOk(Cl.uint(1));
  });

  it("should get token metadata", () => {
    const metadata = new Uint8Array(256);
    metadata[0] = 1;
    
    const signature = new Uint8Array(64);
    signature[0] = 2;
    
    simnet.callPublicFn(
      "acc-bounded-token",
      "give",
      [
        Cl.principal(wallet1),
        Cl.buffer(metadata),
        Cl.buffer(signature),
        Cl.stringAscii("ipfs://token1")
      ],
      deployer
    );
    
    const { result } = simnet.callReadOnlyFn(
      "acc-bounded-token",
      "get-token-metadata",
      [Cl.uint(1)],
      deployer
    );
    expect(result).toBeSome(Cl.tuple({
      uri: Cl.stringAscii("ipfs://token1"),
      metadata: Cl.buffer(metadata)
    }));
  });

  it("should unequip token", () => {
    const metadata = new Uint8Array(256);
    metadata[0] = 1;
    
    const signature = new Uint8Array(64);
    signature[0] = 2;
    
    simnet.callPublicFn(
      "acc-bounded-token",
      "give",
      [
        Cl.principal(wallet1),
        Cl.buffer(metadata),
        Cl.buffer(signature),
        Cl.stringAscii("ipfs://token1")
      ],
      deployer
    );
    
    const { result } = simnet.callPublicFn(
      "acc-bounded-token",
      "unequip",
      [Cl.uint(1)],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should not allow transfer", () => {
    const metadata = new Uint8Array(256);
    metadata[0] = 1;
    
    const signature = new Uint8Array(64);
    signature[0] = 2;
    
    simnet.callPublicFn(
      "acc-bounded-token",
      "give",
      [
        Cl.principal(wallet1),
        Cl.buffer(metadata),
        Cl.buffer(signature),
        Cl.stringAscii("ipfs://token1")
      ],
      deployer
    );
    
    const { result } = simnet.callPublicFn(
      "acc-bounded-token",
      "transfer",
      [Cl.uint(1), Cl.principal(wallet1), Cl.principal(wallet2)],
      wallet1
    );
    expect(result).toBeErr(Cl.uint(103));
  });

  it("should get owner", () => {
    const metadata = new Uint8Array(256);
    metadata[0] = 1;
    
    const signature = new Uint8Array(64);
    signature[0] = 2;
    
    simnet.callPublicFn(
      "acc-bounded-token",
      "give",
      [
        Cl.principal(wallet1),
        Cl.buffer(metadata),
        Cl.buffer(signature),
        Cl.stringAscii("ipfs://token1")
      ],
      deployer
    );
    
    const { result } = simnet.callReadOnlyFn(
      "acc-bounded-token",
      "get-owner",
      [Cl.uint(1)],
      deployer
    );
    expect(result).toBeOk(Cl.some(Cl.principal(wallet1)));
  });

  it("should get contract hash", () => {
    const { result } = simnet.callReadOnlyFn(
      "acc-bounded-token",
      "get-contract-hash",
      [],
      deployer
    );
    expect(result).toBeSome(Cl.buffer(new Uint8Array(32)));
  });
});

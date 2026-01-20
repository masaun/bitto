import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;
const wallet3 = accounts.get("wallet_3")!;

describe("ai-agent-coordination contract", () => {
  beforeEach(() => {
    simnet.setEpoch("3.0");
  });

  it("should propose coordination", () => {
    const intentHash = new Uint8Array(32);
    intentHash[0] = 1;
    
    const payloadHash = new Uint8Array(32);
    payloadHash[0] = 2;
    
    const { result } = simnet.callPublicFn(
      "ai-agent-coordination",
      "propose-coordination",
      [
        Cl.buffer(intentHash),
        Cl.buffer(payloadHash),
        Cl.uint(1000),
        Cl.uint(1),
        Cl.principal(wallet1),
        Cl.list([Cl.principal(wallet2), Cl.principal(wallet3)])
      ],
      deployer
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should get coordination intent", () => {
    const intentHash = new Uint8Array(32);
    intentHash[0] = 1;
    
    const payloadHash = new Uint8Array(32);
    payloadHash[0] = 2;
    
    simnet.callPublicFn(
      "ai-agent-coordination",
      "propose-coordination",
      [
        Cl.buffer(intentHash),
        Cl.buffer(payloadHash),
        Cl.uint(1000),
        Cl.uint(1),
        Cl.principal(wallet1),
        Cl.list([Cl.principal(wallet2)])
      ],
      deployer
    );
    
    const { result } = simnet.callReadOnlyFn(
      "ai-agent-coordination",
      "get-intent",
      [Cl.buffer(intentHash)],
      deployer
    );
    expect(result).toBeSome(Cl.tuple({
      "payload-hash": Cl.buffer(payloadHash),
      expiry: Cl.uint(1000),
      nonce: Cl.uint(1),
      "agent-id": Cl.principal(wallet1),
      status: Cl.stringAscii("Proposed"),
      participants: Cl.list([Cl.principal(wallet2)])
    }));
  });

  it("should accept coordination", () => {
    const intentHash = new Uint8Array(32);
    intentHash[0] = 1;
    
    const payloadHash = new Uint8Array(32);
    payloadHash[0] = 2;
    
    const signature = new Uint8Array(64);
    signature[0] = 1;
    
    simnet.callPublicFn(
      "ai-agent-coordination",
      "propose-coordination",
      [
        Cl.buffer(intentHash),
        Cl.buffer(payloadHash),
        Cl.uint(1000),
        Cl.uint(1),
        Cl.principal(wallet1),
        Cl.list([Cl.principal(wallet2)])
      ],
      deployer
    );
    
    const { result } = simnet.callPublicFn(
      "ai-agent-coordination",
      "accept-coordination",
      [Cl.buffer(intentHash), Cl.buffer(signature)],
      wallet2
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should execute coordination", () => {
    const intentHash = new Uint8Array(32);
    intentHash[0] = 1;
    
    const payloadHash = new Uint8Array(32);
    payloadHash[0] = 2;
    
    simnet.callPublicFn(
      "ai-agent-coordination",
      "propose-coordination",
      [
        Cl.buffer(intentHash),
        Cl.buffer(payloadHash),
        Cl.uint(1000),
        Cl.uint(1),
        Cl.principal(wallet1),
        Cl.list([Cl.principal(wallet2)])
      ],
      deployer
    );
    
    const { result } = simnet.callPublicFn(
      "ai-agent-coordination",
      "execute-coordination",
      [Cl.buffer(intentHash)],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should cancel coordination", () => {
    const intentHash = new Uint8Array(32);
    intentHash[0] = 1;
    
    const payloadHash = new Uint8Array(32);
    payloadHash[0] = 2;
    
    simnet.callPublicFn(
      "ai-agent-coordination",
      "propose-coordination",
      [
        Cl.buffer(intentHash),
        Cl.buffer(payloadHash),
        Cl.uint(1000),
        Cl.uint(1),
        Cl.principal(wallet1),
        Cl.list([Cl.principal(wallet2)])
      ],
      deployer
    );
    
    const { result } = simnet.callPublicFn(
      "ai-agent-coordination",
      "cancel-coordination",
      [Cl.buffer(intentHash)],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should get contract hash", () => {
    const { result } = simnet.callReadOnlyFn(
      "ai-agent-coordination",
      "get-contract-hash",
      [],
      deployer
    );
    expect(result).toBeSome(Cl.buffer(new Uint8Array(32)));
  });
});

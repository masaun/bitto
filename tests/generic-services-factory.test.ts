import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;

describe("generic-services-factory contract", () => {
  beforeEach(() => {
    simnet.setEpoch("3.0");
  });

  it("should create service with linked ID", () => {
    const salt = new Uint8Array(32);
    salt[0] = 1;
    
    const { result } = simnet.callPublicFn(
      "generic-services-factory",
      "create",
      [
        Cl.principal(wallet1),
        Cl.buffer(salt),
        Cl.uint(1),
        Cl.uint(0),
        Cl.principal(deployer),
        Cl.uint(100)
      ],
      deployer
    );
    expect(result).toBeOk(Cl.uint(1));
  });

  it("should create service without linked ID", () => {
    const salt = new Uint8Array(32);
    salt[0] = 2;
    
    const { result } = simnet.callPublicFn(
      "generic-services-factory",
      "create",
      [
        Cl.principal(wallet1),
        Cl.buffer(salt),
        Cl.uint(1),
        Cl.uint(1),
        Cl.principal(deployer),
        Cl.uint(0)
      ],
      deployer
    );
    expect(result).toBeOk(Cl.uint(1));
  });

  it("should get service details", () => {
    const salt = new Uint8Array(32);
    salt[0] = 1;
    
    simnet.callPublicFn(
      "generic-services-factory",
      "create",
      [
        Cl.principal(wallet1),
        Cl.buffer(salt),
        Cl.uint(1),
        Cl.uint(0),
        Cl.principal(deployer),
        Cl.uint(100)
      ],
      deployer
    );
    
    const { result } = simnet.callReadOnlyFn(
      "generic-services-factory",
      "get-service",
      [Cl.principal(deployer), Cl.uint(1)],
      deployer
    );
    expect(result).toBeOk(Cl.tuple({
      implementation: Cl.principal(wallet1),
      "linked-contract": Cl.principal(deployer),
      "linked-id": Cl.uint(100),
      mode: Cl.uint(0)
    }));
  });

  it("should increment service nonce", () => {
    const salt1 = new Uint8Array(32);
    salt1[0] = 1;
    
    const salt2 = new Uint8Array(32);
    salt2[0] = 2;
    
    simnet.callPublicFn(
      "generic-services-factory",
      "create",
      [
        Cl.principal(wallet1),
        Cl.buffer(salt1),
        Cl.uint(1),
        Cl.uint(0),
        Cl.principal(deployer),
        Cl.uint(100)
      ],
      deployer
    );
    
    const { result } = simnet.callPublicFn(
      "generic-services-factory",
      "create",
      [
        Cl.principal(wallet1),
        Cl.buffer(salt2),
        Cl.uint(1),
        Cl.uint(0),
        Cl.principal(deployer),
        Cl.uint(200)
      ],
      deployer
    );
    expect(result).toBeOk(Cl.uint(2));
  });

  it("should get contract hash", () => {
    const { result } = simnet.callReadOnlyFn(
      "generic-services-factory",
      "get-contract-hash",
      [],
      deployer
    );
    expect(result).toBeSome(Cl.buffer(new Uint8Array(32)));
  });

  it("should get block time", () => {
    const { result } = simnet.callReadOnlyFn(
      "generic-services-factory",
      "get-block-time",
      [],
      deployer
    );
    expect(result).toBeUint(0);
  });
});

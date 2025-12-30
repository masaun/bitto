import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;

describe("sc-dependencies-registry contract", () => {
  beforeEach(() => {
    simnet.setEpoch("3.0");
  });

  it("should add contract", () => {
    const { result } = simnet.callPublicFn(
      "sc-dependencies-registry",
      "add-contract",
      [Cl.stringAscii("my-contract"), Cl.principal(wallet1)],
      deployer
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should get contract address", () => {
    simnet.callPublicFn(
      "sc-dependencies-registry",
      "add-contract",
      [Cl.stringAscii("my-contract"), Cl.principal(wallet1)],
      deployer
    );
    
    const { result } = simnet.callReadOnlyFn(
      "sc-dependencies-registry",
      "get-contract",
      [Cl.stringAscii("my-contract")],
      deployer
    );
    expect(result).toBeSome(Cl.principal(wallet1));
  });

  it("should add proxy contract", () => {
    const { result } = simnet.callPublicFn(
      "sc-dependencies-registry",
      "add-proxy-contract",
      [Cl.stringAscii("proxy-contract"), Cl.principal(wallet1)],
      deployer
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should inject dependencies", () => {
    const { result } = simnet.callPublicFn(
      "sc-dependencies-registry",
      "inject-dependencies",
      [
        Cl.stringAscii("my-contract"),
        Cl.list([Cl.stringAscii("dep1"), Cl.stringAscii("dep2")])
      ],
      deployer
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should get dependencies", () => {
    simnet.callPublicFn(
      "sc-dependencies-registry",
      "inject-dependencies",
      [
        Cl.stringAscii("my-contract"),
        Cl.list([Cl.stringAscii("dep1"), Cl.stringAscii("dep2")])
      ],
      deployer
    );
    
    const { result } = simnet.callReadOnlyFn(
      "sc-dependencies-registry",
      "get-dependencies",
      [Cl.stringAscii("my-contract")],
      deployer
    );
    expect(result).toBeSome(
      Cl.list([Cl.stringAscii("dep1"), Cl.stringAscii("dep2")])
    );
  });

  it("should upgrade contract", () => {
    simnet.callPublicFn(
      "sc-dependencies-registry",
      "add-contract",
      [Cl.stringAscii("my-contract"), Cl.principal(wallet1)],
      deployer
    );
    
    const { result } = simnet.callPublicFn(
      "sc-dependencies-registry",
      "upgrade-contract",
      [Cl.stringAscii("my-contract"), Cl.principal(deployer)],
      deployer
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should get contract hash", () => {
    const { result } = simnet.callReadOnlyFn(
      "sc-dependencies-registry",
      "get-contract-hash",
      [],
      deployer
    );
    expect(result).toBeSome(Cl.buffer(new Uint8Array(32)));
  });
});

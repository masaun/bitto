import { Cl } from "@stacks/transactions";
import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const user1 = accounts.get("wallet_1")!;
const user2 = accounts.get("wallet_2")!;

describe("Native Meta Transaction (ERC-2771 inspired)", () => {

  it("should get nonce for account", () => {
    const nonce = simnet.callReadOnlyFn("native-meta-tx", "get-nonce", [
      Cl.principal(user1)
    ], deployer);
    expect(nonce.result).toStrictEqual(Cl.uint(0));
  });

  it("should increment nonce", () => {
    const result = simnet.callPublicFn("native-meta-tx", "increment-nonce", [], user1);
    expect(result.result).toBeOk(Cl.uint(1));

    const nonce = simnet.callReadOnlyFn("native-meta-tx", "get-nonce", [
      Cl.principal(user1)
    ], deployer);
    expect(nonce.result).toStrictEqual(Cl.uint(1));
  });

  it("should set trusted forwarder as owner", () => {
    const result = simnet.callPublicFn("native-meta-tx", "set-trusted-forwarder", [
      Cl.principal(user1),
      Cl.bool(true)
    ], deployer);
    expect(result.result).toBeOk(Cl.bool(true));

    const isTrusted = simnet.callReadOnlyFn("native-meta-tx", "is-trusted-forwarder", [
      Cl.principal(user1)
    ], deployer);
    expect(isTrusted.result).toStrictEqual(Cl.bool(true));
  });

  it("should reject set trusted forwarder from non-owner", () => {
    const result = simnet.callPublicFn("native-meta-tx", "set-trusted-forwarder", [
      Cl.principal(user2),
      Cl.bool(true)
    ], user1);
    expect(result.result).toBeErr(Cl.uint(100));
  });

  it("should check get-restrict-assets", () => {
    const restricted = simnet.callReadOnlyFn("native-meta-tx", "get-restrict-assets", [], deployer);
    expect(restricted.result).toStrictEqual(Cl.bool(true));
  });
});

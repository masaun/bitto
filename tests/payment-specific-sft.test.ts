import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("payment-specific-sft contract", () => {
  beforeEach(() => {
    simnet.setEpoch("3.0");
  });

  it("should set compliance guard", () => {
    const { result } = simnet.callPublicFn(
      "payment-specific-sft",
      "set-compliance-guard",
      [Cl.principal(wallet1), Cl.bool(true)],
      deployer
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should check if user is compliant", () => {
    simnet.callPublicFn(
      "payment-specific-sft",
      "set-compliance-guard",
      [Cl.principal(wallet1), Cl.bool(true)],
      deployer
    );
    
    const { result } = simnet.callReadOnlyFn(
      "payment-specific-sft",
      "is-compliant",
      [Cl.principal(wallet1)],
      deployer
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should mint PBM token to compliant user", () => {
    simnet.callPublicFn(
      "payment-specific-sft",
      "set-compliance-guard",
      [Cl.principal(wallet1), Cl.bool(true)],
      deployer
    );
    
    const { result } = simnet.callPublicFn(
      "payment-specific-sft",
      "mint-pbm",
      [
        Cl.principal(wallet1),
        Cl.uint(1000),
        Cl.stringAscii("education"),
        Cl.uint(10000),
        Cl.stringUtf8("Only for educational purposes")
      ],
      deployer
    );
    expect(result).toBeOk(Cl.uint(1));
  });

  it("should not mint to non-compliant user", () => {
    const { result } = simnet.callPublicFn(
      "payment-specific-sft",
      "mint-pbm",
      [
        Cl.principal(wallet1),
        Cl.uint(1000),
        Cl.stringAscii("healthcare"),
        Cl.uint(10000),
        Cl.stringUtf8("Healthcare only")
      ],
      deployer
    );
    expect(result).toBeErr(Cl.uint(104));
  });

  it("should get token balance", () => {
    simnet.callPublicFn(
      "payment-specific-sft",
      "set-compliance-guard",
      [Cl.principal(wallet1), Cl.bool(true)],
      deployer
    );
    simnet.callPublicFn(
      "payment-specific-sft",
      "mint-pbm",
      [
        Cl.principal(wallet1),
        Cl.uint(500),
        Cl.stringAscii("food"),
        Cl.uint(20000),
        Cl.stringUtf8("Food voucher")
      ],
      deployer
    );
    
    const { result } = simnet.callReadOnlyFn(
      "payment-specific-sft",
      "get-balance",
      [Cl.uint(1), Cl.principal(wallet1)],
      deployer
    );
    expect(result).toBeOk(Cl.uint(500));
  });

  it("should transfer PBM to compliant recipient", () => {
    simnet.callPublicFn(
      "payment-specific-sft",
      "set-compliance-guard",
      [Cl.principal(wallet1), Cl.bool(true)],
      deployer
    );
    simnet.callPublicFn(
      "payment-specific-sft",
      "set-compliance-guard",
      [Cl.principal(wallet2), Cl.bool(true)],
      deployer
    );
    simnet.callPublicFn(
      "payment-specific-sft",
      "mint-pbm",
      [
        Cl.principal(wallet1),
        Cl.uint(1000),
        Cl.stringAscii("transport"),
        Cl.uint(999999999999),
        Cl.stringUtf8("Transport voucher")
      ],
      deployer
    );
    
    const { result } = simnet.callPublicFn(
      "payment-specific-sft",
      "transfer-pbm",
      [Cl.uint(1), Cl.uint(200), Cl.principal(wallet1), Cl.principal(wallet2)],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should redeem PBM", () => {
    simnet.callPublicFn(
      "payment-specific-sft",
      "set-compliance-guard",
      [Cl.principal(wallet1), Cl.bool(true)],
      deployer
    );
    simnet.callPublicFn(
      "payment-specific-sft",
      "mint-pbm",
      [
        Cl.principal(wallet1),
        Cl.uint(1000),
        Cl.stringAscii("utility"),
        Cl.uint(40000),
        Cl.stringUtf8("Utility payment")
      ],
      deployer
    );
    
    const { result } = simnet.callPublicFn(
      "payment-specific-sft",
      "redeem-pbm",
      [Cl.uint(1), Cl.uint(300)],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should get token metadata", () => {
    simnet.callPublicFn(
      "payment-specific-sft",
      "set-compliance-guard",
      [Cl.principal(wallet1), Cl.bool(true)],
      deployer
    );
    simnet.callPublicFn(
      "payment-specific-sft",
      "mint-pbm",
      [
        Cl.principal(wallet1),
        Cl.uint(750),
        Cl.stringAscii("retail"),
        Cl.uint(50000),
        Cl.stringUtf8("Retail voucher")
      ],
      deployer
    );
    
    const { result } = simnet.callReadOnlyFn(
      "payment-specific-sft",
      "get-token-metadata",
      [Cl.uint(1)],
      deployer
    );
    const metadataResult = result as any;
    expect(metadataResult.type).toBe('ok');
  });
});

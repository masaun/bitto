import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;

describe("fixed-income-bond contract", () => {
  beforeEach(() => {
    simnet.setEpoch("3.0");
  });

  it("should issue bond successfully", () => {
    const { result } = simnet.callPublicFn(
      "fixed-income-bond",
      "issue-bond",
      [
        Cl.stringAscii("BOND001"),
        Cl.stringAscii("US1234567890"),
        Cl.uint(500),
        Cl.uint(1000000),
        Cl.uint(10000)
      ],
      deployer
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should get bond info", () => {
    simnet.callPublicFn(
      "fixed-income-bond",
      "issue-bond",
      [
        Cl.stringAscii("BOND002"),
        Cl.stringAscii("US0987654321"),
        Cl.uint(300),
        Cl.uint(2000000),
        Cl.uint(5000)
      ],
      deployer
    );
    
    const { result } = simnet.callReadOnlyFn(
      "fixed-income-bond",
      "get-bond-info",
      [Cl.stringAscii("BOND002")],
      deployer
    );
    const resultData = result as any;
    expect(resultData.type).toBe('ok');
    expect(resultData.value.type).toBe('some');
  });

  it("should purchase bond", () => {
    simnet.callPublicFn(
      "fixed-income-bond",
      "issue-bond",
      [
        Cl.stringAscii("BOND003"),
        Cl.stringAscii("US1111111111"),
        Cl.uint(400),
        Cl.uint(3000000),
        Cl.uint(1000)
      ],
      deployer
    );
    
    const { result } = simnet.callPublicFn(
      "fixed-income-bond",
      "purchase-bond",
      [Cl.stringAscii("BOND003"), Cl.uint(5000)],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should get principal amount", () => {
    simnet.callPublicFn(
      "fixed-income-bond",
      "issue-bond",
      [
        Cl.stringAscii("BOND004"),
        Cl.stringAscii("US2222222222"),
        Cl.uint(350),
        Cl.uint(4000000),
        Cl.uint(2000)
      ],
      deployer
    );
    simnet.callPublicFn(
      "fixed-income-bond",
      "purchase-bond",
      [Cl.stringAscii("BOND004"), Cl.uint(10000)],
      wallet1
    );
    
    const { result } = simnet.callReadOnlyFn(
      "fixed-income-bond",
      "get-principal-of",
      [Cl.stringAscii("BOND004"), Cl.principal(wallet1)],
      deployer
    );
    expect(result).toBeOk(Cl.uint(10000));
  });

  it("should get coupon rate", () => {
    simnet.callPublicFn(
      "fixed-income-bond",
      "issue-bond",
      [
        Cl.stringAscii("BOND005"),
        Cl.stringAscii("US3333333333"),
        Cl.uint(450),
        Cl.uint(5000000),
        Cl.uint(3000)
      ],
      deployer
    );
    
    const { result } = simnet.callReadOnlyFn(
      "fixed-income-bond",
      "get-coupon-rate",
      [Cl.stringAscii("BOND005")],
      deployer
    );
    expect(result).toBeOk(Cl.uint(450));
  });

  it("should get maturity date", () => {
    simnet.callPublicFn(
      "fixed-income-bond",
      "issue-bond",
      [
        Cl.stringAscii("BOND006"),
        Cl.stringAscii("US4444444444"),
        Cl.uint(425),
        Cl.uint(6000000),
        Cl.uint(4000)
      ],
      deployer
    );
    
    const { result } = simnet.callReadOnlyFn(
      "fixed-income-bond",
      "get-maturity-date",
      [Cl.stringAscii("BOND006")],
      deployer
    );
    expect(result).toBeOk(Cl.uint(6000000));
  });

  it("should not redeem before maturity", () => {
    simnet.callPublicFn(
      "fixed-income-bond",
      "issue-bond",
      [
        Cl.stringAscii("BOND007"),
        Cl.stringAscii("US5555555555"),
        Cl.uint(375),
        Cl.uint(9999999999),
        Cl.uint(5000)
      ],
      deployer
    );
    simnet.callPublicFn(
      "fixed-income-bond",
      "purchase-bond",
      [Cl.stringAscii("BOND007"), Cl.uint(1000)],
      wallet1
    );
    
    const { result } = simnet.callPublicFn(
      "fixed-income-bond",
      "redeem-bond",
      [Cl.stringAscii("BOND007")],
      wallet1
    );
    expect(result).toBeErr(Cl.uint(103));
  });
});

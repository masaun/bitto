import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;

describe("media-index-registry contract", () => {
  beforeEach(() => {
    simnet.setEpoch("3.0");
  });

  it("should commit media successfully", () => {
    const { result } = simnet.callPublicFn(
      "media-index-registry",
      "commit",
      [
        Cl.stringAscii("QmHash123456789"),
        Cl.stringUtf8("metadata description")
      ],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should get commit data", () => {
    simnet.callPublicFn(
      "media-index-registry",
      "commit",
      [Cl.stringAscii("QmHash123"), Cl.stringUtf8("test data")],
      wallet1
    );
    
    const { result } = simnet.callReadOnlyFn(
      "media-index-registry",
      "get-commit",
      [Cl.stringAscii("QmHash123")],
      wallet1
    );
    const resultData = result as any;
    expect(resultData.type).toBe('ok');
    expect(resultData.value.type).toBe('some');
  });

  it("should not allow duplicate commits", () => {
    simnet.callPublicFn(
      "media-index-registry",
      "commit",
      [Cl.stringAscii("QmDuplicate"), Cl.stringUtf8("data1")],
      wallet1
    );
    
    const { result } = simnet.callPublicFn(
      "media-index-registry",
      "commit",
      [Cl.stringAscii("QmDuplicate"), Cl.stringUtf8("data2")],
      wallet1
    );
    expect(result).toBeErr(Cl.uint(101));
  });

  it("should verify commit by committer", () => {
    simnet.callPublicFn(
      "media-index-registry",
      "commit",
      [Cl.stringAscii("QmVerify"), Cl.stringUtf8("verify data")],
      wallet1
    );
    
    const { result } = simnet.callPublicFn(
      "media-index-registry",
      "verify-commit",
      [Cl.stringAscii("QmVerify"), Cl.principal(wallet1)],
      deployer
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should get user commit count", () => {
    simnet.callPublicFn(
      "media-index-registry",
      "commit",
      [Cl.stringAscii("QmFirst"), Cl.stringUtf8("data1")],
      wallet1
    );
    simnet.callPublicFn(
      "media-index-registry",
      "commit",
      [Cl.stringAscii("QmSecond"), Cl.stringUtf8("data2")],
      wallet1
    );
    
    const { result } = simnet.callReadOnlyFn(
      "media-index-registry",
      "get-commit-count",
      [Cl.principal(wallet1)],
      deployer
    );
    expect(result).toBeOk(Cl.uint(2));
  });

  it("should get user commit by index", () => {
    simnet.callPublicFn(
      "media-index-registry",
      "commit",
      [Cl.stringAscii("QmIndexTest"), Cl.stringUtf8("indexed data")],
      wallet1
    );
    
    const { result } = simnet.callReadOnlyFn(
      "media-index-registry",
      "get-user-commit",
      [Cl.principal(wallet1), Cl.uint(0)],
      deployer
    );
    expect(result).toBeOk(Cl.some(Cl.stringAscii("QmIndexTest")));
  });

  it("should get block time", () => {
    const { result } = simnet.callReadOnlyFn(
      "media-index-registry",
      "get-block-time",
      [],
      deployer
    );
    const resultData = result as any;
    expect(resultData.type).toBe('ok');
  });
});

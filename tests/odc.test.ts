import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;

describe("odc (on-chain data containers) contract", () => {
  beforeEach(() => {
    simnet.setEpoch("3.0");
  });

  it("should create data point", () => {
    const pointId = new Uint8Array(32).fill(1);
    const data = new Uint8Array(100).fill(42);
    
    const { result } = simnet.callPublicFn(
      "odc",
      "create-data-point",
      [Cl.buffer(pointId), Cl.buffer(data)],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should get data point", () => {
    const pointId = new Uint8Array(32).fill(2);
    const data = new Uint8Array(100).fill(55);
    
    simnet.callPublicFn(
      "odc",
      "create-data-point",
      [Cl.buffer(pointId), Cl.buffer(data)],
      wallet1
    );
    
    const { result } = simnet.callReadOnlyFn(
      "odc",
      "get-data-point",
      [Cl.buffer(pointId)],
      deployer
    );
    const resultData = result as any;
    expect(resultData.type).toBe('ok');
    expect(resultData.value.type).toBe('some');
    expect(resultData.value.value.value.owner.value).toBe(wallet1);
  });

  it("should not create duplicate data point", () => {
    const pointId = new Uint8Array(32).fill(3);
    const data = new Uint8Array(100).fill(66);
    
    simnet.callPublicFn(
      "odc",
      "create-data-point",
      [Cl.buffer(pointId), Cl.buffer(data)],
      wallet1
    );
    
    const { result } = simnet.callPublicFn(
      "odc",
      "create-data-point",
      [Cl.buffer(pointId), Cl.buffer(data)],
      wallet1
    );
    expect(result).toBeErr(Cl.uint(102));
  });

  it("should create data object", () => {
    const objectId = "object-123";
    const point1 = new Uint8Array(32).fill(10);
    const point2 = new Uint8Array(32).fill(11);
    
    const { result } = simnet.callPublicFn(
      "odc",
      "create-data-object",
      [
        Cl.stringAscii(objectId),
        Cl.list([Cl.buffer(point1), Cl.buffer(point2)]),
        Cl.stringUtf8("test metadata")
      ],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should get data object", () => {
    const objectId = "object-456";
    const point1 = new Uint8Array(32).fill(20);
    
    simnet.callPublicFn(
      "odc",
      "create-data-object",
      [
        Cl.stringAscii(objectId),
        Cl.list([Cl.buffer(point1)]),
        Cl.stringUtf8("metadata")
      ],
      wallet1
    );
    
    const { result } = simnet.callReadOnlyFn(
      "odc",
      "get-data-object",
      [Cl.stringAscii(objectId)],
      deployer
    );
    const objectResult = result as any;
    expect(objectResult.type).toBe('ok');
  });

  it("should authorize manager", () => {
    const { result } = simnet.callPublicFn(
      "odc",
      "authorize-manager",
      [Cl.principal(wallet1)],
      deployer
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should not authorize manager by non-owner", () => {
    const { result } = simnet.callPublicFn(
      "odc",
      "authorize-manager",
      [Cl.principal(wallet1)],
      wallet1
    );
    expect(result).toBeErr(Cl.uint(100));
  });

  it("should check if manager is authorized", () => {
    simnet.callPublicFn(
      "odc",
      "authorize-manager",
      [Cl.principal(wallet1)],
      deployer
    );
    
    const { result } = simnet.callReadOnlyFn(
      "odc",
      "is-manager-authorized",
      [Cl.principal(wallet1)],
      deployer
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should update data point by owner", () => {
    const pointId = new Uint8Array(32).fill(30);
    const data1 = new Uint8Array(100).fill(70);
    const data2 = new Uint8Array(100).fill(80);
    
    simnet.callPublicFn(
      "odc",
      "create-data-point",
      [Cl.buffer(pointId), Cl.buffer(data1)],
      wallet1
    );
    
    const { result } = simnet.callPublicFn(
      "odc",
      "update-data-point",
      [Cl.buffer(pointId), Cl.buffer(data2)],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));
  });
});

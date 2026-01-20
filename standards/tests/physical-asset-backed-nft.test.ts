import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("physical-asset-backed-nft contract", () => {
  beforeEach(() => {
    simnet.setEpoch("3.0");
  });

  it("should mint physical asset NFT", () => {
    const { result } = simnet.callPublicFn(
      "physical-asset-backed-nft",
      "mint",
      [
        Cl.principal(wallet1),
        Cl.principal(wallet2),
        Cl.stringUtf8("Warehouse A, Shelf 5"),
        Cl.stringUtf8("Terms and conditions apply"),
        Cl.stringAscii("US"),
        Cl.uint(10000)
      ],
      deployer
    );
    expect(result).toBeOk(Cl.uint(1));
  });

  it("should get asset properties", () => {
    simnet.callPublicFn(
      "physical-asset-backed-nft",
      "mint",
      [
        Cl.principal(wallet1),
        Cl.principal(wallet2),
        Cl.stringUtf8("Storage Unit B"),
        Cl.stringUtf8("Standard terms"),
        Cl.stringAscii("UK"),
        Cl.uint(5000)
      ],
      deployer
    );
    
    const { result } = simnet.callReadOnlyFn(
      "physical-asset-backed-nft",
      "get-properties",
      [Cl.uint(1)],
      deployer
    );
    const propertiesResult = result as any;
    expect(propertiesResult.type).toBe('ok');
  });

  it("should request redemption", () => {
    simnet.callPublicFn(
      "physical-asset-backed-nft",
      "mint",
      [
        Cl.principal(wallet1),
        Cl.principal(wallet2),
        Cl.stringUtf8("Vault 3"),
        Cl.stringUtf8("Premium terms"),
        Cl.stringAscii("CA"),
        Cl.uint(15000)
      ],
      deployer
    );
    
    const { result } = simnet.callPublicFn(
      "physical-asset-backed-nft",
      "request-redemption",
      [Cl.uint(1)],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should get redemption request", () => {
    simnet.callPublicFn(
      "physical-asset-backed-nft",
      "mint",
      [
        Cl.principal(wallet1),
        Cl.principal(wallet2),
        Cl.stringUtf8("Safe Box 10"),
        Cl.stringUtf8("Basic terms"),
        Cl.stringAscii("AU"),
        Cl.uint(8000)
      ],
      deployer
    );
    simnet.callPublicFn(
      "physical-asset-backed-nft",
      "request-redemption",
      [Cl.uint(1)],
      wallet1
    );
    
    const { result } = simnet.callReadOnlyFn(
      "physical-asset-backed-nft",
      "get-redemption-request",
      [Cl.uint(1)],
      deployer
    );
    const requestResult = result as any;
    expect(requestResult.type).toBe('ok');
  });

  it("should approve redemption by asset holder", () => {
    simnet.callPublicFn(
      "physical-asset-backed-nft",
      "mint",
      [
        Cl.principal(wallet1),
        Cl.principal(wallet2),
        Cl.stringUtf8("Container 7"),
        Cl.stringUtf8("Express terms"),
        Cl.stringAscii("JP"),
        Cl.uint(12000)
      ],
      deployer
    );
    simnet.callPublicFn(
      "physical-asset-backed-nft",
      "request-redemption",
      [Cl.uint(1)],
      wallet1
    );
    
    const { result } = simnet.callPublicFn(
      "physical-asset-backed-nft",
      "approve-redemption",
      [Cl.uint(1)],
      wallet2
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should update storage location by asset holder", () => {
    simnet.callPublicFn(
      "physical-asset-backed-nft",
      "mint",
      [
        Cl.principal(wallet1),
        Cl.principal(wallet2),
        Cl.stringUtf8("Old Location"),
        Cl.stringUtf8("Terms"),
        Cl.stringAscii("FR"),
        Cl.uint(7000)
      ],
      deployer
    );
    
    const { result } = simnet.callPublicFn(
      "physical-asset-backed-nft",
      "update-storage-location",
      [Cl.uint(1), Cl.stringUtf8("New Warehouse Location")],
      wallet2
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should transfer redeemable NFT", () => {
    simnet.callPublicFn(
      "physical-asset-backed-nft",
      "mint",
      [
        Cl.principal(wallet1),
        Cl.principal(wallet2),
        Cl.stringUtf8("Location X"),
        Cl.stringUtf8("Transfer terms"),
        Cl.stringAscii("DE"),
        Cl.uint(9000)
      ],
      deployer
    );
    
    const { result } = simnet.callPublicFn(
      "physical-asset-backed-nft",
      "transfer",
      [Cl.uint(1), Cl.principal(wallet1), Cl.principal(wallet2)],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should not transfer after redemption approved", () => {
    simnet.callPublicFn(
      "physical-asset-backed-nft",
      "mint",
      [
        Cl.principal(wallet1),
        Cl.principal(wallet2),
        Cl.stringUtf8("Locked Location"),
        Cl.stringUtf8("No transfer terms"),
        Cl.stringAscii("IT"),
        Cl.uint(6000)
      ],
      deployer
    );
    simnet.callPublicFn(
      "physical-asset-backed-nft",
      "request-redemption",
      [Cl.uint(1)],
      wallet1
    );
    simnet.callPublicFn(
      "physical-asset-backed-nft",
      "approve-redemption",
      [Cl.uint(1)],
      wallet2
    );
    
    const { result } = simnet.callPublicFn(
      "physical-asset-backed-nft",
      "transfer",
      [Cl.uint(1), Cl.principal(wallet1), Cl.principal(wallet2)],
      wallet1
    );
    expect(result).toBeErr(Cl.uint(103));
  });

  it("should get owner of NFT", () => {
    simnet.callPublicFn(
      "physical-asset-backed-nft",
      "mint",
      [
        Cl.principal(wallet1),
        Cl.principal(wallet2),
        Cl.stringUtf8("Owner Test Location"),
        Cl.stringUtf8("Owner terms"),
        Cl.stringAscii("ES"),
        Cl.uint(11000)
      ],
      deployer
    );
    
    const { result } = simnet.callReadOnlyFn(
      "physical-asset-backed-nft",
      "get-owner",
      [Cl.uint(1)],
      deployer
    );
    expect(result).toBeOk(Cl.some(Cl.principal(wallet1)));
  });
});

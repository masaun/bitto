import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("real-estate-nft contract", () => {
  beforeEach(() => {
    simnet.setEpoch("3.0");
  });

  it("should mint real estate NFT", () => {
    const operatingAgreementHash = new Uint8Array(32);
    operatingAgreementHash[0] = 1;
    
    const { result } = simnet.callPublicFn(
      "real-estate-nft",
      "mint",
      [
        Cl.principal(wallet1),
        Cl.stringAscii("123 Main St"),
        Cl.stringUtf8("Property Address"),
        Cl.stringUtf8("{coordinates}"),
        Cl.stringAscii("PARCEL-001"),
        Cl.principal(wallet1),
        Cl.buffer(operatingAgreementHash),
        Cl.principal(wallet2)
      ],
      deployer
    );
    expect(result).toBeOk(Cl.uint(1));
  });

  it("should get property info", () => {
    const operatingAgreementHash = new Uint8Array(32);
    operatingAgreementHash[0] = 1;
    
    simnet.callPublicFn(
      "real-estate-nft",
      "mint",
      [
        Cl.principal(wallet1),
        Cl.stringAscii("123 Main St"),
        Cl.stringUtf8("Property Address"),
        Cl.stringUtf8("{coordinates}"),
        Cl.stringAscii("PARCEL-001"),
        Cl.principal(wallet1),
        Cl.buffer(operatingAgreementHash),
        Cl.principal(wallet2)
      ],
      deployer
    );
    
    const { result } = simnet.callReadOnlyFn(
      "real-estate-nft",
      "get-property-info",
      [Cl.uint(1)],
      deployer
    );
    expect(result).toBeSome(Cl.tuple({
      "legal-description": Cl.stringAscii("123 Main St"),
      address: Cl.stringUtf8("Property Address"),
      "geo-json": Cl.stringUtf8("{coordinates}"),
      "parcel-id": Cl.stringAscii("PARCEL-001"),
      "legal-owner": Cl.principal(wallet1),
      "operating-agreement-hash": Cl.buffer(operatingAgreementHash),
      manager: Cl.principal(wallet2)
    }));
  });

  it("should set debt on property", () => {
    const operatingAgreementHash = new Uint8Array(32);
    operatingAgreementHash[0] = 1;
    
    simnet.callPublicFn(
      "real-estate-nft",
      "mint",
      [
        Cl.principal(wallet1),
        Cl.stringAscii("123 Main St"),
        Cl.stringUtf8("Property Address"),
        Cl.stringUtf8("{coordinates}"),
        Cl.stringAscii("PARCEL-001"),
        Cl.principal(wallet1),
        Cl.buffer(operatingAgreementHash),
        Cl.principal(wallet2)
      ],
      deployer
    );
    
    const { result } = simnet.callPublicFn(
      "real-estate-nft",
      "set-debt",
      [Cl.uint(1), Cl.principal(deployer), Cl.uint(50000)],
      wallet2
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should get debt info", () => {
    const operatingAgreementHash = new Uint8Array(32);
    operatingAgreementHash[0] = 1;
    
    simnet.callPublicFn(
      "real-estate-nft",
      "mint",
      [
        Cl.principal(wallet1),
        Cl.stringAscii("123 Main St"),
        Cl.stringUtf8("Property Address"),
        Cl.stringUtf8("{coordinates}"),
        Cl.stringAscii("PARCEL-001"),
        Cl.principal(wallet1),
        Cl.buffer(operatingAgreementHash),
        Cl.principal(wallet2)
      ],
      deployer
    );
    
    simnet.callPublicFn(
      "real-estate-nft",
      "set-debt",
      [Cl.uint(1), Cl.principal(deployer), Cl.uint(50000)],
      wallet2
    );
    
    const { result } = simnet.callReadOnlyFn(
      "real-estate-nft",
      "get-debt-info",
      [Cl.uint(1)],
      deployer
    );
    expect(result).toBeSome(Cl.tuple({
      "debt-token": Cl.principal(deployer),
      "debt-amount": Cl.uint(50000),
      foreclosed: Cl.bool(false)
    }));
  });

  it("should foreclose property", () => {
    const operatingAgreementHash = new Uint8Array(32);
    operatingAgreementHash[0] = 1;
    
    simnet.callPublicFn(
      "real-estate-nft",
      "mint",
      [
        Cl.principal(wallet1),
        Cl.stringAscii("123 Main St"),
        Cl.stringUtf8("Property Address"),
        Cl.stringUtf8("{coordinates}"),
        Cl.stringAscii("PARCEL-001"),
        Cl.principal(wallet1),
        Cl.buffer(operatingAgreementHash),
        Cl.principal(wallet2)
      ],
      deployer
    );
    
    const { result } = simnet.callPublicFn(
      "real-estate-nft",
      "foreclose",
      [Cl.uint(1)],
      wallet2
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should get contract hash", () => {
    const { result } = simnet.callReadOnlyFn(
      "real-estate-nft",
      "get-contract-hash",
      [],
      deployer
    );
    expect(result).toBeSome(Cl.buffer(new Uint8Array(32)));
  });
});

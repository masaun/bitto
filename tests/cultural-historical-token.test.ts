import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("cultural-historical-token contract", () => {
  beforeEach(() => {
    simnet.setEpoch("3.0");
  });

  it("should mint cultural token", () => {
    const { result } = simnet.callPublicFn(
      "cultural-historical-token",
      "mint",
      [
        Cl.principal(wallet1),
        Cl.stringAscii("Level 1"),
        Cl.stringAscii("2024-01-01"),
        Cl.stringAscii("Artist Name"),
        Cl.stringAscii("Painting"),
        Cl.stringAscii("Oil on canvas"),
        Cl.stringAscii("50x70cm"),
        Cl.stringAscii("Private collection"),
        Cl.stringAscii("All rights reserved")
      ],
      deployer
    );
    expect(result).toBeOk(Cl.uint(1));
  });

  it("should get token attributes", () => {
    simnet.callPublicFn(
      "cultural-historical-token",
      "mint",
      [
        Cl.principal(wallet1),
        Cl.stringAscii("Level 1"),
        Cl.stringAscii("2024-01-01"),
        Cl.stringAscii("Artist Name"),
        Cl.stringAscii("Painting"),
        Cl.stringAscii("Oil on canvas"),
        Cl.stringAscii("50x70cm"),
        Cl.stringAscii("Private collection"),
        Cl.stringAscii("All rights reserved")
      ],
      deployer
    );
    
    const { result } = simnet.callReadOnlyFn(
      "cultural-historical-token",
      "get-attributes",
      [Cl.uint(1)],
      deployer
    );
    expect(result).toBeSome(Cl.tuple({
      "catalog-level": Cl.stringAscii("Level 1"),
      "creation-date": Cl.stringAscii("2024-01-01"),
      "creator-name": Cl.stringAscii("Artist Name"),
      "asset-type": Cl.stringAscii("Painting"),
      materials: Cl.stringAscii("Oil on canvas"),
      dimensions: Cl.stringAscii("50x70cm"),
      provenance: Cl.stringAscii("Private collection"),
      copyright: Cl.stringAscii("All rights reserved")
    }));
  });

  it("should set extended attributes", () => {
    simnet.callPublicFn(
      "cultural-historical-token",
      "mint",
      [
        Cl.principal(wallet1),
        Cl.stringAscii("Level 1"),
        Cl.stringAscii("2024-01-01"),
        Cl.stringAscii("Artist Name"),
        Cl.stringAscii("Painting"),
        Cl.stringAscii("Oil on canvas"),
        Cl.stringAscii("50x70cm"),
        Cl.stringAscii("Private collection"),
        Cl.stringAscii("All rights reserved")
      ],
      deployer
    );
    
    const { result } = simnet.callPublicFn(
      "cultural-historical-token",
      "set-extended",
      [
        Cl.uint(1),
        Cl.stringAscii("Full description"),
        Cl.stringAscii("Museum of Art 2024"),
        Cl.stringAscii("Certificate #123"),
        Cl.stringAscii("https://example.com")
      ],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should get extended attributes", () => {
    simnet.callPublicFn(
      "cultural-historical-token",
      "mint",
      [
        Cl.principal(wallet1),
        Cl.stringAscii("Level 1"),
        Cl.stringAscii("2024-01-01"),
        Cl.stringAscii("Artist Name"),
        Cl.stringAscii("Painting"),
        Cl.stringAscii("Oil on canvas"),
        Cl.stringAscii("50x70cm"),
        Cl.stringAscii("Private collection"),
        Cl.stringAscii("All rights reserved")
      ],
      deployer
    );
    
    simnet.callPublicFn(
      "cultural-historical-token",
      "set-extended",
      [
        Cl.uint(1),
        Cl.stringAscii("Full description"),
        Cl.stringAscii("Museum of Art 2024"),
        Cl.stringAscii("Certificate #123"),
        Cl.stringAscii("https://example.com")
      ],
      wallet1
    );
    
    const { result } = simnet.callReadOnlyFn(
      "cultural-historical-token",
      "get-extended",
      [Cl.uint(1)],
      deployer
    );
    expect(result).toBeSome(Cl.tuple({
      "full-text": Cl.stringAscii("Full description"),
      exhibitions: Cl.stringAscii("Museum of Art 2024"),
      documents: Cl.stringAscii("Certificate #123"),
      urls: Cl.stringAscii("https://example.com")
    }));
  });

  it("should transfer token", () => {
    simnet.callPublicFn(
      "cultural-historical-token",
      "mint",
      [
        Cl.principal(wallet1),
        Cl.stringAscii("Level 1"),
        Cl.stringAscii("2024-01-01"),
        Cl.stringAscii("Artist Name"),
        Cl.stringAscii("Painting"),
        Cl.stringAscii("Oil on canvas"),
        Cl.stringAscii("50x70cm"),
        Cl.stringAscii("Private collection"),
        Cl.stringAscii("All rights reserved")
      ],
      deployer
    );
    
    const { result } = simnet.callPublicFn(
      "cultural-historical-token",
      "transfer",
      [Cl.uint(1), Cl.principal(wallet1), Cl.principal(wallet2)],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should get contract hash", () => {
    const { result } = simnet.callReadOnlyFn(
      "cultural-historical-token",
      "get-contract-hash",
      [],
      deployer
    );
    expect(result).toBeSome(Cl.buffer(new Uint8Array(32)));
  });
});

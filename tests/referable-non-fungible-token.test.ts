import { Cl } from "@stacks/transactions";
import { describe, expect, it, beforeEach } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const user1 = accounts.get("wallet_1")!;
const user2 = accounts.get("wallet_2")!;
const user3 = accounts.get("wallet_3")!;

describe("Referable Non-Fungible Token (ERC-5521 inspired)", () => {

  beforeEach(() => {
    simnet.setEpoch("3.3");
  });

  it("should get token metadata", () => {
    const name = simnet.callReadOnlyFn("referable-non-fungible-token", "get-name", [], deployer);
    expect(name.result).toBeOk(Cl.stringAscii("ReferableNFT"));

    const symbol = simnet.callReadOnlyFn("referable-non-fungible-token", "get-symbol", [], deployer);
    expect(symbol.result).toBeOk(Cl.stringAscii("RNFT"));
  });

  it("should mint an NFT", () => {
    const mintResult = simnet.callPublicFn("referable-non-fungible-token", "mint", [
      Cl.principal(user1)
    ], deployer);
    expect(mintResult.result).toBeOk(Cl.uint(1));

    const owner = simnet.callReadOnlyFn("referable-non-fungible-token", "get-owner", [
      Cl.uint(1)
    ], deployer);
    expect(owner.result).toBeOk(Cl.some(Cl.principal(user1)));

    const lastTokenId = simnet.callReadOnlyFn("referable-non-fungible-token", "get-last-token-id", [], deployer);
    expect(lastTokenId.result).toBeOk(Cl.uint(1));
  });

  it("should mint multiple NFTs with incremental IDs", () => {
    const mint1 = simnet.callPublicFn("referable-non-fungible-token", "mint", [
      Cl.principal(user1)
    ], deployer);
    expect(mint1.result).toBeOk(Cl.uint(1));

    const mint2 = simnet.callPublicFn("referable-non-fungible-token", "mint", [
      Cl.principal(user2)
    ], deployer);
    expect(mint2.result).toBeOk(Cl.uint(2));

    const mint3 = simnet.callPublicFn("referable-non-fungible-token", "mint", [
      Cl.principal(user3)
    ], deployer);
    expect(mint3.result).toBeOk(Cl.uint(3));
  });

  it("should record creation timestamp", () => {
    simnet.mineEmptyBlock();
    const currentHeight = simnet.blockHeight;

    const mintResult = simnet.callPublicFn("referable-non-fungible-token", "mint", [
      Cl.principal(user1)
    ], deployer);
    expect(mintResult.result).toBeOk(Cl.uint(1));

    const timestamp = simnet.callReadOnlyFn("referable-non-fungible-token", "created-timestamp-of", [
      Cl.principal(deployer),
      Cl.uint(1)
    ], deployer);
    expect(timestamp.result).toBeOk(Cl.uint(currentHeight + 1));
  });

  it("should transfer NFT", () => {
    simnet.callPublicFn("referable-non-fungible-token", "mint", [
      Cl.principal(user1)
    ], deployer);

    const transferResult = simnet.callPublicFn("referable-non-fungible-token", "transfer", [
      Cl.uint(1),
      Cl.principal(user1),
      Cl.principal(user2)
    ], user1);
    expect(transferResult.result).toBeOk(Cl.bool(true));

    const owner = simnet.callReadOnlyFn("referable-non-fungible-token", "get-owner", [
      Cl.uint(1)
    ], deployer);
    expect(owner.result).toBeOk(Cl.some(Cl.principal(user2)));
  });

  it("should fail unauthorized transfer", () => {
    simnet.callPublicFn("referable-non-fungible-token", "mint", [
      Cl.principal(user1)
    ], deployer);

    const transferResult = simnet.callPublicFn("referable-non-fungible-token", "transfer", [
      Cl.uint(1),
      Cl.principal(user1),
      Cl.principal(user2)
    ], user2);
    expect(transferResult.result).toBeErr(Cl.uint(100));
  });

  it("should set node references", () => {
    simnet.callPublicFn("referable-non-fungible-token", "mint", [
      Cl.principal(user1)
    ], deployer);

    simnet.callPublicFn("referable-non-fungible-token", "mint", [
      Cl.principal(user2)
    ], deployer);

    const setNodeResult = simnet.callPublicFn("referable-non-fungible-token", "set-node", [
      Cl.uint(2),
      Cl.list([Cl.principal(deployer)]),
      Cl.list([Cl.list([Cl.uint(1)])])
    ], user2);
    expect(setNodeResult.result).toBeOk(Cl.bool(true));
  });

  it("should fail to set node as non-owner", () => {
    simnet.callPublicFn("referable-non-fungible-token", "mint", [
      Cl.principal(user1)
    ], deployer);

    const setNodeResult = simnet.callPublicFn("referable-non-fungible-token", "set-node", [
      Cl.uint(1),
      Cl.list([Cl.principal(deployer)]),
      Cl.list([Cl.list([Cl.uint(1)])])
    ], user2);
    expect(setNodeResult.result).toBeErr(Cl.uint(100));
  });

  it("should get referring relationships", () => {
    simnet.callPublicFn("referable-non-fungible-token", "mint", [
      Cl.principal(user1)
    ], deployer);

    simnet.callPublicFn("referable-non-fungible-token", "mint", [
      Cl.principal(user2)
    ], deployer);

    simnet.callPublicFn("referable-non-fungible-token", "set-node", [
      Cl.uint(2),
      Cl.list([Cl.principal(deployer)]),
      Cl.list([Cl.list([Cl.uint(1)])])
    ], user2);

    const referringOf = simnet.callReadOnlyFn("referable-non-fungible-token", "referring-of", [
      Cl.principal(deployer),
      Cl.uint(2)
    ], deployer);
    
    expect(referringOf.result).toBeOk(
      Cl.tuple({
        contracts: Cl.list([Cl.principal(deployer)]),
        "token-ids": Cl.list([Cl.list([])])
      })
    );
  });

  it("should get referred relationships", () => {
    simnet.callPublicFn("referable-non-fungible-token", "mint", [
      Cl.principal(user1)
    ], deployer);

    simnet.callPublicFn("referable-non-fungible-token", "mint", [
      Cl.principal(user2)
    ], deployer);

    simnet.callPublicFn("referable-non-fungible-token", "set-node", [
      Cl.uint(2),
      Cl.list([Cl.principal(deployer)]),
      Cl.list([Cl.list([Cl.uint(1)])])
    ], user2);

    const referredOf = simnet.callReadOnlyFn("referable-non-fungible-token", "referred-of", [
      Cl.principal(deployer),
      Cl.uint(2)
    ], deployer);
    
    expect(referredOf.result).toBeOk(
      Cl.tuple({
        contracts: Cl.list([Cl.principal(deployer)]),
        "token-ids": Cl.list([Cl.list([])])
      })
    );
  });

  it("should return none for non-existent token URI", () => {
    simnet.callPublicFn("referable-non-fungible-token", "mint", [
      Cl.principal(user1)
    ], deployer);

    const uri = simnet.callReadOnlyFn("referable-non-fungible-token", "get-token-uri", [
      Cl.uint(1)
    ], deployer);
    expect(uri.result).toBeOk(Cl.none());
  });

  it("should handle complex reference relationships", () => {
    const mint1 = simnet.callPublicFn("referable-non-fungible-token", "mint", [
      Cl.principal(user1)
    ], deployer);

    const mint2 = simnet.callPublicFn("referable-non-fungible-token", "mint", [
      Cl.principal(user2)
    ], deployer);

    const mint3 = simnet.callPublicFn("referable-non-fungible-token", "mint", [
      Cl.principal(user3)
    ], deployer);

    const setNode = simnet.callPublicFn("referable-non-fungible-token", "set-node", [
      Cl.uint(3),
      Cl.list([Cl.principal(deployer), Cl.principal(deployer)]),
      Cl.list([Cl.list([Cl.uint(1)]), Cl.list([Cl.uint(2)])])
    ], user3);
    expect(setNode.result).toBeOk(Cl.bool(true));

    const referringOf = simnet.callReadOnlyFn("referable-non-fungible-token", "referring-of", [
      Cl.principal(deployer),
      Cl.uint(3)
    ], deployer);
    
    expect(referringOf.result).toBeOk(
      Cl.tuple({
        contracts: Cl.list([Cl.principal(deployer), Cl.principal(deployer)]),
        "token-ids": Cl.list([Cl.list([]), Cl.list([])])
      })
    );
  });
});

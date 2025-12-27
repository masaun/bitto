import { Cl, ClarityType } from "@stacks/transactions";
import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const user1 = accounts.get("wallet_1")!;
const user2 = accounts.get("wallet_2")!;

describe("SFT with Supply Extension Tests", () => {
  it("should initialize with correct initial state", () => {
    // Check that no tokens exist initially
    const balance = simnet.callReadOnlyFn(
      "sft-with-supply-extension",
      "get-balance",
      [Cl.uint(1), Cl.principal(deployer)],
      deployer
    );
    expect(balance.result).toBeOk(Cl.uint(0));

    const totalSupply = simnet.callReadOnlyFn(
      "sft-with-supply-extension",
      "get-total-supply",
      [Cl.uint(1)],
      deployer
    );
    expect(totalSupply.result).toBeOk(Cl.uint(0));
  });

  it("should mint new tokens by contract owner", () => {
    const { result: mintResult } = simnet.callPublicFn(
      "sft-with-supply-extension",
      "mint",
      [Cl.uint(1), Cl.uint(100), Cl.principal(user1)],
      deployer
    );
    expect(mintResult).toBeOk(Cl.bool(true));

    // Verify balance
    const balance = simnet.callReadOnlyFn(
      "sft-with-supply-extension",
      "get-balance",
      [Cl.uint(1), Cl.principal(user1)],
      user1
    );
    expect(balance.result).toBeOk(Cl.uint(100));

    // Verify total supply
    const totalSupply = simnet.callReadOnlyFn(
      "sft-with-supply-extension",
      "get-total-supply",
      [Cl.uint(1)],
      deployer
    );
    expect(totalSupply.result).toBeOk(Cl.uint(100));

    // Verify token exists
    const exists = simnet.callReadOnlyFn(
      "sft-with-supply-extension",
      "exists",
      [Cl.uint(1)],
      deployer
    );
    expect(exists.result).toBeOk(Cl.bool(true));
  });

  it("should fail to mint if not contract owner", () => {
    const { result: mintResult } = simnet.callPublicFn(
      "sft-with-supply-extension",
      "mint",
      [Cl.uint(1), Cl.uint(100), Cl.principal(user1)],
      user1
    );
    expect(mintResult).toBeErr(Cl.uint(100)); // err-owner-only
  });

  it("should transfer tokens between users", () => {
    // Mint tokens to user1
    simnet.callPublicFn(
      "sft-with-supply-extension",
      "mint",
      [Cl.uint(1), Cl.uint(100), Cl.principal(user1)],
      deployer
    );

    // Transfer from user1 to user2
    const { result: transferResult } = simnet.callPublicFn(
      "sft-with-supply-extension",
      "transfer",
      [Cl.uint(1), Cl.uint(30), Cl.principal(user1), Cl.principal(user2)],
      user1
    );
    expect(transferResult).toBeOk(Cl.bool(true));

    // Verify balances
    const balance1 = simnet.callReadOnlyFn(
      "sft-with-supply-extension",
      "get-balance",
      [Cl.uint(1), Cl.principal(user1)],
      user1
    );
    expect(balance1.result).toBeOk(Cl.uint(70));

    const balance2 = simnet.callReadOnlyFn(
      "sft-with-supply-extension",
      "get-balance",
      [Cl.uint(1), Cl.principal(user2)],
      user2
    );
    expect(balance2.result).toBeOk(Cl.uint(30));
  });

  it("should fail to transfer if not sender", () => {
    // Mint tokens to user1
    simnet.callPublicFn(
      "sft-with-supply-extension",
      "mint",
      [Cl.uint(1), Cl.uint(100), Cl.principal(user1)],
      deployer
    );

    // Try to transfer as different user
    const { result: transferResult } = simnet.callPublicFn(
      "sft-with-supply-extension",
      "transfer",
      [Cl.uint(1), Cl.uint(30), Cl.principal(user1), Cl.principal(user2)],
      user2
    );
    expect(transferResult).toBeErr(Cl.uint(101)); // err-not-authorized
  });

  it("should fail to transfer with insufficient balance", () => {
    // Mint tokens to user1
    simnet.callPublicFn(
      "sft-with-supply-extension",
      "mint",
      [Cl.uint(1), Cl.uint(50), Cl.principal(user1)],
      deployer
    );

    // Try to transfer more than balance
    const { result: transferResult } = simnet.callPublicFn(
      "sft-with-supply-extension",
      "transfer",
      [Cl.uint(1), Cl.uint(100), Cl.principal(user1), Cl.principal(user2)],
      user1
    );
    expect(transferResult).toBeErr(Cl.uint(102)); // err-insufficient-balance
  });

  it("should burn tokens", () => {
    // Mint tokens to user1
    simnet.callPublicFn(
      "sft-with-supply-extension",
      "mint",
      [Cl.uint(1), Cl.uint(100), Cl.principal(user1)],
      deployer
    );

    // Burn tokens
    const { result: burnResult } = simnet.callPublicFn(
      "sft-with-supply-extension",
      "burn",
      [Cl.uint(1), Cl.uint(40), Cl.principal(user1)],
      user1
    );
    expect(burnResult).toBeOk(Cl.bool(true));

    // Verify balance
    const balance = simnet.callReadOnlyFn(
      "sft-with-supply-extension",
      "get-balance",
      [Cl.uint(1), Cl.principal(user1)],
      user1
    );
    expect(balance.result).toBeOk(Cl.uint(60));

    // Verify total supply decreased
    const totalSupply = simnet.callReadOnlyFn(
      "sft-with-supply-extension",
      "get-total-supply",
      [Cl.uint(1)],
      deployer
    );
    expect(totalSupply.result).toBeOk(Cl.uint(60));
  });

  it("should fail to burn if not owner", () => {
    // Mint tokens to user1
    simnet.callPublicFn(
      "sft-with-supply-extension",
      "mint",
      [Cl.uint(1), Cl.uint(100), Cl.principal(user1)],
      deployer
    );

    // Try to burn as different user
    const { result: burnResult } = simnet.callPublicFn(
      "sft-with-supply-extension",
      "burn",
      [Cl.uint(1), Cl.uint(40), Cl.principal(user1)],
      user2
    );
    expect(burnResult).toBeErr(Cl.uint(101)); // err-not-authorized
  });

  it("should fail to burn with insufficient balance", () => {
    // Mint tokens to user1
    simnet.callPublicFn(
      "sft-with-supply-extension",
      "mint",
      [Cl.uint(1), Cl.uint(50), Cl.principal(user1)],
      deployer
    );

    // Try to burn more than balance
    const { result: burnResult } = simnet.callPublicFn(
      "sft-with-supply-extension",
      "burn",
      [Cl.uint(1), Cl.uint(100), Cl.principal(user1)],
      user1
    );
    expect(burnResult).toBeErr(Cl.uint(102)); // err-insufficient-balance
  });

  it("should set token URI by contract owner", () => {
    // Mint a token first
    simnet.callPublicFn(
      "sft-with-supply-extension",
      "mint",
      [Cl.uint(1), Cl.uint(100), Cl.principal(user1)],
      deployer
    );

    // Set token URI
    const { result: setUriResult } = simnet.callPublicFn(
      "sft-with-supply-extension",
      "set-token-uri",
      [Cl.uint(1), Cl.stringAscii("https://example.com/token/1.json")],
      deployer
    );
    expect(setUriResult).toBeOk(Cl.bool(true));

    // Verify URI was set
    const uri = simnet.callReadOnlyFn(
      "sft-with-supply-extension",
      "get-token-uri",
      [Cl.uint(1)],
      deployer
    );
    expect(uri.result).toBeOk(
      Cl.some(Cl.stringAscii("https://example.com/token/1.json"))
    );
  });

  it("should fail to set token URI if not contract owner", () => {
    // Try to set URI as non-owner
    const { result: setUriResult } = simnet.callPublicFn(
      "sft-with-supply-extension",
      "set-token-uri",
      [Cl.uint(1), Cl.stringAscii("https://example.com/token/1.json")],
      user1
    );
    expect(setUriResult).toBeErr(Cl.uint(100)); // err-owner-only
  });

  it("should handle multiple token types", () => {
    // Mint token type 1
    simnet.callPublicFn(
      "sft-with-supply-extension",
      "mint",
      [Cl.uint(1), Cl.uint(100), Cl.principal(user1)],
      deployer
    );

    // Mint token type 2
    simnet.callPublicFn(
      "sft-with-supply-extension",
      "mint",
      [Cl.uint(2), Cl.uint(200), Cl.principal(user2)],
      deployer
    );

    // Verify balances
    const balance1 = simnet.callReadOnlyFn(
      "sft-with-supply-extension",
      "get-balance",
      [Cl.uint(1), Cl.principal(user1)],
      user1
    );
    expect(balance1.result).toBeOk(Cl.uint(100));

    const balance2 = simnet.callReadOnlyFn(
      "sft-with-supply-extension",
      "get-balance",
      [Cl.uint(2), Cl.principal(user2)],
      user2
    );
    expect(balance2.result).toBeOk(Cl.uint(200));

    // Verify total supplies
    const supply1 = simnet.callReadOnlyFn(
      "sft-with-supply-extension",
      "get-total-supply",
      [Cl.uint(1)],
      deployer
    );
    expect(supply1.result).toBeOk(Cl.uint(100));

    const supply2 = simnet.callReadOnlyFn(
      "sft-with-supply-extension",
      "get-total-supply",
      [Cl.uint(2)],
      deployer
    );
    expect(supply2.result).toBeOk(Cl.uint(200));
  });

  it("should batch transfer tokens by owner", () => {
    // Mint tokens to deployer first
    simnet.callPublicFn(
      "sft-with-supply-extension",
      "mint",
      [Cl.uint(1), Cl.uint(100), Cl.principal(deployer)],
      deployer
    );

    simnet.callPublicFn(
      "sft-with-supply-extension",
      "mint",
      [Cl.uint(2), Cl.uint(200), Cl.principal(deployer)],
      deployer
    );

    // Batch transfer
    const transfers = Cl.list([
      Cl.tuple({
        "token-id": Cl.uint(1),
        amount: Cl.uint(50),
        recipient: Cl.principal(user1),
      }),
      Cl.tuple({
        "token-id": Cl.uint(2),
        amount: Cl.uint(100),
        recipient: Cl.principal(user2),
      }),
    ]);

    const { result: batchResult } = simnet.callPublicFn(
      "sft-with-supply-extension",
      "batch-transfer",
      [transfers],
      deployer
    );
    expect(batchResult).toBeOk(Cl.list([Cl.bool(true), Cl.bool(true)]));
  });

  it("should fail batch transfer if not contract owner", () => {
    const transfers = Cl.list([
      Cl.tuple({
        "token-id": Cl.uint(1),
        amount: Cl.uint(50),
        recipient: Cl.principal(user1),
      }),
    ]);

    const { result: batchResult } = simnet.callPublicFn(
      "sft-with-supply-extension",
      "batch-transfer",
      [transfers],
      user1
    );
    expect(batchResult).toBeErr(Cl.uint(100)); // err-owner-only
  });

  it("should mint tokens multiple times and accumulate supply", () => {
    // First mint
    simnet.callPublicFn(
      "sft-with-supply-extension",
      "mint",
      [Cl.uint(1), Cl.uint(100), Cl.principal(user1)],
      deployer
    );

    // Second mint to same user
    simnet.callPublicFn(
      "sft-with-supply-extension",
      "mint",
      [Cl.uint(1), Cl.uint(50), Cl.principal(user1)],
      deployer
    );

    // Verify accumulated balance
    const balance = simnet.callReadOnlyFn(
      "sft-with-supply-extension",
      "get-balance",
      [Cl.uint(1), Cl.principal(user1)],
      user1
    );
    expect(balance.result).toBeOk(Cl.uint(150));

    // Verify total supply
    const totalSupply = simnet.callReadOnlyFn(
      "sft-with-supply-extension",
      "get-total-supply",
      [Cl.uint(1)],
      deployer
    );
    expect(totalSupply.result).toBeOk(Cl.uint(150));
  });

  it("should return zero balance for non-existent tokens", () => {
    const balance = simnet.callReadOnlyFn(
      "sft-with-supply-extension",
      "get-balance",
      [Cl.uint(999), Cl.principal(user1)],
      user1
    );
    expect(balance.result).toBeOk(Cl.uint(0));

    const exists = simnet.callReadOnlyFn(
      "sft-with-supply-extension",
      "exists",
      [Cl.uint(999)],
      deployer
    );
    expect(exists.result).toBeOk(Cl.bool(false));
  });
});

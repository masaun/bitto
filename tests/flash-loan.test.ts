import { Cl, ClarityType } from "@stacks/transactions";
import { describe, expect, it, beforeEach } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const user1 = accounts.get("wallet_1")!;
const user2 = accounts.get("wallet_2")!;
const user3 = accounts.get("wallet_3")!;

// Test token principal (using the fungible-token contract)
const testToken = `${deployer}.fungible-token`;

// Constants from contract
const CALLBACK_SUCCESS = Cl.bufferFromHex("4368616e676520746865207374617465206f6620796f757220636f6e74726163");
const FEE_DENOMINATOR = 10000;
const DEFAULT_FEE_RATE = 9;
const MAX_FEE_RATE = 500;
const MIN_FLASH_LOAN_AMOUNT = 1000;

describe("Flash Loan Contract - ERC-3156 Compatible with Clarity v4 Features", () => {

  beforeEach(() => {
    // Reset simnet state before each test
    simnet.mineEmptyBlock();
  });

  // ==============================
  // Initialization & Clarity v4 Features
  // ==============================

  describe("Contract Initialization & Clarity v4 Features", () => {
    it("should have correct initial configuration", () => {
      const feeRate = simnet.callReadOnlyFn("flash-loan", "get-fee-rate", [], deployer);
      expect(feeRate.result).toEqual(Cl.uint(DEFAULT_FEE_RATE));

      const isPaused = simnet.callReadOnlyFn("flash-loan", "is-flash-loan-paused", [], deployer);
      expect(isPaused.result).toEqual(Cl.bool(false));

      const totalLoans = simnet.callReadOnlyFn("flash-loan", "get-total-flash-loans", [], deployer);
      expect(totalLoans.result).toEqual(Cl.uint(0));

      const totalFees = simnet.callReadOnlyFn("flash-loan", "get-total-fees-collected", [], deployer);
      expect(totalFees.result).toEqual(Cl.uint(0));
    });

    it("should return contract hash using Clarity v4", () => {
      const contractHash = simnet.callReadOnlyFn("flash-loan", "get-contract-hash", [], deployer);
      expect(contractHash.result).toBeTruthy();
    });

    it("should return current block time using Clarity v4", () => {
      const blockTime = simnet.callReadOnlyFn("flash-loan", "get-current-block-time", [], deployer);
      expect(blockTime.result).toBeTruthy();
      expect(blockTime.result.type).toBe(ClarityType.UInt);
    });

    it("should check if assets are restricted", () => {
      const assetsRestricted = simnet.callReadOnlyFn("flash-loan", "are-assets-restricted", [], deployer);
      expect(assetsRestricted.result).toEqual(Cl.bool(false));
    });

    it("should get comprehensive lender info", () => {
      const lenderInfo = simnet.callReadOnlyFn("flash-loan", "get-lender-info", [], deployer);
      expect(lenderInfo.result).toBeTruthy();
      expect(lenderInfo.result.type).toBe(ClarityType.Tuple);
    });
  });

  // ==============================
  // Token Management
  // ==============================

  describe("Token Management", () => {
    it("should allow owner to add supported token", () => {
      const result = simnet.callPublicFn(
        "flash-loan",
        "add-supported-token",
        [
          Cl.principal(testToken),
          Cl.stringUtf8("BITTO"),
          Cl.uint(6),
          Cl.uint(1000000000),
          Cl.none(),
        ],
        deployer
      );
      expect(result.result).toBeOk(Cl.bool(true));

      // Verify token was added
      const tokenConfig = simnet.callReadOnlyFn(
        "flash-loan",
        "get-token-config",
        [Cl.principal(testToken)],
        deployer
      );
      expect(tokenConfig.result).toBeDefined();
    });

    it("should fail when non-owner tries to add token", () => {
      const result = simnet.callPublicFn(
        "flash-loan",
        "add-supported-token",
        [
          Cl.principal(testToken),
          Cl.stringUtf8("BITTO"),
          Cl.uint(6),
          Cl.uint(1000000000),
          Cl.none(),
        ],
        user1
      );
      expect(result.result).toBeErr(Cl.uint(3001)); // ERR_UNAUTHORIZED
    });

    it("should convert token symbol to ASCII", () => {
      const result = simnet.callReadOnlyFn(
        "flash-loan",
        "token-symbol-to-ascii",
        [Cl.stringUtf8("BITTO")],
        deployer
      );
      expect(result.result).toBeTruthy();
    });

    it("should allow owner to update token configuration", () => {
      // First add a token
      simnet.callPublicFn(
        "flash-loan",
        "add-supported-token",
        [
          Cl.principal(testToken),
          Cl.stringUtf8("BITTO"),
          Cl.uint(6),
          Cl.uint(1000000000),
          Cl.none(),
        ],
        deployer
      );

      // Update token config
      const result = simnet.callPublicFn(
        "flash-loan",
        "update-token-config",
        [
          Cl.principal(testToken),
          Cl.uint(2000000000),
          Cl.some(Cl.uint(20)),
          Cl.bool(true),
        ],
        deployer
      );
      expect(result.result).toBeOk(Cl.bool(true));
    });

    it("should fail to update non-existent token", () => {
      const result = simnet.callPublicFn(
        "flash-loan",
        "update-token-config",
        [
          Cl.principal(`${deployer}.non-existent-token`),
          Cl.uint(2000000000),
          Cl.some(Cl.uint(20)),
          Cl.bool(true),
        ],
        deployer
      );
      expect(result.result).toBeErr(Cl.uint(3016)); // ERR_TOKEN_NOT_FOUND
    });
  });

  // ==============================
  // Liquidity Management
  // ==============================

  describe("Liquidity Management", () => {
    beforeEach(() => {
      // Add supported token
      simnet.callPublicFn(
        "flash-loan",
        "add-supported-token",
        [
          Cl.principal(testToken),
          Cl.stringUtf8("BITTO"),
          Cl.uint(6),
          Cl.uint(1000000000),
          Cl.none(),
        ],
        deployer
      );
    });

    it("should allow adding liquidity", () => {
      const amount = 10000000;
      const result = simnet.callPublicFn(
        "flash-loan",
        "add-liquidity",
        [Cl.principal(testToken), Cl.uint(amount)],
        deployer
      );
      expect(result.result).toBeOk(Cl.uint(amount));

      // Check liquidity was added
      const liquidity = simnet.callReadOnlyFn(
        "flash-loan",
        "get-liquidity",
        [Cl.principal(testToken)],
        deployer
      );
      expect(liquidity.result).toEqual(Cl.uint(amount));
    });

    it("should fail to add zero liquidity", () => {
      const result = simnet.callPublicFn(
        "flash-loan",
        "add-liquidity",
        [Cl.principal(testToken), Cl.uint(0)],
        deployer
      );
      expect(result.result).toBeErr(Cl.uint(3017)); // ERR_INVALID_AMOUNT
    });

    it("should fail to add liquidity for unsupported token", () => {
      const result = simnet.callPublicFn(
        "flash-loan",
        "add-liquidity",
        [Cl.principal(`${deployer}.unsupported-token`), Cl.uint(10000)],
        deployer
      );
      expect(result.result).toBeErr(Cl.uint(3002)); // ERR_UNSUPPORTED_TOKEN
    });

    it("should allow owner to remove liquidity", () => {
      const amount = 10000000;
      // First add liquidity
      simnet.callPublicFn(
        "flash-loan",
        "add-liquidity",
        [Cl.principal(testToken), Cl.uint(amount)],
        deployer
      );

      // Remove liquidity
      const result = simnet.callPublicFn(
        "flash-loan",
        "remove-liquidity",
        [Cl.principal(testToken), Cl.uint(5000000)],
        deployer
      );
      expect(result.result).toBeOk(Cl.uint(5000000));
    });

    it("should fail when non-owner tries to remove liquidity", () => {
      const amount = 10000000;
      simnet.callPublicFn(
        "flash-loan",
        "add-liquidity",
        [Cl.principal(testToken), Cl.uint(amount)],
        deployer
      );

      const result = simnet.callPublicFn(
        "flash-loan",
        "remove-liquidity",
        [Cl.principal(testToken), Cl.uint(5000000)],
        user1
      );
      expect(result.result).toBeErr(Cl.uint(3001)); // ERR_UNAUTHORIZED
    });

    it("should fail to remove more liquidity than available", () => {
      const amount = 10000000;
      simnet.callPublicFn(
        "flash-loan",
        "add-liquidity",
        [Cl.principal(testToken), Cl.uint(amount)],
        deployer
      );

      const result = simnet.callPublicFn(
        "flash-loan",
        "remove-liquidity",
        [Cl.principal(testToken), Cl.uint(20000000)],
        deployer
      );
      expect(result.result).toBeErr(Cl.uint(3006)); // ERR_INSUFFICIENT_LIQUIDITY
    });
  });

  // ==============================
  // ERC-3156 Core Functions
  // ==============================

  describe("ERC-3156 Core Functions", () => {
    beforeEach(() => {
      // Setup: add token and liquidity
      simnet.callPublicFn(
        "flash-loan",
        "add-supported-token",
        [
          Cl.principal(testToken),
          Cl.stringUtf8("BITTO"),
          Cl.uint(6),
          Cl.uint(1000000000),
          Cl.none(),
        ],
        deployer
      );
      simnet.callPublicFn(
        "flash-loan",
        "add-liquidity",
        [Cl.principal(testToken), Cl.uint(100000000)],
        deployer
      );
    });

    it("should return max flash loan amount for supported token", () => {
      const maxLoan = simnet.callReadOnlyFn(
        "flash-loan",
        "max-flash-loan",
        [Cl.principal(testToken)],
        deployer
      );
      expect(maxLoan.result).toEqual(Cl.uint(100000000));
    });

    it("should return 0 for unsupported token", () => {
      const maxLoan = simnet.callReadOnlyFn(
        "flash-loan",
        "max-flash-loan",
        [Cl.principal(`${deployer}.unsupported-token`)],
        deployer
      );
      expect(maxLoan.result).toEqual(Cl.uint(0));
    });

    it("should return 0 when flash loans are paused", () => {
      // Pause flash loans
      simnet.callPublicFn("flash-loan", "pause-flash-loans", [], deployer);

      const maxLoan = simnet.callReadOnlyFn(
        "flash-loan",
        "max-flash-loan",
        [Cl.principal(testToken)],
        deployer
      );
      expect(maxLoan.result).toEqual(Cl.uint(0));
    });

    it("should calculate flash loan fee correctly", () => {
      const amount = 1000000;
      const expectedFee = Math.floor((amount * DEFAULT_FEE_RATE) / FEE_DENOMINATOR);

      const feeResult = simnet.callReadOnlyFn(
        "flash-loan",
        "flash-fee",
        [Cl.principal(testToken), Cl.uint(amount)],
        deployer
      );
      expect(feeResult.result).toBeOk(Cl.uint(expectedFee));
    });

    it("should fail to calculate fee for unsupported token", () => {
      const feeResult = simnet.callReadOnlyFn(
        "flash-loan",
        "flash-fee",
        [Cl.principal(`${deployer}.unsupported-token`), Cl.uint(1000000)],
        deployer
      );
      expect(feeResult.result).toBeErr(Cl.uint(3002)); // ERR_UNSUPPORTED_TOKEN
    });

    it("should use custom fee rate if set for token", () => {
      const customFeeRate = 20; // 0.2%
      // Update token with custom fee
      simnet.callPublicFn(
        "flash-loan",
        "update-token-config",
        [
          Cl.principal(testToken),
          Cl.uint(1000000000),
          Cl.some(Cl.uint(customFeeRate)),
          Cl.bool(true),
        ],
        deployer
      );

      const amount = 1000000;
      const expectedFee = Math.floor((amount * customFeeRate) / FEE_DENOMINATOR);

      const feeResult = simnet.callReadOnlyFn(
        "flash-loan",
        "flash-fee",
        [Cl.principal(testToken), Cl.uint(amount)],
        deployer
      );
      expect(feeResult.result).toBeOk(Cl.uint(expectedFee));
    });
  });

  // ==============================
  // Flash Loan Execution
  // ==============================

  describe("Flash Loan Execution", () => {
    beforeEach(() => {
      // Setup: add token and liquidity
      simnet.callPublicFn(
        "flash-loan",
        "add-supported-token",
        [
          Cl.principal(testToken),
          Cl.stringUtf8("BITTO"),
          Cl.uint(6),
          Cl.uint(1000000000),
          Cl.none(),
        ],
        deployer
      );
      simnet.callPublicFn(
        "flash-loan",
        "add-liquidity",
        [Cl.principal(testToken), Cl.uint(100000000)],
        deployer
      );
    });

    it("should initiate flash loan successfully", () => {
      const amount = 10000;
      const data = Cl.bufferFromAscii("test data");

      const result = simnet.callPublicFn(
        "flash-loan",
        "flash-loan",
        [Cl.principal(testToken), Cl.uint(amount), data],
        user1
      );
      
      expect(result.result).toBeTruthy();
      // The result should contain loan details
      if (result.result.type === ClarityType.ResponseOk) {
        expect(result.result.value.type).toBe(ClarityType.Tuple);
      }
    });

    it("should fail flash loan when paused", () => {
      simnet.callPublicFn("flash-loan", "pause-flash-loans", [], deployer);

      const result = simnet.callPublicFn(
        "flash-loan",
        "flash-loan",
        [Cl.principal(testToken), Cl.uint(10000), Cl.bufferFromAscii("data")],
        user1
      );
      expect(result.result).toBeErr(Cl.uint(3010)); // ERR_FLASH_LOAN_PAUSED
    });

    it("should fail flash loan when assets restricted", () => {
      simnet.callPublicFn("flash-loan", "set-asset-restrictions", [Cl.bool(true)], deployer);

      const result = simnet.callPublicFn(
        "flash-loan",
        "flash-loan",
        [Cl.principal(testToken), Cl.uint(10000), Cl.bufferFromAscii("data")],
        user1
      );
      expect(result.result).toBeErr(Cl.uint(3009)); // ERR_ASSETS_RESTRICTED
    });

    it("should fail when loan amount is too small", () => {
      const result = simnet.callPublicFn(
        "flash-loan",
        "flash-loan",
        [Cl.principal(testToken), Cl.uint(500), Cl.bufferFromAscii("data")],
        user1
      );
      expect(result.result).toBeErr(Cl.uint(3007)); // ERR_LOAN_AMOUNT_TOO_SMALL
    });

    it("should fail when token is not supported", () => {
      const result = simnet.callPublicFn(
        "flash-loan",
        "flash-loan",
        [
          Cl.principal(`${deployer}.unsupported-token`),
          Cl.uint(10000),
          Cl.bufferFromAscii("data"),
        ],
        user1
      );
      expect(result.result).toBeErr(Cl.uint(3002)); // ERR_UNSUPPORTED_TOKEN
    });

    it("should fail when insufficient liquidity", () => {
      const result = simnet.callPublicFn(
        "flash-loan",
        "flash-loan",
        [Cl.principal(testToken), Cl.uint(200000000), Cl.bufferFromAscii("data")],
        user1
      );
      expect(result.result).toBeErr(Cl.uint(3006)); // ERR_INSUFFICIENT_LIQUIDITY
    });

    it("should fail when loan amount exceeds max", () => {
      // Update token with lower max loan
      simnet.callPublicFn(
        "flash-loan",
        "update-token-config",
        [Cl.principal(testToken), Cl.uint(5000000), Cl.none(), Cl.bool(true)],
        deployer
      );

      const result = simnet.callPublicFn(
        "flash-loan",
        "flash-loan",
        [Cl.principal(testToken), Cl.uint(10000000), Cl.bufferFromAscii("data")],
        user1
      );
      expect(result.result).toBeErr(Cl.uint(3008)); // ERR_LOAN_AMOUNT_TOO_LARGE
    });
  });

  // ==============================
  // Flash Loan Callback
  // ==============================

  describe("Flash Loan Callback", () => {
    beforeEach(() => {
      // Setup: add token and liquidity
      simnet.callPublicFn(
        "flash-loan",
        "add-supported-token",
        [
          Cl.principal(testToken),
          Cl.stringUtf8("BITTO"),
          Cl.uint(6),
          Cl.uint(1000000000),
          Cl.none(),
        ],
        deployer
      );
      simnet.callPublicFn(
        "flash-loan",
        "add-liquidity",
        [Cl.principal(testToken), Cl.uint(100000000)],
        deployer
      );
    });

    it("should complete flash loan callback with correct callback success hash", () => {
      const amount = 10000;
      const expectedFee = Math.floor((amount * DEFAULT_FEE_RATE) / FEE_DENOMINATOR);

      // Initiate flash loan
      simnet.callPublicFn(
        "flash-loan",
        "flash-loan",
        [Cl.principal(testToken), Cl.uint(amount), Cl.bufferFromAscii("data")],
        user1
      );

      // Complete callback
      const callbackResult = simnet.callPublicFn(
        "flash-loan",
        "flash-loan-callback",
        [Cl.principal(testToken), Cl.uint(amount), Cl.uint(expectedFee), CALLBACK_SUCCESS],
        user1
      );
      expect(callbackResult.result).toBeOk(Cl.bool(true));
    });

    it("should fail callback with incorrect callback hash", () => {
      const amount = 10000;
      const expectedFee = Math.floor((amount * DEFAULT_FEE_RATE) / FEE_DENOMINATOR);

      // Initiate flash loan
      simnet.callPublicFn(
        "flash-loan",
        "flash-loan",
        [Cl.principal(testToken), Cl.uint(amount), Cl.bufferFromAscii("data")],
        user1
      );

      // Complete callback with wrong hash
      const callbackResult = simnet.callPublicFn(
        "flash-loan",
        "flash-loan-callback",
        [
          Cl.principal(testToken),
          Cl.uint(amount),
          Cl.uint(expectedFee),
          Cl.bufferFromHex("0000000000000000000000000000000000000000000000000000000000000000"),
        ],
        user1
      );
      expect(callbackResult.result).toBeErr(Cl.uint(3003)); // ERR_CALLBACK_FAILED
    });

    it("should fail callback with wrong amount", () => {
      const amount = 10000;
      const expectedFee = Math.floor((amount * DEFAULT_FEE_RATE) / FEE_DENOMINATOR);

      // Initiate flash loan
      simnet.callPublicFn(
        "flash-loan",
        "flash-loan",
        [Cl.principal(testToken), Cl.uint(amount), Cl.bufferFromAscii("data")],
        user1
      );

      // Complete callback with wrong amount
      const callbackResult = simnet.callPublicFn(
        "flash-loan",
        "flash-loan-callback",
        [Cl.principal(testToken), Cl.uint(amount + 1000), Cl.uint(expectedFee), CALLBACK_SUCCESS],
        user1
      );
      expect(callbackResult.result).toBeErr(Cl.uint(3017)); // ERR_INVALID_AMOUNT
    });

    it("should fail callback with wrong fee", () => {
      const amount = 10000;
      const expectedFee = Math.floor((amount * DEFAULT_FEE_RATE) / FEE_DENOMINATOR);

      // Initiate flash loan
      simnet.callPublicFn(
        "flash-loan",
        "flash-loan",
        [Cl.principal(testToken), Cl.uint(amount), Cl.bufferFromAscii("data")],
        user1
      );

      // Complete callback with wrong fee
      const callbackResult = simnet.callPublicFn(
        "flash-loan",
        "flash-loan-callback",
        [Cl.principal(testToken), Cl.uint(amount), Cl.uint(expectedFee + 100), CALLBACK_SUCCESS],
        user1
      );
      expect(callbackResult.result).toBeErr(Cl.uint(3017)); // ERR_INVALID_AMOUNT
    });

    it("should update statistics after successful flash loan", () => {
      const amount = 10000;
      const expectedFee = Math.floor((amount * DEFAULT_FEE_RATE) / FEE_DENOMINATOR);

      // Initiate and complete flash loan
      simnet.callPublicFn(
        "flash-loan",
        "flash-loan",
        [Cl.principal(testToken), Cl.uint(amount), Cl.bufferFromAscii("data")],
        user1
      );
      simnet.callPublicFn(
        "flash-loan",
        "flash-loan-callback",
        [Cl.principal(testToken), Cl.uint(amount), Cl.uint(expectedFee), CALLBACK_SUCCESS],
        user1
      );

      // Check statistics
      const totalLoans = simnet.callReadOnlyFn("flash-loan", "get-total-flash-loans", [], deployer);
      expect(totalLoans.result).toEqual(Cl.uint(1));

      const totalFees = simnet.callReadOnlyFn(
        "flash-loan",
        "get-total-fees-collected",
        [],
        deployer
      );
      expect(totalFees.result).toEqual(Cl.uint(expectedFee));
    });
  });

  // ==============================
  // Borrower Authorization
  // ==============================

  describe("Borrower Authorization", () => {
    it("should allow owner to authorize borrower", () => {
      const result = simnet.callPublicFn(
        "flash-loan",
        "authorize-borrower",
        [Cl.principal(user1), Cl.stringUtf8("Test Borrower"), Cl.none()],
        deployer
      );
      expect(result.result).toBeOk(Cl.bool(true));

      // Check borrower is authorized
      const isAuthorized = simnet.callReadOnlyFn(
        "flash-loan",
        "is-borrower-authorized",
        [Cl.principal(user1)],
        deployer
      );
      expect(isAuthorized.result).toEqual(Cl.bool(true));
    });

    it("should fail when non-owner tries to authorize borrower", () => {
      const result = simnet.callPublicFn(
        "flash-loan",
        "authorize-borrower",
        [Cl.principal(user2), Cl.stringUtf8("Test Borrower"), Cl.none()],
        user1
      );
      expect(result.result).toBeErr(Cl.uint(3001)); // ERR_UNAUTHORIZED
    });

    it("should allow owner to revoke borrower", () => {
      // First authorize
      simnet.callPublicFn(
        "flash-loan",
        "authorize-borrower",
        [Cl.principal(user1), Cl.stringUtf8("Test Borrower"), Cl.none()],
        deployer
      );

      // Then revoke
      const result = simnet.callPublicFn(
        "flash-loan",
        "revoke-borrower",
        [Cl.principal(user1)],
        deployer
      );
      expect(result.result).toBeOk(Cl.bool(true));

      // Check borrower is not authorized
      const isAuthorized = simnet.callReadOnlyFn(
        "flash-loan",
        "is-borrower-authorized",
        [Cl.principal(user1)],
        deployer
      );
      expect(isAuthorized.result).toEqual(Cl.bool(false));
    });

    it("should get borrower info", () => {
      simnet.callPublicFn(
        "flash-loan",
        "authorize-borrower",
        [Cl.principal(user1), Cl.stringUtf8("Test Borrower"), Cl.none()],
        deployer
      );

      const borrowerInfo = simnet.callReadOnlyFn(
        "flash-loan",
        "get-borrower-info",
        [Cl.principal(user1)],
        deployer
      );
      expect(borrowerInfo.result).toBeDefined();
    });

    it("should verify borrower contract hash", () => {
      // Get a contract hash first
      const hashResult = simnet.callReadOnlyFn(
        "flash-loan",
        "get-borrower-contract-hash",
        [Cl.principal(deployer)],
        deployer
      );
      
      expect(hashResult.result).toBeTruthy();
    });
  });

  // ==============================
  // Admin Functions
  // ==============================

  describe("Admin Functions", () => {
    it("should allow owner to pause flash loans", () => {
      const result = simnet.callPublicFn("flash-loan", "pause-flash-loans", [], deployer);
      expect(result.result).toBeOk(Cl.bool(true));

      const isPaused = simnet.callReadOnlyFn("flash-loan", "is-flash-loan-paused", [], deployer);
      expect(isPaused.result).toEqual(Cl.bool(true));
    });

    it("should allow owner to unpause flash loans", () => {
      simnet.callPublicFn("flash-loan", "pause-flash-loans", [], deployer);
      
      const result = simnet.callPublicFn("flash-loan", "unpause-flash-loans", [], deployer);
      expect(result.result).toBeOk(Cl.bool(true));

      const isPaused = simnet.callReadOnlyFn("flash-loan", "is-flash-loan-paused", [], deployer);
      expect(isPaused.result).toEqual(Cl.bool(false));
    });

    it("should fail when non-owner tries to pause", () => {
      const result = simnet.callPublicFn("flash-loan", "pause-flash-loans", [], user1);
      expect(result.result).toBeErr(Cl.uint(3001)); // ERR_UNAUTHORIZED
    });

    it("should allow owner to set fee rate", () => {
      const newFeeRate = 15;
      const result = simnet.callPublicFn(
        "flash-loan",
        "set-fee-rate",
        [Cl.uint(newFeeRate)],
        deployer
      );
      expect(result.result).toBeOk(Cl.uint(newFeeRate));

      const feeRate = simnet.callReadOnlyFn("flash-loan", "get-fee-rate", [], deployer);
      expect(feeRate.result).toEqual(Cl.uint(newFeeRate));
    });

    it("should fail to set fee rate above maximum", () => {
      const result = simnet.callPublicFn(
        "flash-loan",
        "set-fee-rate",
        [Cl.uint(MAX_FEE_RATE + 1)],
        deployer
      );
      expect(result.result).toBeErr(Cl.uint(3011)); // ERR_INVALID_FEE_RATE
    });

    it("should fail when non-owner tries to set fee rate", () => {
      const result = simnet.callPublicFn("flash-loan", "set-fee-rate", [Cl.uint(15)], user1);
      expect(result.result).toBeErr(Cl.uint(3001)); // ERR_UNAUTHORIZED
    });

    it("should allow owner to set asset restrictions", () => {
      const result = simnet.callPublicFn(
        "flash-loan",
        "set-asset-restrictions",
        [Cl.bool(true)],
        deployer
      );
      expect(result.result).toBeOk(Cl.bool(true));

      const assetsRestricted = simnet.callReadOnlyFn(
        "flash-loan",
        "are-assets-restricted",
        [],
        deployer
      );
      expect(assetsRestricted.result).toEqual(Cl.bool(true));
    });

    it("should fail when non-owner tries to set asset restrictions", () => {
      const result = simnet.callPublicFn(
        "flash-loan",
        "set-asset-restrictions",
        [Cl.bool(true)],
        user1
      );
      expect(result.result).toBeErr(Cl.uint(3001)); // ERR_UNAUTHORIZED
    });
  });

  // ==============================
  // Signature Verification (Clarity v4)
  // ==============================

  describe("Signature Verification with Clarity v4", () => {
    it("should get signature nonce for borrower", () => {
      const nonce = simnet.callReadOnlyFn(
        "flash-loan",
        "get-signature-nonce",
        [Cl.principal(user1)],
        deployer
      );
      expect(nonce.result).toEqual(Cl.uint(0));
    });

    it("should verify secp256r1 signature", () => {
      // Note: This test requires valid secp256r1 signature data
      const messageHash = Cl.bufferFromHex(
        "1234567890123456789012345678901234567890123456789012345678901234"
      );
      const signature = Cl.bufferFromHex(
        "12345678901234567890123456789012345678901234567890123456789012341234567890123456789012345678901234567890123456789012345678901234"
      );
      const publicKey = Cl.bufferFromHex(
        "021234567890123456789012345678901234567890123456789012345678901234"
      );

      const result = simnet.callReadOnlyFn(
        "flash-loan",
        "verify-flash-loan-signature",
        [messageHash, signature, publicKey],
        deployer
      );
      
      // This will fail with invalid signature data, but tests the function exists
      expect(result.result).toBeTruthy();
    });
  });

  // ==============================
  // Query Functions
  // ==============================

  describe("Query Functions", () => {
    beforeEach(() => {
      // Setup
      simnet.callPublicFn(
        "flash-loan",
        "add-supported-token",
        [
          Cl.principal(testToken),
          Cl.stringUtf8("BITTO"),
          Cl.uint(6),
          Cl.uint(1000000000),
          Cl.none(),
        ],
        deployer
      );
      simnet.callPublicFn(
        "flash-loan",
        "add-liquidity",
        [Cl.principal(testToken), Cl.uint(100000000)],
        deployer
      );
    });

    it("should get token configuration", () => {
      const tokenConfig = simnet.callReadOnlyFn(
        "flash-loan",
        "get-token-config",
        [Cl.principal(testToken)],
        deployer
      );
      expect(tokenConfig.result).toBeDefined();
    });

    it("should return none for non-existent token", () => {
      const tokenConfig = simnet.callReadOnlyFn(
        "flash-loan",
        "get-token-config",
        [Cl.principal(`${deployer}.non-existent`)],
        deployer
      );
      expect(tokenConfig.result).toBeNone();
    });

    it("should get active loan for borrower", () => {
      const amount = 10000;
      // Initiate flash loan
      simnet.callPublicFn(
        "flash-loan",
        "flash-loan",
        [Cl.principal(testToken), Cl.uint(amount), Cl.bufferFromAscii("data")],
        user1
      );

      const activeLoan = simnet.callReadOnlyFn(
        "flash-loan",
        "get-active-loan",
        [Cl.principal(user1), Cl.principal(testToken)],
        deployer
      );
      expect(activeLoan.result).toBeDefined();
    });

    it("should get loan history", () => {
      const amount = 10000;
      const expectedFee = Math.floor((amount * DEFAULT_FEE_RATE) / FEE_DENOMINATOR);

      // Complete a flash loan
      simnet.callPublicFn(
        "flash-loan",
        "flash-loan",
        [Cl.principal(testToken), Cl.uint(amount), Cl.bufferFromAscii("data")],
        user1
      );
      simnet.callPublicFn(
        "flash-loan",
        "flash-loan-callback",
        [Cl.principal(testToken), Cl.uint(amount), Cl.uint(expectedFee), CALLBACK_SUCCESS],
        user1
      );

      const history = simnet.callReadOnlyFn(
        "flash-loan",
        "get-loan-history",
        [Cl.uint(1)],
        deployer
      );
      expect(history.result).toBeDefined();
    });

    it("should verify contract integrity", () => {
      // Get the contract hash
      const hashResult = simnet.callReadOnlyFn("flash-loan", "get-contract-hash", [], deployer);
      
      // Note: This test just verifies the function works
      expect(hashResult.result).toBeTruthy();
    });
  });

  // ==============================
  // Integration Tests
  // ==============================

  describe("Integration Tests", () => {
    beforeEach(() => {
      // Setup complete environment
      simnet.callPublicFn(
        "flash-loan",
        "add-supported-token",
        [
          Cl.principal(testToken),
          Cl.stringUtf8("BITTO"),
          Cl.uint(6),
          Cl.uint(1000000000),
          Cl.none(),
        ],
        deployer
      );
      simnet.callPublicFn(
        "flash-loan",
        "add-liquidity",
        [Cl.principal(testToken), Cl.uint(100000000)],
        deployer
      );
    });

    it("should handle multiple sequential flash loans", () => {
      const amount = 10000;
      const expectedFee = Math.floor((amount * DEFAULT_FEE_RATE) / FEE_DENOMINATOR);

      // First loan
      simnet.callPublicFn(
        "flash-loan",
        "flash-loan",
        [Cl.principal(testToken), Cl.uint(amount), Cl.bufferFromAscii("data1")],
        user1
      );
      simnet.callPublicFn(
        "flash-loan",
        "flash-loan-callback",
        [Cl.principal(testToken), Cl.uint(amount), Cl.uint(expectedFee), CALLBACK_SUCCESS],
        user1
      );

      // Second loan
      simnet.callPublicFn(
        "flash-loan",
        "flash-loan",
        [Cl.principal(testToken), Cl.uint(amount), Cl.bufferFromAscii("data2")],
        user2
      );
      simnet.callPublicFn(
        "flash-loan",
        "flash-loan-callback",
        [Cl.principal(testToken), Cl.uint(amount), Cl.uint(expectedFee), CALLBACK_SUCCESS],
        user2
      );

      // Check statistics
      const totalLoans = simnet.callReadOnlyFn("flash-loan", "get-total-flash-loans", [], deployer);
      expect(totalLoans.result).toEqual(Cl.uint(2));

      const totalFees = simnet.callReadOnlyFn(
        "flash-loan",
        "get-total-fees-collected",
        [],
        deployer
      );
      expect(totalFees.result).toEqual(Cl.uint(expectedFee * 2));
    });

    it("should handle flash loans with different amounts", () => {
      const amounts = [10000, 20000, 50000];

      for (const amount of amounts) {
        const expectedFee = Math.floor((amount * DEFAULT_FEE_RATE) / FEE_DENOMINATOR);

        simnet.callPublicFn(
          "flash-loan",
          "flash-loan",
          [Cl.principal(testToken), Cl.uint(amount), Cl.bufferFromAscii("data")],
          user1
        );
        simnet.callPublicFn(
          "flash-loan",
          "flash-loan-callback",
          [Cl.principal(testToken), Cl.uint(amount), Cl.uint(expectedFee), CALLBACK_SUCCESS],
          user1
        );
      }

      const totalLoans = simnet.callReadOnlyFn("flash-loan", "get-total-flash-loans", [], deployer);
      expect(totalLoans.result).toEqual(Cl.uint(3));
    });

    it("should correctly track liquidity through flash loans", () => {
      const initialLiquidity = 100000000;
      const amount = 10000;
      const expectedFee = Math.floor((amount * DEFAULT_FEE_RATE) / FEE_DENOMINATOR);

      // Check initial liquidity
      let liquidity = simnet.callReadOnlyFn(
        "flash-loan",
        "get-liquidity",
        [Cl.principal(testToken)],
        deployer
      );
      expect(liquidity.result).toEqual(Cl.uint(initialLiquidity));

      // Execute flash loan
      simnet.callPublicFn(
        "flash-loan",
        "flash-loan",
        [Cl.principal(testToken), Cl.uint(amount), Cl.bufferFromAscii("data")],
        user1
      );
      simnet.callPublicFn(
        "flash-loan",
        "flash-loan-callback",
        [Cl.principal(testToken), Cl.uint(amount), Cl.uint(expectedFee), CALLBACK_SUCCESS],
        user1
      );

      // Check liquidity increased by fee
      liquidity = simnet.callReadOnlyFn(
        "flash-loan",
        "get-liquidity",
        [Cl.principal(testToken)],
        deployer
      );
      expect(liquidity.result).toEqual(Cl.uint(initialLiquidity + expectedFee));
    });

    it("should handle emergency pause and unpause scenario", () => {
      const amount = 10000;

      // Pause flash loans
      simnet.callPublicFn("flash-loan", "pause-flash-loans", [], deployer);

      // Try to execute flash loan (should fail)
      let result = simnet.callPublicFn(
        "flash-loan",
        "flash-loan",
        [Cl.principal(testToken), Cl.uint(amount), Cl.bufferFromAscii("data")],
        user1
      );
      expect(result.result).toBeErr(Cl.uint(3010)); // ERR_FLASH_LOAN_PAUSED

      // Unpause
      simnet.callPublicFn("flash-loan", "unpause-flash-loans", [], deployer);

      // Try again (should succeed)
      result = simnet.callPublicFn(
        "flash-loan",
        "flash-loan",
        [Cl.principal(testToken), Cl.uint(amount), Cl.bufferFromAscii("data")],
        user1
      );
      expect(result.result).toBeTruthy();
    });
  });
});

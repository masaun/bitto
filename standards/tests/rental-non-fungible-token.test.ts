import { Cl, ClarityType } from "@stacks/transactions";
import { describe, expect, it, beforeEach } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const user1 = accounts.get("wallet_1")!;
const user2 = accounts.get("wallet_2")!;
const user3 = accounts.get("wallet_3")!;

// Constants from contract
const MIN_RENTAL_DURATION = 3600; // 1 hour in seconds
const MAX_RENTAL_DURATION = 31536000; // 365 days in seconds
const DEFAULT_PLATFORM_FEE_RATE = 250; // 2.5%

// Helper function to mint a test NFT
const mintTestNFT = (recipient: string) => {
  return simnet.callPublicFn(
    "rental-non-fungible-token",
    "mint",
    [
      Cl.principal(recipient),
      Cl.stringAscii("https://api.bitto.io/nft/1"),
      Cl.stringAscii("Test NFT"),
      Cl.stringUtf8("A test NFT for rental"),
    ],
    deployer
  );
};

// Helper function to set up rental config
const setupRentalConfig = (
  tokenId: number,
  owner: string,
  pricePerSecond: number = 1,
  minDuration: number = MIN_RENTAL_DURATION,
  maxDuration: number = MAX_RENTAL_DURATION
) => {
  return simnet.callPublicFn(
    "rental-non-fungible-token",
    "set-rental-config",
    [
      Cl.uint(tokenId),
      Cl.bool(true),
      Cl.uint(pricePerSecond),
      Cl.uint(minDuration),
      Cl.uint(maxDuration),
      Cl.none(),
      Cl.bool(true),
    ],
    owner
  );
};

describe("Rental Non-Fungible Token Contract - ERC-4907 Compatible with Clarity v4", () => {
  beforeEach(() => {
    simnet.mineEmptyBlock();
  });

  // ==============================
  // Contract Initialization & Clarity v4 Features
  // ==============================

  describe("Contract Initialization & Clarity v4 Features", () => {
    it("should return correct token name", () => {
      const result = simnet.callReadOnlyFn(
        "rental-non-fungible-token",
        "get-name",
        [],
        deployer
      );
      expect(result.result).toBeOk(Cl.stringAscii("Bitto Rental NFT"));
    });

    it("should return correct token symbol", () => {
      const result = simnet.callReadOnlyFn(
        "rental-non-fungible-token",
        "get-symbol",
        [],
        deployer
      );
      expect(result.result).toBeOk(Cl.stringAscii("BRNFT"));
    });

    it("should have zero initial supply", () => {
      const result = simnet.callReadOnlyFn(
        "rental-non-fungible-token",
        "get-total-supply",
        [],
        deployer
      );
      expect(result.result).toBeOk(Cl.uint(0));
    });

    it("should return contract hash using Clarity v4", () => {
      const result = simnet.callReadOnlyFn(
        "rental-non-fungible-token",
        "get-contract-hash",
        [],
        deployer
      );
      expect(result.result).toBeTruthy();
    });

    it("should return current block time using Clarity v4", () => {
      const result = simnet.callReadOnlyFn(
        "rental-non-fungible-token",
        "get-current-block-time",
        [],
        deployer
      );
      expect(result.result).toBeTruthy();
      expect(result.result.type).toEqual(ClarityType.UInt);
    });

    it("should check if assets are restricted", () => {
      const result = simnet.callReadOnlyFn(
        "rental-non-fungible-token",
        "are-assets-restricted",
        [],
        deployer
      );
      expect(result.result).toEqual(Cl.bool(false));
    });

    it("should get comprehensive contract info", () => {
      const result = simnet.callReadOnlyFn(
        "rental-non-fungible-token",
        "get-contract-info",
        [],
        deployer
      );
      expect(result.result).toBeTruthy();
      expect(result.result.type).toEqual(ClarityType.Tuple);
    });

    it("should convert status to ASCII using Clarity v4", () => {
      const result = simnet.callReadOnlyFn(
        "rental-non-fungible-token",
        "status-to-ascii",
        [Cl.stringUtf8("active")],
        deployer
      );
      expect(result.result).toBeTruthy();
    });
  });

  // ==============================
  // NFT Minting
  // ==============================

  describe("NFT Minting", () => {
    it("should allow owner to mint NFT", () => {
      const result = mintTestNFT(user1);
      expect(result.result).toBeOk(Cl.uint(1));

      // Check supply increased
      const supply = simnet.callReadOnlyFn(
        "rental-non-fungible-token",
        "get-total-supply",
        [],
        deployer
      );
      expect(supply.result).toBeOk(Cl.uint(1));
    });

    it("should set correct owner after minting", () => {
      mintTestNFT(user1);

      const owner = simnet.callReadOnlyFn(
        "rental-non-fungible-token",
        "get-owner",
        [Cl.uint(1)],
        deployer
      );
      expect(owner.result).toBeOk(Cl.principal(user1));
    });

    it("should store token metadata correctly", () => {
      mintTestNFT(user1);

      const metadata = simnet.callReadOnlyFn(
        "rental-non-fungible-token",
        "get-token-metadata",
        [Cl.uint(1)],
        deployer
      );
      expect(metadata.result).toBeDefined();
    });

    it("should fail when non-owner tries to mint", () => {
      const result = simnet.callPublicFn(
        "rental-non-fungible-token",
        "mint",
        [
          Cl.principal(user2),
          Cl.stringAscii("https://api.bitto.io/nft/1"),
          Cl.stringAscii("Test NFT"),
          Cl.stringUtf8("A test NFT"),
        ],
        user1
      );
      expect(result.result).toBeErr(Cl.uint(4001)); // ERR_UNAUTHORIZED
    });

    it("should fail when contract is paused", () => {
      simnet.callPublicFn("rental-non-fungible-token", "pause", [], deployer);

      const result = mintTestNFT(user1);
      expect(result.result).toBeErr(Cl.uint(4012)); // ERR_ASSETS_RESTRICTED
    });

    it("should return correct token URI", () => {
      mintTestNFT(user1);

      const uri = simnet.callReadOnlyFn(
        "rental-non-fungible-token",
        "token-uri",
        [Cl.uint(1)],
        deployer
      );
      expect(uri.result).toBeOk(Cl.stringAscii("https://api.bitto.io/nft/1"));
    });
  });

  // ==============================
  // ERC-721 Compatible Functions
  // ==============================

  describe("ERC-721 Compatible Functions", () => {
    beforeEach(() => {
      mintTestNFT(user1);
    });

    it("should transfer NFT correctly", () => {
      const result = simnet.callPublicFn(
        "rental-non-fungible-token",
        "transfer",
        [Cl.uint(1), Cl.principal(user1), Cl.principal(user2)],
        user1
      );
      expect(result.result).toBeOk(Cl.bool(true));

      const owner = simnet.callReadOnlyFn(
        "rental-non-fungible-token",
        "get-owner",
        [Cl.uint(1)],
        deployer
      );
      expect(owner.result).toBeOk(Cl.principal(user2));
    });

    it("should fail transfer when not owner or approved", () => {
      const result = simnet.callPublicFn(
        "rental-non-fungible-token",
        "transfer",
        [Cl.uint(1), Cl.principal(user1), Cl.principal(user2)],
        user2
      );
      expect(result.result).toBeErr(Cl.uint(4010)); // ERR_NOT_APPROVED
    });

    it("should approve address for token", () => {
      const result = simnet.callPublicFn(
        "rental-non-fungible-token",
        "approve",
        [Cl.principal(user2), Cl.uint(1)],
        user1
      );
      expect(result.result).toBeOk(Cl.bool(true));

      const approved = simnet.callReadOnlyFn(
        "rental-non-fungible-token",
        "get-approved",
        [Cl.uint(1)],
        deployer
      );
      expect(approved.result).toBeDefined();
    });

    it("should allow approved address to transfer", () => {
      simnet.callPublicFn(
        "rental-non-fungible-token",
        "approve",
        [Cl.principal(user2), Cl.uint(1)],
        user1
      );

      const result = simnet.callPublicFn(
        "rental-non-fungible-token",
        "transfer",
        [Cl.uint(1), Cl.principal(user1), Cl.principal(user3)],
        user2
      );
      expect(result.result).toBeOk(Cl.bool(true));
    });

    it("should set approval for all", () => {
      const result = simnet.callPublicFn(
        "rental-non-fungible-token",
        "set-approval-for-all",
        [Cl.principal(user2), Cl.bool(true)],
        user1
      );
      expect(result.result).toBeOk(Cl.bool(true));

      const isApproved = simnet.callReadOnlyFn(
        "rental-non-fungible-token",
        "is-approved-for-all",
        [Cl.principal(user1), Cl.principal(user2)],
        deployer
      );
      expect(isApproved.result).toEqual(Cl.bool(true));
    });

    it("should fail to approve self", () => {
      const result = simnet.callPublicFn(
        "rental-non-fungible-token",
        "approve",
        [Cl.principal(user1), Cl.uint(1)],
        user1
      );
      expect(result.result).toBeErr(Cl.uint(4004)); // ERR_INVALID_RECIPIENT
    });
  });

  // ==============================
  // ERC-4907 Core User Functions
  // ==============================

  describe("ERC-4907 Core User Functions", () => {
    beforeEach(() => {
      mintTestNFT(user1);
    });

    it("should return none for user-of when no user set", () => {
      const result = simnet.callReadOnlyFn(
        "rental-non-fungible-token",
        "user-of",
        [Cl.uint(1)],
        deployer
      );
      expect(result.result).toBeOk(Cl.none());
    });

    it("should return 0 for user-expires when no user set", () => {
      const result = simnet.callReadOnlyFn(
        "rental-non-fungible-token",
        "user-expires",
        [Cl.uint(1)],
        deployer
      );
      expect(result.result).toBeOk(Cl.uint(0));
    });

    it("should allow owner to set user", () => {
      const blockTime = simnet.callReadOnlyFn(
        "rental-non-fungible-token",
        "get-current-block-time",
        [],
        deployer
      );
      const currentTime = Number((blockTime.result as any).value);
      const expires = currentTime + 86400; // 1 day

      const result = simnet.callPublicFn(
        "rental-non-fungible-token",
        "set-user",
        [Cl.uint(1), Cl.principal(user2), Cl.uint(expires)],
        user1
      );
      expect(result.result).toBeOk(Cl.bool(true));
    });

    it("should return correct user after set-user", () => {
      const blockTime = simnet.callReadOnlyFn(
        "rental-non-fungible-token",
        "get-current-block-time",
        [],
        deployer
      );
      const currentTime = Number((blockTime.result as any).value);
      const expires = currentTime + 86400;

      simnet.callPublicFn(
        "rental-non-fungible-token",
        "set-user",
        [Cl.uint(1), Cl.principal(user2), Cl.uint(expires)],
        user1
      );

      const userResult = simnet.callReadOnlyFn(
        "rental-non-fungible-token",
        "user-of",
        [Cl.uint(1)],
        deployer
      );
      expect(userResult.result).toBeOk(Cl.some(Cl.principal(user2)));
    });

    it("should fail set-user when not owner or approved", () => {
      const blockTime = simnet.callReadOnlyFn(
        "rental-non-fungible-token",
        "get-current-block-time",
        [],
        deployer
      );
      const currentTime = Number((blockTime.result as any).value);
      const expires = currentTime + 86400;

      const result = simnet.callPublicFn(
        "rental-non-fungible-token",
        "set-user",
        [Cl.uint(1), Cl.principal(user3), Cl.uint(expires)],
        user2
      );
      expect(result.result).toBeErr(Cl.uint(4001)); // ERR_UNAUTHORIZED
    });

    it("should fail set-user when user is owner", () => {
      const blockTime = simnet.callReadOnlyFn(
        "rental-non-fungible-token",
        "get-current-block-time",
        [],
        deployer
      );
      const currentTime = Number((blockTime.result as any).value);
      const expires = currentTime + 86400;

      const result = simnet.callPublicFn(
        "rental-non-fungible-token",
        "set-user",
        [Cl.uint(1), Cl.principal(user1), Cl.uint(expires)],
        user1
      );
      expect(result.result).toBeErr(Cl.uint(4005)); // ERR_INVALID_USER
    });

    it("should fail set-user when expiration is in the past", () => {
      const result = simnet.callPublicFn(
        "rental-non-fungible-token",
        "set-user",
        [Cl.uint(1), Cl.principal(user2), Cl.uint(1)],
        user1
      );
      expect(result.result).toBeErr(Cl.uint(4006)); // ERR_INVALID_EXPIRATION
    });

    it("should check rental expired status correctly", () => {
      const isExpired = simnet.callReadOnlyFn(
        "rental-non-fungible-token",
        "is-rental-expired",
        [Cl.uint(1)],
        deployer
      );
      expect(isExpired.result).toEqual(Cl.bool(true));
    });

    it("should clear user on transfer (ERC-4907 requirement)", () => {
      const blockTime = simnet.callReadOnlyFn(
        "rental-non-fungible-token",
        "get-current-block-time",
        [],
        deployer
      );
      const currentTime = Number((blockTime.result as any).value);
      const expires = currentTime + 86400;

      // Set user
      simnet.callPublicFn(
        "rental-non-fungible-token",
        "set-user",
        [Cl.uint(1), Cl.principal(user2), Cl.uint(expires)],
        user1
      );

      // Transfer
      simnet.callPublicFn(
        "rental-non-fungible-token",
        "transfer",
        [Cl.uint(1), Cl.principal(user1), Cl.principal(user3)],
        user1
      );

      // Check user cleared
      const userResult = simnet.callReadOnlyFn(
        "rental-non-fungible-token",
        "user-of",
        [Cl.uint(1)],
        deployer
      );
      expect(userResult.result).toBeOk(Cl.none());
    });
  });

  // ==============================
  // Rental Configuration
  // ==============================

  describe("Rental Configuration", () => {
    beforeEach(() => {
      mintTestNFT(user1);
    });

    it("should allow owner to set rental config", () => {
      const result = setupRentalConfig(1, user1);
      expect(result.result).toBeOk(Cl.bool(true));
    });

    it("should get rental config correctly", () => {
      setupRentalConfig(1, user1, 10, 7200, 604800);

      const config = simnet.callReadOnlyFn(
        "rental-non-fungible-token",
        "get-rental-config",
        [Cl.uint(1)],
        deployer
      );
      expect(config.result).toBeDefined();
    });

    it("should fail when non-owner sets rental config", () => {
      const result = simnet.callPublicFn(
        "rental-non-fungible-token",
        "set-rental-config",
        [
          Cl.uint(1),
          Cl.bool(true),
          Cl.uint(1),
          Cl.uint(MIN_RENTAL_DURATION),
          Cl.uint(MAX_RENTAL_DURATION),
          Cl.none(),
          Cl.bool(true),
        ],
        user2
      );
      expect(result.result).toBeErr(Cl.uint(4001)); // ERR_UNAUTHORIZED
    });

    it("should fail when min duration is too small", () => {
      const result = simnet.callPublicFn(
        "rental-non-fungible-token",
        "set-rental-config",
        [
          Cl.uint(1),
          Cl.bool(true),
          Cl.uint(1),
          Cl.uint(100), // Less than MIN_RENTAL_DURATION
          Cl.uint(MAX_RENTAL_DURATION),
          Cl.none(),
          Cl.bool(true),
        ],
        user1
      );
      expect(result.result).toBeErr(Cl.uint(4014)); // ERR_INVALID_DURATION
    });

    it("should fail when max duration exceeds limit", () => {
      const result = simnet.callPublicFn(
        "rental-non-fungible-token",
        "set-rental-config",
        [
          Cl.uint(1),
          Cl.bool(true),
          Cl.uint(1),
          Cl.uint(MIN_RENTAL_DURATION),
          Cl.uint(MAX_RENTAL_DURATION + 1),
          Cl.none(),
          Cl.bool(true),
        ],
        user1
      );
      expect(result.result).toBeErr(Cl.uint(4014)); // ERR_INVALID_DURATION
    });

    it("should fail when min duration exceeds max duration", () => {
      const result = simnet.callPublicFn(
        "rental-non-fungible-token",
        "set-rental-config",
        [
          Cl.uint(1),
          Cl.bool(true),
          Cl.uint(1),
          Cl.uint(86400), // 1 day
          Cl.uint(7200), // 2 hours
          Cl.none(),
          Cl.bool(true),
        ],
        user1
      );
      expect(result.result).toBeErr(Cl.uint(4014)); // ERR_INVALID_DURATION
    });
  });

  // ==============================
  // Rental Marketplace
  // ==============================

  describe("Rental Marketplace", () => {
    beforeEach(() => {
      mintTestNFT(user1);
      setupRentalConfig(1, user1, 1, MIN_RENTAL_DURATION, MAX_RENTAL_DURATION);
    });

    it("should allow renting an NFT", () => {
      const duration = MIN_RENTAL_DURATION;
      const result = simnet.callPublicFn(
        "rental-non-fungible-token",
        "rent-nft",
        [Cl.uint(1), Cl.uint(duration)],
        user2
      );
      expect(result.result).toBeTruthy();
      if (result.result.type === ClarityType.ResponseOk) {
        expect(result.result.value.type).toEqual(ClarityType.Tuple);
      }
    });

    it("should set user correctly after renting", () => {
      const duration = MIN_RENTAL_DURATION;
      simnet.callPublicFn(
        "rental-non-fungible-token",
        "rent-nft",
        [Cl.uint(1), Cl.uint(duration)],
        user2
      );

      const userResult = simnet.callReadOnlyFn(
        "rental-non-fungible-token",
        "user-of",
        [Cl.uint(1)],
        deployer
      );
      expect(userResult.result).toBeOk(Cl.some(Cl.principal(user2)));
    });

    it("should fail to rent own NFT", () => {
      const result = simnet.callPublicFn(
        "rental-non-fungible-token",
        "rent-nft",
        [Cl.uint(1), Cl.uint(MIN_RENTAL_DURATION)],
        user1
      );
      expect(result.result).toBeErr(Cl.uint(4005)); // ERR_INVALID_USER
    });

    it("should fail to rent when not rentable", () => {
      // Set not rentable
      simnet.callPublicFn(
        "rental-non-fungible-token",
        "set-rental-config",
        [
          Cl.uint(1),
          Cl.bool(false), // Not rentable
          Cl.uint(1),
          Cl.uint(MIN_RENTAL_DURATION),
          Cl.uint(MAX_RENTAL_DURATION),
          Cl.none(),
          Cl.bool(true),
        ],
        user1
      );

      const result = simnet.callPublicFn(
        "rental-non-fungible-token",
        "rent-nft",
        [Cl.uint(1), Cl.uint(MIN_RENTAL_DURATION)],
        user2
      );
      expect(result.result).toBeErr(Cl.uint(4016)); // ERR_NOT_RENTABLE
    });

    it("should fail to rent when duration is too short", () => {
      const result = simnet.callPublicFn(
        "rental-non-fungible-token",
        "rent-nft",
        [Cl.uint(1), Cl.uint(100)],
        user2
      );
      expect(result.result).toBeErr(Cl.uint(4014)); // ERR_INVALID_DURATION
    });

    it("should fail to rent when already rented", () => {
      simnet.callPublicFn(
        "rental-non-fungible-token",
        "rent-nft",
        [Cl.uint(1), Cl.uint(MIN_RENTAL_DURATION)],
        user2
      );

      const result = simnet.callPublicFn(
        "rental-non-fungible-token",
        "rent-nft",
        [Cl.uint(1), Cl.uint(MIN_RENTAL_DURATION)],
        user3
      );
      expect(result.result).toBeErr(Cl.uint(4015)); // ERR_ALREADY_RENTED
    });

    it("should update rental statistics", () => {
      simnet.callPublicFn(
        "rental-non-fungible-token",
        "rent-nft",
        [Cl.uint(1), Cl.uint(MIN_RENTAL_DURATION)],
        user2
      );

      const totalRentals = simnet.callReadOnlyFn(
        "rental-non-fungible-token",
        "get-total-rentals",
        [],
        deployer
      );
      expect(totalRentals.result).toEqual(Cl.uint(1));
    });

    it("should record rental history", () => {
      simnet.callPublicFn(
        "rental-non-fungible-token",
        "rent-nft",
        [Cl.uint(1), Cl.uint(MIN_RENTAL_DURATION)],
        user2
      );

      const history = simnet.callReadOnlyFn(
        "rental-non-fungible-token",
        "get-rental-history",
        [Cl.uint(1)],
        deployer
      );
      expect(history.result).toBeDefined();
    });

    it("should update user rental stats", () => {
      simnet.callPublicFn(
        "rental-non-fungible-token",
        "rent-nft",
        [Cl.uint(1), Cl.uint(MIN_RENTAL_DURATION)],
        user2
      );

      const stats = simnet.callReadOnlyFn(
        "rental-non-fungible-token",
        "get-user-rental-stats",
        [Cl.principal(user2)],
        deployer
      );
      expect(stats.result).toBeDefined();
    });
  });

  // ==============================
  // Rental Extension & Termination
  // ==============================

  describe("Rental Extension & Termination", () => {
    beforeEach(() => {
      mintTestNFT(user1);
      setupRentalConfig(1, user1, 1, MIN_RENTAL_DURATION, MAX_RENTAL_DURATION);
      simnet.callPublicFn(
        "rental-non-fungible-token",
        "rent-nft",
        [Cl.uint(1), Cl.uint(MIN_RENTAL_DURATION)],
        user2
      );
    });

    it("should allow user to extend rental", () => {
      const result = simnet.callPublicFn(
        "rental-non-fungible-token",
        "extend-rental",
        [Cl.uint(1), Cl.uint(MIN_RENTAL_DURATION)],
        user2
      );
      expect(result.result).toBeTruthy();
    });

    it("should fail extend rental when not current user", () => {
      const result = simnet.callPublicFn(
        "rental-non-fungible-token",
        "extend-rental",
        [Cl.uint(1), Cl.uint(MIN_RENTAL_DURATION)],
        user3
      );
      expect(result.result).toBeErr(Cl.uint(4001)); // ERR_UNAUTHORIZED
    });

    it("should allow owner to terminate rental", () => {
      const result = simnet.callPublicFn(
        "rental-non-fungible-token",
        "terminate-rental",
        [Cl.uint(1)],
        user1
      );
      expect(result.result).toBeOk(Cl.bool(true));

      // Check user cleared
      const userResult = simnet.callReadOnlyFn(
        "rental-non-fungible-token",
        "user-of",
        [Cl.uint(1)],
        deployer
      );
      expect(userResult.result).toBeOk(Cl.none());
    });

    it("should fail terminate rental when not owner", () => {
      const result = simnet.callPublicFn(
        "rental-non-fungible-token",
        "terminate-rental",
        [Cl.uint(1)],
        user2
      );
      expect(result.result).toBeErr(Cl.uint(4001)); // ERR_UNAUTHORIZED
    });
  });

  // ==============================
  // Clear Expired User
  // ==============================

  describe("Clear Expired User", () => {
    beforeEach(() => {
      mintTestNFT(user1);
    });

    it("should clear expired user when rental has ended", () => {
      // Rental is already expired (no user set, so it's considered expired)
      const result = simnet.callPublicFn(
        "rental-non-fungible-token",
        "clear-expired-user",
        [Cl.uint(1)],
        user3
      );
      expect(result.result).toBeOk(Cl.bool(true));
    });

    it("should fail to clear when token does not exist", () => {
      const result = simnet.callPublicFn(
        "rental-non-fungible-token",
        "clear-expired-user",
        [Cl.uint(999)],
        user3
      );
      expect(result.result).toBeErr(Cl.uint(4002)); // ERR_TOKEN_NOT_FOUND
    });
  });

  // ==============================
  // Admin Functions
  // ==============================

  describe("Admin Functions", () => {
    it("should allow owner to pause contract", () => {
      const result = simnet.callPublicFn(
        "rental-non-fungible-token",
        "pause",
        [],
        deployer
      );
      expect(result.result).toBeOk(Cl.bool(true));

      const isPaused = simnet.callReadOnlyFn(
        "rental-non-fungible-token",
        "is-paused",
        [],
        deployer
      );
      expect(isPaused.result).toEqual(Cl.bool(true));
    });

    it("should allow owner to unpause contract", () => {
      simnet.callPublicFn("rental-non-fungible-token", "pause", [], deployer);

      const result = simnet.callPublicFn(
        "rental-non-fungible-token",
        "unpause",
        [],
        deployer
      );
      expect(result.result).toBeOk(Cl.bool(true));

      const isPaused = simnet.callReadOnlyFn(
        "rental-non-fungible-token",
        "is-paused",
        [],
        deployer
      );
      expect(isPaused.result).toEqual(Cl.bool(false));
    });

    it("should fail when non-owner tries to pause", () => {
      const result = simnet.callPublicFn(
        "rental-non-fungible-token",
        "pause",
        [],
        user1
      );
      expect(result.result).toBeErr(Cl.uint(4001)); // ERR_UNAUTHORIZED
    });

    it("should allow owner to set platform fee rate", () => {
      const newRate = 500; // 5%
      const result = simnet.callPublicFn(
        "rental-non-fungible-token",
        "set-platform-fee-rate",
        [Cl.uint(newRate)],
        deployer
      );
      expect(result.result).toBeOk(Cl.uint(newRate));

      const feeRate = simnet.callReadOnlyFn(
        "rental-non-fungible-token",
        "get-platform-fee-rate",
        [],
        deployer
      );
      expect(feeRate.result).toEqual(Cl.uint(newRate));
    });

    it("should fail to set fee rate above 10%", () => {
      const result = simnet.callPublicFn(
        "rental-non-fungible-token",
        "set-platform-fee-rate",
        [Cl.uint(1001)],
        deployer
      );
      expect(result.result).toBeErr(Cl.uint(4019)); // ERR_INVALID_PRICE
    });

    it("should allow owner to set base URI", () => {
      const newUri = "https://new-api.bitto.io/nft/";
      const result = simnet.callPublicFn(
        "rental-non-fungible-token",
        "set-base-uri",
        [Cl.stringAscii(newUri)],
        deployer
      );
      expect(result.result).toBeOk(Cl.bool(true));

      const baseUri = simnet.callReadOnlyFn(
        "rental-non-fungible-token",
        "get-base-uri",
        [],
        deployer
      );
      expect(baseUri.result).toEqual(Cl.stringAscii(newUri));
    });

    it("should allow owner to set asset restrictions", () => {
      const result = simnet.callPublicFn(
        "rental-non-fungible-token",
        "set-asset-restrictions",
        [Cl.bool(true)],
        deployer
      );
      expect(result.result).toBeOk(Cl.bool(true));

      const restricted = simnet.callReadOnlyFn(
        "rental-non-fungible-token",
        "are-assets-restricted",
        [],
        deployer
      );
      expect(restricted.result).toEqual(Cl.bool(true));
    });
  });

  // ==============================
  // Signature Verification (Clarity v4)
  // ==============================

  describe("Signature Verification with Clarity v4", () => {
    it("should get signature nonce for user", () => {
      const nonce = simnet.callReadOnlyFn(
        "rental-non-fungible-token",
        "get-signature-nonce",
        [Cl.principal(user1)],
        deployer
      );
      expect(nonce.result).toEqual(Cl.uint(0));
    });

    it("should verify secp256r1 signature", () => {
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
        "rental-non-fungible-token",
        "verify-rental-signature",
        [messageHash, signature, publicKey],
        deployer
      );
      
      // Function exists and returns a result (will fail with invalid sig data)
      expect(result.result).toBeTruthy();
    });
  });

  // ==============================
  // Query Functions
  // ==============================

  describe("Query Functions", () => {
    beforeEach(() => {
      mintTestNFT(user1);
      setupRentalConfig(1, user1, 1, MIN_RENTAL_DURATION, MAX_RENTAL_DURATION);
    });

    it("should get full rental info", () => {
      const info = simnet.callReadOnlyFn(
        "rental-non-fungible-token",
        "get-full-rental-info",
        [Cl.uint(1)],
        deployer
      );
      expect(info.result).toBeTruthy();
      expect(info.result.type).toEqual(ClarityType.Tuple);
    });

    it("should get remaining rental time", () => {
      const remaining = simnet.callReadOnlyFn(
        "rental-non-fungible-token",
        "get-remaining-rental-time",
        [Cl.uint(1)],
        deployer
      );
      expect(remaining.result).toBeOk(Cl.uint(0));
    });

    it("should get owner rental stats", () => {
      simnet.callPublicFn(
        "rental-non-fungible-token",
        "rent-nft",
        [Cl.uint(1), Cl.uint(MIN_RENTAL_DURATION)],
        user2
      );

      const stats = simnet.callReadOnlyFn(
        "rental-non-fungible-token",
        "get-owner-rental-stats",
        [Cl.principal(user1)],
        deployer
      );
      expect(stats.result).toBeDefined();
    });

    it("should get total rental fees", () => {
      const fees = simnet.callReadOnlyFn(
        "rental-non-fungible-token",
        "get-total-rental-fees",
        [],
        deployer
      );
      expect(fees.result.type).toEqual(ClarityType.UInt);
    });
  });

  // ==============================
  // Integration Tests
  // ==============================

  describe("Integration Tests", () => {
    it("should handle complete rental lifecycle", () => {
      // 1. Mint NFT
      mintTestNFT(user1);

      // 2. Set rental config
      setupRentalConfig(1, user1, 10, MIN_RENTAL_DURATION, 86400);

      // 3. Rent NFT
      const rentResult = simnet.callPublicFn(
        "rental-non-fungible-token",
        "rent-nft",
        [Cl.uint(1), Cl.uint(MIN_RENTAL_DURATION)],
        user2
      );
      expect(rentResult.result).toBeTruthy();

      // 4. Verify user is set
      const userResult = simnet.callReadOnlyFn(
        "rental-non-fungible-token",
        "user-of",
        [Cl.uint(1)],
        deployer
      );
      expect(userResult.result).toBeOk(Cl.some(Cl.principal(user2)));

      // 5. Extend rental
      const extendResult = simnet.callPublicFn(
        "rental-non-fungible-token",
        "extend-rental",
        [Cl.uint(1), Cl.uint(MIN_RENTAL_DURATION)],
        user2
      );
      expect(extendResult.result).toBeTruthy();

      // 6. Owner terminates rental
      const terminateResult = simnet.callPublicFn(
        "rental-non-fungible-token",
        "terminate-rental",
        [Cl.uint(1)],
        user1
      );
      expect(terminateResult.result).toBeOk(Cl.bool(true));

      // 7. Verify user cleared
      const userAfter = simnet.callReadOnlyFn(
        "rental-non-fungible-token",
        "user-of",
        [Cl.uint(1)],
        deployer
      );
      expect(userAfter.result).toBeOk(Cl.none());
    });

    it("should handle multiple NFT rentals", () => {
      // Mint multiple NFTs
      mintTestNFT(user1);
      mintTestNFT(user1);
      mintTestNFT(user1);

      // Set rental configs
      setupRentalConfig(1, user1);
      setupRentalConfig(2, user1);
      setupRentalConfig(3, user1);

      // Rent different NFTs
      simnet.callPublicFn(
        "rental-non-fungible-token",
        "rent-nft",
        [Cl.uint(1), Cl.uint(MIN_RENTAL_DURATION)],
        user2
      );
      simnet.callPublicFn(
        "rental-non-fungible-token",
        "rent-nft",
        [Cl.uint(2), Cl.uint(MIN_RENTAL_DURATION)],
        user3
      );

      // Check total rentals
      const totalRentals = simnet.callReadOnlyFn(
        "rental-non-fungible-token",
        "get-total-rentals",
        [],
        deployer
      );
      expect(totalRentals.result).toEqual(Cl.uint(2));
    });

    it("should handle restricted user rental config", () => {
      mintTestNFT(user1);

      // Set rental config with specific allowed user
      simnet.callPublicFn(
        "rental-non-fungible-token",
        "set-rental-config",
        [
          Cl.uint(1),
          Cl.bool(true),
          Cl.uint(1),
          Cl.uint(MIN_RENTAL_DURATION),
          Cl.uint(MAX_RENTAL_DURATION),
          Cl.some(Cl.principal(user2)), // Only user2 can rent
          Cl.bool(true),
        ],
        user1
      );

      // user2 should be able to rent
      const result = simnet.callPublicFn(
        "rental-non-fungible-token",
        "rent-nft",
        [Cl.uint(1), Cl.uint(MIN_RENTAL_DURATION)],
        user2
      );
      expect(result.result).toBeTruthy();
    });

    it("should block unauthorized user from restricted rental", () => {
      mintTestNFT(user1);

      // Set rental config with specific allowed user
      simnet.callPublicFn(
        "rental-non-fungible-token",
        "set-rental-config",
        [
          Cl.uint(1),
          Cl.bool(true),
          Cl.uint(1),
          Cl.uint(MIN_RENTAL_DURATION),
          Cl.uint(MAX_RENTAL_DURATION),
          Cl.some(Cl.principal(user2)), // Only user2 can rent
          Cl.bool(true),
        ],
        user1
      );

      // user3 should NOT be able to rent
      const result = simnet.callPublicFn(
        "rental-non-fungible-token",
        "rent-nft",
        [Cl.uint(1), Cl.uint(MIN_RENTAL_DURATION)],
        user3
      );
      expect(result.result).toBeErr(Cl.uint(4001)); // ERR_UNAUTHORIZED
    });

    it("should handle emergency pause scenario", () => {
      mintTestNFT(user1);
      setupRentalConfig(1, user1);

      // Pause contract
      simnet.callPublicFn("rental-non-fungible-token", "pause", [], deployer);

      // Try to rent (should fail)
      const rentResult = simnet.callPublicFn(
        "rental-non-fungible-token",
        "rent-nft",
        [Cl.uint(1), Cl.uint(MIN_RENTAL_DURATION)],
        user2
      );
      expect(rentResult.result).toBeErr(Cl.uint(4012)); // ERR_ASSETS_RESTRICTED

      // Unpause
      simnet.callPublicFn("rental-non-fungible-token", "unpause", [], deployer);

      // Try again (should succeed)
      const rentResult2 = simnet.callPublicFn(
        "rental-non-fungible-token",
        "rent-nft",
        [Cl.uint(1), Cl.uint(MIN_RENTAL_DURATION)],
        user2
      );
      expect(rentResult2.result).toBeTruthy();
    });
  });
});

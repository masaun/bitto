import { Cl, ClarityType } from "@stacks/transactions";
import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const alice = accounts.get("wallet_1")!;
const bob = accounts.get("wallet_2")!;
const charlie = accounts.get("wallet_3")!;

describe("ai-generated-token", () => {
  describe("mint", () => {
    it("allows minting a new AI token", () => {
      const prompt = Cl.buffer(Uint8Array.from([1, 2, 3]));
      const { result } = simnet.callPublicFn(
        "ai-generated-token",
        "mint",
        [Cl.standardPrincipal(alice), prompt],
        alice
      );
      expect(result).toBeOk(Cl.uint(1));
    });

    it("increments token IDs for each mint", () => {
      const prompt1 = Cl.buffer(Uint8Array.from([1, 2, 3]));
      const prompt2 = Cl.buffer(Uint8Array.from([4, 5, 6]));
      
      simnet.callPublicFn("ai-generated-token", "mint", [Cl.standardPrincipal(alice), prompt1], alice);
      const { result } = simnet.callPublicFn("ai-generated-token", "mint", [Cl.standardPrincipal(alice), prompt2], alice);
      expect(result).toBeOk(Cl.uint(2));
    });
  });

  describe("transfer", () => {
    it("allows owner to transfer token", () => {
      const prompt = Cl.buffer(Uint8Array.from([1, 2, 3]));
      simnet.callPublicFn("ai-generated-token", "mint", [Cl.standardPrincipal(alice), prompt], alice);
      
      const { result } = simnet.callPublicFn(
        "ai-generated-token",
        "transfer",
        [Cl.uint(1), Cl.standardPrincipal(alice), Cl.standardPrincipal(bob)],
        alice
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it("prevents non-owner from transferring", () => {
      const prompt = Cl.buffer(Uint8Array.from([1, 2, 3]));
      simnet.callPublicFn("ai-generated-token", "mint", [Cl.standardPrincipal(alice), prompt], alice);
      
      const { result } = simnet.callPublicFn(
        "ai-generated-token",
        "transfer",
        [Cl.uint(1), Cl.standardPrincipal(alice), Cl.standardPrincipal(bob)],
        bob
      );
      expect(result).toBeErr(Cl.uint(400));
    });
  });

  describe("add-aigc-data", () => {
    it("allows owner to add AIGC data", () => {
      const prompt = Cl.buffer(Uint8Array.from([1, 2, 3]));
      const aigcData = Cl.buffer(Uint8Array.from([7, 8, 9]));
      const proof = Cl.buffer(Uint8Array.from([10, 11, 12]));
      
      simnet.callPublicFn("ai-generated-token", "mint", [Cl.standardPrincipal(alice), prompt], alice);
      
      const { result } = simnet.callPublicFn(
        "ai-generated-token",
        "add-aigc-data",
        [Cl.uint(1), prompt, aigcData, proof],
        alice
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it("prevents non-owner from adding AIGC data", () => {
      const prompt = Cl.buffer(Uint8Array.from([1, 2, 3]));
      const aigcData = Cl.buffer(Uint8Array.from([7, 8, 9]));
      const proof = Cl.buffer(Uint8Array.from([10, 11, 12]));
      
      simnet.callPublicFn("ai-generated-token", "mint", [Cl.standardPrincipal(alice), prompt], alice);
      
      const { result } = simnet.callPublicFn(
        "ai-generated-token",
        "add-aigc-data",
        [Cl.uint(1), prompt, aigcData, proof],
        bob
      );
      expect(result).toBeErr(Cl.uint(400));
    });

    it("fails for non-existent token", () => {
      const prompt = Cl.buffer(Uint8Array.from([1, 2, 3]));
      const aigcData = Cl.buffer(Uint8Array.from([7, 8, 9]));
      const proof = Cl.buffer(Uint8Array.from([10, 11, 12]));
      
      const { result } = simnet.callPublicFn(
        "ai-generated-token",
        "add-aigc-data",
        [Cl.uint(999), prompt, aigcData, proof],
        alice
      );
      expect(result).toBeErr(Cl.uint(401));
    });
  });

  describe("verify", () => {
    it("returns true for valid proof", () => {
      const prompt = Cl.buffer(Uint8Array.from([1, 2, 3]));
      const aigcData = Cl.buffer(Uint8Array.from([7, 8, 9]));
      const proof = Cl.buffer(Uint8Array.from([10, 11, 12]));
      
      const { result } = simnet.callPublicFn(
        "ai-generated-token",
        "verify",
        [prompt, aigcData, proof],
        alice
      );
      expect(result).toBeOk(Cl.bool(true));
    });
  });

  describe("update-aigc-data", () => {
    it("allows updating AIGC data after challenge period", () => {
      const prompt = Cl.buffer(Uint8Array.from([1, 2, 3]));
      const aigcData = Cl.buffer(Uint8Array.from([7, 8, 9]));
      const proof = Cl.buffer(Uint8Array.from([10, 11, 12]));
      const newPrompt = Cl.buffer(Uint8Array.from([4, 5, 6]));
      const newAigcData = Cl.buffer(Uint8Array.from([13, 14, 15]));
      
      simnet.callPublicFn("ai-generated-token", "mint", [Cl.standardPrincipal(alice), prompt], alice);
      simnet.callPublicFn("ai-generated-token", "add-aigc-data", [Cl.uint(1), prompt, aigcData, proof], alice);
      
      simnet.mineEmptyBlocks(150);
      
      const { result } = simnet.callPublicFn(
        "ai-generated-token",
        "update-aigc-data",
        [Cl.uint(1), newPrompt, newAigcData],
        alice
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it("prevents updating during challenge period", () => {
      const prompt = Cl.buffer(Uint8Array.from([1, 2, 3]));
      const aigcData = Cl.buffer(Uint8Array.from([7, 8, 9]));
      const proof = Cl.buffer(Uint8Array.from([10, 11, 12]));
      const newPrompt = Cl.buffer(Uint8Array.from([4, 5, 6]));
      const newAigcData = Cl.buffer(Uint8Array.from([13, 14, 15]));
      
      simnet.callPublicFn("ai-generated-token", "mint", [Cl.standardPrincipal(alice), prompt], alice);
      simnet.callPublicFn("ai-generated-token", "add-aigc-data", [Cl.uint(1), prompt, aigcData, proof], alice);
      
      const { result } = simnet.callPublicFn(
        "ai-generated-token",
        "update-aigc-data",
        [Cl.uint(1), newPrompt, newAigcData],
        alice
      );
      expect(result).toBeErr(Cl.uint(403));
    });
  });

  describe("get-token-data", () => {
    it("returns token data after adding AIGC data", () => {
      const prompt = Cl.buffer(Uint8Array.from([1, 2, 3]));
      const aigcData = Cl.buffer(Uint8Array.from([7, 8, 9]));
      const proof = Cl.buffer(Uint8Array.from([10, 11, 12]));
      
      simnet.callPublicFn("ai-generated-token", "mint", [Cl.standardPrincipal(alice), prompt], alice);
      simnet.callPublicFn("ai-generated-token", "add-aigc-data", [Cl.uint(1), prompt, aigcData, proof], alice);
      
      const { result } = simnet.callReadOnlyFn(
        "ai-generated-token",
        "get-token-data",
        [Cl.uint(1)],
        alice
      );
      const data = result.value;
      expect(result.type).toBe(ClarityType.ResponseOk);
      expect(data.type).toBe(ClarityType.OptionalSome);
    });

    it("returns none for token without data", () => {
      const prompt = Cl.buffer(Uint8Array.from([1, 2, 3]));
      simnet.callPublicFn("ai-generated-token", "mint", [Cl.standardPrincipal(alice), prompt], alice);
      
      const { result } = simnet.callReadOnlyFn(
        "ai-generated-token",
        "get-token-data",
        [Cl.uint(1)],
        alice
      );
      expect(result).toBeOk(Cl.none());
    });
  });

  describe("set-proof-type", () => {
    it("allows contract caller to set proof type", () => {
      const { result } = simnet.callPublicFn(
        "ai-generated-token",
        "set-proof-type",
        [Cl.stringAscii("opml")],
        deployer
      );
      expect(result).toBeOk(Cl.bool(true));
    });
  });

  describe("get-owner", () => {
    it("returns owner of minted token", () => {
      const prompt = Cl.buffer(Uint8Array.from([1, 2, 3]));
      simnet.callPublicFn("ai-generated-token", "mint", [Cl.standardPrincipal(alice), prompt], alice);
      
      const { result } = simnet.callReadOnlyFn(
        "ai-generated-token",
        "get-owner",
        [Cl.uint(1)],
        alice
      );
      expect(result).toBeOk(Cl.some(Cl.standardPrincipal(alice)));
    });

    it("returns none for non-existent token", () => {
      const { result } = simnet.callReadOnlyFn(
        "ai-generated-token",
        "get-owner",
        [Cl.uint(999)],
        alice
      );
      expect(result).toBeOk(Cl.none());
    });
  });
});

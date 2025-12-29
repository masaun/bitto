import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("emoji-nft contract", () => {
  beforeEach(() => {
    simnet.setEpoch("3.0");
  });

  it("should emote on NFT", () => {
    const { result } = simnet.callPublicFn(
      "emoji-nft",
      "emote",
      [Cl.principal(deployer), Cl.uint(1), Cl.stringUtf8("❤️")],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should get emote count", () => {
    simnet.callPublicFn(
      "emoji-nft",
      "emote",
      [Cl.principal(deployer), Cl.uint(1), Cl.stringUtf8("👍")],
      wallet1
    );
    simnet.callPublicFn(
      "emoji-nft",
      "emote",
      [Cl.principal(deployer), Cl.uint(1), Cl.stringUtf8("👍")],
      wallet2
    );
    
    const { result } = simnet.callReadOnlyFn(
      "emoji-nft",
      "get-emote-count",
      [Cl.principal(deployer), Cl.uint(1), Cl.stringUtf8("👍")],
      deployer
    );
    expect(result).toBeOk(Cl.uint(2));
  });

  it("should not allow duplicate emote from same user", () => {
    simnet.callPublicFn(
      "emoji-nft",
      "emote",
      [Cl.principal(deployer), Cl.uint(2), Cl.stringUtf8("🔥")],
      wallet1
    );
    
    const { result } = simnet.callPublicFn(
      "emoji-nft",
      "emote",
      [Cl.principal(deployer), Cl.uint(2), Cl.stringUtf8("🔥")],
      wallet1
    );
    expect(result).toBeErr(Cl.uint(100));
  });

  it("should get emotes list", () => {
    simnet.callPublicFn(
      "emoji-nft",
      "emote",
      [Cl.principal(deployer), Cl.uint(3), Cl.stringUtf8("😊")],
      wallet1
    );
    
    const { result } = simnet.callReadOnlyFn(
      "emoji-nft",
      "get-emotes",
      [Cl.principal(deployer), Cl.uint(3), Cl.stringUtf8("😊")],
      deployer
    );
    const emotesResult = result as any;
    expect(emotesResult.type).toBe('ok');
  });

  it("should get user emotes", () => {
    simnet.callPublicFn(
      "emoji-nft",
      "emote",
      [Cl.principal(deployer), Cl.uint(4), Cl.stringUtf8("⭐")],
      wallet1
    );
    simnet.callPublicFn(
      "emoji-nft",
      "emote",
      [Cl.principal(deployer), Cl.uint(4), Cl.stringUtf8("💯")],
      wallet1
    );
    
    const { result } = simnet.callReadOnlyFn(
      "emoji-nft",
      "get-user-emotes",
      [Cl.principal(wallet1), Cl.principal(deployer), Cl.uint(4)],
      deployer
    );
    const userEmotesResult = result as any;
    expect(userEmotesResult.type).toBe('ok');
  });

  it("should check if user has emoted", () => {
    simnet.callPublicFn(
      "emoji-nft",
      "emote",
      [Cl.principal(deployer), Cl.uint(5), Cl.stringUtf8("🎉")],
      wallet1
    );
    
    const { result } = simnet.callReadOnlyFn(
      "emoji-nft",
      "has-emoted",
      [Cl.principal(wallet1), Cl.principal(deployer), Cl.uint(5), Cl.stringUtf8("🎉")],
      deployer
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should remove emote", () => {
    simnet.callPublicFn(
      "emoji-nft",
      "emote",
      [Cl.principal(deployer), Cl.uint(6), Cl.stringUtf8("🚀")],
      wallet1
    );
    
    const { result } = simnet.callPublicFn(
      "emoji-nft",
      "remove-emote",
      [Cl.principal(deployer), Cl.uint(6), Cl.stringUtf8("🚀")],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should allow multiple users to emote same emoji", () => {
    simnet.callPublicFn(
      "emoji-nft",
      "emote",
      [Cl.principal(deployer), Cl.uint(7), Cl.stringUtf8("💎")],
      wallet1
    );
    
    const { result } = simnet.callPublicFn(
      "emoji-nft",
      "emote",
      [Cl.principal(deployer), Cl.uint(7), Cl.stringUtf8("💎")],
      wallet2
    );
    expect(result).toBeOk(Cl.bool(true));
  });
});

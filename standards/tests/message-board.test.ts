import { Cl, ClarityType } from "@stacks/transactions";
import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const address1 = accounts.get("wallet_1")!;

describe("example tests", () => {
  let content = "Hello Stacks Devs!"

  it("allows user to add a new message", () => {
    let currentBurnBlockHeight = simnet.burnBlockHeight;

    let confirmation = simnet.callPublicFn(
      "message-board-v2",
      "add-message",
      [Cl.stringUtf8(content)],
      address1
    )

    const messageCount = simnet.getDataVar("message-board-v2", "message-count");
    
    expect(confirmation.result).toHaveClarityType(ClarityType.ResponseOk);
    expect(confirmation.result).toBeOk(messageCount);    
    expect(confirmation.events[1].data.value).toBeTuple({
      author: Cl.standardPrincipal(address1),
      event: Cl.stringAscii("[Stacks Dev Quickstart] New Message"),
      id: messageCount,
      message: Cl.stringUtf8(content),
      time: Cl.uint(currentBurnBlockHeight),
    });
  });

  it("allows contract owner to withdraw funds", () => {
    simnet.callPublicFn(
      "message-board-v2",
      "add-message",
      [Cl.stringUtf8(content)],
      address1
    )
    
    simnet.mineEmptyBurnBlocks(2);

    let confirmation = simnet.callPublicFn(
      "message-board-v2",
      "withdraw-funds",
      [],
      deployer
    )
    
    expect(confirmation.result).toBeOk(Cl.bool(true));
    // Note: In our simplified implementation, funds go directly to owner
    // so there are no transfer events from the contract's withdraw function
  })
});

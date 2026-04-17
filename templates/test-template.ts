/*
  Purpose:
  - source-grounded Hardhat test template for the confidential voting validation target
  - mirrors the documented encrypted-input flow and actor-specific reveal step
*/

import {expect} from "chai";
import {ethers, fhevm} from "hardhat";
import {FhevmType} from "@fhevm/hardhat-plugin";

describe("ConfidentialVotingTemplate", () => {
  async function deployFixture() {
    const [admin, voter, secondVoter, outsider] = await ethers.getSigners();
    const latestBlock = await ethers.provider.getBlock("latest");
    const now = latestBlock?.timestamp ?? Math.floor(Date.now() / 1000);

    const factory = await ethers.getContractFactory("ConfidentialVotingTemplate");
    const contract = await factory.deploy(admin.address, now - 60, now + 3600, [
      admin.address,
      voter.address,
      secondVoter.address,
    ]);
    await contract.waitForDeployment();

    return {contract, admin, voter, secondVoter, outsider, endTime: now + 3600};
  }

  async function castVote(contract: any, signer: any, value: boolean) {
    const encryptedVote = await fhevm
      .createEncryptedInput(await contract.getAddress(), signer.address)
      .addBool(value)
      .encrypt();

    await contract.connect(signer).submitVote(encryptedVote.handles[0], encryptedVote.inputProof);
  }

  it("accepts an encrypted vote during the active window", async () => {
    const {contract, voter} = await deployFixture();

    await castVote(contract, voter, true);

    expect(await contract.hasSubmitted(voter.address)).to.equal(true);
  });

  it("rejects ineligible voters before touching the encrypted input path", async () => {
    const {contract, outsider} = await deployFixture();

    const encryptedVote = await fhevm
      .createEncryptedInput(await contract.getAddress(), outsider.address)
      .addBool(true)
      .encrypt();

    await expect(
      contract.connect(outsider).submitVote(encryptedVote.handles[0], encryptedVote.inputProof),
    ).to.be.revertedWithCustomError(contract, "NotEligibleVoter");
  });

  it("rejects duplicate submissions", async () => {
    const {contract, voter} = await deployFixture();

    const encryptedVote = await fhevm
      .createEncryptedInput(await contract.getAddress(), voter.address)
      .addBool(false)
      .encrypt();

    await contract.connect(voter).submitVote(encryptedVote.handles[0], encryptedVote.inputProof);

    await expect(
      contract.connect(voter).submitVote(encryptedVote.handles[0], encryptedVote.inputProof),
    ).to.be.revertedWithCustomError(contract, "AlreadySubmitted");
  });

  it("rejects encrypted input when the signer differs from the original input user", async () => {
    const {contract, voter, secondVoter} = await deployFixture();

    const encryptedVote = await fhevm
      .createEncryptedInput(await contract.getAddress(), voter.address)
      .addBool(true)
      .encrypt();

    await expect(
      contract.connect(secondVoter).submitVote(encryptedVote.handles[0], encryptedVote.inputProof),
    ).to.be.rejectedWith(/InvalidSigner|encrypted input|user address/i);
  });

  it("rejects encrypted input when it was created for a different contract address", async () => {
    const {contract, voter, admin} = await deployFixture();
    const secondFactory = await ethers.getContractFactory("ConfidentialVotingTemplate");
    const secondContract = await secondFactory.deploy(admin.address, 0, 9999999999, [voter.address]);
    await secondContract.waitForDeployment();

    const encryptedVote = await fhevm
      .createEncryptedInput(await secondContract.getAddress(), voter.address)
      .addBool(true)
      .encrypt();

    await expect(
      contract.connect(voter).submitVote(encryptedVote.handles[0], encryptedVote.inputProof),
    ).to.be.rejectedWith(/InvalidSigner|encrypted input|contract address/i);
  });

  it("rejects tampered inputProof bytes", async () => {
    const {contract, voter} = await deployFixture();

    const encryptedVote = await fhevm
      .createEncryptedInput(await contract.getAddress(), voter.address)
      .addBool(true)
      .encrypt();

    const tamperedProof = Uint8Array.from(encryptedVote.inputProof);
    tamperedProof[tamperedProof.length - 1] = tamperedProof[tamperedProof.length - 1] ^ 0x01;

    await expect(
      contract.connect(voter).submitVote(encryptedVote.handles[0], tamperedProof),
    ).to.be.rejected;
  });

  it("rejects submission before the voting window starts", async () => {
    const [admin, voter] = await ethers.getSigners();
    const latestBlock = await ethers.provider.getBlock("latest");
    const now = latestBlock?.timestamp ?? Math.floor(Date.now() / 1000);
    const factory = await ethers.getContractFactory("ConfidentialVotingTemplate");
    const contract = await factory.deploy(admin.address, now + 3600, now + 7200, [voter.address]);
    await contract.waitForDeployment();

    const encryptedVote = await fhevm
      .createEncryptedInput(await contract.getAddress(), voter.address)
      .addBool(true)
      .encrypt();

    await expect(
      contract.connect(voter).submitVote(encryptedVote.handles[0], encryptedVote.inputProof),
    ).to.be.revertedWithCustomError(contract, "VotingClosed");
  });

  it("rejects submission after the voting window ends", async () => {
    const {contract, voter, endTime} = await deployFixture();

    await ethers.provider.send("evm_setNextBlockTimestamp", [endTime + 1]);
    await ethers.provider.send("evm_mine", []);

    const encryptedVote = await fhevm
      .createEncryptedInput(await contract.getAddress(), voter.address)
      .addBool(true)
      .encrypt();

    await expect(
      contract.connect(voter).submitVote(encryptedVote.handles[0], encryptedVote.inputProof),
    ).to.be.revertedWithCustomError(contract, "VotingClosed");
  });

  it("allows the admin to configure the electorate before the voting window starts", async () => {
    const [admin, voter, outsider] = await ethers.getSigners();
    const latestBlock = await ethers.provider.getBlock("latest");
    const now = latestBlock?.timestamp ?? Math.floor(Date.now() / 1000);
    const factory = await ethers.getContractFactory("ConfidentialVotingTemplate");
    const contract = await factory.deploy(admin.address, now + 3600, now + 7200, [voter.address]);
    await contract.waitForDeployment();

    expect(await contract.eligibleVoters(outsider.address)).to.equal(false);

    await contract.connect(admin).setEligibleVoter(outsider.address, true);

    expect(await contract.eligibleVoters(outsider.address)).to.equal(true);
  });

  it("locks electorate changes once the voting window has started", async () => {
    const {contract, admin, outsider} = await deployFixture();

    await expect(
      contract.connect(admin).setEligibleVoter(outsider.address, true),
    ).to.be.revertedWithCustomError(contract, "ElectorateLocked");
  });

  it("prevents unauthorized finalization", async () => {
    const {contract, outsider, endTime} = await deployFixture();

    await ethers.provider.send("evm_setNextBlockTimestamp", [endTime + 1]);
    await ethers.provider.send("evm_mine", []);

    await expect(contract.connect(outsider).finalizeResult()).to.be.revertedWithCustomError(
      contract,
      "OnlyAdmin",
    );
  });

  it("rejects finalization before the voting window closes", async () => {
    const {contract, admin} = await deployFixture();

    await expect(contract.connect(admin).finalizeResult()).to.be.revertedWithCustomError(
      contract,
      "VotingStillOpen",
    );
  });

  it("allows authorized finalization after the window closes", async () => {
    const {contract, admin, endTime} = await deployFixture();

    await castVote(contract, admin, true);

    await ethers.provider.send("evm_setNextBlockTimestamp", [endTime + 1]);
    await ethers.provider.send("evm_mine", []);

    await contract.connect(admin).finalizeResult();

    expect(await contract.finalized()).to.equal(true);
    expect(await contract.canAdminDecryptTallies()).to.equal(true);

    const encryptedYesVotes = await contract.getEncryptedYesVotes();
    const clearYesVotes = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedYesVotes,
      await contract.getAddress(),
      admin,
    );

    expect(clearYesVotes).to.equal(1);
  });

  it("rejects unauthorized decryption after finalization", async () => {
    const {contract, admin, outsider, endTime} = await deployFixture();

    await castVote(contract, admin, true);

    await ethers.provider.send("evm_setNextBlockTimestamp", [endTime + 1]);
    await ethers.provider.send("evm_mine", []);

    await contract.connect(admin).finalizeResult();

    const encryptedYesVotes = await contract.getEncryptedYesVotes();

    await expect(
      fhevm.userDecryptEuint(
        FhevmType.euint32,
        encryptedYesVotes,
        await contract.getAddress(),
        outsider,
      ),
    ).to.be.rejected;
  });

  it("tracks correct tallies across multiple voters", async () => {
    const {contract, admin, voter, secondVoter, endTime} = await deployFixture();

    await castVote(contract, admin, true);
    await castVote(contract, voter, false);
    await castVote(contract, secondVoter, true);

    await ethers.provider.send("evm_setNextBlockTimestamp", [endTime + 1]);
    await ethers.provider.send("evm_mine", []);

    await contract.connect(admin).finalizeResult();

    const encryptedYesVotes = await contract.getEncryptedYesVotes();
    const encryptedTotalVotes = await contract.getEncryptedTotalVotes();

    const clearYesVotes = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedYesVotes,
      await contract.getAddress(),
      admin,
    );
    const clearTotalVotes = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedTotalVotes,
      await contract.getAddress(),
      admin,
    );

    expect(clearYesVotes).to.equal(2);
    expect(clearTotalVotes).to.equal(3);
  });

  it("supports zero-vote finalization with decryptable zero tallies", async () => {
    const {contract, admin, endTime} = await deployFixture();

    await ethers.provider.send("evm_setNextBlockTimestamp", [endTime + 1]);
    await ethers.provider.send("evm_mine", []);

    await contract.connect(admin).finalizeResult();

    const encryptedYesVotes = await contract.getEncryptedYesVotes();
    const encryptedTotalVotes = await contract.getEncryptedTotalVotes();

    const clearYesVotes = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedYesVotes,
      await contract.getAddress(),
      admin,
    );
    const clearTotalVotes = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedTotalVotes,
      await contract.getAddress(),
      admin,
    );

    expect(clearYesVotes).to.equal(0);
    expect(clearTotalVotes).to.equal(0);
  });
});

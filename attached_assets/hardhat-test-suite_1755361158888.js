// Test suite for WheelGameArbitrumSepolia
// Run with: npx hardhat test

const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("WheelGameArbitrumSepolia", function () {
    let wheelGame;
    let aidogeToken, boopToken, bobotrumToken;
    let owner, player1, player2, player3;
    
    const INITIAL_SUPPLY = ethers.utils.parseEther("1000000");
    const GAME_INITIAL_BALANCE = ethers.utils.parseEther("100000");
    const SECONDS_IN_DAY = 86400;
    
    beforeEach(async function () {
        // Get signers
        [owner, player1, player2, player3] = await ethers.getSigners();
        
        // Deploy test tokens
        const TestToken = await ethers.getContractFactory("TestToken");
        
        aidogeToken = await TestToken.deploy(
            "AIDOGE Test Token",
            "AIDOGE",
            INITIAL_SUPPLY
        );
        await aidogeToken.deployed();
        
        boopToken = await TestToken.deploy(
            "BOOP Test Token",
            "BOOP",
            INITIAL_SUPPLY
        );
        await boopToken.deployed();
        
        bobotrumToken = await TestToken.deploy(
            "BOBOTRUM Test Token",
            "BOBOTRUM",
            INITIAL_SUPPLY
        );
        await bobotrumToken.deployed();
        
        // Deploy game contract
        const WheelGame = await ethers.getContractFactory("WheelGameArbitrumSepolia");
        wheelGame = await WheelGame.deploy(
            aidogeToken.address,
            boopToken.address,
            bobotrumToken.address
        );
        await wheelGame.deployed();
        
        // Fund game contract with tokens
        await aidogeToken.approve(wheelGame.address, GAME_INITIAL_BALANCE);
        await boopToken.approve(wheelGame.address, GAME_INITIAL_BALANCE);
        await bobotrumToken.approve(wheelGame.address, GAME_INITIAL_BALANCE);
        
        await wheelGame.depositTokens(aidogeToken.address, GAME_INITIAL_BALANCE);
        await wheelGame.depositTokens(boopToken.address, GAME_INITIAL_BALANCE);
        await wheelGame.depositTokens(bobotrumToken.address, GAME_INITIAL_BALANCE);
    });
    
    describe("Deployment", function () {
        it("Should set the correct token addresses", async function () {
            expect(await wheelGame.aidogeToken()).to.equal(aidogeToken.address);
            expect(await wheelGame.boopToken()).to.equal(boopToken.address);
            expect(await wheelGame.bobotrumToken()).to.equal(bobotrumToken.address);
        });
        
        it("Should set the correct owner", async function () {
            expect(await wheelGame.owner()).to.equal(owner.address);
        });
        
        it("Should have correct initial token balances", async function () {
            const balances = await wheelGame.getContractBalances();
            expect(balances.aidogeBalance).to.equal(GAME_INITIAL_BALANCE);
            expect(balances.boopBalance).to.equal(GAME_INITIAL_BALANCE);
            expect(balances.bobotrumBalance).to.equal(GAME_INITIAL_BALANCE);
        });
        
        it("Should return correct wheel segments", async function () {
            const segments = await wheelGame.getWheelSegments();
            expect(segments.length).to.equal(8);
            expect(segments).to.deep.equal([
                "AIDOGE", "BUST", "BOOP", "BONUS",
                "BOBOTRUM", "BUST", "AIDOGE", "JACKPOT"
            ]);
        });
    });
    
    describe("Spinning", function () {
        it("Should allow a player to spin", async function () {
            const tx = await wheelGame.connect(player1).spin();
            const receipt = await tx.wait();
            
            // Check for SpinResult event
            const event = receipt.events.find(e => e.event === "SpinResult");
            expect(event).to.not.be.undefined;
            expect(event.args.player).to.equal(player1.address);
        });
        
        it("Should update player stats after spin", async function () {
            await wheelGame.connect(player1).spin();
            
            const stats = await wheelGame.getPlayerStats(player1.address);
            expect(stats.totalSpins).to.equal(1);
            expect(stats.dailySpins).to.equal(1);
            expect(stats.spinsRemaining).to.equal(4);
        });
        
        it("Should enforce daily spin limit", async function () {
            // Use all 5 daily spins
            for (let i = 0; i < 5; i++) {
                await wheelGame.connect(player1).spin();
            }
            
            // 6th spin should fail
            await expect(
                wheelGame.connect(player1).spin()
            ).to.be.revertedWithCustomError(wheelGame, "DailyLimitReached");
        });
        
        it("Should reset daily limit after 24 hours", async function () {
            // Use all 5 spins
            for (let i = 0; i < 5; i++) {
                await wheelGame.connect(player1).spin();
            }
            
            // Move time forward by 24 hours
            await time.increase(SECONDS_IN_DAY);
            
            // Should be able to spin again
            await expect(
                wheelGame.connect(player1).spin()
            ).to.not.be.reverted;
            
            const stats = await wheelGame.getPlayerStats(player1.address);
            expect(stats.dailySpins).to.equal(1);
            expect(stats.totalSpins).to.equal(6);
        });
        
        it("Should accumulate rewards without auto-transfer", async function () {
            let totalWins = 0;
            
            // Spin multiple times
            for (let i = 0; i < 5; i++) {
                const tx = await wheelGame.connect(player1).spin();
                const receipt = await tx.wait();
                const event = receipt.events.find(e => e.event === "SpinResult");
                
                if (event.args.isWin) {
                    totalWins++;
                }
            }
            
            // Check pending rewards (should have some if any wins)
            const rewards = await wheelGame.getPendingRewards(player1.address);
            
            // Player shouldn't have received tokens yet
            expect(await aidogeToken.balanceOf(player1.address)).to.equal(0);
            expect(await boopToken.balanceOf(player1.address)).to.equal(0);
            expect(await bobotrumToken.balanceOf(player1.address)).to.equal(0);
        });
    });
    
    describe("Claiming Rewards", function () {
        beforeEach(async function () {
            // Do multiple spins to accumulate some rewards
            for (let i = 0; i < 5; i++) {
                await wheelGame.connect(player1).spin();
            }
        });
        
        it("Should allow claiming specific token rewards", async function () {
            const rewardsBefore = await wheelGame.getPendingRewards(player1.address);
            
            if (rewardsBefore.aidoge > 0) {
                await wheelGame.connect(player1).claimRewards(aidogeToken.address);
                
                const rewardsAfter = await wheelGame.getPendingRewards(player1.address);
                expect(rewardsAfter.aidoge).to.equal(0);
                expect(await aidogeToken.balanceOf(player1.address)).to.equal(rewardsBefore.aidoge);
            }
        });
        
        it("Should allow claiming all rewards at once", async function () {
            const rewardsBefore = await wheelGame.getPendingRewards(player1.address);
            
            // Only claim if there are rewards
            if (rewardsBefore.aidoge > 0 || rewardsBefore.boop > 0 || rewardsBefore.bobotrum > 0) {
                await wheelGame.connect(player1).claimAllRewards();
                
                const rewardsAfter = await wheelGame.getPendingRewards(player1.address);
                expect(rewardsAfter.aidoge).to.equal(0);
                expect(rewardsAfter.boop).to.equal(0);
                expect(rewardsAfter.bobotrum).to.equal(0);
                
                expect(await aidogeToken.balanceOf(player1.address)).to.equal(rewardsBefore.aidoge);
                expect(await boopToken.balanceOf(player1.address)).to.equal(rewardsBefore.boop);
                expect(await bobotrumToken.balanceOf(player1.address)).to.equal(rewardsBefore.bobotrum);
            }
        });
        
        it("Should revert when claiming with no pending rewards", async function () {
            // Claim all rewards first
            const rewards = await wheelGame.getPendingRewards(player1.address);
            if (rewards.aidoge > 0 || rewards.boop > 0 || rewards.bobotrum > 0) {
                await wheelGame.connect(player1).claimAllRewards();
            }
            
            // Try to claim again
            await expect(
                wheelGame.connect(player1).claimAllRewards()
            ).to.be.revertedWithCustomError(wheelGame, "NoPendingRewards");
        });
        
        it("Should revert when claiming invalid token", async function () {
            await expect(
                wheelGame.connect(player1).claimRewards(player1.address)
            ).to.be.revertedWithCustomError(wheelGame, "InvalidTokenAddress");
        });
    });
    
    describe("Owner Functions", function () {
        it("Should allow owner to pause the game", async function () {
            await wheelGame.setPaused(true);
            expect(await wheelGame.paused()).to.be.true;
            
            // Spinning should fail when paused
            await expect(
                wheelGame.connect(player1).spin()
            ).to.be.revertedWithCustomError(wheelGame, "GamePaused");
        });
        
        it("Should allow owner to unpause the game", async function () {
            await wheelGame.setPaused(true);
            await wheelGame.setPaused(false);
            expect(await wheelGame.paused()).to.be.false;
            
            // Should be able to spin again
            await expect(
                wheelGame.connect(player1).spin()
            ).to.not.be.reverted;
        });
        
        it("Should allow owner to deposit tokens", async function () {
            const depositAmount = ethers.utils.parseEther("1000");
            await aidogeToken.approve(wheelGame.address, depositAmount);
            
            await wheelGame.depositTokens(aidogeToken.address, depositAmount);
            
            const balances = await wheelGame.getContractBalances();
            expect(balances.aidogeBalance).to.equal(GAME_INITIAL_BALANCE.add(depositAmount));
        });
        
        it("Should allow owner to emergency withdraw", async function () {
            const withdrawAmount = ethers.utils.parseEther("1000");
            const ownerBalanceBefore = await aidogeToken.balanceOf(owner.address);
            
            await wheelGame.emergencyWithdraw(aidogeToken.address, withdrawAmount);
            
            const ownerBalanceAfter = await aidogeToken.balanceOf(owner.address);
            expect(ownerBalanceAfter).to.equal(ownerBalanceBefore.add(withdrawAmount));
        });
        
        it("Should restrict owner functions to owner only", async function () {
            await expect(
                wheelGame.connect(player1).setPaused(true)
            ).to.be.revertedWith("Ownable: caller is not the owner");
            
            await expect(
                wheelGame.connect(player1).depositTokens(aidogeToken.address, 1000)
            ).to.be.revertedWith("Ownable: caller is not the owner");
            
            await expect(
                wheelGame.connect(player1).emergencyWithdraw(aidogeToken.address, 1000)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });
    
    describe("Test Tokens", function () {
        it("Should allow users to use faucet", async function () {
            await aidogeToken.connect(player1).faucet();
            
            const balance = await aidogeToken.balanceOf(player1.address);
            expect(balance).to.equal(ethers.utils.parseEther("100"));
        });
        
        it("Should enforce faucet cooldown", async function () {
            await aidogeToken.connect(player1).faucet();
            
            // Try to use faucet again immediately
            await expect(
                aidogeToken.connect(player1).faucet()
            ).to.be.revertedWithCustomError(aidogeToken, "FaucetCooldown");
        });
        
        it("Should allow faucet use after cooldown", async function () {
            await aidogeToken.connect(player1).faucet();
            
            // Move time forward by 1 day
            await time.increase(SECONDS_IN_DAY);
            
            // Should be able to use faucet again
            await aidogeToken.connect(player1).faucet();
            
            const balance = await aidogeToken.balanceOf(player1.address);
            expect(balance).to.equal(ethers.utils.parseEther("200"));
        });
        
        it("Should allow owner to mint tokens", async function () {
            const mintAmount = ethers.utils.parseEther("1000");
            await aidogeToken.mint(player2.address, mintAmount);
            
            const balance = await aidogeToken.balanceOf(player2.address);
            expect(balance).to.equal(mintAmount);
        });
    });
    
    describe("Edge Cases", function () {
        it("Should handle multiple players simultaneously", async function () {
            // Multiple players spin
            await wheelGame.connect(player1).spin();
            await wheelGame.connect(player2).spin();
            await wheelGame.connect(player3).spin();
            
            // Check individual stats
            const stats1 = await wheelGame.getPlayerStats(player1.address);
            const stats2 = await wheelGame.getPlayerStats(player2.address);
            const stats3 = await wheelGame.getPlayerStats(player3.address);
            
            expect(stats1.totalSpins).to.equal(1);
            expect(stats2.totalSpins).to.equal(1);
            expect(stats3.totalSpins).to.equal(1);
        });
        
        it("Should properly track rewards for multiple players", async function () {
            // Players spin
            for (let i = 0; i < 3; i++) {
                await wheelGame.connect(player1).spin();
                await wheelGame.connect(player2).spin();
            }
            
            // Get rewards
            const rewards1 = await wheelGame.getPendingRewards(player1.address);
            const rewards2 = await wheelGame.getPendingRewards(player2.address);
            
            // Rewards should be independent
            if (rewards1.aidoge > 0 || rewards1.boop > 0 || rewards1.bobotrum > 0) {
                await wheelGame.connect(player1).claimAllRewards();
                
                // Player 2's rewards should be unaffected
                const rewards2After = await wheelGame.getPendingRewards(player2.address);
                expect(rewards2After.aidoge).to.equal(rewards2.aidoge);
                expect(rewards2After.boop).to.equal(rewards2.boop);
                expect(rewards2After.bobotrum).to.equal(rewards2.bobotrum);
            }
        });
    });
    
    describe("Gas Optimization", function () {
        it("Should have reasonable gas costs for spinning", async function () {
            const tx = await wheelGame.connect(player1).spin();
            const receipt = await tx.wait();
            
            // Gas used should be reasonable (less than 200k)
            expect(receipt.gasUsed).to.be.lt(200000);
        });
        
        it("Should have reasonable gas costs for claiming", async function () {
            // Accumulate some rewards
            for (let i = 0; i < 5; i++) {
                await wheelGame.connect(player1).spin();
            }
            
            const rewards = await wheelGame.getPendingRewards(player1.address);
            
            if (rewards.aidoge > 0 || rewards.boop > 0 || rewards.bobotrum > 0) {
                const tx = await wheelGame.connect(player1).claimAllRewards();
                const receipt = await tx.wait();
                
                // Gas used should be reasonable (less than 150k per token)
                expect(receipt.gasUsed).to.be.lt(450000);
            }
        });
    });
});

describe("Integration Tests", function () {
    let wheelGame;
    let aidogeToken, boopToken, bobotrumToken;
    let owner, player1;
    
    before(async function () {
        [owner, player1] = await ethers.getSigners();
        
        // Deploy everything fresh
        const TestToken = await ethers.getContractFactory("TestToken");
        
        aidogeToken = await TestToken.deploy(
            "AIDOGE Test Token",
            "AIDOGE",
            ethers.utils.parseEther("1000000")
        );
        boopToken = await TestToken.deploy(
            "BOOP Test Token",
            "BOOP",
            ethers.utils.parseEther("1000000")
        );
        bobotrumToken = await TestToken.deploy(
            "BOBOTRUM Test Token",
            "BOBOTRUM",
            ethers.utils.parseEther("1000000")
        );
        
        const WheelGame = await ethers.getContractFactory("WheelGameArbitrumSepolia");
        wheelGame = await WheelGame.deploy(
            aidogeToken.address,
            boopToken.address,
            bobotrumToken.address
        );
        
        // Fund the game
        const fundAmount = ethers.utils.parseEther("100000");
        await aidogeToken.approve(wheelGame.address, fundAmount);
        await boopToken.approve(wheelGame.address, fundAmount);
        await bobotrumToken.approve(wheelGame.address, fundAmount);
        
        await wheelGame.depositTokens(aidogeToken.address, fundAmount);
        await wheelGame.depositTokens(boopToken.address, fundAmount);
        await wheelGame.depositTokens(bobotrumToken.address, fundAmount);
    });
    
    it("Should handle a complete user journey", async function () {
        // Day 1: Player spins 5 times
        console.log("\n      Day 1: Spinning 5 times...");
        let totalWins = 0;
        
        for (let i = 0; i < 5; i++) {
            const tx = await wheelGame.connect(player1).spin();
            const receipt = await tx.wait();
            const event = receipt.events.find(e => e.event === "SpinResult");
            
            console.log(`        Spin ${i + 1}: ${event.args.segment} - ${event.args.isWin ? "WIN" : "BUST"}`);
            if (event.args.isWin) totalWins++;
        }
        
        // Check stats
        const day1Stats = await wheelGame.getPlayerStats(player1.address);
        console.log(`        Total wins: ${totalWins}/${day1Stats.totalSpins}`);
        expect(day1Stats.totalSpins).to.equal(5);
        expect(day1Stats.dailySpins).to.equal(5);
        expect(day1Stats.spinsRemaining).to.equal(0);
        
        // Check pending rewards
        const day1Rewards = await wheelGame.getPendingRewards(player1.address);
        console.log(`        Pending rewards - AIDOGE: ${ethers.utils.formatEther(day1Rewards.aidoge)}, BOOP: ${ethers.utils.formatEther(day1Rewards.boop)}, BOBOTRUM: ${ethers.utils.formatEther(day1Rewards.bobotrum)}`);
        
        // Day 2: New day, spin again and claim
        await time.increase(86400);
        console.log("\n      Day 2: New day...");
        
        const tx = await wheelGame.connect(player1).spin();
        const receipt = await tx.wait();
        const event = receipt.events.find(e => e.event === "SpinResult");
        console.log(`        Spin 1: ${event.args.segment} - ${event.args.isWin ? "WIN" : "BUST"}`);
        
        // Claim all rewards
        const finalRewards = await wheelGame.getPendingRewards(player1.address);
        if (finalRewards.aidoge > 0 || finalRewards.boop > 0 || finalRewards.bobotrum > 0) {
            console.log("        Claiming all rewards...");
            await wheelGame.connect(player1).claimAllRewards();
            
            console.log(`        Final balances - AIDOGE: ${ethers.utils.formatEther(await aidogeToken.balanceOf(player1.address))}, BOOP: ${ethers.utils.formatEther(await boopToken.balanceOf(player1.address))}, BOBOTRUM: ${ethers.utils.formatEther(await bobotrumToken.balanceOf(player1.address))}`);
        }
        
        // Final stats
        const finalStats = await wheelGame.getPlayerStats(player1.address);
        expect(finalStats.totalSpins).to.equal(6);
        expect(finalStats.dailySpins).to.equal(1);
    });
});
const { expect } = require("chai");

describe("BabiToken", async function () {

	let babiToken;
	let maxSupply = '195000000';

	let deployer, acc1;

	beforeEach(async function() {
		[deployer, acc1] = await ethers.getSigners();
	
		const BabiToken = await ethers.getContractFactory("BabiToken");
		babiToken = await BabiToken.deploy();
		await babiToken.deployed();
	})

	it("Should mint all tokens to owner", async function () {
		let deployerBalance = await babiToken.balanceOf(deployer.address);
		expect(deployerBalance).to.equal(ethers.utils.parseEther(maxSupply));
	});

	it("Should transfer his tokens to someone", async function () {
		let initalDeployerBalance = await babiToken.balanceOf(deployer.address);
		let transferredAmount = ethers.utils.parseEther('5000000');

		let transferTx = await babiToken.transfer(acc1.address, transferredAmount);
		await transferTx.wait(1);

		let acc1Balance = await babiToken.balanceOf(acc1.address);
		expect(acc1Balance).to.equal(transferredAmount);

		let deployerBalance = await babiToken.balanceOf(deployer.address);
		expect(deployerBalance).to.equal(initalDeployerBalance.sub(transferredAmount));
	});

	it("Should not transfer more than owned", async function () {
		let initalDeployerBalance = await babiToken.balanceOf(deployer.address);
		let transferredAmount = initalDeployerBalance.add(ethers.utils.parseEther('1'));

		await expect(babiToken.transfer(acc1.address, transferredAmount)).to.be.revertedWith('ERC20: transfer amount exceeds balance');
	});

	it("Should burn his tokens", async function () {
		let initialTotalSupply = await babiToken.totalSupply();
		let initalDeployerBalance = await babiToken.balanceOf(deployer.address);
		let burnAmount = ethers.utils.parseEther('5000000');

		let burnTx = await babiToken.burn(burnAmount);
		await burnTx.wait(1);

		let deployerBalance = await babiToken.balanceOf(deployer.address);
		expect(deployerBalance).to.equal(initalDeployerBalance.sub(burnAmount));

		let totalSupply = await babiToken.totalSupply();
		expect(totalSupply).to.equal(initialTotalSupply.sub(burnAmount));
	});

	it("Should not burn others tokens", async function () {
		let initialTotalSupply = await babiToken.totalSupply();
		let initalDeployerBalance = await babiToken.balanceOf(deployer.address);
		let burnAmount = ethers.utils.parseEther('5000000');

		await expect(babiToken.connect(acc1).burn(burnAmount)).to.be.revertedWith('ERC20: burn amount exceeds balance');
	});


});

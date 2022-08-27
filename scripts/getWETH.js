const { ethers } = require('hardhat');

async function getWETH(deployer, value) {

  const weth = await ethers.getContractAt(
    "IWeth",
    process.env.WETH_ADDRESS,
    deployer
  );
  
  const tx = await weth.deposit({ value });
  await tx.wait(1);
  
  return weth;
}

module.exports = {
  getWETH,
};
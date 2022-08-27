const { ethers, getNamedAccounts } = require('hardhat');
const { getWETH } = require('./getWETH');

async function main() {
  const deployer = (await getNamedAccounts()).deployer;
  
  // 1. Deposit ETH / WETH
  const weth = await getWETH(deployer, ethers.utils.parseEther('0.1'));

  const lendingPoolAddressesProvider = await ethers.getContractAt(
    "ILendingPoolAddressesProvider",
    process.env.ILendingPoolAddressesProvider_ADDRESS,
    deployer
  );
    
  const lendingPoolAddress = await lendingPoolAddressesProvider.getLendingPool();
  const lendingPool = await ethers.getContractAt(
    "ILendingPool",
    lendingPoolAddress,
    deployer
  );
  
  // approve of the use of our ERC20 token.
  await approveErc20(weth.address, lendingPool.address, ethers.utils.parseEther('0.1'), deployer);
  
  console.log('Depositing...');
  await lendingPool.deposit(process.env.WETH_ADDRESS, ethers.utils.parseEther('0.1'), deployer, 0);
  console.log('Deposited ✅');
  
  const { availableBorrowsETH } = await getUserData(lendingPool, deployer);
  
  // 2. Borrow DAI
  // get dai price in eth
  const priceOracleAddress = await lendingPoolAddressesProvider.getPriceOracle();
  const priceOracle = await ethers.getContractAt(
    "IPriceOracle",
    priceOracleAddress,
    deployer
  );
  
  const priceOfDaiInEth = ethers.utils.formatEther(await priceOracle.getAssetPrice(process.env.DAI_ADDRESS));
  const amountToBeBorrowed = (ethers.utils.formatEther(availableBorrowsETH) / priceOfDaiInEth) * 0.95;

  console.log(`Borrowing ${amountToBeBorrowed} DAI...`);
  const txBorrow = await lendingPool.borrow(process.env.DAI_ADDRESS, ethers.utils.parseEther(amountToBeBorrowed.toString()), 1, 0, deployer);
  await txBorrow.wait(1);
  console.log(`Borrowed ✅`);
  
  // 3. Repay the DAI
  console.log(`Repaying ${amountToBeBorrowed} DAI...`);
  await approveErc20(process.env.DAI_ADDRESS, lendingPool.address, ethers.utils.parseEther((amountToBeBorrowed).toString()), deployer);
  const tx = await lendingPool.repay(
    process.env.DAI_ADDRESS,
    ethers.utils.parseEther((amountToBeBorrowed).toString()),
    1,
    deployer
  );
  await tx.wait(1);
  console.log('Repaid ✅');
}

async function approveErc20(erc20Address, spenderContract, amount, account) {
  const ecr20Token = await ethers.getContractAt('IERC20', erc20Address, account);
  const result = await ecr20Token.approve(spenderContract, amount);
  const receipt = await result.wait(1);
  return receipt;
}

async function getUserData(lendingPool, account) {
  const { totalCollateralETH, totalDebtETH, availableBorrowsETH } = await lendingPool.getUserAccountData(account);
  console.log(`Your total collateral is: ${ethers.utils.formatEther(totalCollateralETH)} ETH`);
  console.log(`Your total debt is: ${ethers.utils.formatEther(totalDebtETH)} ETH`);
  console.log(`Your available to borrow rate is: ${ethers.utils.formatEther(availableBorrowsETH)} ETH`);
  return { totalCollateralETH, totalDebtETH, availableBorrowsETH };
}

main()
.then(() => process.exit(1))
.catch(
  (error) => {
    console.log(error);
    process.exit(1);
  }
)
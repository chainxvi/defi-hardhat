const { run } = require('hardhat');

async function verify(contractAddress, args, contract) {
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
      contract,
    });
  } catch (error) {
    console.error(error)
  }
}

module.exports = {
  verify
};
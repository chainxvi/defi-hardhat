const { ethers } = require("hardhat");

module.exports = {
  networkConfig: {
    // rinkeby network config
    4: {
      name: 'rinkeby',
    },
    // goerli network config
    5: {
      name: 'goerli',
    },
    // hardhat network config
    1337: {
      name: 'hardhat',
    },
  },
  devChains: ['hardhat', 'localhost']
}
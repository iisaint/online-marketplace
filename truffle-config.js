const path = require("path");
const HDWalletProvider = require("truffle-hdwallet-provider");
const keys = require('./config/keys');

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    develop: {
      port: 8545
    },
    ganache: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 8545,            // Standard Ethereum port (default: none)
      network_id: "*",       // Any network (default: none)
    },
    ropsten: {
      provider: function() {
        return new HDWalletProvider(keys.mnemonic, keys.infura);
      },
      network_id: 3
    },
    rinkeby: {
      provider: function() {
        return new HDWalletProvider(keys.mnemonic, keys.infura);
      },
      network_id: 4
    }
  }
};

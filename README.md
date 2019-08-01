<!-- ABOUT THE PROJECT -->
## About The Project

Online Marketplace

There are a list of stores on a central marketplace where shoppers can purchase goods posted by the store owners.
 
The central marketplace is managed by a group of administrators. Admins allow store owners to add stores to the marketplace. Store owners can manage their store’s inventory and funds. Shoppers can visit stores and purchase goods that are in stock using cryptocurrency. 
 
### User Stories

* An administrator opens the web app. The web app reads the address and identifies that the user is an admin, showing them admin only functions, such as managing store owners. An admin adds an address to the list of approved store owners, so if the owner of that address logs into the app, they have access to the store owner functions.
 
* An approved store owner logs into the app. The web app recognizes their address and identifies them as a store owner. They are shown the store owner functions. They can create a new storefront that will be displayed on the marketplace. They can also see the storefronts that they have already created. They can click on a storefront to manage it. They can add/remove products to the storefront or change any of the products’ prices. They can also withdraw any funds that the store has collected from sales.
 
* A shopper logs into the app. The web app does not recognize their address so they are shown the generic shopper application. From the main page they can browse all of the storefronts that have been created in the marketplace. Clicking on a storefront will take them to a product page. They can see a list of products offered by the store, including their price and quantity. Shoppers can purchase a product, which will debit their account and send it to the store. The quantity of the item in the store’s inventory will be reduced by the appropriate amount.

* An approved store owner logs into the app. The store owner can toggle storefronts and products to open or close. Shoppers cannot see closed storefronts and closed products.

* An approved store owner logs into the app. They can withdraw their income (balances). The balance of the store owner will be reduced by the appropriate amount.

* Circuit Breakers. Admin can toggle contract active or deactivate. The forcedWithdraw function can be executed to force store owners to clean up their balance while deactivating. 

* A shopper logs into the app. The web app shows products which are purchased by the shopper.


<!-- GETTING STARTED -->
## Getting Started

To get a local copy up and running follow these simple steps.

### Prerequisites

* nodejs and npm, [here](https://nodejs.org/en/).

* truffle framework
```sh
npm install -g truffle
```
* ganache-cli
```sh
npm install -g ganache-cli
```


### How to run
 
1. Clone the repo
```sh
git clone https://github.com/iisaint/online-marketplace.git
```
2. Install NPM packages
```sh
npm install
```
3. Open a new terminal and run ganache-cli
```sh
ganache-cli
```
4. Switch back to previous terminal and connect to ganache-cli and run tests
```sh
$ mv ./config/dev_sample.js ./config/dev.js // see next section
$ truffle console --network=ganache
truffle(ganache)> compile
truffle(ganache)> migrate --reset
truffle(ganache)> test
truffle(ganache)> networks
```
5. Open a new terminal and start a dapp UI
```sh
$ cd client
$ yarn install
$ yarn start
```

### How to migrate to testnet (ropsten or rinkeby)
```sh
$ mv ./config/dev_sample.js ./config/dev.js
```
Fill in your infura url and mnemonic in ./config/dev.js
```javascriopt
// dev.js - don't commit this!!
module.exports = {
  infura: 'YOUR INFURA URI',
  mnemonic: 'YOUR SEED PHRASE',
};
```
```sh
$ truffle console --network=ropsten
truffle(ropsten)> compile
truffle(ropsten)> migrate --reset
truffle(ropsten)> networks
```

<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE` for more information.

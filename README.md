<!-- ABOUT THE PROJECT -->
## About The Project

Online Marketplace

There are a list of stores on a central marketplace where shoppers can purchase goods posted by the store owners.
 
The central marketplace is managed by a group of administrators. Admins allow store owners to add stores to the marketplace. Store owners can manage their store’s inventory and funds. Shoppers can visit stores and purchase goods that are in stock using cryptocurrency. 
 
### User Stories

* An administrator opens the web app. The web app reads the address and identifies that the user is an admin, showing them admin only functions, such as managing store owners. An admin adds an address to the list of approved store owners, so if the owner of that address logs into the app, they have access to the store owner functions.
 
* An approved store owner logs into the app. The web app recognizes their address and identifies them as a store owner. They are shown the store owner functions. They can create a new storefront that will be displayed on the marketplace. They can also see the storefronts that they have already created. They can click on a storefront to manage it. They can add/remove products to the storefront or change any of the products’ prices. They can also withdraw any funds that the store has collected from sales.
 
* A shopper logs into the app. The web app does not recognize their address so they are shown the generic shopper application. From the main page they can browse all of the storefronts that have been created in the marketplace. Clicking on a storefront will take them to a product page. They can see a list of products offered by the store, including their price and quantity. Shoppers can purchase a product, which will debit their account and send it to the store. The quantity of the item in the store’s inventory will be reduced by the appropriate amount.


<!-- GETTING STARTED -->
## Getting Started

To get a local copy up and running follow these simple steps.

### Prerequisites

* npm
```sh
npm install -g npm@latest
```
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
git clone https:://github.com/github_username/repo.git
```
2. Install NPM packages
```sh
npm install
```
3. Run ganache-cli on a new terminal
```sh
ganache-cli
```
4. Connect to ganache-cli and run tests
```sh
$ truffle console --network=ganache
truffle(ganache)> compile
truffle(ganache)> migrate --reset
truffle(ganache)> test
```
5. Start a dapp
```sh
$ cd client
$ yarn install
$ yarn start
```

<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE` for more information.

import React, { Component } from "react";
import MarketPlaceContract from "./contracts/MarketPlace.json";
import getWeb3 from "./utils/getWeb3";
import { Button, Table } from 'rimble-ui';

import "./App.css";

class App extends Component {
  constructor(props) {
    super(props);

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmitAdmin = this.handleSubmitAdmin.bind(this);
    this.handleCreateFront = this.handleCreateFront.bind(this);
    this.handleWithdraw = this.handleWithdraw.bind(this);
    this.handleBuyProduct = this.handleBuyProduct.bind(this);
    this.admin = this.admin.bind(this);

    this.state = { 
      web3: null, 
      accounts: null, 
      contract: null, 
      admin: null, 
      address: '', 
      name: '', 
      stores:[], 
      role: '' ,
      fronts: [],
      frontName: '',
      isOpen: false,
      product: '',
      price: 0,
      quantity: 0,
      isOpenProduct: false,
      amount: 0,
      balance: 0,
      items: [],
      buyAmount: 0,
    };
  }

  

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = MarketPlaceContract.networks[networkId];
      const instance = new web3.eth.Contract(
        MarketPlaceContract.abi,
        deployedNetwork && deployedNetwork.address,
      );

      console.log(instance);

      this.setState({ web3, accounts, contract: instance }, this.fetchInfo);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  fetchInfo = async () => {
    const { accounts, contract } = this.state;

    const admin = await contract.methods.admin().call();
    let role = '';
    if (accounts[0] === admin) {
      role = 'admin';
    } else if (await contract.methods.isStore(accounts[0]).call()) {
      role = 'owner';
    } else {
      role = 'shopper';
    }
    console.log(role);

    if (role === 'admin') {
      // get store list
      const storeCount = await contract.methods.getStoreCount().call();
      let stores = [];
      for (let i=0; i < storeCount; i++) {
        const store = await contract.methods.getStoreAtIndex(i).call();
        stores.push(store);
      }
      console.log(stores);
      this.setState({ admin, stores, role });
    } else if (role === 'owner') {
      // get balance of store
      const store = await contract.methods.getStoreDetail(accounts[0]).call();
      
      // get front list and product list
      const frontCount = await contract.methods.getFrontsCount(accounts[0]).call();
      let fronts = [];
      for (let i=0; i < frontCount; i++) {
        let front = await contract.methods.getFrontAtIndex(accounts[0], i).call();
        front.products = [];
        const productCount = await contract.methods.getProductsCount(accounts[0], front.name).call();
        for (let j=0; j < productCount; j++) {
          const product = await contract.methods.getProductAtIndex(accounts[0], front.name, j).call();
          front.products.push(product);
        }
        fronts.push(front);
      }
      console.log(fronts);
      this.setState({fronts, role, balance: store.balance });
    } else { // shopper
      // get all products
      let items = [];
      const storeCount = await contract.methods.getStoreCount().call();
      for (let i=0; i < storeCount; i++) {
        const store = await contract.methods.getStoreAtIndex(i).call();
        const frontCount = await contract.methods.getFrontsCount(store.owner).call();
        for (let j=0; j < frontCount; j++) {
          const front = await contract.methods.getFrontAtIndex(store.owner, j).call();
          if (front.isOpen) {
            const productCount = await contract.methods.getProductsCount(store.owner, front.name).call();
            for (let k=0; k < productCount; k++) {
              const product = await contract.methods.getProductAtIndex(store.owner, front.name, k).call();
              if (product.isOpen) {
                const item = {
                  owner: store.owner,
                  front: front.name,
                  product: product
                }
                items.push(item);
              }
            }
          }
        }
      }
      console.log(items);
      this.setState({ role, items });
    }
    
    
    
    // Get the value from the contract to prove it worked.
    // const response = await contract.methods.get().call();

    // Update state with the result.
    // this.setState({ storageValue: response });
  };

  handleInputChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;
    
    this.setState({
      [name]: value
    });
  }

  async handleSubmitAdmin(event) {
    event.preventDefault();

    const { web3, contract, accounts, address, name } = this.state;

    console.log(address);
    console.log(name);

    if (!web3.utils.isAddress(address)) {
      console.log('invalid address');
      return;
    }

    await contract.methods.createStore(address, name).send({from: accounts[0]});
    console.log(await contract.methods.getStoreDetail(address).call());

    const storeCount = await contract.methods.getStoreCount().call();
    let stores = [];
    for (let i=0; i < storeCount; i++) {
      const store = await contract.methods.getStoreAtIndex(i).call();
      stores.push(store);
    }
    console.log(stores);
    this.setState({ stores });
  }

  async handleSubmitOwner(event) {
    event.preventDefault();

    const { web3, contract, accounts, frontName, isOpen } = this.state;

    console.log(frontName);
    console.log(isOpen);
  }

  handleCreateFront = async () => {
    const { accounts, contract, frontName, isOpen } = this.state;
    await contract.methods.createFront(frontName, (isOpen === 'true')? true : false).send({from:accounts[0]});
    // update fronts list
    const frontCount = await contract.methods.getFrontsCount(accounts[0]).call();
    let fronts = [];
    for (let i=0; i < frontCount; i++) {
      const front = await contract.methods.getFrontAtIndex(accounts[0], i).call();
      fronts.push(front);
    }
    console.log(fronts);
    this.setState({fronts});
  }

  handleCreateProduct = async () => {
    const { accounts, contract, frontName, product, price, quantity, isOpenProduct } = this.state;
    await contract.methods.createProduct(frontName, product, parseInt(price), parseInt(quantity), (isOpenProduct === 'true')? true : false).send({from:accounts[0]});
    // update info
    const frontCount = await contract.methods.getFrontsCount(accounts[0]).call();
    let fronts = [];
    for (let i=0; i < frontCount; i++) {
      let front = await contract.methods.getFrontAtIndex(accounts[0], i).call();
      front.products = [];
      const productCount = await contract.methods.getProductsCount(accounts[0], front.name).call();
      for (let j=0; j < productCount; j++) {
        const product = await contract.methods.getProductAtIndex(accounts[0], front.name, j).call();
        front.products.push(product);
      }
      fronts.push(front);
    }
    console.log(fronts);
    this.setState({fronts});
  }

  handleWithdraw = async () => {
    const { accounts, contract, amount } = this.state;
    await contract.methods.withdraw(parseInt(amount)).send({from:accounts[0]});
    // update balance of store
    const store = await contract.methods.getStoreDetail(accounts[0]).call();
    this.setState({balance: store.balance});
  }

  handleBuyProduct = async (item) => {
    const { accounts, contract, buyAmount } = this.state;
    const value = parseInt(item.product.price) * parseInt(buyAmount);
    await contract.methods.buyProduct(item.owner, item.front, item.product.name, buyAmount).send({from: accounts[0], value: value});
    // update all products
    let items = [];
    const storeCount = await contract.methods.getStoreCount().call();
    for (let i=0; i < storeCount; i++) {
      const store = await contract.methods.getStoreAtIndex(i).call();
      const frontCount = await contract.methods.getFrontsCount(store.owner).call();
      for (let j=0; j < frontCount; j++) {
        const front = await contract.methods.getFrontAtIndex(store.owner, j).call();
        if (front.isOpen) {
          const productCount = await contract.methods.getProductsCount(store.owner, front.name).call();
          for (let k=0; k < productCount; k++) {
            const product = await contract.methods.getProductAtIndex(store.owner, front.name, k).call();
            if (product.isOpen) {
              const item = {
                owner: store.owner,
                front: front.name,
                product: product
              }
              items.push(item);
            }
          }
        }
      }
    }
    console.log(items);
    this.setState({ items });
  }

  admin() {
    return (
      <div>
      <form onSubmit={this.handleSubmitAdmin}>
      <label>
        Create Store - 
        owner address <input name="address" type="text" value={this.state.address} onChange={this.handleInputChange} />
        store name <input name="name" type="text" value={this.state.name} onChange={this.handleInputChange} />
      </label>
      <input type="submit" value="Submit" />
      </form>
      <div>
      <Table>
        <thead>
          <tr>
            <th>Owner</th>
            <th>Name</th>
            <th>Balance</th>
          </tr>
        </thead>
        <tbody>
          {this.state.stores.map(e =>  (
              <tr key={e.name}>
              <td>{e.owner}</td>
              <td>{e.name}</td>
              <td>{e.balance}</td>
              </tr>
            )
          )}
        </tbody>
      </Table>
      </div>
      </div>
    )
  }

  owner() {
    return (
      <div>
        <Table>
          <thead>
            <tr>
              <th>method</th>
              <th>inputs</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><Button size="medium" onClick={this.handleCreateFront}>createFront</Button></td>
              <td>
              frontName <input name="frontName" type="text" value={this.state.frontName} onChange={this.handleInputChange} /><br></br>
              isOpen <input name="isOpen" type="text" value={this.state.isOpen} onChange={this.handleInputChange} />
              </td>
            </tr>
            <tr>
              <td><Button size="medium" onClick={this.handleCreateProduct}>createProduct</Button></td>
              <td>
              frontName <input name="frontName" type="text" value={this.state.frontName} onChange={this.handleInputChange} /><br></br>
              product <input name="product" type="text" value={this.state.product} onChange={this.handleInputChange} /><br></br>
              price <input name="price" type="text" value={this.state.price} onChange={this.handleInputChange} /><br></br>
              quantity <input name="quantity" type="text" value={this.state.quantity} onChange={this.handleInputChange} /><br></br>
              isOpen <input name="isOpenProduct" type="text" value={this.state.isOpenProduct} onChange={this.handleInputChange} /><br></br>
              </td>
            </tr>
            <tr>
              <td><Button size="medium" onClick={this.handleWithdraw}>withdraw</Button></td>
              <td>
              amount <input name="amount" type="text" value={this.state.amount} onChange={this.handleInputChange} /><br></br>
              current balance: {this.state.balance}
              </td>
            </tr>
          </tbody>
        </Table>
        <br></br>
        <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>isOpen</th>
            <th>products</th>
          </tr>
        </thead>
        <tbody>
          {this.state.fronts.map(e =>  (
              <tr key={e.name}>
              <td>{e.name}</td>
              <td>{(e.isOpen)? 'true': 'false'}</td>
              <td>
                { e.products.map(p => (
                  <li key={p.name}>{`${p.name}, ${p.price}, ${p.quantity}, ${p.sales}, ${p.isOpen}`}</li>
                ))}
              </td>
              </tr>
            )
          )}
        </tbody>
      </Table>
      </div>
    )
  }

  shopper() {
    return (
      <div>
        <Table>
        <thead>
          <tr>
            <th>Owner</th>
            <th>Front</th>
            <th>Product</th>
            <th>price</th>
            <th>available</th>
            <th>sales</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {this.state.items.map(e =>  (
              <tr key={e.owner + e.front + e.product.name}>
              <td>{e.owner}</td>
              <td>{e.front}</td>
              <td>{e.product.name}</td>
              <td>{e.product.price}</td>
              <td>{parseInt(e.product.quantity) - parseInt(e.product.sales)}</td>
              <td>{e.product.sales}</td>
              <td>
              amount <input name="buyAmount" type="text" value={this.state.buyAmount} onChange={this.handleInputChange} /><br></br>
                <Button size="medium" onClick={this.handleBuyProduct.bind(this, e)}>Buy</Button>
              </td>
              </tr>
            )
          )}
        </tbody>
      </Table>
      </div>
    )
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    let operatons;
    switch (this.state.role) {
      case 'admin':
        operatons = this.admin();
        break;
      case 'owner': 
        operatons = this.owner();
        break;
      default:
        operatons = this.shopper();
    }

    return (
      <div className="App">
        <h1>Market Place</h1>
        <p>Contract Address: {this.state.contract._address}</p>
        <p>Current User: {this.state.accounts[0]}</p>
        <p>Role: {this.state.role}</p>
        {operatons}
        
      </div>
    );
  }
}

export default App;

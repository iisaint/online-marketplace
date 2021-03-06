pragma solidity ^0.5.0;

import "./Adminable.sol";
import "./SafeMath.sol";

/** @title Online Marketplace. */
contract MarketPlace is Adminable {
  using SafeMath for uint256;
  struct Product {
    string name;
    uint price;
    uint quantity;
    uint sales;
    bool isOpen;
    mapping(address => uint) shoppers;
  }
  
  struct Front {
    string name;
    bool isOpen;
    string[] productKeys;
    mapping(string => bool) isProduct;
    mapping(string => Product) products;
  }
  
  struct Store {
    string name;
    uint balance;
    string[] frontKeys;
    mapping(string => bool) isFront;
    mapping(string => Front) fronts;  
  }

  mapping(address => bool) public isStore;
  mapping(address => Store) public stores;
  address[] public storeKeys;
  
  // modifier onlyAdmin() {
  //   require(msg.sender == admin, "caller is not admin");
  //   _;
  // }
  
  modifier onlyStoreOwner() {
    require(isStore[msg.sender], "caller is not store owner");
    _;
  }

  modifier storeExist(address _owner) {
    require(isStore[_owner], "the store does not exist.");
    _;
  }
  
  event LogNewStore(address indexed owner, string name);
  event LogNewFront(address indexed owner, string front);
  event LogNewProduct(address indexed owner, string front, string product);
  event LogBuyProduct(address indexed shopper, address owner, string front, string product, uint amount);
  event LogWithdraw(address indexed owner, uint newBalance);
  
  constructor() public {
      // admin = msg.sender;
  }
  
  /** @dev Create a store by admin.
    * @param _owner address of store owner.
    * @param _name a unique name of store.
    */
  function createStore(address _owner, string memory _name) public onlyAdmin stopInEmergency {
      require(!isStore[_owner], "duplicate store.");
      isStore[_owner] = true;
      stores[_owner] = Store(_name, 0, new string[](0));
      storeKeys.push(_owner);
      emit LogNewStore(_owner, _name);
  }
  
  /** @dev Create a storefront by store owner .
    * @param _name a unique name of storefront.
    * @param _isOpen is the storefront available or not.
    */
  function createFront(string memory _name, bool _isOpen) public onlyStoreOwner stopInEmergency {
      require(!stores[msg.sender].isFront[_name], "front name is already created.");
      Store storage store = stores[msg.sender];
      store.isFront[_name] = true;
      store.fronts[_name] = Front(_name, _isOpen, new string[](0));
      store.frontKeys.push(_name);
      emit LogNewFront(msg.sender, _name);
  }

  /** @dev Toggle storefront isOpen for shoppers.
    * @param _name a unique name of storefront.
    */
  function toggleFrontActive(string memory _name) public onlyStoreOwner stopInEmergency {
    require(stores[msg.sender].isFront[_name], "front name doesn't exist.");
    Store storage s = stores[msg.sender];
    Front storage f = s.fronts[_name];
    f.isOpen = !f.isOpen;
  }
  
  /** @dev Create a product of storefront by store owner .
    * @param _front the name of storefront.
    * @param _product a unique name of product.
    * @param _price price of product.
    * @param _quantity quantity of product.
    * @param _isOpen is the product available or not.
    */
  function createProduct(string memory _front, string memory _product, uint _price, uint _quantity, bool _isOpen) public onlyStoreOwner stopInEmergency {
      Store storage s = stores[msg.sender];
      require(s.isFront[_front], "front doesn't exist.");
      Front storage f = s.fronts[_front];
      require(!f.isProduct[_product], "product name is already created.");
      f.isProduct[_product] = true;
      f.products[_product] = Product(_product, _price, _quantity, 0, _isOpen);
      f.productKeys.push(_product);
      emit LogNewProduct(msg.sender, _front, _product);
  }

  /** @dev Toggle the product of storefront isOpen for shoppers.
    * @param _front a unique name of storefront.
    * @param _product a unique name of product.
    */
  function toggleFrontActive(string memory _front, string memory _product) public onlyStoreOwner stopInEmergency {
    require(stores[msg.sender].isFront[_front], "front name doesn't exist.");
    Store storage s = stores[msg.sender];
    Front storage f = s.fronts[_front];
    require(f.isProduct[_product], "product name doesn't exist.");
    Product storage p = f.products[_product];
    p.isOpen = !p.isOpen;
  }
  
  /** @dev Store owner can withdraw his balance.
    * @param _amount amount of balance to be withdraw.
    */
  function withdraw(uint _amount) public onlyStoreOwner stopInEmergency {
      require(_amount <= stores[msg.sender].balance, "insufficient balance.");
      stores[msg.sender].balance = stores[msg.sender].balance.sub(_amount);
      msg.sender.transfer(_amount);
      emit LogWithdraw(msg.sender, stores[msg.sender].balance);
  }

  /** @dev Force store owners to withdraw their balance.
    * @param _owner address of store owner.
    */
  function forcedWithdraw(address payable _owner) public onlyAdmin onlyInEmergency {
    require(stores[_owner].balance > 0, "the balance is zero.");
    uint amount = stores[_owner].balance;
    stores[_owner].balance = 0;
    _owner.transfer(amount);
  }
  
  /** @dev Shopper can purches a product.
    * @param _owner the address of store owner.
    * @param _front the unique name of storefront.
    * @param _product the unique name of product.
    * @param _amount purches amount of product.
    */
  function buyProduct(address _owner, string memory _front, string memory _product, uint _amount) public payable stopInEmergency {
      require(isStore[_owner], "the store doesn't exist.");
      Store storage s = stores[_owner];
      require(s.isFront[_front], "the front doesn't exist.");
      Front storage f = s.fronts[_front];
      require(f.isOpen, "the front is not open.");
      require(f.isProduct[_product], "the product doesn't exist.");
      Product storage p = f.products[_product];
      require(p.isOpen, "the product is not open.");
      require(_amount <= p.quantity, "out of amount.");
      require(msg.value >= _amount * p.price, "not enough value.");
      uint refund = msg.value.sub(_amount.mul(p.price));
      if (refund > 0) {
          msg.sender.transfer(refund);
      }
      p.quantity = p.quantity.sub(_amount);
      p.sales = p.sales.add(_amount);
      p.shoppers[msg.sender] = p.shoppers[msg.sender].add(_amount);
      s.balance = s.balance.add(msg.value.sub(refund));
      emit LogBuyProduct(msg.sender, _owner, _front, _product, _amount);
  }
  
  /** @dev Get store count.
    * @return The store count.
    */
  function getStoreCount() public view returns(uint) {
    return storeKeys.length;
  }

  /** @dev Get a store information by index.
    * @param _index a index of store.
    * @return owner The address of store owner.
    * @return name The name of store.
    * @return balance The balance of store.
    */
  function getStoreAtIndex(uint _index) public view returns(address owner, string memory name, uint balance) {
    require(_index < storeKeys.length, "out of index.");
    owner = storeKeys[_index];
    name = stores[storeKeys[_index]].name;
    balance = stores[storeKeys[_index]].balance;
  }

  /** @dev Get a store information by address.
    * @param _owner an address of store owner.
    * @return name The name of store.
    * @return balance The balance of store.
    */
  function getStoreDetail(address _owner) public view returns(string memory name, uint balance) {
    require(isStore[_owner], "the owner's store doesn't exist");
    name = stores[_owner].name;
    balance = stores[_owner].balance;
  }
  
  /** @dev Get storefront count.
    * @param _owner the address of store owner.
    * @return The storefront count.
    */
  function getFrontsCount(address _owner) public view returns(uint) {
      require(isStore[_owner], "the owner's store doesn't exist");
      return stores[_owner].frontKeys.length;
  }
  
  /** @dev Get a storefront information by index.
    * @param _owner the address of store owner.
    * @param _index a index of storefront.
    * @return name The name of storefront.
    * @return isOpen The status of storefront.
    */
  function getFrontAtIndex(address _owner, uint _index) public view returns(string memory name, bool isOpen) {
      require(isStore[_owner], "the owner's store doesn't exist");
      Store storage s = stores[_owner];
      require(_index < s.frontKeys.length, "out of index.");
      Front memory f = s.fronts[s.frontKeys[_index]];
      name = f.name;
      isOpen = f.isOpen;
  }
  
  /** @dev Get product count of a storefront.
    * @param _owner the address of store owner.
    * @param _front the unique name of storefront.
    * @return The product count of the storefront.
    */
  function getProductsCount(address _owner, string memory _front) public view returns(uint) {
      require(isStore[_owner], "the owner's store doesn't exist");
      Store storage s = stores[_owner];
      require(s.isFront[_front], "the owner's front doesn't exist");
      Front memory f = s.fronts[_front];
      return f.productKeys.length;
  }
  
  /** @dev Get a product information by index.
    * @param _owner the address of store owner.
    * @param _front the unique name of storefront.
    * @param _index a index of product of storefront.
    * @return name The name of product.
    * @return price The price of product.
    * @return quantity The quantity of product.
    * @return sales The sales of product.
    * @return isOpen The status of product.
    */
  function getProductAtIndex(address _owner, string memory _front, uint _index) public view returns(string memory name, uint price, uint quantity, uint sales, bool isOpen) {
      require(isStore[_owner], "the owner's store doesn't exist");
      Store storage s = stores[_owner];
      require(s.isFront[_front], "the owner's front doesn't exist");
      Front storage f = s.fronts[_front];
      Product memory p = f.products[f.productKeys[_index]];
      name = p.name;
      price = p.price;
      quantity = p.quantity;
      sales = p.sales;
      isOpen = p.isOpen;
  }

  function getShopperProducts(address _owner, string memory _front, string memory _product, address _shopper) public view returns(uint amount) {
    require(isStore[_owner], "the owner's store doesn't exist");
    Store storage s = stores[_owner];
    require(s.isFront[_front], "the owner's front doesn't exist");
    Front storage f = s.fronts[_front];
    Product storage p = f.products[_product];
    amount = p.shoppers[_shopper];
  }
  
  /** @dev Fallback function which reverts all tx.
    */
  function () external payable {
      revert();
  }
}
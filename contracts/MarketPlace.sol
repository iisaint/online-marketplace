pragma solidity ^0.5.0;

import "./Adminable.sol";

/** @title Online Marketplace. */
contract MarketPlace is Adminable {
  struct Product {
    string name;
    uint price;
    uint quantity;
    uint sales;
    bool isOpen;
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
      require(!stores[msg.sender].isFront[_name]);
      Store storage store = stores[msg.sender];
      store.isFront[_name] = true;
      store.fronts[_name] = Front(_name, _isOpen, new string[](0));
      store.frontKeys.push(_name);
      emit LogNewFront(msg.sender, _name);
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
      require(s.isFront[_front]);
      Front storage f = s.fronts[_front];
      require(!f.isProduct[_product]);
      f.isProduct[_product] = true;
      f.products[_product] = Product(_product, _price, _quantity, 0, _isOpen);
      f.productKeys.push(_product);
      emit LogNewProduct(msg.sender, _front, _product);
  }
  
  /** @dev Store owner can withdraw his balance.
    * @param _amount amount of balance to be withdraw.
    */
  function withdraw(uint _amount) public onlyStoreOwner stopInEmergency {
      require(_amount <= stores[msg.sender].balance);
      stores[msg.sender].balance -= _amount;
      msg.sender.transfer(_amount);
      emit LogWithdraw(msg.sender, stores[msg.sender].balance);
  }

  /** @dev Force store owners to withdraw their balance.
    * @param _owner address of store owner.
    */
  function forcedWithdraw(address payable _owner) public onlyAdmin onlyInEmergency {
    uint amount = stores[msg.sender].balance;
    stores[msg.sender].balance = 0;
    _owner.transfer(amount);
  }
  
  /** @dev Shopper can purches a product.
    * @param _owner the address of store owner.
    * @param _front the unique name of storefront.
    * @param _product the unique name of product.
    * @param _amount purches amount of product.
    */
  function buyProduct(address _owner, string memory _front, string memory _product, uint _amount) public payable stopInEmergency {
      require(isStore[_owner]);
      Store storage s = stores[_owner];
      require(s.isFront[_front]);
      Front storage f = s.fronts[_front];
      require(f.isOpen);
      require(f.isProduct[_product]);
      Product storage p = f.products[_product];
      require(p.isOpen);
      require(_amount + p.sales <= p.quantity);
      require(msg.value >= _amount * p.price);
      p.sales += _amount;
      uint refund = msg.value - _amount * p.price;
      if (refund > 0) {
          msg.sender.transfer(refund);
      }
      s.balance += msg.value - refund;
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
    require(_index < storeKeys.length);
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
    require(isStore[_owner]);
    name = stores[_owner].name;
    balance = stores[_owner].balance;
  }
  
  /** @dev Get storefront count.
    * @param _owner the address of store owner.
    * @return The storefront count.
    */
  function getFrontsCount(address _owner) public view returns(uint) {
      require(isStore[_owner]);
      return stores[_owner].frontKeys.length;
  }
  
  /** @dev Get a storefront information by index.
    * @param _owner the address of store owner.
    * @param _index a index of storefront.
    * @return name The name of storefront.
    * @return isOpen The status of storefront.
    */
  function getFrontAtIndex(address _owner, uint _index) public view returns(string memory name, bool isOpen) {
      require(isStore[_owner]);
      Store storage s = stores[_owner];
      require(_index < s.frontKeys.length);
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
      require(isStore[_owner]);
      Store storage s = stores[_owner];
      require(s.isFront[_front]);
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
      require(isStore[_owner]);
      Store storage s = stores[_owner];
      require(s.isFront[_front]);
      Front storage f = s.fronts[_front];
      Product memory p = f.products[f.productKeys[_index]];
      name = p.name;
      price = p.price;
      quantity = p.quantity;
      sales = p.sales;
      isOpen = p.isOpen;
  }
  
  /** @dev Fallback function which reverts all tx.
    */
  function () external payable {
      revert();
  }
}
const MarketPlace = artifacts.require("./MarketPlace.sol");
let catchRevert = require("./exceptionsHelpers.js").catchRevert;
const BN = web3.utils.BN;

contract("MarketPlace", accounts => {
  let MarketPlaceInstance;
  const admin = accounts[0];
  const notAdmin = accounts[1];
  const owner1 = accounts[2];
  const owner2 = accounts[3];
  const shopper = accounts[4];
  const store = "Store A";
  const store2 = "Store B";
  const front = "Front 1";
  const front2 = "Front 2";
  const product = {
    name: "P001",
    price: 100,
    quantity: 100,
    sales: 0,
    isOpen: true
  }
  const product2 = {
    name: "P002",
    price: 100,
    quantity: 100,
    sales: 0,
    isOpen: true
  }
  
  
  beforeEach(async() => {
    MarketPlaceInstance = await MarketPlace.deployed();
  });
  
  it("...should revert to create a store by others", async () => {
    // Add a store owner by notAdmin
    await catchRevert(MarketPlaceInstance.createStore(owner1, store, { from: notAdmin}));
  });
  
  it("...should create a store by admin.", async () => {
    // Add a store owner by admin
    const tx = await MarketPlaceInstance.createStore(owner1, store, { from: admin });
    assert.equal(tx.logs[0].event, "LogNewStore", "the created event should be emitted.");
    assert.equal(tx.logs[0].args.owner, owner1, "the created event address should match.");
    assert.equal(tx.logs[0].args.name, store, "the created event address should match.");

    // Get the store owner count
    const count = await MarketPlaceInstance.getStoreCount();
    assert.equal(count, 1, "the store count should match.");

    // Get the store owner
    const storeInfo = await MarketPlaceInstance.getStoreDetail(owner1);
    assert.equal(storeInfo.name, store, "the name should match.");
    assert.equal(storeInfo.balance.toString(), "0", "the balance should match.");
  });
  
  it("...should revert to create the same store twice.", async () => {
    await catchRevert(MarketPlaceInstance.createStore(owner1, store, { from: admin }));
  });

  it("...should revert to create a front by others", async () => {
    await catchRevert(MarketPlaceInstance.createFront(front, true, { from: admin }));
  });

  it("...should create a front by store owner", async() => {
    // Create a front by store onwer
    const tx = await MarketPlaceInstance.createFront(front, true, { from: owner1 });
    const event = tx.logs[0];
    assert.equal(event.event, "LogNewFront", "the created event should be emitted.");
    assert.equal(event.args.owner, owner1, "the created event store owner should match.");
    assert.equal(event.args.front, front, "the created event front should match.");

    // Get the front count
    const count = await MarketPlaceInstance.getFrontsCount(owner1);
    assert.equal(count, 1, "the frount count should match.");

    // Get front info from storeOwner
    for(let i = 0; i < count; i++ ) {
      const storefront = await MarketPlaceInstance.getFrontAtIndex(owner1, i);
      assert.equal(storefront.name, front, "the front name should match.");
      assert.equal(storefront.isOpen, true, "the front isOpen should match.");
    }
  });

  it("...should revert to create a product by others", async () => {
    await catchRevert(MarketPlaceInstance.createProduct(front, product.name, product.price, product.quantity, product.isOpen, { from: owner2 }));
  });

  it("...should revert to create a product from a non-exist front", async () => {
    await catchRevert(MarketPlaceInstance.createProduct(front2, product.name, product.price, product.quantity, product.isOpen, { from: owner1 }));
  });

  it("...should create a product by store owner.", async () => {
    // Create a product by store owner
    const tx = await MarketPlaceInstance.createProduct(front, product.name, product.price, product.quantity, product.isOpen, { from: owner1 });
    const event = tx.logs[0];
    assert.equal(event.event, "LogNewProduct", "the created event should be emitted.");
    assert.equal(event.args.owner, owner1, "the created event store owner should match.");
    assert.equal(event.args.front, front, "the created event front should match.");
    assert.equal(event.args.product, product.name, "the created event product should match.");

    // Get the product count
    const count = await MarketPlaceInstance.getProductsCount(owner1, front);
    assert.equal(count, 1, "the product count should match.");

    // Get product info from front
    for(let i = 0; i < count; i++ ) {
      const productInfo = await MarketPlaceInstance.getProductAtIndex(owner1, front, i);
      assert.equal(productInfo.name, product.name, "the product name should match.");
      assert.equal(productInfo.price, product.price, "the product price should match.");
      assert.equal(productInfo.quantity, product.quantity, "the product quantity should match.");
      assert.equal(productInfo.sales, product.sales, "the product sales should match.");
      assert.equal(productInfo.isOpen, product.isOpen, "the product isOpen should match.");
    }
  });

  it("...should success to buyProduct", async () => {
    const tx = await MarketPlaceInstance.buyProduct(owner1, front, product.name, 1, { from: shopper, value: product.price});
    const event = tx.logs[0];
    assert.equal(event.event, "LogBuyProduct", "the created event should be emitted.");
    assert.equal(event.args.shopper, shopper, "the created event shopper should match.");
    assert.equal(event.args.owner, owner1, "the created event store owner should match.");
    assert.equal(event.args.front, front, "the created event front should match.");
    assert.equal(event.args.product, product.name, "the created event product should match.");
    assert.equal(event.args.amount, 1, "the created event buy amount should match.");

    const productInfo = await MarketPlaceInstance.getProductAtIndex(owner1, front, 0);

    assert.equal(productInfo.sales.toString(), "1", "the sales should be 1");
    assert.equal(productInfo.quantity.toString(), "99", "the sales should be 99");

    const shopperProduct = await MarketPlaceInstance.getShopperProducts(owner1, front, product.name, shopper);
    assert.equal(shopperProduct.toString(), "1", "the shopper's product amount should be 1");
  });

  it("...should fail to toggleContractActive by not admin", async () => {
    await catchRevert(MarketPlaceInstance.toggleContractActive({ from: owner2 }));
  });

  it("...should fail to forcedWithdraw when onlyInEmergency", async () => {
    await catchRevert(MarketPlaceInstance.forcedWithdraw(owner1, { from: admin }));
  });

  it("...should success to toggleContractActive by admin", async () => {
    await MarketPlaceInstance.toggleContractActive({ from: admin });
  });

  it("...should success to forcedWithdraw", async () => {
    await MarketPlaceInstance.forcedWithdraw(owner1, { from: admin });
  });

  it("...should fail to execute stopInEmergency functions while emergency", async () => {
    await catchRevert(MarketPlaceInstance.createStore(owner1, store2, { from: admin }));
    await catchRevert(MarketPlaceInstance.createFront(front2, true, { from: owner1 }));
    await catchRevert(MarketPlaceInstance.createProduct(front, product2.name, product2.price, product2.quantity, product2.isOpen, { from: owner1 }));
  });
});

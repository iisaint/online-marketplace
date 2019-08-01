* Avoid Reentrancy on the withdraw and forcedWithdraw functions of MarketPlace.sol
```javascript
function withdraw(uint _amount) public onlyStoreOwner stopInEmergency {
      require(_amount <= stores[msg.sender].balance);
      stores[msg.sender].balance -= _amount;
      msg.sender.transfer(_amount); // store owner's balance is already subtracted
      emit LogWithdraw(msg.sender, stores[msg.sender].balance);
  }

function forcedWithdraw(address payable _owner) public onlyAdmin onlyInEmergency {
    uint amount = stores[msg.sender].balance;
    stores[msg.sender].balance = 0; // store owner's balance is already 0
    _owner.transfer(amount);
  }
```

* Avoid overflow or underflow by using SafeMath library

* There is no DoS with (Unexpected) revert vulnerability
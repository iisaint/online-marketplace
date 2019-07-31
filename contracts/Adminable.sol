pragma solidity ^0.5.0;

contract Adminable {
  bool private stopped = false;
  address payable public admin;

  modifier onlyAdmin() {
    require(msg.sender == admin, "caller is not admin.");
    _;
  }

  modifier stopInEmergency() { 
    require(!stopped, "stop in emergency");
    _; 
  }
  modifier onlyInEmergency() { 
    require(stopped, "only in emergency");
     _; 
  }

  constructor() public {
    admin = msg.sender;
  }

  function toggleContractActive() onlyAdmin public {
    // You can add an additional modifier that restricts stopping a contract to be based on another action, such as a vote of users
    stopped = !stopped;
  }

  

}
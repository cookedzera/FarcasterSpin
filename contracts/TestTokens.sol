// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TestToken
 * @dev Simple mintable test token for the ArbCasino game
 */
contract TestToken is ERC20, Ownable {
    uint8 private _decimals;
    
    constructor(
        string memory name,
        string memory symbol,
        uint8 decimalsValue,
        uint256 initialSupply
    ) ERC20(name, symbol) Ownable(msg.sender) {
        _decimals = decimalsValue;
        _mint(msg.sender, initialSupply * 10**decimalsValue);
    }
    
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
    
    // Allow owner to mint more tokens for testing
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
    
    // Allow anyone to get some test tokens (faucet functionality)
    function faucet(uint256 amount) public {
        require(amount <= 1000 * 10**_decimals, "Maximum 1000 tokens per faucet");
        _mint(msg.sender, amount);
    }
}

/**
 * @title AIDOGE Test Token
 */
contract AIDOGETest is TestToken {
    constructor() TestToken("AIDOGE Test", "AIDOGE", 18, 1000000) {}
}

/**
 * @title BOOP Test Token  
 */
contract BOOPTest is TestToken {
    constructor() TestToken("BOOP Test", "BOOP", 18, 1000000) {}
}

/**
 * @title BOBOTRUM Test Token
 */
contract BOBOTRUMTest is TestToken {
    constructor() TestToken("BOBOTRUM Test", "BOBOTRUM", 18, 1000000) {}
}
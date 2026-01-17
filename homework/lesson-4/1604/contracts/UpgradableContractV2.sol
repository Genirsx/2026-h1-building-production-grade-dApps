// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

/**
 * @title UpgradableContractV2
 * @dev Upgraded version with additional functionality
 */
contract UpgradableContractV2 is Initializable, UUPSUpgradeable, OwnableUpgradeable {
    uint256 public value;
    string public name;
    uint256 public newValue;
    bool public newFeatureEnabled;

    constructor() { _disableInitializers(); }

    // 保留 V1 的 initialize（但通常不再使用）
    function initialize(string memory, uint256) public initializer {
        revert("Use V1 initializer only");
    }

    // 新初始化函数
    function initializeV2() public reinitializer(2) {
        newFeatureEnabled = true;
    }

    function setValue(uint256 _value) public {
        value = _value; 
    }

    function setName(string memory _name) public onlyOwner { 
        name = _name; 
    }

    function setNewValue(uint256 _newValue) public { 
        newValue = _newValue; 
    }

    function _authorizeUpgrade(address) internal override onlyOwner {}
}
// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

/**
 * @title utils String Converter contract
 * @author jistro.eth
 * @notice this contract is used to decode the signature message and return the data
 */

import "@openzeppelin/contracts/utils/Strings.sol";
abstract contract StringConverter {
    function addressToString(address _address) internal pure returns (string memory) {
        bytes32 _bytes = bytes32(uint256(uint160(_address)));
        bytes memory HEX = "0123456789abcdef";
        bytes memory _string = new bytes(42);
        _string[0] = "0";
        _string[1] = "x";
        for (uint256 i = 0; i < 20; i++) {
            _string[2 + i * 2] = HEX[uint8(_bytes[i + 12] >> 4)];
            _string[3 + i * 2] = HEX[uint8(_bytes[i + 12] & 0x0f)];
        }
        return string(_string);
    }

    function uintToString (uint256 _uint) internal pure returns (string memory) {
        return Strings.toString(_uint);
    }

    function boolToString(bool _bool) internal pure returns (string memory) {
        if (_bool) {
            return "true";
        } else {
            return "false";
        }
    }

}

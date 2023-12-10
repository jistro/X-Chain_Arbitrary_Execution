// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CCIP's encodeWithSignature receiver message decoder
 * @author jistro.eth
 * @notice this contract is used to decode the signature message and return the data
 */

abstract contract DecodeMsgSig {
    /**
     *  @notice the function decodeSignatureMsgToString is used to decode the signature message and return the data
     *          in a string array, the function is made only for CCIP receiver messages
     *  @param symbolBeginAndEndString define the symbol that will be used to define the begin and the end of the string
     *  @param symbolSeparator define the symbol that will be used to separate the data
     *  @param dataEncoded is for the encodeWithSignature data
     *  @param numberOfData the number foreach variable that will be returned
     *  @return return the data in a list of string
     */
    function decodeSignatureMsgToString(
        string memory symbolBeginAndEndString,//quitar 
        string memory symbolSeparator,
        bytes memory dataEncoded,
        uint256 numberOfData
    ) internal pure returns (
        //bytes memory, 
        //string memory, 
        string[] memory,
        uint256 whereIsSignedMetadata
    ) {
        bool finished = false;
        bool hasSignedData = false;
        uint256 _index = 0;
        uint256 _indexStorageVar = 0;

        (/*bytes memory dataString*/, string memory allText) = getString(dataEncoded);

        string memory character = string(abi.encodePacked(getCharacterByCharacter(allText, _index)));
        
        if (keccak256(abi.encodePacked(character)) != keccak256(abi.encodePacked(symbolBeginAndEndString))) {
            revert();
        }
        string[] memory sectionsData = new string[](numberOfData+3);
        do {
            _index++;
            character = string(abi.encodePacked(getCharacterByCharacter(allText, _index)));
            if (keccak256(abi.encodePacked(character)) == keccak256(abi.encodePacked(symbolBeginAndEndString))) {
                finished = true;
            } else {
                if (keccak256(abi.encodePacked(character)) != keccak256(abi.encodePacked(symbolSeparator))) {
                    if (keccak256(abi.encodePacked(character)) == keccak256(abi.encodePacked("|"))) {
                        hasSignedData = true;
                        _indexStorageVar++;
                        whereIsSignedMetadata = _indexStorageVar;
                    } else {
                        sectionsData[_indexStorageVar] = string.concat(sectionsData[_indexStorageVar], character);
                    }
                } else {
                    _indexStorageVar++;
                }
            }
        } while (!finished);

        if (hasSignedData == false){
            revert();
        }

        return (/*dataString, allText, */sectionsData, whereIsSignedMetadata);
    }

    /// @notice the function decodeSignatureMsgToBytes is used to decode the signature message and return the data
    function getString(bytes memory data) internal pure returns (bytes memory, string memory) {
        bytes memory result = new bytes(data.length - 68);

        for (uint256 i = 0; i < data.length - 68; i++) {
            result[i] = data[i + 68];
        }

        string memory resultTostring = string(result);

        return (data, resultTostring);
    }

    /// @notice the function getCharacterByCharacter is used to get a character from a string
    function getCharacterByCharacter(string memory str, uint256 index) internal pure returns (bytes1) {
        bytes memory strBytes = bytes(str);
        return strBytes[index];
    }

    function convertStringToAddress(string memory _address) internal pure returns (address) {
        bytes memory tmp = bytes(_address);
        uint160 iaddr = 0;
        uint160 b1;
        uint160 b2;
        for (uint256 i = 2; i < 2 + 2 * 20; i += 2) {
            iaddr *= 256;
            b1 = uint160(uint8(tmp[i]));
            b2 = uint160(uint8(tmp[i + 1]));
            if ((b1 >= 97) && (b1 < 103)) {
                b1 -= 87;
            } else if ((b1 >= 65) && (b1 < 71)) {
                b1 -= 55;
            } else if ((b1 >= 48) && (b1 < 58)) {
                b1 -= 48;
            }
            if ((b2 >= 97) && (b2 < 103)) {
                b2 -= 87;
            } else if ((b2 >= 65) && (b2 < 71)) {
                b2 -= 55;
            } else if ((b2 >= 48) && (b2 < 58)) {
                b2 -= 48;
            }
            iaddr += (b1 * 16 + b2);
        }
        return address(iaddr);
    }

    function convertStringToUint(string memory _str) internal pure returns (uint256 res, bool err) {
        for (uint256 i = 0; i < bytes(_str).length; i++) {
            if ((uint8(bytes(_str)[i]) - 48) < 0 || (uint8(bytes(_str)[i]) - 48) > 9) {
                return (0, false);
            }
            res += (uint8(bytes(_str)[i]) - 48) * 10 ** (bytes(_str).length - i - 1);
        }
        return (res, true);
    }

    function convertStringToBool(string memory _str) internal pure returns (bool res) {
        if (keccak256(abi.encodePacked(_str)) == keccak256(abi.encodePacked("true"))) {
            return true;
        } else {
            return false;
        }
    }
}

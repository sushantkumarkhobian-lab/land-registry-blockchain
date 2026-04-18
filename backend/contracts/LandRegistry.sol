// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// Using OpenZeppelin v4.9.0 for Ganache compatibility
import "@openzeppelin/contracts@4.9.0/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts@4.9.0/access/Ownable.sol";

contract LandRegistry is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    // In OpenZeppelin 4.x, Ownable constructor takes no arguments
    constructor() ERC721("LandRegistry", "LAND") {}

    /**
     * @dev Mints a new land token.
     * @param to The address that will own the minted token.
     * @param uri The IPFS CID or metadata URI.
     * @return The ID of the newly minted token.
     */
    function mintLand(address to, string memory uri) public onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        return tokenId;
    }

    /**
     * @dev Overrides the transfer function to allow the Admin (Government) to move land tokens.
     * Only the contract owner (Admin) can call this function.
     */
    function transferLand(address from, address to, uint256 tokenId) public onlyOwner {
        // Force transfer by Admin - bypasses user approval for government processing
        _transfer(from, to, tokenId);
    }
}

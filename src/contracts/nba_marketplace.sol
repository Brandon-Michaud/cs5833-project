// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Marketplace {
    struct Card {
        uint id;
        string name;
        uint price;
        address payable owner;
        bool isListed;
    }

    Card[] private cards;
    mapping(uint => string) public transactionHashes;

    event CardListed(uint cardId, address owner, uint price, string transactionHash);

    function listCard(string memory _name, uint _price) public returns (uint cardId) {
        require(_price > 0, "Price must be greater than zero");
        cardId = cards.length;
        Card memory newCard = Card(cardId, _name, _price, payable(msg.sender), true);
        cards.push(newCard);
        emit CardListed(cardId, msg.sender, _price, "Initial hash or other identifier");
    }

    function buyCard(uint _cardId) public payable {
        Card storage card = cards[_cardId];
        require(card.isListed, "Card must be listed for sale");
        require(msg.value >= card.price, "Value sent is not enough");
        require(card.owner != msg.sender, "Owner cannot buy their own card");

        card.owner.transfer(msg.value);
        card.owner = payable(msg.sender);
        card.isListed = false;
    }

    function getCard(uint _cardId) public view returns (Card memory) {
        return cards[_cardId];
    }

    function getCardCount() public view returns (uint) {
        return cards.length;
    }
}
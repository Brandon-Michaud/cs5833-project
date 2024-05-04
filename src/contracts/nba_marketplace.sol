// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Create a marketplace for buying and selling NBA trading cards
contract Marketplace {
    // Defines a card
    struct Card {
        uint id; // Unique identifier for card
        string name; // Name of card
        uint price; // Price of card in ether
        address payable owner; // Address of owner of card
        bool isListed; // If card is listed or not
    }

    Card[] private cards; // List of all cards

    // Function to list a new card
    function listCard(string memory _name, uint _price) public {
        require(_price > 0, "Price must be greater than zero"); // Ensure price is valid

        cards.push(Card(cards.length, _name, _price, payable(msg.sender), true)); // Create new card
    }

    // Function to buy a card
    function buyCard(uint _cardId) public payable {
        Card storage card = cards[_cardId]; // Get desired card

        // Check to ensure card is available, the price is satisfied, and the purchaser is not the owner
        require(card.isListed, "Card must be listed for sale");
        require(msg.value >= card.price, "Value sent is not enough");
        require(card.owner != msg.sender, "Owner cannot buy their own card");

        // Pay owner and transfer ownership
        card.owner.transfer(msg.value);
        card.owner = payable(msg.sender);
        card.isListed = false;
    }

    // Function to get a single card given the ID
    function getCard(uint _cardId) public view returns (Card memory) {
        return cards[_cardId];
    }

    // Function to get the total number of cards
    function getCardCount() public view returns (uint) {
        return cards.length;
    }
}
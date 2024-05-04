import React, { useEffect, useState } from 'react';
import getWeb3 from './getWeb3';
import NBATradingCardsABI from './contracts/NBATradingCards.json';
import './App.css';

function App() {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [contract, setContract] = useState(null);
  const [cards, setCards] = useState([]);
  const [newCardName, setNewCardName] = useState('');
  const [newCardPrice, setNewCardPrice] = useState('');
  const [lastTransactionHash, setLastTransactionHash] = useState('');

  useEffect(() => {
    const initWeb3 = async () => {
      try {
        const web3 = await getWeb3();
        const accounts = await web3.eth.getAccounts();
        const networkId = await web3.eth.net.getId();
        
        // Define contract address and check network ID
        const contractAddress = "0xD4352F75Ed115f331f30fc571DC4e01F13007e8e"; // Replace with your contract's address
        const expectedNetworkId = "11155111"; // Replace with the network ID you're targeting, e.g., '4' for Rinkeby
  
        if (networkId.toString() !== expectedNetworkId) {
          alert("Please connect to the right Ethereum network.");
          return;
        }
  
        const contractInstance = new web3.eth.Contract(
          NBATradingCardsABI,
          contractAddress
        );
        setWeb3(web3);
        setAccounts(accounts);
        setContract(contractInstance);
        fetchCards(contractInstance, web3);
      } catch (error) {
        alert(
          `Failed to load web3, accounts, or contract. Check console for details.`,
        );
        console.error(error);
      }
    };
  
    initWeb3();
  }, []);
  
  const fetchCards = async (contractInstance, web3) => {
    console.log("Web3 available in fetchCards:", web3);
    const cardCount = await contractInstance.methods.getCardCount().call();
    const loadedCards = [];

    for (let i = 0; i < cardCount; i++) {
      let card = await contractInstance.methods.getCard(i).call();
      loadedCards.push({
        id: card.id,
        name: card.name,
        price: web3.utils.fromWei(card.price, 'ether'),
        owner: card.owner,
        isListed: card.isListed
      });
    }

    setCards(loadedCards);
  };

  const listCard = async (name, price) => {
    if (!contract) {
      console.error("Contract is not initialized.");
      return;
    }
  
    try {
      const response = await contract.methods.listCard(name, web3.utils.toWei(price, 'ether')).send({ from: accounts[0] })
        .then(response => {
          setLastTransactionHash(response.transactionHash);
          fetchCards(contract, web3); // Fetch new list of cards
        });
    } catch (error) {
      console.error("Error listing card:", error);
    }
  };

  const buyCard = async (id, price) => {
    const response = await contract.methods.buyCard(id).send({ from: accounts[0], value: web3.utils.toWei(price, 'ether') })
      .then(response => {
        setLastTransactionHash(response.transactionHash);
        fetchCards(contract, web3); // Fetch new list of cards
      });
  };

  const handleListCard = async (event) => {
    event.preventDefault();
    await listCard(newCardName, newCardPrice);
  };

  const etherscanUrl = `https://sepolia.etherscan.io/tx/${lastTransactionHash}`

  return (
    <div>
      <h1>NBA Trading Cards</h1>
      <h2>List a New Card</h2>
      <div className="form-container">
        <form onSubmit={handleListCard} >
          <input
            type="text"
            value={newCardName}
            onChange={e => setNewCardName(e.target.value)}
            placeholder="Card Name"
            required
          />
          <input
            type="text"
            value={newCardPrice}
            onChange={e => setNewCardPrice(e.target.value)}
            placeholder="Card Price (ETH)"
            required
          />
          <button type="submit">List Card</button>
        </form>
      </div>
      <h2>Last Transaction Hash: {lastTransactionHash != '' && <a href={etherscanUrl} target="_blank" rel="noopener noreferrer">{lastTransactionHash}</a>}</h2>
      <h2>Available Cards</h2>
      <div className="cards-container">
        {cards.map((card, index) => (
          <div key={index} className="card">
            <p>Card ID: {card.id.toString()}</p>
            <p>Name: {card.name}</p>
            <p>Price: {card.price} ETH</p>
            <p>Owner: {card.owner}</p>
            {card.owner.toLowerCase() === accounts[0].toLowerCase() ? (
              <div className="owned-indicator">Owned</div>
            ) : (
              card.isListed ?
              <button onClick={() => buyCard(card.id, card.price)}>Buy</button> :
              <div className="not-for-sale-indicator">Not For Sale</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;

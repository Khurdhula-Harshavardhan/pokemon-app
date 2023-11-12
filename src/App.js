import React, { useState, useEffect } from 'react';
import './styles.css';
import axios from 'axios';
import html2canvas from 'html2canvas';

function Header({ user, onLogout }) {
  return (
    <header>
      <div className="header-content">
        <h1>Welcome to the Pokemon Cards</h1>
        <nav>
          <a href="https://www.pokemon.com/">Official Pokemon Site</a>
          {user && (
            <div className="user-info">
              <span>Welcome, {user.name}!</span>
              <button onClick={onLogout} className="logout-button">Logout</button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

function SearchBar({ handleSearch }) {
  return (
    <div className="search-bar">
      <input
        type="text"
        id="searchbar"
        placeholder="Search Pokemon"
        onChange={e => handleSearch(e.target.value)}
      />
    </div>
  );
}

function PokemonCard({ data }) {
    const [imageLoaded, setImageLoaded] = useState(false);
  
    const onImageLoad = () => {
      setImageLoaded(true);
    };
  
    const downloadCard = () => {
      if (imageLoaded) {
        // Use html2canvas to take a screenshot of the current component
        html2canvas(document.querySelector(`#card-${data.id}`), { useCORS: true })
          .then((canvas) => {
            // Create an image from the canvas
            const image = canvas.toDataURL('image/png');
  
            // Create a link to download the image
            const link = document.createElement('a');
            link.href = image;
            link.download = `${data.name}.png`;
  
            // Append to the DOM, trigger the download, and remove from the DOM
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          })
          .catch(err => {
            console.error('Error downloading the card:', err);
          });
      } else {
        alert('Please wait for the image to load before downloading.');
      }
    };
  
    return (
      <div className="pokemon-card" id={`card-${data.id}`} onClick={downloadCard}>
        <img src={data.image} alt={data.name} onLoad={onImageLoad} />
        <h3>{data.name}</h3>
        <p><strong>Type: {data.type}</strong></p>
      </div>
    );
  }

function Footer() {
  return (
    <footer>
      <p>© 2023 Pokemon Cards. By Ganesh Karnati.</p>
    </footer>
  );
}

function App() {
  const [pokemons, setPokemons] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/checkAuthentication', { withCredentials: true })
      .then(response => {
        setUser(response.data);
        fetchPokemon();
      })
      .catch(error => {
        // Handle unauthorized access by redirecting to login
        if (error.response && error.response.status === 401) {
          window.location.href = 'http://localhost:5000/auth/google';
        } else {
          console.error('Authentication error:', error);
        }
      });
  }, []);

  const handleLogout = () => {
    axios.get('http://localhost:5000/auth/logout', { withCredentials: true })
      .then(() => {
        // Clear user state and redirect to login
        setUser(null);
      })
      .catch(error => {
        window.location.reload() 
        console.error('Logout error:', error);
      });
  };
  
  
  const fetchPokemon = async () => {
    const promises = [];
    for (let i = 1; i <= 150; i++) {
      const url = `https://pokeapi.co/api/v2/pokemon/${i}`;
      promises.push(fetch(url).then((res) => res.json()));
    }
    const results = await Promise.all(promises);
    const pokemonData = results.map((result) => ({
      name: result.name,
      image: result.sprites['front_default'],
      type: result.types.map((type) => type.type.name).join(', '),
      id: result.id,
    }));
    setPokemons(pokemonData);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <Header user={user} onLogout={handleLogout} />
      <SearchBar handleSearch={setSearchTerm} />
      <strong><i><h2>Gotta catch them all! Pokemon!!</h2></i></strong>
      <div id="pokedex">
        {pokemons.filter(pokemon => pokemon.name.includes(searchTerm.toLowerCase()))
          .map(pokemon => <PokemonCard key={pokemon.id} data={pokemon} />)}
      </div>
      <Footer />
    </div>
  );
}

export default App;

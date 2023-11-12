import React, { useContext } from 'react';
import { PokemonContext } from './PokemonContext';

function SearchBar() {
  const { searchPokemon } = useContext(PokemonContext);

  return (
    <div>
      <input type="text" placeholder="Search Pokémon..." onChange={searchPokemon} />
    </div>
  );
}

export default SearchBar;

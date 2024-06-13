document.addEventListener('DOMContentLoaded', function() {
    const fetchButton = document.getElementById('fetchButton');

    fetchButton.addEventListener('click', async function() {
        const pokemonNumberInput = document.getElementById('pokemonNumber').value;
        const pokemonNumber = parseInt(pokemonNumberInput);

        // Check if the input is a valid number between 1 and 807
        if (isNaN(pokemonNumber) || pokemonNumber < 1 || pokemonNumber > 807) {
            alert('Please enter a valid Pokémon number between 1 and 807.');
            return;
        }

        try {
            // Fetch Pokémon data from PokeAPI
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonNumber}`);
            const data = await response.json();

            // Fetch type data
            const typeData = await fetchTypeData(data.types);

            // Fetch abilities data
            const abilitiesData = await fetchAbilitiesData(data.abilities);

            // Fetch stats data
            const statsData = data.stats.map(stat => `${capitalizeFirstLetter(stat.stat.name)}: ${stat.base_stat}`);

            // Fetch moves data
            const movesData = await fetchMovesData(data.moves);

            // Clear previous Pokémon data
            document.getElementById('app').innerHTML = '';

            // Display Pokémon name
            const nameElement = document.createElement('h2');
            nameElement.textContent = `Name: ${capitalizeFirstLetter(data.name)}`;
            nameElement.style.fontFamily = 'Arial, sans-serif';
            document.getElementById('app').appendChild(nameElement);

            // Display Pokémon image
            const imageElement = document.createElement('img');
            imageElement.src = data.sprites.front_default;
            imageElement.alt = data.name;
            document.getElementById('app').appendChild(imageElement);

            // Display Pokémon types
            const typesElement = document.createElement('h2');
            typesElement.textContent = `Type(s): ${typeData.join(', ')}`;
            document.getElementById('app').appendChild(typesElement);

            // Display Pokémon abilities
            const abilitiesElement = document.createElement('h2');
            abilitiesElement.textContent = `Abilities: ${abilitiesData.join(', ')}`;
            document.getElementById('app').appendChild(abilitiesElement);

            // Display Pokémon stats
            const statsElement = document.createElement('h2');
            statsElement.textContent = `Stats: ${statsData.join(', ')}`;
            document.getElementById('app').appendChild(statsElement);

            // Display Pokémon moves
            const movesElement = document.createElement('h4');
            movesElement.textContent = `Moves: ${movesData.join(', ')}`;
            document.getElementById('app').appendChild(movesElement);

            // Fetch and display evolution chain
            const evolutionChain = await fetchEvolutionChain(pokemonNumber);
            displayEvolutionChain(evolutionChain);
        } catch (error) {
            console.error('Error fetching Pokémon data:', error);
        }
    });

    // Function to fetch type data
    async function fetchTypeData(types) {
        const typePromises = types.map(async type => {
            const response = await fetch(type.type.url);
            const data = await response.json();
            return capitalizeFirstLetter(data.name);
        });
        return Promise.all(typePromises);
    }

    // Function to fetch abilities data
    async function fetchAbilitiesData(abilities) {
        const abilityPromises = abilities.map(async ability => {
            const response = await fetch(ability.ability.url);
            const data = await response.json();
            return capitalizeFirstLetter(data.name);
        });
        return Promise.all(abilityPromises);
    }

    // Function to fetch moves data
    async function fetchMovesData(moves) {
        const movePromises = moves.map(async move => {
            try {
                const response = await fetch(move.move.url);
                if (!response.ok) throw new Error('Move not found');
                const data = await response.json();
                return capitalizeFirstLetter(data.name);
            } catch (error) {
                console.warn('Move not found:', move.move.name);
                return move.move.name;  // Return the move name if fetch fails
            }
        });
        return Promise.all(movePromises);
    }

    // Function to fetch evolution chain
    async function fetchEvolutionChain(pokemonId) {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}/`);
        const data = await response.json();
        const evolutionChainUrl = data.evolution_chain.url;
        const evolutionChainResponse = await fetch(evolutionChainUrl);
        const evolutionChainData = await evolutionChainResponse.json();
        return evolutionChainData.chain;
    }

    // Function to fetch Pokémon details
    async function fetchPokemonDetails(pokemonId) {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}/`);
        const data = await response.json();
        return {
            name: capitalizeFirstLetter(data.name),
            image: data.sprites.front_default // You can use other sprite URLs for different images
        };
    }

    // Function to display evolution chain
    function displayEvolutionChain(evolutionChain) {
        const evolutionChainContainer = document.createElement('div');
        evolutionChainContainer.classList.add('evolution-chain');

        // Display evolution chain header
        const headerElement = document.createElement('h3');
        headerElement.textContent = 'Evolution Chain';
        evolutionChainContainer.appendChild(headerElement);

        // Display evolution chain details recursively
        displayPokemon(evolutionChain, evolutionChainContainer);

        // Append evolution chain container to app
        document.getElementById('app').appendChild(evolutionChainContainer);
    }

    // Recursive function to display evolution chain details
    async function displayPokemon(pokemon, container) {
        const pokemonDetails = await fetchPokemonDetails(pokemon.species.name);

        // Create container for current Pokémon
        const pokemonElement = document.createElement('div');
        pokemonElement.classList.add('pokemon');
        
        // Create image for current Pokémon
        const imageElement = document.createElement('img');
        imageElement.src = pokemonDetails.image;
        imageElement.alt = pokemonDetails.name;
        pokemonElement.appendChild(imageElement);

        // Create name for current Pokémon
        const nameElement = document.createElement('p');
        nameElement.textContent = pokemonDetails.name;
        pokemonElement.appendChild(nameElement);

        // Append current Pokémon to container
        container.appendChild(pokemonElement);

        // Recursively display evolutions
        if (pokemon.evolves_to.length > 0) {
            const evolutionContainer = document.createElement('div');
            evolutionContainer.classList.add('evolution-container');
            container.appendChild(evolutionContainer);
            for (const evolution of pokemon.evolves_to) {
                displayPokemon(evolution, evolutionContainer);
            }
        }
    }

    // Function to capitalize the first letter of a string
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
});
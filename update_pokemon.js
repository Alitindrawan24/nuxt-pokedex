import fs from 'fs';

// Load the JSON data from the file
fs.readFile('pokemon.json', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }

    // Parse the JSON data
    let pokemonData = JSON.parse(data);

    // Iterate through each Pokémon object and add height and weight
    pokemonData.forEach(pokemon => {
        pokemon.height = 1.0;  // Default height value
        pokemon.weight = 10.0; // Default weight value
    });

    // Write the updated JSON data back to the file
    fs.writeFile('pokemon.json', JSON.stringify(pokemonData, null, 4), 'utf8', err => {
        if (err) {
            console.error(err);
            return;
        }
        console.log('Height and weight added to each Pokémon.');
    });
});
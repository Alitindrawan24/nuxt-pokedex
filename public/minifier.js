import fs from 'fs';

// Load the JSON data from the file
fs.readFile('pokemon.json', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }

    // Parse the JSON data
    let pokemonData = JSON.parse(data);

    // Minimize the data by extracting only necessary properties
    let minimizedData = pokemonData.map(pokemon => ({
        id: pokemon.id,
        name: pokemon.name,
        sprite: pokemon.sprite,
        types: pokemon.types,
        abilities: pokemon.abilities,
        base_stats: pokemon.base_stats,
        height: pokemon.height,
        weight: pokemon.weight,
    }));

    // Write the minimized JSON data to a new file
    fs.writeFile('pokemon.min.json', JSON.stringify(minimizedData), 'utf8', err => {
        if (err) {
            console.error(err);
            return;
        }
        console.log('Minimized data written to pokemon.min.json.');
    });
});
/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require('fs');
const path = require('path');

const optimizeFile = (inputName, outputName, propsToKeep) => {
    const inputPath = path.join(__dirname, `../public/geojson/${inputName}`);
    const outputPath = path.join(__dirname, `../public/geojson/${outputName}`);

    console.log(`Reading ${inputName}...`);
    const rawData = fs.readFileSync(inputPath, 'utf8');
    const geojson = JSON.parse(rawData);

    console.log(`Optimizing ${inputName}...`);
    geojson.features = geojson.features.map(feature => {
        // Round coordinates to 4 decimal places
        if (feature.geometry && feature.geometry.type === 'Polygon') {
            feature.geometry.coordinates = feature.geometry.coordinates.map(ring => 
                ring.map(coord => coord.map(c => Math.round(c * 10000) / 10000))
            );
        } else if (feature.geometry && feature.geometry.type === 'MultiPolygon') {
            feature.geometry.coordinates = feature.geometry.coordinates.map(polygon => 
                polygon.map(ring => 
                    ring.map(coord => coord.map(c => Math.round(c * 10000) / 10000))
                )
            );
        }

        // Keep only necessary properties
        const newProps = {};
        propsToKeep.forEach(prop => {
            if (feature.properties[prop]) {
                newProps[prop] = feature.properties[prop];
            }
        });
        feature.properties = newProps;

        return feature;
    });

    console.log(`Writing ${outputName}...`);
    fs.writeFileSync(outputPath, JSON.stringify(geojson));

    const originalSize = fs.statSync(inputPath).size / (1024 * 1024);
    const optimizedSize = fs.statSync(outputPath).size / (1024 * 1024);

    console.log(`Optimization complete for ${inputName}!`);
    console.log(`Original size: ${originalSize.toFixed(2)} MB`);
    console.log(`Optimized size: ${optimizedSize.toFixed(2)} MB`);
    console.log(`Reduction: ${((1 - optimizedSize / originalSize) * 100).toFixed(2)}%`);
    console.log('---');
};

optimizeFile('india-districts.geojson', 'india-districts-optimized.geojson', ['NAME_1', 'NAME_2']);
optimizeFile('india-states.geojson', 'india-states-optimized.geojson', ['NAME_1']);

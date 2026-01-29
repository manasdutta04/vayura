
const fs = require('fs');
const path = require('path');

// Read the all-indian-districts.ts file
const districtsFileContent = fs.readFileSync(path.join(__dirname, 'all-indian-districts.ts'), 'utf8');

// More robust way to extract district data
const districts = [];
const lines = districtsFileContent.split('\n');
lines.forEach(line => {
    const match = line.match(/name:\s*'([^']+)',\s*slug:\s*'([^']+)',\s*state:\s*'([^']+)'/);
    if (match) {
        districts.push({
            name: match[1],
            slug: match[2],
            state: match[3]
        });
    }
});

console.log(`Found ${districts.length} major districts in scripts/all-indian-districts.ts`);

// Read the new GeoJSON
const geoJsonData = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'india-districts-new.geojson'), 'utf8'));

const normalize = (name) => {
    if (!name) return '';
    return name.toLowerCase()
        .replace(/\s+/g, '')
        .replace(/-/g, '')
        .replace(/&/g, 'and')
        .replace(/\./g, '');
};

const nameMap = {
    'delhi': 'delhi',
    'centraldelhi': 'delhi',
    'eastdelhi': 'delhi',
    'newdelhi': 'delhi',
    'northdelhi': 'delhi',
    'northeastdelhi': 'delhi',
    'northwestdelhi': 'delhi',
    'southdelhi': 'delhi',
    'southeastdelhi': 'delhi',
    'southwestdelhi': 'delhi',
    'westdelhi': 'delhi',
    'shahdara': 'delhi',
    'mumbaisuburban': 'mumbai',
    'mumbaicity': 'mumbai',
    'jamshedpur': 'eastsinghbhum',
    'kanchipuram': 'kancheepuram',
    'bardhaman': 'purbabardhaman',
    'bhubaneswar': 'khordha',
    'bangaloreurban': 'bengaluruurban',
    'bangalorerural': 'bengalururural',
    'mysore': 'mysuru',
    'chikmagalur': 'chikkamagaluru',
    'trivandrum': 'thiruvananthapuram',
    'trichy': 'tiruchirappalli',
    'kanpur': 'kanpurnagar',
    'allahabad': 'prayagraj',
    'faizabad': 'ayodhya',
    'hoshangabad': 'narmadapuram',
    'osmanabad': 'dharashiv',
    'aurangabad': 'sambhajinagar',
    'ahmednagar': 'ahilyanagar',
    'gurgaon': 'gurugram',
    'parganasnorth': 'north24parganas',
    'parganassouth': 'south24parganas',
    '24parganasnorth': 'north24parganas',
    '24parganassouth': 'south24parganas',
    'bangalore': 'bengaluruurban',
    'belgaum': 'belagavi',
    'gulbarga': 'kalaburagi',
    'bellary': 'ballari',
    'hublidharwad': 'dharwad',
    'tumkur': 'tumakuru',
    'itanagar': 'papumpare',
    'guwahati': 'kamrupmetropolitan'
};

const getNormalizedName = (name) => {
    const norm = normalize(name);
    return nameMap[norm] || norm;
};

const majorDistrictsMap = new Map();
districts.forEach(d => {
    const key = `${getNormalizedName(d.name)}|${getNormalizedName(d.state)}`;
    majorDistrictsMap.set(key, d);
    // Also store by name only for fallback (careful with duplicates)
    if (!majorDistrictsMap.has(getNormalizedName(d.name))) {
        majorDistrictsMap.set(getNormalizedName(d.name), d);
    }
});

console.log(`Normalized ${majorDistrictsMap.size} unique major district entries`);

const filteredFeatures = geoJsonData.features.filter(feature => {
    const districtName = feature.properties.district;
    const stateName = feature.properties.st_nm;
    
    const key = `${getNormalizedName(districtName)}|${getNormalizedName(stateName)}`;
    if (majorDistrictsMap.has(key)) return true;
    
    if (majorDistrictsMap.has(getNormalizedName(districtName))) return true;
    
    return false;
});

console.log(`Filtered to ${filteredFeatures.length} features`);

// If we have fewer than expected, find missing ones
const foundNames = new Set(filteredFeatures.map(f => getNormalizedName(f.properties.district)));
const missing = districts.filter(d => !foundNames.has(getNormalizedName(d.name)));

if (missing.length > 0) {
    console.log(`Missing ${missing.length} districts:`);
    missing.slice(0, 20).forEach(d => console.log(` - ${d.name} (${d.state})`));
}

// Update the GeoJSON
geoJsonData.features = filteredFeatures;

// Save
fs.writeFileSync(
    path.join(__dirname, '..', 'public', 'geojson', 'india-districts.geojson'),
    JSON.stringify(geoJsonData)
);

console.log('Successfully updated public/geojson/india-districts.geojson');

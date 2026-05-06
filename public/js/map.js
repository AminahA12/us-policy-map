// FIPS numeric ID → state name (matches us-atlas TopoJSON)
const fipsToState = {
  1:  'Alabama',        2:  'Alaska',         4:  'Arizona',
  5:  'Arkansas',       6:  'California',      8:  'Colorado',
  9:  'Connecticut',    10: 'Delaware',        12: 'Florida',
  13: 'Georgia',        15: 'Hawaii',          16: 'Idaho',
  17: 'Illinois',       18: 'Indiana',         19: 'Iowa',
  20: 'Kansas',         21: 'Kentucky',        22: 'Louisiana',
  23: 'Maine',          24: 'Maryland',        25: 'Massachusetts',
  26: 'Michigan',       27: 'Minnesota',       28: 'Mississippi',
  29: 'Missouri',       30: 'Montana',         31: 'Nebraska',
  32: 'Nevada',         33: 'New Hampshire',   34: 'New Jersey',
  35: 'New Mexico',     36: 'New York',        37: 'North Carolina',
  38: 'North Dakota',   39: 'Ohio',            40: 'Oklahoma',
  41: 'Oregon',         42: 'Pennsylvania',    44: 'Rhode Island',
  45: 'South Carolina', 46: 'South Dakota',    47: 'Tennessee',
  48: 'Texas',          49: 'Utah',            50: 'Vermont',
  51: 'Virginia',       53: 'Washington',      54: 'West Virginia',
  55: 'Wisconsin',      56: 'Wyoming'
};

const W = 960, H = 600;
const tooltip      = document.getElementById('tooltip');
const mapContainer = document.getElementById('map-container');

// Clear loading placeholder
document.getElementById('map').innerHTML = '';

const svg = d3.select('#map')
  .append('svg')
  .attr('viewBox', `0 0 ${W} ${H}`)
  .attr('preserveAspectRatio', 'xMidYMid meet');

const projection = d3.geoAlbersUsa().scale(1300).translate([W / 2, H / 2]);
const pathGen    = d3.geoPath().projection(projection);

d3.json('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json').then(us => {
  const states = topojson.feature(us, us.objects.states);

  svg.selectAll('.state')
    .data(states.features)
    .join('path')
    .attr('class', 'state')
    .attr('d', pathGen)
    .on('mousemove', function (event, d) {
      const name = fipsToState[+d.id];
      if (!name) return;
      const rect = mapContainer.getBoundingClientRect();
      tooltip.textContent  = name;
      tooltip.style.opacity = '1';
      tooltip.style.left   = (event.clientX - rect.left + 14) + 'px';
      tooltip.style.top    = (event.clientY - rect.top  - 40) + 'px';
    })
    .on('mouseleave', () => { tooltip.style.opacity = '0'; })
    .on('click', (event, d) => {
      const name = fipsToState[+d.id];
      if (name) window.location.href = '/state/' + encodeURIComponent(name);
    });

  // State border mesh
  svg.append('path')
    .datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
    .attr('class', 'state-borders')
    .attr('d', pathGen);
});

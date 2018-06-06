const map = new mapboxgl.Map({
    container: 'map',
    style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    center: [0, 30],
    zoom: 2,
    dragRotate: false,
});
map.touchZoomRotate.disableRotation();

carto.setDefaultAuth({
    user: 'simon-carto',
    apiKey: 'default_public'
});


const types = [
    'Hydro',
    'Solar',
    'Wind',
    'Oil',
    'Gas',
    'Coal',
    'Biomass',
    'Waste',
    'Nuclear',
    'Geothermal',
    'Cogeneration'
];



const energySource = new carto.source.SQL(`
    select *
    from global_power_plant_database
    where estimated_generation_gwh is not null
    order by estimated_generation_gwh desc
    limit 10
`);

const s = carto.expressions;




const energyViz = new carto.Viz(`
    @name: $name
    @estimated_generation_gwh: $estimated_generation_gwh
    @fuel1: $fuel1
    @totalgwh: viewportSum($capacity_mw)

    color: ramp($fuel1, vivid)
    width: $estimated_generation_gwh / 1000
`);


const energyLayer = new carto.Layer('energyLayer', energySource, energyViz);
energyLayer.addTo(map);


/* WIDGETS */
document.getElementById('totalContent').innerHTML = energyViz.variables.totalgwh.eval()


/* ACTIONS */

const interactivity = new carto.Interactivity(energyLayer);
interactivity.on('featureHover', event => {
    let biggest = event.features[0];
    for (let feature of event.features) {
        if(feature.variables.estimated_generation_gwh.value > biggest.variables.estimated_generation_gwh.value) {
            biggest = feature;
        }
    }

    if (biggest) {
        document.getElementById('infoContent').innerHTML = `
            <div class="element">
                <h3 class="h3">${biggest.variables.name.value}</h3>
                <p class="open-sans">Energy: ${Number(biggest.variables.estimated_generation_gwh.value).toFixed(0)} GWh</p>
                <p class="open-sans">Type: ${biggest.variables.fuel1.value}</p>
            </div>
        `;
    }
})

interactivity.on('featureLeave', () => document.getElementById('infoContent').innerHTML = '');


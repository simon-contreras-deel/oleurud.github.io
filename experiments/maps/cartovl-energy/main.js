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


// const types = [
//     'Hydro',
//     'Solar',
//     'Wind',
//     'Oil',
//     'Gas',
//     'Coal',
//     'Biomass',
//     'Waste',
//     'Nuclear',
//     'Geothermal',
//     'Cogeneration'
// ];


/* SOURCES */
const energySource = new carto.source.SQL(`
    SELECT *
    FROM global_power_plant_database
    WHERE estimated_generation_gwh is not null
    and capacity_mw is not null
`);

const renewableEnergySource = new carto.source.SQL(`
    SELECT *
    FROM global_power_plant_database
    WHERE estimated_generation_gwh is not null
    AND capacity_mw is not null 
    AND fuel1 IN ('Hydro', 'Solar', 'Wind', 'Biomass', 'Geothermal')
`);

const nonRenewableEnergySource = new carto.source.SQL(`
    SELECT *
    FROM global_power_plant_database
    WHERE estimated_generation_gwh is not null
    AND capacity_mw is not null 
    AND fuel1 NOT IN ('Hydro', 'Solar', 'Wind', 'Biomass', 'Geothermal')
`);


const s = carto.expressions;


const energyViz = new carto.Viz(`
    @name: $name
    @capacity_mw: $capacity_mw
    @estimated_generation_gwh: $estimated_generation_gwh
    @fuel1: $fuel1
    @totalGeneration: viewportSum($estimated_generation_gwh)
    @totalCapacity: viewportSum($capacity_mw)

    color: ramp($fuel1, vivid)
    strokeWidth: 0 
    width: sqrt($capacity_mw) / 3.14
`);


const energyLayer = new carto.Layer('energyLayer', energySource, energyViz);
energyLayer.addTo(map);



/* WIDGETS */
document.getElementById('total').innerHTML = `
    <h3>POWER PLANTS</h3>
    <p>Capacity: ${energyViz.variables.totalCapacity.eval()} MW</p>
    <p>Generation: ${energyViz.variables.totalGeneration.eval()} GWh</p>
`;

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
        document.getElementById('info').innerHTML = `
            <div class="container">
                <h3 class="h3">${biggest.variables.name.value}</h3>
                <p>Type: ${biggest.variables.fuel1.value}</p>
                <p>Capacity: ${Number(biggest.variables.capacity_mw.value).toFixed(0)} GWh</p>
                <p>Generation: ${Number(biggest.variables.estimated_generation_gwh.value).toFixed(0)} GWh</p>
            </div>
        `;
    }
})

interactivity.on('featureLeave', () => document.getElementById('info').innerHTML = '');


function allTypes() {
    energyLayer.update(energySource, energyViz);
}

function renewableTypes() {
    energyLayer.update(renewableEnergySource, energyViz);
}

function nonRenewableTypes() {
    energyLayer.update(nonRenewableEnergySource, energyViz);
}

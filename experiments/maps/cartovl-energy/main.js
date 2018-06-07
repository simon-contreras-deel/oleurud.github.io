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


/* SOURCES */

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

const emptyEnergySource = new carto.source.SQL(`
    SELECT *
    FROM global_power_plant_database
    limit 0
`);



const renewableEnergyViz = new carto.Viz(`
    @name: $name
    @capacity_mw: $capacity_mw
    @estimated_generation_gwh: $estimated_generation_gwh
    @fuel1: $fuel1
    @totalGeneration: viewportSum($estimated_generation_gwh)
    @totalCapacity: viewportSum($capacity_mw)

    color: ramp($fuel1, TEALGRN)
    strokeWidth: 0 
    width: sqrt($capacity_mw) / 3.14
`);

const nonRenewableEnergyViz = new carto.Viz(`
    @name: $name
    @capacity_mw: $capacity_mw
    @estimated_generation_gwh: $estimated_generation_gwh
    @fuel1: $fuel1
    @totalGeneration: viewportSum($estimated_generation_gwh)
    @totalCapacity: viewportSum($capacity_mw)

    color: ramp($fuel1, BURG)
    strokeWidth: 0 
    width: sqrt($capacity_mw) / 3.14 /viewportMax(sqrt($capacity_mw)) *50
`);


const nonRenewableEnergyLayer = new carto.Layer('nonRenewableEnergyLayer', nonRenewableEnergySource, nonRenewableEnergyViz);
nonRenewableEnergyLayer.addTo(map);

const renewableEnergyLayer = new carto.Layer('renewableEnergyLayer', renewableEnergySource, renewableEnergyViz);
renewableEnergyLayer.addTo(map);



/* ACTIONS */
let biggest;
const delay = 50;
const interactivity = new carto.Interactivity([renewableEnergyLayer, nonRenewableEnergyLayer]);
interactivity.on('featureEnter', event => {
    if (!biggest) {
        biggest = event.features[0];
        for (let feature of event.features) {
            if (feature.variables.estimated_generation_gwh.value > biggest.variables.estimated_generation_gwh.value) {
                biggest = feature;
            }
        }

        if (biggest) {
            document.getElementById('info').innerHTML = `
                <div class="container">
                    <h3 class="h3">${biggest.variables.name.value}</h3>
                    <p>Type: ${biggest.variables.fuel1.value}</p>
                    <p>Capacity: ${Number(biggest.variables.capacity_mw.value).toFixed(0)} GWh</p>
                </div>
            `;

            biggest.color.blendTo('opacity(DeepPink, 0.5)', delay)
            biggest.strokeWidth.blendTo('4', delay);
            biggest.strokeColor.blendTo('opacity(DeepPink, 0.8)', delay);
        }
    }
})

interactivity.on('featureLeave', () => {
    if (biggest) {
        document.getElementById('info').innerHTML = '';
        biggest.color.reset(delay);
        biggest.strokeWidth.reset(delay);
        biggest.strokeColor.reset(delay);
        biggest = null;
    }
});


renewableEnergyLayer.on('updated', () => {
    document.getElementById('total').innerHTML = `
        <h3>POWER PLANTS</h3>
        <hr>
        <p><strong>Renewable</strong>:</p>
        <p>${Number(renewableEnergyViz.variables.totalCapacity.eval().toFixed(0)).toLocaleString()} MW</p>
        <p><strong>Non-renewable</strong>:</p>
        <p>${Number(nonRenewableEnergyViz.variables.totalCapacity.eval().toFixed(0)).toLocaleString()} MW</p>
    `;
});


function allTypes() {
    map.setLayoutProperty('nonRenewableEnergyLayer', 'visibility', 'visible');
    map.setLayoutProperty('renewableEnergyLayer', 'visibility', 'visible');
}

function renewableTypes() {
    map.setLayoutProperty('nonRenewableEnergyLayer', 'visibility', 'none');
    map.setLayoutProperty('renewableEnergyLayer', 'visibility', 'visible');
}

function nonRenewableTypes() {
    map.setLayoutProperty('renewableEnergyLayer', 'visibility', 'none');
    map.setLayoutProperty('nonRenewableEnergyLayer', 'visibility', 'visible');
}

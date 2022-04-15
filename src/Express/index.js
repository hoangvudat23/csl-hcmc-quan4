const { LocalStorage } = require("node-localstorage");
const setting = require('../settings/settings.json');
const express = require('express')
var bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { default: axios } = require("axios");
const app = express();
const port = setting.expressPort;

var localStorage = new LocalStorage('./scratch');
localStorage.removeItem('view-option');
localStorage.removeItem('mode');
localStorage.removeItem('table');
localStorage.removeItem('scenario');
localStorage.removeItem('scenario_table');
localStorage.removeItem('chart');
localStorage.removeItem('chart_table');
localStorage.removeItem('access_property_index');
localStorage.removeItem('list_on_options');
setInitialValueOptions();

// for parsing application/json
app.use(bodyParser.json());

// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true }));

// for cors
app.use(cors());
app.options('*', cors());


let arrayOptionAllowance = ["GRID", "ABM", "GEOJSON", "AGGREGATED_TRIPS", "ACCESS", "TEXTUAL", "SHADOWS",]
let arrayModeAllowance = ["ON", "OFF"]
let arrayScenarioAllowance = ["hcm_scenario_0", "hcm_scenario_2", "hcm_scenario_3"]
let arrayChartAllowance = ["pie", "radar", "bar", "all"];
var onlyMapSettingPath = path.join(__dirname, '..', 'settings', 'onlyMapSetting.json');

app.get('/get-option', (req, res) => {
    let option = localStorage.getItem('view-option');
    let mode = localStorage.getItem('mode');
    let table = localStorage.getItem('table');
    let access_property_index = localStorage.getItem('access_property_index');
    let list_on_options = localStorage.getItem('list_on_options');
    return res.send({ option, mode, table, access_property_index, list_on_options });
})

app.get('/get-scenario', (req, res) => {
    let scenario = localStorage.getItem('scenario');
    let scenario_table = localStorage.getItem('scenario_table');
    return res.send({ scenario, scenario_table });
})

app.get('/get-chart', (req, res) => {
    let chart = localStorage.getItem('chart');
    let chart_table = localStorage.getItem('chart_table');
    return res.send({ chart, chart_table });
})

app.get('/get-access-properties', (req, res) => {
    let scenario = req.query.scenario;
    if (!scenario || !arrayScenarioAllowance.includes(scenario)) {
        return res.status('422').send(`"scenario" is not valid!`);
    }
    //let url = `https://cityio.media.mit.edu/api/table/${scenario}/access/`;
    let url = `https://quan4.csl-hcmc.com/cityio/api/table/${scenario}/access/`;
    axios.get(url).then(response => {
        let mapArray = response.data.properties.map((item, index) => {
            return {
                index: index,
                name: item
            }
        })
        return res.send(mapArray);
    }).catch(err => {
        if (err.response.status == 404) {
            return res.status('404').send('Table or data not found!');
        }
        else {
            return res.status(err.response.status).send('Something went wrong!');
        }
    });
})

app.get('/get-only-map-setting', (req, res) => {
    let onlyMapSetting = fs.readFileSync(onlyMapSettingPath);
    return res.send(onlyMapSetting);
});

app.get('/get-all-on-options', (req, res) => {
    let existingOnOptions = localStorage.getItem('list_on_options');
    let lastOption = localStorage.getItem('view-option');
    let mode = localStorage.getItem('mode');
    let table = localStorage.getItem('table');

   
});

app.post('/set-option', (req, res) => {
    let reqParams = req.body;
    let option = reqParams.option
    let mode = reqParams.mode;
    let table = reqParams.table;
    let access_property_index = reqParams.access_property_index;
    if (arrayOptionAllowance.includes(option) && arrayModeAllowance.includes(mode)) {
        localStorage.setItem('view-option', option);
        localStorage.setItem('mode', mode);
        localStorage.setItem('table', table);
        console.log(table, option, mode);

        /* check if is access mode */
        if (option == "ACCESS") {
            access_property_index = access_property_index && Number.isInteger(access_property_index) ? access_property_index : 0;
            localStorage.setItem('access_property_index', access_property_index);
        }

        // update list on-options
        let listOnOptions = localStorage.getItem('list_on_options');
        listOnOptions = JSON.parse(listOnOptions);
        if(listOnOptions && Array.isArray(listOnOptions)){
            let index = listOnOptions.indexOf(option);
            if(mode == "ON"){
                if(index == -1){
                    listOnOptions.push(option);
                }
            }
            else{
                if(index != -1){
                    listOnOptions.splice(index, 1);
                }
            }
        }
        else{
            listOnOptions = [];
            if(mode == "ON"){
                listOnOptions.push(option);
            }
        }
        localStorage.setItem('list_on_options', JSON.stringify(listOnOptions));
        // Done update list on-options

        return res.send(`${mode} ${option} ${table}, ${listOnOptions}`);

    }
    else {
        return res.status('422').send(`Params is not valid!`);
    }
})

app.post('/choose-scenario', (req, res) => {
    let reqParams = req.body;
    let scenario = reqParams.scenario;
    let table = reqParams.table;
    if (arrayScenarioAllowance.includes(scenario)) {
        localStorage.setItem('scenario', scenario);
        localStorage.setItem('scenario_table', table);
        console.log(scenario);
        console.log(table);
        return res.send(`Scenario: ${scenario}`);
    }
    else {
        return res.status('422').send(`Scenario is not valid!`);
    }
})

app.post('/display-chart', (req, res) => {
    let reqParams = req.body;
    let chart = reqParams.chart;
    let table = reqParams.table;
    if (arrayChartAllowance.includes(chart)) {
        localStorage.setItem('chart', chart);
        localStorage.setItem('chart_table', table);
        console.log(chart);
        console.log(table);
        return res.send(`Chart: ${chart}`);
    }
    else {
        return res.status('422').send(`Chart is not valid!`);
    }
})

app.post('/save-only-map-settings', (req, res) => {
    let reqParams = req.body;
    let data = reqParams.setting;
    try {
        console.log(onlyMapSettingPath);
        try {
            fs.unlinkSync(onlyMapSettingPath);
        } catch (error) {
            console.log("File not exists!");
        }
        fs.writeFileSync(onlyMapSettingPath, data, (err) => {
            // In case of a error throw err.
            if (err) {
                return res.status('500').send(err);
            };
        })
    } catch (err) {
        console.log(err);
        return res.status('500').send(err);
    }
    return res.send(`Save settings successfully`);
})


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

function setInitialValueOptions(){
    localStorage.setItem('view-option', 'GEOJSON');
    localStorage.setItem('mode', 'ON');
    localStorage.setItem('table', 'hcm_scenario_0');
    localStorage.setItem('list_on_options', JSON.stringify(['GEOJSON']));
    console.log('Init value!');
}
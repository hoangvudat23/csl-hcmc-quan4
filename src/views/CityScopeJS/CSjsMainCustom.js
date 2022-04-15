import MenuContainer from './MenuContainer'
import MenuContainer2 from './MenuContainer/index_mapchartmenu'
import MapContainer from './DeckglMap'
import LoadingSpinner from './CityIO/LoadingSpinner'
import VisContainer from './VisContainer/index_custom'
import VisContainer2 from './VisContainer/index_custom_mapchartmenu'
import {
  makeStyles,
  Grid,
  Card,
  CardContent,
  Container,
  Box,
  Typography,
  Avatar
} from '@material-ui/core'
import Page from '../../layouts/Page'

import axios from "axios";
import { useEffect, useState } from "react";
import settings from "../../settings/settings.json";
import { useSelector, useDispatch } from "react-redux";
import { listenToMenuUI, setCurrentScenario, listenToAccessToggle } from "../../redux/actions";
import ChooseScenario from "./MenuContainer/ChooseScenario"


const useStyles = makeStyles((theme) => ({
  root: {
    margin: 'auto',
    height: '100%',
    // paddingBottom: theme.spacing(3),
    // paddingTop: theme.spacing(3),
  },
}))

const getAPICall = async (URL) => {
  try {
    const response = await axios.get(URL);
    return response.data;
  } catch (err) {
    console.log(err);
  }
};

export default function CSjsMainCustom(props) {
  const classes = useStyles()
  const tableName = props.tableName
  const cityIOdata = props.cityIOdata
  const onlyMap = props.onlyMap
  const onlyOptionMenu = props.onlyOptionMenu
  const mapAndChartSidebar = props.mapAndChartSidebar
  const mapAndChartSidebarAndMenu = props.mapAndChartSidebarAndMenu

  const menuState = useSelector((state) => state.MENU);
  const loadedModules = Object.keys(cityIOdata);
  const togglesMeta = settings.menu.toggles;

  const dispatch = useDispatch();
  let myMenuState = [...menuState];
  const [chosenScenario, setChosenScenario] = useState("");
  let myChosenScenario = 'hcm_scenario_0';
  const [chosenChart, setChosenChart] = useState("all");
  let myChosenChart = 'all';
  let myAccessPropertyIndex = 0;
  let mapChoosenScenario = {
    'hcm_scenario_0': 'SCENARIO 0',
    'hcm_scenario_2': 'SCENARIO 2',
    'hcm_scenario_3': 'SCENARIO 3',
  }

  /* Listening View Option Change */
  useEffect(() => {
    const timer = setTimeout(listenChangingOption, 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function listenChangingOption() {
    // recursively get hashes
    const options = await getAPICall(`${process.env.REACT_APP_EXPRESS_PUBLIC_URL}/get-option`);
    const scenarioObject = await getAPICall(`${process.env.REACT_APP_EXPRESS_PUBLIC_URL}/get-scenario`);
    const chartObject = await getAPICall(`${process.env.REACT_APP_EXPRESS_PUBLIC_URL}/get-chart`);
    if (options) {
      let table = options.table;
      let option = options.option;
      let mode = options.mode;
      let listOnOptions = JSON.parse(options.list_on_options);

      if (table == tableName) {
        // if (option) {
        //   let requireModule = togglesMeta[option].requireModule;
        //   if (loadedModules.includes(requireModule) || requireModule === false) {
        //     const i = myMenuState.indexOf(option);
        //     if (mode == "ON") {
        //       if (i === -1) {
        //         myMenuState.push(option);
        //       }
        //       /* Check access and its sub menu */
        //       if (option == 'ACCESS') {
        //         let access_property_index = options.access_property_index;
        //         if (access_property_index && myAccessPropertyIndex != access_property_index) {
        //           myAccessPropertyIndex = access_property_index
        //           dispatch(listenToAccessToggle(myAccessPropertyIndex));
        //         }
        //       }
        //     }
        //     else {
        //       if (i !== -1) {
        //         myMenuState.splice(i, 1);
        //       }
        //     }
        //     dispatch(listenToMenuUI(myMenuState));
        //   }
        // }
        if (Array.isArray(listOnOptions)) {
          myMenuState = listOnOptions;
          for (let i = 0; i < myMenuState.length; i++) {
            let option = myMenuState[i];
            let requireModule = togglesMeta[option].requireModule;
            if (loadedModules.includes(requireModule) || requireModule === false) {
              if (option == 'ACCESS') {
                let access_property_index = options.access_property_index;
                if (access_property_index && myAccessPropertyIndex != access_property_index) {
                  myAccessPropertyIndex = access_property_index
                  dispatch(listenToAccessToggle(myAccessPropertyIndex));
                }
              }
            }
            else {
              myMenuState.splice(i, 1);
            }
          }
          dispatch(listenToMenuUI(myMenuState));
        }
      }
    }
    if (scenarioObject) {
      let table = scenarioObject.scenario_table;
      if (table == tableName) {
        let scenario = scenarioObject.scenario;
        if (scenario && scenario != myChosenScenario) {
          myChosenScenario = scenario;
          setChosenScenario(scenario);
          dispatch(setCurrentScenario(scenario));
        }
      }
    }

    if (chartObject) {
      let table = chartObject.chart_table;
      if (table == tableName) {
        let chart = chartObject.chart;
        if (chart && chart != myChosenChart) {
          myChosenChart = chart;
          setChosenChart(chart);
        }
      }
    }
    setTimeout(listenChangingOption, 1000);
  }

  /* END Listening */
  return (
    <Page className={classes.root} title="CitySCopeJS">
      <LoadingSpinner />
      <Container maxWidth={null}
        style={{
          height: '100%',
          padding: '0px'
        }}>
        {/* <Grid container spacing={5}> */}
        <Grid container
          style={{
            height: '100%'
          }}
        >
          {onlyOptionMenu && <Grid item xs={12} l={12} md={12} xl={12} container>
            <Grid item container direction="column" spacing={2}>
              <Grid item xs={12} l={12} md={12} xl={12}>
                <Card
                  elevation={15}
                  style={{
                    maxHeight: '90vh',
                    overflow: 'auto',
                  }}
                >
                  <CardContent>
                    <MenuContainer tableName={tableName} />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>}

          {onlyMap && <Grid item xs={12} l={12} md={12} xl={12}>
            <Card
              elevation={15}
              style={{
                // height: '90vh',
                height: '100%',
                width: '100%',
                position: 'relative',
              }}
            >
              <MapContainer onlyMap={true} />
            </Card>
          </Grid>}
          {mapAndChartSidebar && <Grid item xs={6} l={6} md={6} xl={6}>
            <Card
              elevation={15}
              style={{
                maxHeight: '100%',
                height: '100%',
                overflow: 'hidden',
                boxShadow: 'none',
                background: '#192c48'
              }}
            >
              <VisContainer cityIOdata={cityIOdata} chosenChart={chosenChart} />
            </Card>
          </Grid>}
          {mapAndChartSidebar && <Grid item xs={6} l={6} md={6} xl={6}>
            <Card
              elevation={15}
              style={{
                height: '100%',
                width: '100%',
                overflow: 'hidden',
                position: 'relative',
                boxShadow: 'none',
                background: '#192c48'
              }}
            >
              <Box display="flex" alignItems="center" justifyContent="end" flexDirection="column" mt={8}>
                <Typography color="textPrimary" variant="h1" style={{ fontSize: '55px' }}>
                  {mapChoosenScenario[chosenScenario] ? mapChoosenScenario[chosenScenario] : mapChoosenScenario[myChosenScenario]}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center"
                style={{
                  height: '88%',
                  position: 'relative'
                }}
              >
                <MapContainer pitchMap={60} zoomMap={15} autoRotate={true} />
              </Box>
              <Box display="flex" alignItems="center" justifyContent="flex-end" mr={8}>
                <img src="images/CSL_HCMC.jpeg" alt="CSL HCMC" width="100px" style={{ marginRight: '20px', borderRadius: '10px' }}></img>
                <img src="images/MIT_Media_Lab_Logo.jpg" alt="MIT Media Lab" width="100px" style={{ borderRadius: '10px' }}></img>
              </Box>
            </Card>
          </Grid>}
          {/* mapAndChartSidebarAndMenu */}
          {mapAndChartSidebarAndMenu && <Grid item xs={2} l={2} md={2} xl={2} container>
            <Grid item container direction="column">
              <Grid item xs={12} l={12} md={12} xl={12}>
                <Card
                  elevation={15}
                  style={{
                    height: '90%',
                    overflow: 'none',
                    background: '#192c48',
                    boxShadow: 'none',
                    borderRadius: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: '50px'
                  }}
                >
                  <CardContent>
                    {/* <Box display="flex" alignItems="center" justifyContent="center" flexDirection="column"> */}
                    <MenuContainer2 tableName={tableName} />
                    {/* </Box> */}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>}
          {mapAndChartSidebarAndMenu && <Grid item xs={5} l={5} md={5} xl={5}>
            <Card
              elevation={15}
              style={{
                maxHeight: '100%',
                height: '100%',
                overflow: 'hidden',
                boxShadow: 'none',
                background: '#192c48'
              }}
            >
              <VisContainer2 cityIOdata={cityIOdata} chosenChart={chosenChart} />
            </Card>
          </Grid>}
          {mapAndChartSidebarAndMenu && <Grid item xs={5} l={5} md={5} xl={5}>
            <Card
              elevation={15}
              style={{
                height: '100%',
                width: '100%',
                overflow: 'hidden',
                position: 'relative',
                boxShadow: 'none',
                background: '#192c48'
              }}
            >
              <Box display="flex" alignItems="center" justifyContent="end" flexDirection="column" mt={8}>
                <Typography color="textPrimary" variant="h1" style={{ fontSize: '55px' }}>
                  {mapChoosenScenario[chosenScenario] ? mapChoosenScenario[chosenScenario] : mapChoosenScenario[myChosenScenario]}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center"
                style={{
                  height: '88%',
                  position: 'relative'
                }}
              >
                <MapContainer pitchMap={60} zoomMap={15} autoRotate={true} />
              </Box>
              <Box display="flex" alignItems="center" justifyContent="flex-end" mr={8}>
                <img src="images/CSL_HCMC.jpeg" alt="CSL HCMC" width="100px" style={{ marginRight: '20px', borderRadius: '10px' }}></img>
                <img src="images/MIT_Media_Lab_Logo.jpg" alt="MIT Media Lab" width="100px" style={{ borderRadius: '10px' }}></img>
              </Box>
            </Card>
          </Grid>}
          <Grid>
            <ChooseScenario chosenScenario={chosenScenario} />
          </Grid>
        </Grid>
      </Container>
    </Page>
  )
}

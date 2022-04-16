import React, { useState, useEffect } from "react";
import { CircularGridLines, DiscreteColorLegend } from "react-vis";
import { RadarChart } from "react-vis";
import "react-vis/dist/style.css";
import "./Radar.css";
import sampleIndicatorData from "../../../../settings/sampleIndicatorData.json";

// const radarSize = 1000;
// const radarFontSize = 20;
const colorRange = ["#ff5278", "#660016"];

export default function Radar(props) {
    const radarSize = props.radarSize ? props.radarSize : 1000;
    const radarFontSize = props.radarFontSize ? props.radarFontSize : 20;
    const [radarData, setRadarData] = useState(null);
    const [sampleRadarData, setSampleRadarData] = useState(null);

    const createRadarData = (indicators) => {
        let r = {};
        let f = {};
        let domains = [];
        for (let i = 0; i < indicators.length; i++) {
            if (indicators[i].viz_type === "radar") {
                r[indicators[i].name] = [indicators[i].value];
                f[indicators[i].name] = [indicators[i].ref_value];
                indicators[i].domain = [0, 1];
                domains.push(indicators[i]);
            }
        }
        return { radarData: [r, f], domains: domains };
    };

    useEffect(() => {
        try {
            if (
                props &&
                props.cityioData &&
                props.cityioData.indicators &&
                props.cityioData.indicators.length > 0
            ) {
                const d = createRadarData(props.cityioData.indicators);
                if (d.domains.length > 0) {
                    setRadarData(d);
                    // console.log(radarData);
                }
                else {
                    let sampleData = createRadarData(sampleIndicatorData);
                    setSampleRadarData(sampleData);
                }
            } else {
                let sampleData = createRadarData(sampleIndicatorData);
                setSampleRadarData(sampleData);
            }
        } catch (error) {
            console.log(error);
            let sampleData = createRadarData(sampleIndicatorData);
            setSampleRadarData(sampleData);
        }
    }, [props]);

    return (
        <div>
            {(radarData && radarData.domains) ? (
                <>
                    <RadarChart
                        className="Radar blur"
                        animation
                        data={radarData.radarData}
                        domains={radarData.domains}
                        colorRange={colorRange}
                        style={{
                            polygons: {
                                fillOpacity: 0.2,
                                strokeWidth: 2,
                            },
                            axes: {
                                text: {
                                    opacity: 0,
                                    fontWeight: 700,
                                    fill: "white",
                                    fontFamily: "Roboto Mono",
                                    width: "100",
                                },
                                strokeWidth: 0,
                            },
                            labels: {
                                fontFamily: "Roboto Mono",
                                textAnchor: "middle",
                                fontSize: radarFontSize,
                                fill: "white",
                            },
                        }}
                        margin={{
                            left: radarSize / 6,
                            top: radarSize / 6,
                            bottom: radarSize / 6,
                            right: radarSize / 6,
                        }}
                        width={radarSize}
                        height={radarSize}
                    >
                        <CircularGridLines
                            style={{
                                fill: "white",
                                fillOpacity: 0.1,
                                backgroundColor: "#FFF",
                                opacity: 0.5,
                                stroke: "white",
                                width: 0.1,
                            }}
                            tickValues={[...new Array(11)].map(
                                (v, i) => i / 10 - 1
                            )}
                        />
                    </RadarChart>
                    {/* <DiscreteColorLegend
                        items={["Design", "Reference"]}
                        colors={colorRange}
                        style={{
                            fontFamily: "Roboto Mono",
                        }}
                    /> */}
                </>
            ) : (<>
                <RadarChart
                    className="Radar blur"
                    animation
                    data={sampleRadarData ? sampleRadarData.radarData : []}
                    domains={sampleRadarData ? sampleRadarData.domains : []}
                    colorRange={colorRange}
                    style={{
                        polygons: {
                            fillOpacity: 0.2,
                            strokeWidth: 2,
                        },
                        axes: {
                            text: {
                                opacity: 0,
                                fontWeight: 700,
                                fill: "white",
                                fontFamily: "Roboto Mono",
                            },
                            strokeWidth: 0,
                        },
                        labels: {
                            fontFamily: "Roboto Mono",

                            textAnchor: "middle",
                            fontSize: radarFontSize,
                            fill: "white",
                        },
                    }}
                    margin={{
                        left: radarSize / 6,
                        top: radarSize / 6,
                        bottom: radarSize / 6,
                        right: radarSize / 6,
                    }}
                    width={radarSize}
                    height={radarSize}
                >
                    <CircularGridLines
                        style={{
                            fill: "white",
                            fillOpacity: 0.1,
                            backgroundColor: "#FFF",
                            opacity: 0.5,
                            stroke: "white",
                            width: 0.1,
                        }}
                        tickValues={[...new Array(11)].map(
                            (v, i) => i / 10 - 1
                        )}
                    />
                </RadarChart>
                {/* <DiscreteColorLegend
                    items={["Design", "Reference"]}
                    colors={colorRange}
                    style={{
                        fontFamily: "Roboto Mono",
                    }}
                /> */}
            </>)}
        </div>
    );
}

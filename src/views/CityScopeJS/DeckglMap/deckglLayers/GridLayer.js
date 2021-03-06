import { GeoJsonLayer } from "deck.gl";
import { _handleGridcellEditing } from "../../../../utils/utils";

export default function GridLayer({
    data,
    editOn,
    state: { selectedType, keyDownState, selectedCellsState, pickingRadius },
    updaters: { setSelectedCellsState, setDraggingWhileEditing, setHoveredObj },
    deckGL,
}) {
    return new GeoJsonLayer({
        id: "GRID",
        data,
        pickable: true,
        extruded: true,
        wireframe: true,
        lineWidthScale: 1,
        lineWidthMinPixels: 2,
        getElevation: (d) => d.properties.color,
        getFillColor: (d) => {
            // return d.properties.color
            return d.properties.TypeCode == "DGT" ? [0, 0, 0, 0] : d.properties.color;
        },

        onClick: (event) => {
            if (selectedType && editOn && keyDownState !== "Shift")
                _handleGridcellEditing(
                    event,
                    selectedType,
                    setSelectedCellsState,
                    pickingRadius,
                    deckGL
                );
        },

        onDrag: (event) => {
            if (selectedType && editOn && keyDownState !== "Shift")
                _handleGridcellEditing(
                    event,
                    selectedType,
                    setSelectedCellsState,
                    pickingRadius,
                    deckGL
                );
        },

        onDragStart: () => {
            if (selectedType && editOn && keyDownState !== "Shift") {
                setDraggingWhileEditing(true);
            }
        },

        onHover: (e) => {
            if (e.object) {
                setHoveredObj(e);
            }
        },

        onDragEnd: () => {
            setDraggingWhileEditing(false);
        },
        updateTriggers: {
            getFillColor: selectedCellsState,
            getElevation: selectedCellsState,
        },
        transitions: {
            getFillColor: 500,
            getElevation: 500,
        },
    });
}

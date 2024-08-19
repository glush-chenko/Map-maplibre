import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface PolygonState {
    area: number | null;
    showInputPanel: boolean;
    selectedFeatureId: string | null;
    polygonTool: boolean;
    polygonId: number | null;
    polygonsData: any[],
    selectedCoordinates: any[],
    cancel: boolean;
    deletedId: number | null;
    zoomToPolygon: boolean;
}

const initialState: PolygonState = {
    area: null,
    showInputPanel: false,
    selectedFeatureId: null,
    polygonTool: false,
    polygonId: null,
    polygonsData: [],
    selectedCoordinates: [],
    cancel: false,
    deletedId: null,
    zoomToPolygon: false
};

const polygonSlice = createSlice({
    name: 'polygon',
    initialState,
    reducers: {
        togglePolygonTool(state, action: PayloadAction<boolean>) {
            state.polygonTool = action.payload;
        },
        setPolygonId(state, action) {
            state.polygonId = action.payload;
        },
        setArea(state, action: PayloadAction<number | null>) {
            state.area = action.payload;
        },
        toggleInputPanel(state, action: PayloadAction<boolean>) {
            state.showInputPanel = action.payload;
        },
        setSelectedFeatureId(state, action: PayloadAction<string | null>) {
            state.selectedFeatureId = action.payload;
        },
        setPolygonsData(state, action: PayloadAction<any>) {
            state.polygonsData.push({
                id: state.selectedFeatureId,
                coordinates: state.selectedCoordinates,
                name: action.payload,
                area: state.area
            })
        },
        updatePolygonName(state, action: PayloadAction<{ id: number; name: string }>) {
            const polygon = state.polygonsData.find(p => p.id === action.payload.id);
            if (polygon) {
                polygon.name = action.payload.name;
            }
        },
        setSelectedCoordinates(state, action: PayloadAction<any>) {
            state.selectedCoordinates = action.payload;
        },
        setCancel(state, action: PayloadAction<boolean>) {
            state.cancel = action.payload
        },
        setDeletedId(state, action: PayloadAction<number>) {
            state.deletedId = action.payload;
            state.polygonsData = state.polygonsData.filter(polygon => polygon.id !== action.payload);
        },
        setPolygonsCoords(state, action: PayloadAction<any>) {
            state.polygonsData = state.polygonsData.map((polygon) => {
                if (action.payload.id === polygon.id) {
                    polygon.coordinates = action.payload.coordinates;
                }
                return polygon;
            })
        },
        toggleZoomToPolygon(state, action: PayloadAction<boolean>) {
            state.zoomToPolygon = action.payload;
        }
    },
});

export const {
    setArea,
    toggleInputPanel,
    setSelectedFeatureId,
    togglePolygonTool,
    setPolygonId,
    setPolygonsData,
    setSelectedCoordinates,
    setPolygonsCoords,
    setCancel,
    setDeletedId,
    updatePolygonName,
    toggleZoomToPolygon
} = polygonSlice.actions;
export default polygonSlice.reducer;


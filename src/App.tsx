import React from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import {MapComponent} from "./components/map-component";
import {ControlPanel} from "./components/control-panel/control-panel";
import store from "./app/store";
import {Provider} from "react-redux";

function App() {

    return (
        <Provider store={store}>
            <ControlPanel />
            <MapComponent/>
        </Provider>
    );
}

export default App;

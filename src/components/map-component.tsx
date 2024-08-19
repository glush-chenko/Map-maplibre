import React, {useEffect, useRef} from 'react';
import maplibregl, {LngLat} from 'maplibre-gl';
import * as turf from '@turf/turf';
import {useDispatch, useSelector} from "react-redux";
import {Box} from "@mui/material";
import {RootState} from "../app/store";
import {
    setArea, setCancel, setPolygonId, setPolygonsCoords,
    setSelectedCoordinates,
    setSelectedFeatureId,
    toggleInputPanel,
    togglePolygonTool, toggleZoomToPolygon
} from "./polygon-slice";

declare global {
    interface Window {
        MapboxDraw: any;
    }
}

export const MapComponent: React.FC = () => {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const popupRef = useRef(
        new maplibregl.Popup({
            closeButton: false,
            closeOnClick: false
        })
    );
    const dispatch = useDispatch();
    const [draw, setDraw] = React.useState<any>(null);
    const [map, setMap] = React.useState<maplibregl.Map>();
    const [selectedFeature, setSelectedFeature] = React.useState<any>(null);
    const [lngLtd, setLngLtd] = React.useState<LngLat>();
    const [showPolygons, setShowPolygons] = React.useState(true);
    const {polygonTool, zoomToPolygon, polygonsData, polygonId, cancel, selectedFeatureId, deletedId} = useSelector((state: RootState) => state.polygon);

    const loadScriptsAndStyles = () => {
        // Загрузка Mapbox GL Draw
        const drawScript = document.createElement('script');
        drawScript.src = 'https://www.unpkg.com/@mapbox/mapbox-gl-draw@1.4.3/dist/mapbox-gl-draw.js';
        drawScript.async = true;
        document.body.appendChild(drawScript);

        // Загрузка стилей для Mapbox GL Draw
        const drawStylesheet = document.createElement('link');
        drawStylesheet.rel = 'stylesheet';
        drawStylesheet.href = 'https://www.unpkg.com/@mapbox/mapbox-gl-draw@1.4.3/dist/mapbox-gl-draw.css';
        document.head.appendChild(drawStylesheet);
    };

    const updateArea = (e: any, draw: any) => {
        const features = e.features;

        if (features.length > 0) {
            // Получаем координаты конкретного полигона
            const newFeature = features[0];
            const id = newFeature.id;
            const coordinates = newFeature.geometry.coordinates;

            // Вычисляем площадь только для этого полигона
            const areaInSquareMeters = turf.area(newFeature.geometry);
            const areaInHectares = areaInSquareMeters / 10000;

            dispatch(setArea(Math.round(areaInHectares * 100) / 100));
            dispatch(setSelectedFeatureId(id));
            dispatch(setSelectedCoordinates(coordinates));
            dispatch(setPolygonsCoords({id, coordinates}));

        }
    }

    const updatePolygons = (map: maplibregl.Map, draw: any) => {
        const features = draw.getAll();

        // Проверяем, есть ли хотя бы 2 полигона для пересечения
        if (features.features.length < 2) {
            return;
        }

        // Извлекаем геометрию и преобразуем в формат turf.polygon
        const polygons = features.features.map((feature: any) => {
            return turf.polygon(feature.geometry.coordinates);
        });

        // Находим пересечения между полигонами
        const intersectionFeatures = [];

        for (let i = 0; i < polygons.length; i++) {
            for (let j = i + 1; j < polygons.length; j++) {
                const intersection = turf.intersect(turf.featureCollection([polygons[i], polygons[j]]));

                if (intersection) {
                    intersectionFeatures.push(intersection);
                }
            }
        }

        // Обновляем источник данных для пересечений
        (map?.getSource('Intersections') as maplibregl.GeoJSONSource).setData({
            type: 'FeatureCollection',
            features: intersectionFeatures
        });
    };

    const showPopup = () => {
        if (!lngLtd || !map) return;

        let foundPolygon = null;

        // Проходим по каждому полигону в массиве
        for (const polygon of polygonsData) {
            const coordinates = polygon.coordinates[0];

            // Проверяем, что у нас достаточно координат
            if (coordinates.length < 4) {
                console.warn(`Полигон с ID ${polygon.id} имеет недостаточно координат.`);
                continue;
            }

            // Проверяем, находится ли точка внутри полигона
            if (turf.booleanPointInPolygon([lngLtd.lng, lngLtd.lat], turf.polygon([coordinates]))) {
                foundPolygon = polygon;
                break;
            }
        }

        if (foundPolygon) {
            popupRef.current.setLngLat(lngLtd).setHTML(`<strong>${foundPolygon.name}</strong>`).addTo(map);
        } else {
            popupRef.current.remove();
        }

    }

    const addMapListeners = (map: maplibregl.Map, draw: any) => {

        map?.on('draw.create', (e: any) => {
            (map.getSource('Polygon') as maplibregl.GeoJSONSource).setData(draw.getAll());

            updateArea(e, draw);
            updatePolygons(map, draw);

            dispatch(toggleInputPanel(true));
        });
        map?.on('draw.delete', (e: any) => {
            (map.getSource('Polygon') as maplibregl.GeoJSONSource).setData(draw.getAll());
            updateArea(e, draw);
            updatePolygons(map, draw);
        });
        map?.on('draw.update', (e: any) => {
            (map.getSource('Polygon') as maplibregl.GeoJSONSource).setData(draw.getAll());
            updateArea(e, draw);
            updatePolygons(map, draw);
        });

        map?.on('load', () => {
            //Источник для полигонов
            map.addSource('Polygon', {
                'type': 'geojson',
                'data': {
                    type: 'FeatureCollection',
                    features: []
                }
            });

            // Источник для пересечений
            map.addSource('Intersections', {
                'type': 'geojson',
                'data': {
                    type: 'FeatureCollection',
                    features: []
                }
            });

            // Слой для отображения полигонов
            map.addLayer({
                'id': 'Polygon',
                'type': 'fill',
                'source': 'Polygon',
                'layout': {},
                'paint': {
                    // 'fill-color': '#a0b93c',
                    'fill-opacity': 0
                }
            });

            // Слой для отображения границы полигонов
            // map.addLayer({
            //     'id': 'PolygonOutline',
            //     'type': 'line',
            //     'source': 'Polygon',
            //     'layout': {},
            //     'paint': {
            //         'line-color': '#40751c',
            //         'line-width': 2
            //     }
            // });

            // Слой для отображения пересечений
            map.addLayer({
                'id': 'Intersections',
                'type': 'fill',
                'source': 'Intersections',
                'layout': {},
                'paint': {
                    'fill-color': '#982020',
                    'fill-opacity': 0.5
                }
            });

            map.on('mousemove', (e: any) => {
                setLngLtd(new LngLat(e.lngLat.lng, e.lngLat.lat));
            });

            map.on('mouseleave', 'Polygon', () => {
                map.getCanvas().style.cursor = '';
                popupRef.current.remove();
            });

            map.on('click', 'Polygon', (e: any) => {
                const features = map.queryRenderedFeatures(e.point, {
                    layers: ['Polygon']
                });

                if (features.length > 0) {
                    setSelectedFeature(features[0]);
                }
            });
        });
    }

    const addMapControls = (map: maplibregl.Map, draw: any) => {
        map?.addControl(new maplibregl.NavigationControl());
        map?.addControl(draw);

        map?.addControl(new maplibregl.ScaleControl({maxWidth: 80}));
        map?.addControl(
            new maplibregl.GeolocateControl({
                positionOptions: {
                    enableHighAccuracy: true
                },
                trackUserLocation: false
            })
        );

        map?.addControl(new maplibregl.FullscreenControl());
    }

    const initMap = () => {
        if (window.MapboxDraw) {
            window.MapboxDraw.constants.classes.CONTROL_BASE = 'maplibregl-ctrl';
            window.MapboxDraw.constants.classes.CONTROL_PREFIX = 'maplibregl-ctrl-';
            window.MapboxDraw.constants.classes.CONTROL_GROUP = 'maplibregl-ctrl-group';

            const map = new maplibregl.Map({
                container: mapContainerRef.current!,
                style: 'https://api.maptiler.com/maps/topo-v2/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL',
                center: [37.6173, 55.7558],
                zoom: 4
            });
            setMap(map);

            const draw = new window.MapboxDraw({
                displayControlsDefault: false,
                controls: {
                    polygon: false,
                    trash: false
                }
            });
            setDraw(draw);

            addMapListeners(map, draw);
            addMapControls(map, draw);
        }
    };

    // const toggleOverlay = () => {
    //     if (showPolygons) {
    //         map?.setLayoutProperty('Polygon', 'visibility', 'none');
    //         map?.setLayoutProperty('PolygonOutline', 'visibility', 'none');
    //     } else {
    //         map?.setLayoutProperty('Polygon', 'visibility', 'visible');
    //         map?.setLayoutProperty('PolygonOutline', 'visibility', 'visible');
    //     }
    //     setShowPolygons(prev => !prev)
    // }

    useEffect(() => {
        loadScriptsAndStyles();
        initMap();

        return () => {
            if (mapContainerRef.current) {
                mapContainerRef.current.innerHTML = '';
            }
        };
    }, []);

    useEffect(() => {
        if (polygonTool && draw) {
            draw.changeMode('draw_polygon');
            dispatch((togglePolygonTool(false)));
        }

        if (polygonId && map) {
            const data = draw.getAll();

            const feature = data.features.find((feature: any) => feature.id === polygonId);

            const coordinates = feature ? feature.geometry.coordinates[0] : [];

            if (coordinates) {
                const bounds = coordinates.reduce((bounds: maplibregl.LngLatBounds, coord: [number, number]) => {
                    return bounds.extend(coord);
                }, new maplibregl.LngLatBounds(coordinates[0], coordinates[0]));

                map?.fitBounds(bounds, {
                    padding: 40
                });
                dispatch(setPolygonId(null))
            }
        }

        if(cancel || deletedId) {
            if (map) {
                draw.delete(cancel ? selectedFeatureId : deletedId);
                // map.setLayoutProperty('Polygon', 'visibility', 'none');
                // map.setLayoutProperty('PolygonOutline', 'visibility', 'none');
                map.setLayoutProperty('Intersections', 'visibility', 'none');
            }

            dispatch(setCancel(false));
        }

        if (zoomToPolygon && !!polygonsData.length) {
            let coordinates;

            if (selectedFeature) {
                coordinates = selectedFeature.geometry.coordinates[0];
            } else {
                const data = draw.getAll();
                if (data.features.length > 0) {
                    coordinates = data.features[data.features.length - 1].geometry.coordinates[0];
                }
            }

            if (coordinates) {
                const bounds = coordinates.reduce((bounds: maplibregl.LngLatBounds, coord: [number, number]) => {
                    return bounds.extend(coord);
                }, new maplibregl.LngLatBounds(coordinates[0], coordinates[0]));

                map?.fitBounds(bounds, {
                    padding: 40
                });
                dispatch(toggleZoomToPolygon(false))
            }
        }
    }, [dispatch, deletedId, polygonTool, draw, polygonId, map, selectedFeatureId, cancel, zoomToPolygon, polygonsData, selectedFeature]);


    useEffect(() => {
        showPopup();
    }, [lngLtd?.lng, lngLtd?.lat])

    return (
        <>
            <Box
                ref={mapContainerRef}
                style={{
                    width: '85%',
                    borderRadius: "1rem",
                    margin: "0.5rem 0"
                }}
            />
        </>
    );
};


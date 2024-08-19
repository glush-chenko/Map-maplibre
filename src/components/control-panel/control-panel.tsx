import React from "react";
import {Box} from "@mui/material";
import HighlightAltIcon from "@mui/icons-material/HighlightAlt";
import FileOpenIcon from "@mui/icons-material/FileOpen";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import PolylineIcon from "@mui/icons-material/Polyline";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {ButtonControl, ControlPanelProps} from "../button-control/button-control";
import {AreaDisplay} from "../area-display";
import {useDispatch, useSelector} from "react-redux";
import {setPolygonId, togglePolygonTool, toggleZoomToPolygon} from "../polygon-slice";
import {RootState} from "../../app/store";
import Typography from "@mui/material/Typography";

const EVENTS: ControlPanelProps[] = [
    {
        icon: <HighlightAltIcon/>,
        text: "Нарисовать поле",
        variant: "outlined",
    },
    {
        icon: <FileOpenIcon/>,
        text: "Загрузить файл",
        variant: "contained",
    },
    {
        icon: <ZoomInIcon/>,
        text: "Приблизить",
        variant: "outlined",
    },
    // {
    //     icon: <PolylineIcon/>,
    //     text: "Измерить расстояние",
    //     variant: "contained",
    // },
    {
        icon: <VisibilityOffIcon/>,
        text: "Скрыть область",
        variant: "contained",
    },
]
export const ControlPanel = () => {
    const {
        showInputPanel,
        selectedFeatureId
    } = useSelector((state: RootState) => state.polygon);
    const dispatch = useDispatch();

    EVENTS[0].onClick = () => {
        dispatch(togglePolygonTool(true));
    };

    EVENTS[2].onClick = () => {
        dispatch(toggleZoomToPolygon(true))
    };

    return (
        <Box sx={{
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            padding: "0.5rem 0",
            gap: "0.5rem",
            overflow: "auto",
            maxWidth: "16rem"
        }}>
            {!showInputPanel ? (
                <>
                    <Box
                        sx={{
                            backgroundColor: "#f1f1f1",
                            borderRadius: "1rem",
                            marginLeft: "0.5rem",
                            padding: "0.5rem 0"
                        }}
                    >
                        {EVENTS.map((event, index) => (
                            <ButtonControl
                                key={index}
                                icon={event.icon}
                                variant={event.variant}
                                text={event.text}
                                onClick={event.onClick}
                            />
                        ))}
                    </Box>
                    <AreaDisplay/>
                </>
            ) : (
                <>
                    <Typography variant="h6" component="div" sx={{paddingLeft: "1rem"}}>
                        Новое поле
                    </Typography>
                    <AreaDisplay/>
                </>
            )}
        </Box>
    );
}
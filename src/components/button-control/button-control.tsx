import React from "react";
import {Button} from "@mui/material";

export interface ControlPanelProps {
    icon: React.ReactNode,
    text: string,
    variant: 'text' | 'outlined' | 'contained',
    onClick?: () => void;
}

export const ButtonControl = (props: ControlPanelProps) => {
    const {icon, text, variant, onClick} = props;

    return (
        <Button
            startIcon={icon}
            variant={variant}
            style={{
                display: "flex",
                justifyContent: "flex-start",
                width: "90%",
                border: "none"
            }}
            onClick={onClick}
        >
            {text}
        </Button>
    )
}
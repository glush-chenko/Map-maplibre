import React, {useCallback} from 'react';
import Box from "@mui/material/Box";
import Typography from '@mui/material/Typography';
import {RootState} from "../app/store";
import {useDispatch, useSelector} from "react-redux";
import {Button, TextField} from "@mui/material";
import {
    setArea,
    setCancel,
    setDeletedId,
    setPolygonId,
    setPolygonsData,
    toggleInputPanel,
    updatePolygonName
} from "./polygon-slice";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

export const AreaDisplay = () => {
    const dispatch = useDispatch();
    const {
        area,
        showInputPanel,
        polygonsData
    } = useSelector((state: RootState) => state.polygon);
    const [name, setName] = React.useState('');
    const [isTouched, setIsTouched] = React.useState(false);
    const [editingPolygonId, setEditingPolygonId] = React.useState<number | null>(null);
    const [editingPolygon, setEditingPolygon] = React.useState<boolean>(false);

    const handleAdd = useCallback(() => {
        if (name) {
            if (editingPolygonId !== null) {
                dispatch(updatePolygonName({ id: editingPolygonId, name }));
                setEditingPolygon(false);
            } else {
                dispatch(setPolygonsData(name));
            }
            dispatch(toggleInputPanel(false));
            setName("");
            setEditingPolygonId(null);
        }
    }, [dispatch, name, editingPolygonId]);

    const handleCancel = useCallback(() => {
        if (!editingPolygon) {
            dispatch(setCancel(true));
        }

        dispatch(toggleInputPanel(false));
        setIsTouched(false);
        setEditingPolygonId(null);
    }, [dispatch, editingPolygon]);

    const handleClick = useCallback((polygonId: number) => {
        dispatch(setPolygonId(polygonId))
    }, [dispatch]);

    const handleBlur = useCallback(() => {
        setIsTouched(true);
    }, []);

    const handleDelete = useCallback((polygonId: number) => {
        dispatch(setDeletedId(polygonId));
    }, [dispatch]);

    const handleEdit = useCallback((polygon: any) => {
        dispatch(toggleInputPanel(true))
        setName(polygon.name);
        dispatch(setArea(polygon.area));
        setEditingPolygonId(polygon.id);
        setEditingPolygon(true);
        dispatch(setPolygonId(polygon.id))
    }, [dispatch]);

    return (
        <>
            {!!showInputPanel && (
                <Box sx={{
                    backgroundColor: "#f1f1f1",
                    borderRadius: "1rem",
                    marginLeft: "0.5rem",
                    padding: "0.5rem",
                    textAlign: "center",
                }}>
                    <TextField
                        required
                        multiline
                        inputProps={{
                            maxLength: 40,
                        }}
                        autoFocus
                        size="small"
                        variant="outlined"
                        label="Название поля"
                        fullWidth
                        error={isTouched && !name.trim()}
                        value={name}
                        onBlur={handleBlur}
                        onChange={(e) => setName(e.target.value)}
                        helperText={isTouched && name.trim() === "" ? 'Обязательное поле' : ''}
                    />
                    <Typography
                        variant="subtitle2"
                        component="div"
                        sx={{color: "gray"}}
                    >
                        ~{area ? `${area} ГА` : '0 ГА'}
                    </Typography>
                    <Box sx={{display: "flex", gap: "1rem"}}>
                        <Button onClick={handleAdd} variant="contained">{editingPolygon ? "Сохранить" : "Добавить"}</Button>
                        <Button onClick={handleCancel}>Отмена</Button>
                    </Box>
                </Box>
            )}
            {(!showInputPanel && !!polygonsData.length) && (
                <List
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.5rem",
                        marginLeft: "0.5rem",
                    }}
                >
                    {polygonsData.map((polygon) => (
                        <ListItem
                            disablePadding
                            sx={{backgroundColor: "#f1f1f1", borderRadius: "1rem"}}
                            key={polygon.id}
                        >
                            <ListItemButton
                                sx={{
                                    borderRadius: "1rem",
                                    display: "flex",
                                    flexDirection: "column"
                                }}
                                onClick={() => handleClick(polygon.id)}
                            >
                                <ListItemText
                                    style={{
                                        textAlign: "center",
                                        wordBreak: "break-word",
                                        whiteSpace: "pre-wrap",
                                        textOverflow: "ellipsis",
                                        display: "-webkit-box",
                                        overflow: "hidden",
                                        WebkitLineClamp: '2',
                                        WebkitBoxOrient: 'vertical'
                                    }}
                                >{polygon.name}</ListItemText>
                                <ListItemText
                                    sx={{color: "gray", textAlign: "center",}}>{polygon.area} ГА</ListItemText>
                            </ListItemButton>
                            <ListItemButton
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center",
                                    gap: "0.5rem",
                                    height: "100%",
                                    flexGrow: 0,
                                    padding: "0.5rem",
                                    borderRadius: "1rem"
                                }}
                            >
                                <ListItemIcon style={{minWidth: 0}} onClick={() => handleDelete(polygon.id)}>
                                    <DeleteIcon/>
                                </ListItemIcon>
                                <ListItemIcon style={{minWidth: 0}} onClick={() => handleEdit(polygon)}>
                                    <EditIcon/>
                                </ListItemIcon>
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            )}
        </>
    );
}
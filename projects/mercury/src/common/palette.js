import React from 'react';

import {makeStyles} from '@material-ui/core/styles';
import {
    amber,
    blue,
    blueGrey,
    deepOrange,
    deepPurple,
    green,
    indigo,
    lightBlue,
    lightGreen, pink, teal
} from '@material-ui/core/colors';
import Chip from '@material-ui/core/Chip';

export const usePalette = makeStyles((theme) => ({
    orange: {
        color: theme.palette.getContrastText(deepOrange[400]),
        backgroundColor: deepOrange[400]
    },
    orangeBorder: {
        borderColor: deepOrange[400]
    },
    purple: {
        color: theme.palette.getContrastText(deepPurple[500]),
        backgroundColor: deepPurple[500]
    },
    purpleBorder: {
        borderColor: deepPurple[500]
    },
    blueGrey: {
        color: theme.palette.getContrastText(blueGrey[500]),
        backgroundColor: blueGrey[500]
    },
    blueGreyBorder: {
        borderColor: blueGrey[500]
    },
    green: {
        color: theme.palette.getContrastText(green[200]),
        backgroundColor: green[200]
    },
    greenBorder: {
        borderColor: green[200]
    },
    blue: {
        color: theme.palette.getContrastText(blue[500]),
        backgroundColor: blue[500]
    },
    blueBorder: {
        borderColor: blue[500]
    },
    amber: {
        color: theme.palette.getContrastText(amber[300]),
        backgroundColor: amber[300]
    },
    amberBorder: {
        borderColor: amber[300]
    },
    indigo: {
        color: theme.palette.getContrastText(indigo[500]),
        backgroundColor: indigo[500]
    },
    indigoBorder: {
        borderColor: indigo[500]
    },
    lightBlue: {
        color: theme.palette.getContrastText(lightBlue[200]),
        backgroundColor: lightBlue[200]
    },
    lightBlueBorder: {
        borderColor: lightBlue[200]
    },
    lightGreen: {
        color: theme.palette.getContrastText(lightGreen[400]),
        backgroundColor: lightGreen[400]
    },
    lightGreenBorder: {
        borderColor: lightGreen[400]
    },
    teal: {
        color: theme.palette.getContrastText(teal[500]),
        backgroundColor: teal[500]
    },
    tealBorder: {
        borderColor: teal[500]
    },
    pink: {
        color: theme.palette.getContrastText(pink[500]),
        backgroundColor: pink[500]
    },
    pinkBorder: {
        borderColor: pink[500]
    }
}));

export const BackgroundColorsPalette = () => {
    const palette = usePalette();
    const backgroundColors = {
        'Orange': palette.orange,
        'Purple': palette.purple,
        'Blue grey': palette.blueGrey,
        'Green': palette.green,
        'Blue': palette.blue,
        'Amber': palette.amber,
        'Indigo': palette.indigo,
        'Light blue': palette.lightBlue,
        'Light green': palette.lightGreen,
        'Teal': palette.teal,
        'Pink': palette.pink
    };
    return (
        <>
            {Object.entries(backgroundColors).map(([colorName, colorClass]) => <Chip key={colorName} className={colorClass} label={colorName} />)}
        </>
    );
};

export const BorderColorsPalette = () => {
    const palette = usePalette();
    const backgroundColors = {
        'Orange': palette.orangeBorder,
        'Purple': palette.purpleBorder,
        'Blue grey': palette.blueGreyBorder,
        'Green': palette.greenBorder,
        'Blue': palette.blueBorder,
        'Amber': palette.amberBorder,
        'Indigo': palette.indigoBorder,
        'Light blue': palette.lightBlueBorder,
        'Light green': palette.lightGreenBorder,
        'Teal': palette.tealBorder,
        'Pink': palette.pinkBorder
    };
    return (
        <>
            {Object.entries(backgroundColors).map(([colorName, colorClass]) => (
                <Chip key={colorName} className={colorClass} label={colorName} variant="outlined" />
            ))}
        </>
    );
};

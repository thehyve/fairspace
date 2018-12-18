import React from 'react';
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardMedia from "@material-ui/core/CardMedia";
import CardActions from "@material-ui/core/CardActions";
import Button from "@material-ui/core/Button";
import {withStyles} from "@material-ui/core";
import asPage from "../../containers/asPage/asPage";
import BreadCrumbs from "../../components/generic/BreadCrumbs/BreadCrumbs";
import Config from "../../services/Config/Config";

const styles = theme => ({
    card: {
        maxWidth: 345,
    },
    media: {
        height: 140,
        backgroundSize: 'contain',
        margin: theme.spacing.unit
    },
});

const Notebooks = ({classes}) => (
    <React.Fragment>
        <BreadCrumbs />

        <Card className={classes.card}>
            <CardActionArea>
                <CardMedia
                    className={classes.media}
                    image="/images/jupyter.svg"
                    title="JupyterHub"
                />
                <CardContent>
                    <Typography gutterBottom variant="h5" component="h2">
                        Jupyter Notebook
                    </Typography>
                    <Typography component="p">
                        The Jupyter Notebook is an open-source web application that allows
                        you to create and share documents that contain live code, equations,
                        visualizations and narrative text.
                    </Typography>
                </CardContent>
            </CardActionArea>
            <CardActions>
                <a href={Config.get().urls.jupyter} target="_blank" rel="noopener noreferrer">
                    <Button size="small" color="primary">
                        Open
                    </Button>
                </a>
            </CardActions>
        </Card>

    </React.Fragment>
);

export default asPage(withStyles(styles)(Notebooks));

import React, {useState} from 'react';
import {Card, CardContent, CardHeader, Collapse, IconButton, withStyles} from "@material-ui/core";
import {ExpandMore} from "@material-ui/icons";
import CircularProgress from "@material-ui/core/CircularProgress";
import LinearProgress from "@material-ui/core/LinearProgress";
import classnames from "classnames";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import {
    UPLOAD_STATUS_ERROR,
    UPLOAD_STATUS_FINISHED,
    UPLOAD_STATUS_IN_PROGRESS,
    UPLOAD_STATUS_INITIAL
} from "./UploadsContext";

const styles = theme => ({
    expand: {
        transform: 'rotate(0deg)',
        marginLeft: 'auto',
        transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
        }),
    },
    expandOpen: {
        transform: 'rotate(180deg)',
    },
});

export const UploadProgressComponent = ({uploads = [], classes}) => {
    const [uploading, setUploading] = useState(false);
    const [expanded, setExpanded] = useState(true);

    const toggleExpand = () => setExpanded(!expanded);

    const progress = upload => {
        switch (upload.status) {
            case UPLOAD_STATUS_INITIAL:
                return "Upload pending";
            case UPLOAD_STATUS_IN_PROGRESS:
                return <LinearProgress variant="determinate" value={upload.progress} />;
            case UPLOAD_STATUS_FINISHED:
                return "Finished";
            case UPLOAD_STATUS_ERROR:
                return "Error uploading";
            default:
                return "";
        }
    };

    const cardHeaderAction = (
        <>
            {uploading && (<CircularProgress size={10} />)}
            <IconButton
                onClick={toggleExpand}
                className={classnames(classes.expand, {
                    [classes.expandOpen]: expanded,
                })}
                aria-expanded={expanded}
                aria-label="Show more"
            >
                <ExpandMore />
            </IconButton>
        </>
    );

    const renderUploadName = (upload) => (
        <span>
            {upload.destinationPath}/{upload.files[0].name}
            {upload.files.length > 1 && (
                <em> and {upload.files.length - 1} other(s)</em>
            )}
        </span>
    );

    const renderUploadList = () => (
        <div style={{overflowX: 'auto'}}>
            {uploads.length > 0 && (
                <Table>
                    <TableBody>
                        {uploads.map(upload => (
                            <TableRow key={upload.id}>
                                <TableCell>{renderUploadName(upload)}</TableCell>
                                <TableCell>{progress(upload)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    );

    return (
        <Card>
            <CardHeader
                action={cardHeaderAction}
                titleTypographyProps={{variant: 'h6'}}
                title="File upload progress"
            />
            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <CardContent style={{paddingTop: 0}}>
                    {renderUploadList()}
                </CardContent>
            </Collapse>
        </Card>
    );
};

export default withStyles(styles)(UploadProgressComponent);

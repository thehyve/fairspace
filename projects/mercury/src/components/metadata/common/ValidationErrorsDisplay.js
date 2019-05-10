import React from 'react';
import {
    Table, TableBody, TableHead, TableRow,
    TableCell, Typography, ExpansionPanel,
    ExpansionPanelSummary, ExpansionPanelDetails
} from "@material-ui/core";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

export default ({entityErrors, otherErrors}) => {
    const hasOtherErrors = otherErrors && otherErrors.length;
    const hasEntityErrors = entityErrors && entityErrors.length;
    const entityErrorsTable = (
        <Table padding="checkbox">
            <TableHead>
                <TableRow>
                    <TableCell>Field</TableCell>
                    <TableCell>Error</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {entityErrors.map(({predicate, message}) => (
                    <TableRow key={predicate + message}>
                        <TableCell>
                            {predicate}
                        </TableCell>
                        <TableCell>
                            {message}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );

    return (
        <>
            {hasEntityErrors > 0 && (
                hasOtherErrors ? (
                    <ExpansionPanel defaultExpanded>
                        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography>Current entity</Typography>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails>
                            {entityErrorsTable}
                        </ExpansionPanelDetails>
                    </ExpansionPanel>
                ) : entityErrorsTable)}

            {hasOtherErrors > 0 && (
                <ExpansionPanel defaultExpanded={false}>
                    <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>Other affected entities</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                        <Table padding="checkbox">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Subject</TableCell>
                                    <TableCell>Predicate</TableCell>
                                    <TableCell>Error</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {otherErrors.map(({subject, predicate, message}) => (
                                    <TableRow key={subject + predicate + message}>
                                        <TableCell>
                                            {subject}
                                        </TableCell>
                                        <TableCell>
                                            {predicate}
                                        </TableCell>
                                        <TableCell>
                                            {message}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ExpansionPanelDetails>
                </ExpansionPanel>
            )}
        </>
    );
};

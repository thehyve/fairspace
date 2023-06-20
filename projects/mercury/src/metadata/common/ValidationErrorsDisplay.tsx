// @ts-nocheck
import React from "react";
import {Accordion, AccordionDetails, AccordionSummary, Table, TableBody, TableCell, TableHead, TableRow, Typography} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
export default (({
    entityErrors,
    otherErrors
}) => {
    const hasOtherErrors = otherErrors && otherErrors.length > 0;
    const hasEntityErrors = entityErrors && entityErrors.length > 0;
    const entityErrorsTable = <Table padding="checkbox">
        <TableHead>
            <TableRow>
                <TableCell>Field</TableCell>
                <TableCell>Error</TableCell>
            </TableRow>
        </TableHead>
        <TableBody>
            {entityErrors.map(({
                predicate,
                message
            }) => <TableRow key={predicate + message}>
                <TableCell>
                    {predicate}
                </TableCell>
                <TableCell>
                    {message}
                </TableCell>
            </TableRow>)}
        </TableBody>
    </Table>;
    return <>
        {hasEntityErrors && (hasOtherErrors ? // No expansion panel if only entity errors
            <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Current entity</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    {entityErrorsTable}
                </AccordionDetails>
            </Accordion> : entityErrorsTable)}

        {hasOtherErrors && <Accordion defaultExpanded={!hasEntityErrors}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Other affected entities</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Table padding="checkbox">
                    <TableHead>
                        <TableRow>
                            <TableCell>Subject</TableCell>
                            <TableCell>Predicate</TableCell>
                            <TableCell>Error</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {otherErrors.map(({
                            subject,
                            predicate,
                            message
                        }) => <TableRow key={subject + predicate + message}>
                            <TableCell>
                                {subject}
                            </TableCell>
                            <TableCell>
                                {predicate}
                            </TableCell>
                            <TableCell>
                                {message}
                            </TableCell>
                        </TableRow>)}
                    </TableBody>
                </Table>
            </AccordionDetails>
        </Accordion>}
    </>;
});
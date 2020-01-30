import React from 'react';
import {useHistory} from 'react-router-dom';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TablePagination,
    TableRow,
    TableSortLabel,
} from "@material-ui/core";
import {MessageDisplay, usePagination, useSorting} from '../common';

import type {Project} from './ProjectsAPI';

const columns = {
    id: {
        valueExtractor: 'id',
        label: 'Id'
    },
    label: {
        valueExtractor: 'label',
        label: 'Label'
    }
};

const ProjectList = ({
    projects = []
}) => {
    const history = useHistory();

    const onProjectDoubleClick = (project: Project) => {
        history.push(`/projects/${project.id}/`);
    };

    const {orderedItems, orderAscending, orderBy, toggleSort} = useSorting(projects, columns, 'id');
    const {page, setPage, rowsPerPage, setRowsPerPage, pagedItems} = usePagination(orderedItems);

    if (!projects || projects.length === 0) {
        return (
            <MessageDisplay
                message="Please create a project."
                variant="h6"
                withIcon={false}
                isError={false}
                messageColor="textSecondary"
            />
        );
    }

    return (
        <Paper>
            <Table>
                <TableHead>
                    <TableRow>
                        {
                            Object.entries(columns).map(([key, column]) => (
                                <TableCell key={key}>
                                    <TableSortLabel
                                        active={orderBy === key}
                                        direction={orderAscending ? 'asc' : 'desc'}
                                        onClick={() => toggleSort(key)}
                                    >
                                        {column.label}
                                    </TableSortLabel>
                                </TableCell>
                            ))
                        }
                    </TableRow>
                </TableHead>
                <TableBody>
                    {pagedItems.map((project: Project) => (
                        <TableRow
                            key={project.id}
                            hover
                            onClick={() => {}}
                            onDoubleClick={() => onProjectDoubleClick(project)}
                        >
                            {
                                Object.entries(columns).map(([key, column]) => (
                                    <TableCell style={{maxWidth: 160}} component="th" scope="row" key={key}>
                                        {project[column.valueExtractor]}
                                    </TableCell>
                                ))
                            }
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25, 100]}
                component="div"
                count={projects.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onChangePage={(e, p) => setPage(p)}
                onChangeRowsPerPage={e => setRowsPerPage(e.target.value)}
            />
        </Paper>
    );
};

export default ProjectList;

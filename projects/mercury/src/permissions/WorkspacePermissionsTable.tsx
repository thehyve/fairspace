// @ts-nocheck
// @ts-nocheck
import React from "react";
import { IconButton, Table, TableBody, TableCell, TableRow, Tooltip, Typography } from "@mui/material";
import withStyles from "@mui/styles/withStyles";
import { Close, Widgets } from "@mui/icons-material";
import PropTypes from "prop-types";
const styles = {
  table: {
    padding: 0
  },
  tableBody: {
    display: 'block',
    maxHeight: 150,
    overflow: 'auto',
    width: '100%'
  },
  tableRow: {
    display: 'block',
    height: 49,
    width: '100%'
  },
  iconCell: {
    padding: '0 0 0 8px',
    textAlign: 'right'
  },
  emptyPermissions: {
    margin: 15,
    width: 350,
    fontStyle: 'italic'
  }
};
export const WorkspacePermissionsTable = ({
  selectedPermissions = [],
  emptyPermissionsText,
  handleDeleteSelectedPermission,
  canManage,
  classes
}) => {
  if (selectedPermissions.length === 0) {
    return <Typography variant="body2" className={classes.emptyPermissions}>
                {emptyPermissionsText}
            </Typography>;
  }

  return <Table size="small" className={classes.table}>
            <TableBody className={classes.tableBody}>
                {selectedPermissions.map(p => <TableRow key={p.iri} className={classes.tableRow}>
                            <TableCell width={25} className={classes.iconCell}>
                                <Widgets />
                            </TableCell>
                            <TableCell width="100%" data-testid="permission">
                                <Tooltip title={p.name} placement="left-start" arrow>
                                    <Typography variant="body2" noWrap style={{
              width: '100%'
            }}>
                                        {p.name}
                                    </Typography>
                                </Tooltip>
                            </TableCell>
                            <TableCell width={40} className={classes.iconCell} align="right">
                                {canManage && <IconButton onClick={() => handleDeleteSelectedPermission(p)} size="medium">
                                        <Close />
                                    </IconButton>}
                            </TableCell>
                        </TableRow>)}
            </TableBody>
        </Table>;
};
WorkspacePermissionsTable.propTypes = {
  classes: PropTypes.object.isRequired,
  selectedPermissions: PropTypes.array,
  emptyPermissionsText: PropTypes.string,
  handleDeleteSelectedPermission: PropTypes.func.isRequired,
  canManage: PropTypes.bool
};
export default withStyles(styles)(WorkspacePermissionsTable);
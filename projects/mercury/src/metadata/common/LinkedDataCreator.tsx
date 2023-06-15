// @ts-nocheck
// @ts-nocheck
import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button } from "@mui/material";
import useIsMounted from "react-is-mounted-hook";
import LinkedDataShapeChooserDialog from "./LinkedDataShapeChooserDialog";
import NewLinkedDataEntityDialog from "./NewLinkedDataEntityDialog";
const CREATION_STATE_CHOOSE_SHAPE = 'CHOOSE_SHAPE';
const CREATION_STATE_CREATE_ENTITY = 'CREATE_ENTITY';

const LinkedDataCreator = ({
  children,
  shapesLoading,
  shapesError,
  shapes,
  requireIdentifier,
  onCreate
}) => {
  const [shape, setShape] = useState();
  const [creationState, setCreationState] = useState();
  const isMounted = useIsMounted();

  const startCreating = e => {
    e.stopPropagation();
    setCreationState(CREATION_STATE_CHOOSE_SHAPE);
  };

  const chooseShape = chosenShape => {
    setShape(chosenShape);
    setCreationState(CREATION_STATE_CREATE_ENTITY);
  };

  const closeDialog = e => {
    if (e) e.stopPropagation();
    if (isMounted()) setCreationState();
  };

  return <>
            <LinkedDataShapeChooserDialog open={creationState === CREATION_STATE_CHOOSE_SHAPE} shapes={shapes} onChooseShape={chooseShape} onClose={closeDialog} />

            {creationState === CREATION_STATE_CREATE_ENTITY && <NewLinkedDataEntityDialog shape={shape} onClose={closeDialog} onCreate={onCreate} requireIdentifier={requireIdentifier} />}

            {children}

            <Button variant="contained" color="primary" aria-label="Add" title="Create a new metadata entity" onClick={startCreating} style={{
      margin: '10px 0'
    }} disabled={shapesLoading || !!shapesError || !shapes || shapes.length === 0}>
                Create
            </Button>
        </>;
};

LinkedDataCreator.propTypes = {
  shapes: PropTypes.array,
  requireIdentifier: PropTypes.bool,
  onCreate: PropTypes.func
};
LinkedDataCreator.defaultProps = {
  requireIdentifier: true,
  onCreate: () => {}
};
export default LinkedDataCreator;
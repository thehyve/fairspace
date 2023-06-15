// @ts-nocheck
// @ts-nocheck
import React, { useEffect } from "react";
import { useLinkedDataNoContext } from "../UseLinkedData";
import { MemoryRouter, useHistory } from "react-router-dom";

const WrapperWithPushToHistory = ({
  children
}) => {
  const history = useHistory();
  useEffect(() => history.push(), [history]);
  return children;
};

const LinkedDataParentMock = props => {
  const {
    iri,
    context
  } = props;
  context.result = useLinkedDataNoContext(iri, context);
  return <MemoryRouter>
            <WrapperWithPushToHistory>
            </WrapperWithPushToHistory>
        </MemoryRouter>;
};

export { LinkedDataParentMock };
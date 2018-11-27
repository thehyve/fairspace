import React from 'react';
import asPage from "../../containers/asPage/asPage";
import BreadCrumbs from "../../components/generic/BreadCrumbs/BreadCrumbs";
import EntityInformation from '../../components/metadata/EntityInformation';

export class MetadataEntityPage extends React.Component {

    render() {
        return (
            <div>
                <BreadCrumbs/>
                <EntityInformation {...this.props}/>
            </div>
        );
    }
}

export default asPage(MetadataEntityPage);




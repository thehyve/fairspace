import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Typography from "@material-ui/core/Typography";
import StringValue from "./values/StringValue";
import ReferringValue from "./values/ReferringValue";
import {connect} from 'react-redux';
import {updateMetadata} from "../../actions/metadata";

/**
 * Shows the property and values for the property
 */
class MetadataProperty extends React.Component {
    saveValue = index => newValue => {
        const {subject, property} = this.props;
        const currentEntry = property.values.find(el => el.index === index);

        if(currentEntry.value !== newValue) {
            const updatedValues = property.values.map(el => {
                if(el.index === index) {
                    return {index: index, value: newValue}
                } else {
                    return el;
                }
            })

            return this.props.dispatch(updateMetadata(subject, property.key, updatedValues))
        } else {
            return Promise.resolve();
        }
    }

    render() {
        const {property} = this.props;

        const items = property.values.map(entry => this.renderEntry(entry));
        const values = <List dense={true}>{items}</List>

        return <ListItem key={property.key} style={{display: 'block'}}>
            <Typography variant="body2">{property.label}</Typography>
            {values}
        </ListItem>
    }

    renderEntry(entry) {
        const {property} = this.props;
        const Component = this.getValueComponentForProperty(property);
        return <ListItem key={entry.index}>
                <Component property={property} entry={entry} onBlur={this.saveValue(entry.index)}/>
            </ListItem>
    }

    getValueComponentForProperty(property) {
        switch(property.range) {
            case 'http://www.w3.org/TR/xmlschema11-2/#string':
                return StringValue;
            default:
                return ReferringValue;
        }
    }

}

const mapStateToProps = (state, ownProps) => {
    return {
        // saving: state.metadata[ownProps.subject][ownProps.property].pending
    }
}

export default connect(mapStateToProps)(MetadataProperty)

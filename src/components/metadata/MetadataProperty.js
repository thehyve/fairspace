import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Typography from "@material-ui/core/Typography";
import StringValue from "./values/StringValue";
import ReferringValue from "./values/ReferringValue";
import LinearProgress from "@material-ui/core/LinearProgress";
import ErrorDialog from "../error/ErrorDialog";

/**
 * Shows the property and values for the property
 */
class MetadataProperty extends React.Component {
    state = {
        saving: false
    }

    constructor(props) {
        super(props);

        // Store the list of values for this property with an
        // additional index. This is done because some
        // list items may not contain an @id and the @value
        // is not suitable to uniquely identify the entry
        this.extendValuesWithIndex(props.property.values);
    }

    extendValuesWithIndex(values) {
        this.values = values ? values.map((value, index) => Object.assign({}, value, {index: index})) : [];
    }

    saveValue = index => newValue => {
        const {subject, property} = this.props;
        const currentEntry = this.values.find(el => el.index === index);

        if(currentEntry.value !== newValue) {
            const updatedValues = this.values.map(el => {
                if(el.index === index) {
                    return {index: index, value: newValue}
                } else {
                    return el;
                }
            })

            this.setState({saving: true});

            return this.props.metadataAPI
                    .update(subject, property.key, updatedValues)
                    .catch(e => ErrorDialog.showError(e, "An error occurred while updating metadata"))
                    .then(() => {
                        this.values = updatedValues;
                        this.setState({saving: false})
                    });

        } else {
            return Promise.resolve();
        }
    }

    render() {
        const {property} = this.props;
        let values;

        if(this.state.saving) {
            values = <LinearProgress />
        } else {
            const items = this.values.map(entry => this.renderEntry(entry));
            values = <List dense={true}>{items}</List>
        }

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

export default MetadataProperty

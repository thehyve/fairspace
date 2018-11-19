import React from 'react';

const withHovered = (WrappedComponent) => {

    return class extends React.Component {

        constructor(props) {
            super(props);
            this.state = {
                hovered: null,
            };

        }

        handleOnItemMouseOver = (value) => {
            this.setState({
                hovered: value
            })
        };

        handleOnItemMouseOut = (value) => {
            if (this.state.hovered === value) {
                this.setState({hovered: null})
            }
        };

        render() {
            return <WrappedComponent {...this.props} onItemMouseOver={this.handleOnItemMouseOver}
                                     onItemMouseOut={this.handleOnItemMouseOut} hovered={this.state.hovered}
            />;
        }
    }
};

export default withHovered;

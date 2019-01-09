import React from 'react';

/**
 * This component handles doubleclicks and single
 * clicks on a single component. By default, the onClick
 * handler is called by React for double clicks as well.
 */
class ClickHandler extends React.Component {
    constructor(props) {
        super(props);
        this.props = props;

        this.doubleClickTimeout = props.doubleClickTimeout || 400;

        this.onSingleClick = props.onSingleClick;
        this.onDoubleClick = props.onDoubleClick;

        this.clickCount = 0;
        this.singleClickTimer = '';
    }

    handleClicks() {
        this.clickCount += 1;
        if (this.clickCount === 1) {
            this.singleClickTimer = setTimeout(() => {
                this.clickCount = 0;

                if (this.onSingleClick) {
                    this.onSingleClick();
                }
            }, this.doubleClickTimeout);
        } else if (this.clickCount === 2) {
            clearTimeout(this.singleClickTimer);
            this.clickCount = 0;

            if (this.onDoubleClick) {
                this.onDoubleClick();
            }
        }
    }

    render() {
        const {
            children: childrenProp,
            component: componentProp,
            onSingleClick,
            onDoubleClick,
            ...componentProps
        } = this.props;

        const Component = componentProp || 'div';

        return (
            <Component
                onMouseOver={this.props.onMouseOver}
                onMouseOut={this.props.onMouseOut}
                onClick={() => this.handleClicks()}
                {...componentProps}
            >
                {this.props.children}
            </Component>
        );
    }
}

export default ClickHandler;

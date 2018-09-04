import React from 'react';
import PropTypes from 'prop-types';
import ErrorMessage from "../../error/ErrorMessage";

class Loader extends React.Component {
    static propTypes = {
        what: PropTypes.string,
        onLoad: PropTypes.func,
        onRender: PropTypes.func
    };

    constructor(props) {
        super(props);

        this.what = props.what || 'data';
        this.onLoad = props.onLoad;
        this.onRender = props.onRender;

        this.state = {
            status: 'loading',
            data: null
        };
    }

    componentWillMount() {
        this.loadData();
    }

    loadData() {
        this.setState({status: 'loading'});

        Promise.resolve(this.onLoad())
            .then(data => {
                if (this.willUnmount) return;
                this.setState({status: 'loaded', data: data});
            })
            .catch(e => {
                console.error(`Error loading ${this.what}`, e);
                if (this.willUnmount) return;
                this.setState({status: 'error'});
            });
    }

    componentWillUnmount() {
        this.willUnmount = true
    }

    componentWillReceiveProps(nextProps) {
        if (this.subject !== nextProps.subject) {
            this.subject = nextProps.subject;
            this.loadData();
        }
    }

    render() {
        switch (this.state.status) {
            case 'loading':
                return (<div>Loading...</div>);
            case 'error':
                return (<ErrorMessage>message={`Error loading ${this.what}`}</ErrorMessage>);
            default:
                return this.state.data
                    ? this.onRender(this.state.data)
                    : (<div>{`No ${this.what} to display`}</div>);
        }
    }
}

export default Loader

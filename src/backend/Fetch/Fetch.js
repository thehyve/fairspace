import { Component } from "react"
import PropTypes from "prop-types"

const isEvent = obj => obj && obj.preventDefault && obj.stopPropagation

class Fetch extends Component {
    static propTypes = {
        method: PropTypes.oneOf(["get", "post", "put", "delete"]),
        url: PropTypes.string.isRequired,
        params: PropTypes.object,
        headers: PropTypes.object,
        body: PropTypes.object,
        lazy: PropTypes.bool,
        transformError: PropTypes.func,
        onResponse: PropTypes.func,
        onData: PropTypes.func,
        onError: PropTypes.func,
        children: PropTypes.func
    }

    static defaultProps = {
        method: "get",
        lazy: false,
        transformError: error => error
    }

    static defaultHeaders = {
        'X-Requsted-With': 'XMLHttpRequest'
    }

    state = {
        isFetching: !this.props.lazy,
        response: null,
        data: null,
        error: null
    }

    componentDidMount() {
        if (this.props.lazy) {
            return
        }
        this.dispatch(this.props.body, this.props)
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.lazy) {
            return
        }
        const compareProps = [
            "method",
            "url",
            "params",
            "headers",
            "body"
        ]

        // If any of the variables is changed, dispatch
        for(let prop of compareProps) {
            if(nextProps[prop] !== this.props[prop]) {
                this.dispatch(nextProps.body, nextProps)
            }
        }
    }

    componentWillUnmount() {
        this.willUnmount = true
    }

    dispatch = (body = this.props.body, props = this.props) => {
        this.setState({ isFetching: true, error: null })

        // Append extra headers used in the backend
        let headers = this.extendWithDefaultHeaders(props.headers);

        fetch(
            this.buildUrl(props.url, props.params),
            {
                method: props.method,
                headers: headers,
                body: isEvent(body) ? null : body,
                credentials: 'same-origin'
            })
            .then(response => {
                if (this.willUnmount) {
                    return
                }

                if (props.onResponse) {
                    props.onResponse(null, response)
                }

                if(response.ok) {
                    return response.json();
                } else if(response.status === 401 || response.status === 403) {
                    // When the authentication has failed, the user is being sent to the login page
                    window.location.href = '/login';
                    throw Error('Authentication failed. Redirecting to login page');
                } else {
                    console.error("An error occurred while fetching", props.url,": ", response.status, response.statusText);
                    throw Error(response.statusText);
                }
            })
            .then(data => {
                if (this.willUnmount) {
                    return
                }
                if (props.onData) {
                    props.onData(data)
                }
                this.setState({
                    isFetching: false,
                    data: data
                })
            })
            .catch(error => {
                if (this.willUnmount) {
                    return
                }
                const transformedError = props.transformError(error, body)
                if (props.onResponse) {
                    props.onResponse(transformedError, null)
                }
                if (props.onError) {
                    props.onError(transformedError)
                }
                this.setState({
                    isFetching: false,
                    response: transformedError,
                    error: transformedError
                })
            })
    }

    extendWithDefaultHeaders(headers) {
        return Object.assign({}, headers, Fetch.defaultHeaders);
    }

    render() {
        if (!this.props.children) {
            return null
        }
        return (
            this.props.children({
                isFetching: this.state.isFetching,
                response: this.state.response,
                data: this.state.data,
                error: this.state.error,
                dispatch: this.dispatch
            }) || null
        )
    }

    buildUrl(url, params) {
        if(!params) {
            return url;
        }

        var queryString = Object.keys(params).map(key => key + '=' + params[key]).join('&');
        var separator = url.indexOf('?') > -1 ? '&' : '?';
        return url + separator + queryString;
    }
}

export default Fetch

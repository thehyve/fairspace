import React from 'react';
import ReactDOM from 'react-dom';
import 'typeface-roboto';
import '@material-ui/icons';
import './index.css';
import axios from "axios";
import App from './App';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(
    <App />,
    document.getElementById('root')
);

registerServiceWorker();

axios.defaults.headers.common['X-Requested-With'] = "XMLHttpRequest";

import React from 'react';
import {createRoot} from 'react-dom/client';
import 'typeface-roboto';
import '@mui/icons-material';
import './index.css';
import axios from "axios";
import App from './App';
import registerServiceWorker from './registerServiceWorker';

axios.defaults.headers.common['X-Requested-With'] = "XMLHttpRequest";

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);

registerServiceWorker();

import {APPLICATION_NAME} from "../constants";

const VersionInfo = {
    id: process.env.REACT_APP_NAME,
    name: APPLICATION_NAME,
    description: '',
    version: process.env.REACT_APP_VERSION
};

export default VersionInfo;

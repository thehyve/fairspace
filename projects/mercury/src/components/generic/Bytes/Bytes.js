/* eslint-disable no-restricted-properties */
const MULTIPLIER = 1024;
const UNITS = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

function Bytes(props) {
    const size = props.value;
    if (!size) {
        return '0 bytes';
    }
    const magnitude = Math.floor(Math.log(size) / Math.log(MULTIPLIER));
    const unit = UNITS[magnitude];
    const decimals = 0;

    return `${(size / Math.pow(MULTIPLIER, magnitude)).toFixed(decimals)} ${unit}`;
}

export default Bytes;

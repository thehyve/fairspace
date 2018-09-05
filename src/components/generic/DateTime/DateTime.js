const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
};
const dateFormatter = new Intl.DateTimeFormat('en-US', options);

function DateTime(props) {
    return dateFormatter.format(props.value);
}

export default DateTime;

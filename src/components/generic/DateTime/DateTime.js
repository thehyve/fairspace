const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
};
const dateFormatter = new Intl.DateTimeFormat('en-US', options);

function DateTime(props) {
    return dateFormatter.format(new Date(props.value));
}

export default DateTime;

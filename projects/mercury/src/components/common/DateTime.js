const dateFormatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
});

const timeFormatter = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric'
});

const formatDateTime = (date) => {
    const today = new Date();
    const isToday = (today.toDateString() === date.toDateString());
    return isToday ? timeFormatter.format(date) : dateFormatter.format(date);
};

const DateTime = ({value}) => formatDateTime(new Date(value));

export default DateTime;

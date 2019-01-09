import React from 'react';

class DateTime extends React.Component {
    optionsDate = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }

    optionsTime = {
        hour: 'numeric',
        minute: 'numeric'
    }

    dateFormatter = new Intl.DateTimeFormat('en-US', this.optionsDate);
    timeFormatter = new Intl.DateTimeFormat('en-US', this.optionsTime);

    formatDateTime = (date) => {
        const today = new Date();
        const isToday = (today.toDateString() === date.toDateString());
        return isToday ? this.timeFormatter.format(date) : this.dateFormatter.format(date);
    }

    render() {
        const {value} = this.props;
        return this.formatDateTime(new Date(value));
    }
}

export default DateTime;

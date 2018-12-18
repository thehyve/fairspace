import React from 'react';

class DateTime extends React.Component {
    options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
    }

    dateFormatter = new Intl.DateTimeFormat('en-US', this.options);

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

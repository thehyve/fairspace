import moment from 'moment';
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

    timeUnits = ['year', 'month', 'day', 'hour', 'minute', 'second'];

    formatMoment = (date) => {
        let t1 = moment(Date.now());
        let t2 = moment(date);
        let past = t2.isBefore(t1);
        for (let i = 0; i < this.timeUnits.length; i++) {
            let unit = this.timeUnits[i];
            let diff = Math.abs(Math.round(t1.diff(t2, unit)));
            if (diff > 0) {
                return `${past ? '' : 'in '}${diff} ${unit}${diff > 1 ? 's' : ''}${past ? ' ago' : ''}`;
            }
        }
        return 'now';
    }

    render() {
        const {full, value} = this.props;
        return full ?
            this.dateFormatter.format(new Date(value)) :
            this.formatMoment(new Date(value));
    }
}

export default DateTime;

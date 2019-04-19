const conditionApplisToAnyValue = (values, condition) => values && values.some(condition);

export const maxLengthValidation = (maxLength, values) => (conditionApplisToAnyValue(values, ({length}) => length > maxLength)
    ? `The maximum length is ${maxLength}` : null);

export const minCountValidation = (minCount, values) => ((!values || values.length < minCount)
    ? `The minimum number of values is ${minCount}` : null);

export const maxCountValidation = (maxCount, values) => ((values && values.length > maxCount)
    ? `The maximum number of values is ${maxCount}` : null);

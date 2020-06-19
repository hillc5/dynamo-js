const STRING_TYPE = 'S';
const NUM_TYPE = 'N';

const isString = val => Object.prototype.toString.call(val) === '[object String]';
const isNum = val => !isNaN(val) && typeof val === 'number';

const getType = val => {
    if (isString(val)) return STRING_TYPE;
    if (isNum(val)) return NUM_TYPE;
    return STRING_TYPE;
};

const toDynamoEntry = val => {
    const type = getType(val);
    switch (type) {
        case NUM_TYPE:
        case STRING_TYPE:
            return { [type]: val };
        default:
            return { [STRING_TYPE]: val };
    }
};

module.exports = {
    isString,
    isNum,
    toDynamoEntry,
};

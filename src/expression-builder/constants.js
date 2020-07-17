const EQ = '=';
const PLUS = '+';
const MINUS = '-';
const LT = '<';
const GT = '>';
const LE = '<=';
const GE = '>=';

const AND = 'AND';
const OR = 'OR';
const BETWEEN = 'BETWEEN';

const GROUP_START = '(';
const GROUP_END = ')';

const SET = 'SET';
const REMOVE = 'REMOVE';
const ADD = 'ADD';
const DELETE = 'DELETE';

const PREFIX = 'eb';

const LIST_INDEX_REG = /\[\d+\]/g;

const DATA_TYPES = {
    STRING: 'S',
    STRING_SET: 'SS',
    NUMBER: 'N',
    NUMBER_SET: 'NS',
    BINARY: 'B',
    BINARY_SET: 'BS',
    BOOLEAN: 'BOOL',
    NULL: 'NULL',
    LIST: 'L',
    MAP: 'M',
};

module.exports = {
    EQ,
    PLUS,
    MINUS,
    LT,
    GT,
    LE,
    GE,
    AND,
    OR,
    BETWEEN,
    GROUP_START,
    GROUP_END,
    SET,
    REMOVE,
    ADD,
    DELETE,
    PREFIX,
    LIST_INDEX_REG,
    DATA_TYPES,
};

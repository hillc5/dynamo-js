AWS = require('aws-sdk');

AWS.config.getCredentials(err => (err ? console.log(err.stack) : undefined));
const converter = AWS.DynamoDB.Converter;
const CLIENT = new AWS.DynamoDB();

class ExpressionBuilder {
    static EQ = '=';
    static LT = '<';
    static GT = '>';
    static LE = '<=';
    static GE = '>=';
    static AND = 'AND';
    static BETWEEN = 'BETWEEN';

    constructor() {
        this.attributeNames = new Map();
        this.attributeValues = new Map();
        this.expressionTokens = [];
    }

    hashAttribute(attr) {
        return `#${String(attr).toLowerCase()}`;
    }

    hashValue(val) {
        return `:${String(val)
            .replace(' ', '_')
            .toLowerCase()}`;
    }

    addExpressionToken(token) {
        this.expressionTokens.push(token);
        return this;
    }

    Attribute(attr) {
        const hash = this.hashAttribute(attr);
        this.attributeNames.set(hash, attr);
        this.expressionTokens.push(hash);
        return this;
    }

    Value(val) {
        const hash = this.hashValue(val);
        this.attributeValues.set(hash, converter.input(val));
        this.expressionTokens.push(hash);
        return this;
    }

    EQ() {
        return this.addExpressionToken(ExpressionBuilder.EQ);
    }

    LT() {
        return this.addExpressionToken(ExpressionBuilder.LT);
    }

    GT() {
        return this.addExpressionToken(ExpressionBuilder.GT);
    }

    LE() {
        return this.addExpressionToken(ExpressionBuilder.LE);
    }

    GE() {
        return this.addExpressionToken(ExpressionBuilder.GE);
    }

    AND() {
        return this.addExpressionToken(ExpressionBuilder.AND);
    }

    BETWEEN() {
        return this.addExpressionToken(ExpressionBuilder.BETWEEN);
    }

    getKeyConditionExpression() {
        return this.expressionTokens.join(' ');
    }

    getExpressionAttributeNames() {
        return Object.fromEntries(this.attributeNames);
    }

    getExpressionAttributeValues() {
        return Object.fromEntries(this.attributeValues);
    }

    getQueryExpressions() {
        return {
            KeyConditionExpression: this.getKeyConditionExpression(),
            ExpressionAttributeNames: this.getExpressionAttributeNames(),
            ExpressionAttributeValues: this.getExpressionAttributeValues(),
        };
    }
}

const getItem = async ({ TableName, Key }) =>
    new Promise((resolve, reject) => {
        CLIENT.getItem({ TableName, Key: converter.marshall(Key) }, (err, data) => {
            if (err) reject(err);
            else resolve(converter.unmarshall(data.Item));
        });
    });

const putItem = async ({ TableName, Item }) =>
    new Promise((resolve, reject) => {
        CLIENT.putItem({ TableName, Item: converter.marshall(Item) }, err => {
            if (err) reject(err);
            else resolve();
        });
    });

const query = async ({
    TableName,
    IndexName,
    KeyConditionExpression,
    ExpressionAttributeNames,
    ExpressionAttributeValues,
}) =>
    new Promise((resolve, reject) => {
        CLIENT.query(
            {
                TableName,
                IndexName,
                KeyConditionExpression,
                ExpressionAttributeNames,
                ExpressionAttributeValues,
            },
            (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data.Items.map(converter.unmarshall));
                }
            }
        );
    });

module.exports = {
    getItem,
    putItem,
    query,
    ExpressionBuilder,
};

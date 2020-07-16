const AWS = require('aws-sdk');

AWS.config.getCredentials(err => (err ? console.log(err.stack) : undefined));

const converter = AWS.DynamoDB.Converter;
const CLIENT = new AWS.DynamoDB();

const getItem = async ({ TableName, Key }) =>
    new Promise((resolve, reject) => {
        CLIENT.getItem({ TableName, Key: converter.marshall(Key) }, (err, data) => {
            if (err) reject(err);
            else resolve(converter.unmarshall(data.Item));
        });
    });

const putItem = async ({ TableName, Item, ConditionExpression, ExpressionAttributeNames }) =>
    new Promise((resolve, reject) => {
        CLIENT.putItem(
            {
                TableName,
                Item: converter.marshall(Item),
                ConditionExpression,
                ExpressionAttributeNames,
            },
            err => {
                if (err) reject(err);
                else resolve();
            }
        );
    });

const updateItem = async ({
    TableName,
    Key,
    UpdateExpression,
    ConditionExpression,
    ExpressionAttributeValues,
    ExpressionAttributeNames,
}) =>
    new Promise((resolve, reject) => {
        CLIENT.updateItem(
            {
                TableName,
                Key,
                UpdateExpression,
                ConditionExpression,
                ExpressionAttributeNames,
                ExpressionAttributeValues,
                ReturnValues: 'ALL_NEW',
            },
            (err, data) => {
                if (err) reject(err);
                else resolve(data);
            }
        );
    });

const query = async ({
    TableName,
    IndexName,
    KeyConditionExpression,
    ProjectionExpression,
    FilterExpression,
    ExpressionAttributeNames,
    ExpressionAttributeValues,
}) =>
    new Promise((resolve, reject) => {
        CLIENT.query(
            {
                TableName,
                IndexName,
                KeyConditionExpression,
                ProjectionExpression,
                FilterExpression,
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
    updateItem,
    query,
};

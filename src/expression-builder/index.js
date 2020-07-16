const { Converter: converter, DocumentClient } = require('aws-sdk').DynamoDB;

const createSet = new DocumentClient().createSet;

const {
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
} = require('./constants');

const { incrementCharacter, getMapKeyFromValue } = require('./utils');

class ExpressionBuilder {
    #attributeNames = new Map();
    #attributeValues = new Map();
    #keys = new Map();
    #expressionTokens = [];
    #filterTokens = [];
    #setTokens = [];
    #removeTokens = [];
    #addTokens = [];
    #deleteTokens = [];
    #projectionTokens = new Set();
    #attrCode = 'a';
    #valCode = 'a';
    #isFilterExpression = false;

    #__getAttrHash = attr => {
        let hash = getMapKeyFromValue(attr, this.#attributeNames);
        if (!hash) {
            hash = `#${PREFIX}_${this.#attrCode}`;
            this.#attrCode = incrementCharacter(this.#attrCode);
        }

        return hash;
    };

    #__getValHash = val => {
        const hash = `:${PREFIX}_${this.#valCode}`;
        this.#valCode = incrementCharacter(this.#valCode);

        return hash;
    };

    #__addToken = token => {
        const tokenList = this.#isFilterExpression ? this.#filterTokens : this.#expressionTokens;
        tokenList.push(token);
        return this;
    };

    #__getUpdateAttrHash = attr => {
        const regex = /\[\d+\]/g;

        return attr
            .split('.')
            .map(attr => {
                const attrName = attr.replace(regex, '');
                const hash = this.#__getAttrHash(attrName);

                const indices = attr.match(regex);
                // Set attribute name to be keyed off of hash  and value without any indices
                this.#attributeNames.set(hash, attrName);

                // Add indices back to the hashed value for the update expression
                return `${hash}${indices ? indices.join('') : ''}`;
            })
            .join('.');
    };

    #__getUpdateExpression = (tokens, operation) => {
        return tokens.length ? `${operation} ${tokens.join(', ')} ` : '';
    };

    #__addTokenAndValue = (token, val) => {
        const hash = this.#__getValHash(val);
        this.#attributeValues.set(hash, converter.input(val));
        return this.#__addToken(token).#__addToken(hash);
    };

    constructor(tableName) {
        if (!tableName) throw Error('table name must be included');

        this.tableName = tableName;
    }

    Attr(attr) {
        const hash = this.#__getAttrHash(attr);
        this.#attributeNames.set(hash, attr);
        return this.#__addToken(hash);
    }

    AttrExists(attr) {
        const hash = this.#__getAttrHash(attr);
        this.#attributeNames.set(hash, attr);
        return this.#__addToken(`attribute_exists(${hash})`);
    }

    AttrNotExists(attr) {
        const hash = this.#__getAttrHash(attr);
        this.#attributeNames.set(hash, attr);
        return this.#__addToken(`attribute_not_exists(${hash})`);
    }

    Contains(attr, val) {
        const attr_hash = this.#__getAttrHash(attr);
        const val_hash = this.#__getValHash(val);
        this.#attributeNames.set(attr_hash, attr);
        this.#attributeValues.set(val_hash, val);
        return this.#__addToken(`contains(${attr_hash}, ${val_hash})`);
    }

    BeginsWith(attr, val) {
        const attr_hash = this.#__getAttrHash(attr);
        const val_hash = this.#__getValHash(val);
        this.#attributeNames.set(attr_hash, attr);
        this.#attributeValues.set(val_hash, val);
        return this.#__addToken(`begins_with(${attr_hash}, ${val_hash})`);
    }

    EQ(val) {
        return this.#__addTokenAndValue(EQ, val);
    }

    LT(val) {
        return this.#__addTokenAndValue(LT, val);
    }

    GT(val) {
        return this.#__addTokenAndValue(GT, val);
    }

    LE(val) {
        return this.#__addTokenAndValue(LE, val);
    }

    GE(val) {
        return this.#__addTokenAndValue(GE, val);
    }

    BETWEEN(val1, val2) {
        return this.#__addTokenAndValue(BETWEEN, val1).#__addTokenAndValue(AND, val2);
    }

    AND() {
        return this.#__addToken(AND);
    }

    OR() {
        return this.#__addToken(OR);
    }

    GroupStart() {
        return this.#__addToken(GROUP_START);
    }

    GroupEnd() {
        return this.#__addToken(GROUP_END);
    }

    FilterStart() {
        this.#isFilterExpression = true;
        return this;
    }

    FilterEnd() {
        this.#isFilterExpression = false;
        return this;
    }

    Key(keyObj) {
        Object.entries(keyObj).forEach(([k, v]) => {
            this.#keys.set(k, converter.input(v));
        });

        return this;
    }

    Set(attr, val) {
        const attr_hash = this.#__getUpdateAttrHash(attr);
        const val_hash = this.#__getValHash(val);

        this.#setTokens.push(`${attr_hash} ${EQ} ${val_hash}`);
        this.#attributeValues.set(val_hash, converter.input(val));

        return this;
    }

    SetPlus(attr, val) {
        const attr_hash = this.#__getUpdateAttrHash(attr);
        const val_hash = this.#__getValHash(val);

        this.#setTokens.push(`${attr_hash} ${EQ} ${attr_hash} ${PLUS} ${val_hash}`);
        this.#attributeValues.set(val_hash, converter.input(val));

        return this;
    }

    SetMinus(attr, val) {
        const attr_hash = this.#__getUpdateAttrHash(attr);
        const val_hash = this.#__getValHash(val);

        this.#setTokens.push(`${attr_hash} ${EQ} ${attr_hash} ${MINUS} ${val_hash}`);
        this.#attributeValues.set(val_hash, converter.input(val));

        return this;
    }

    Add(attr, val) {
        const attr_hash = this.#__getUpdateAttrHash(attr);
        const val_hash = this.#__getValHash(val);

        this.#addTokens.push(`${attr_hash} ${val_hash}`);
        this.#attributeValues.set(val_hash, converter.input(val));

        return this;
    }

    AddAttr(attr) {
        const attr_hash = this.#__getAttrHash(attr);

        this.#addTokens.push(attr_hash);
        this.#attributeNames.set(attr_hash, attr);

        return this;
    }

    RemoveAttr(attr) {
        const attr_hash = this.#__getAttrHash(attr);

        this.#removeTokens.push(attr_hash);
        this.#attributeNames.set(attr_hash, attr);

        return this;
    }

    Projections(projections) {
        projections.forEach(attr => {
            this.#projectionTokens.add(this.#__getAttrHash(attr));
            this.#attributeNames.set(attr_hash, attr);
        });
    }

    KeyExpression() {
        return Object.fromEntries(this.#keys);
    }

    SetExpression() {
        return this.#__getUpdateExpression(this.#setTokens, SET);
    }

    RemoveExpression() {
        return this.#__getUpdateExpression(this.#removeTokens, REMOVE);
    }

    AddExpression() {
        return this.#__getUpdateExpression(this.#addTokens, ADD);
    }

    DeleteExpression() {
        return this.#__getUpdateExpression(this.#deleteTokens, DELETE);
    }

    UpdateExpression() {
        return `${this.SetExpression()}${this.RemoveExpression()}${this.AddExpression()}${this.DeleteExpression()}`.trim();
    }

    ConditionExpression() {
        return this.#expressionTokens.join(' ');
    }

    ProjectionExpression() {
        return [...this.#projectionTokens].join(', ');
    }

    FilterExpression() {
        return this.#filterTokens.join(' ');
    }

    ExpressionAttributeNames() {
        return Object.fromEntries(this.#attributeNames);
    }

    ExpressionAttributeValues() {
        return Object.fromEntries(this.#attributeValues);
    }

    BuildQueryExpressions() {
        const response = {
            TableName: this.tableName,
            KeyConditionExpression: this.ConditionExpression(),
            ExpressionAttributeNames: this.ExpressionAttributeNames(),
            ExpressionAttributeValues: this.ExpressionAttributeValues(),
        };

        const ProjectionExpression = this.ProjectionExpression();
        if (ProjectionExpression) {
            response.ProjectionExpression = ProjectionExpression;
        }

        const FilterExpression = this.FilterExpression();
        if (FilterExpression) {
            response.FilterExpression = FilterExpression;
        }

        return response;
    }

    BuildConditionExpression() {
        const response = {
            TableName: this.tableName,
            ConditionExpression: this.ConditionExpression(),
            ExpressionAttributeNames: this.ExpressionAttributeNames(),
        };

        const ExpressionAttributeValues = this.ExpressionAttributeValues();
        if (ExpressionAttributeValues) {
            response.ExpressionAttributeValues = ExpressionAttributeValues;
        }

        return response;
    }

    BuildUpdateExpression() {
        const response = {
            TableName: this.tableName,
            Key: this.KeyExpression(),
            UpdateExpression: this.UpdateExpression(),
            ExpressionAttributeNames: this.ExpressionAttributeNames(),
            ExpressionAttributeValues: this.ExpressionAttributeValues(),
        };

        const ConditionExpression = this.ConditionExpression();
        if (ConditionExpression) {
            response.ConditionExpression = ConditionExpression;
        }

        return response;
    }
}

module.exports = { ExpressionBuilder, converter, createSet };

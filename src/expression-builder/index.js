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
    DATA_TYPES,
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

    #__getNameHash = attr => {
        let hash = getMapKeyFromValue(attr, this.#attributeNames);
        if (!hash) {
            hash = `#${PREFIX}_${this.#attrCode}`;
            this.#attrCode = incrementCharacter(this.#attrCode);
        }

        return hash;
    };

    #__getAttrHash = attr => {
        const regex = /\[\d+\]/g;

        return attr
            .split('.')
            .map(attr => {
                const attrName = attr.replace(regex, '');
                const hash = this.#__getNameHash(attrName);

                const indices = attr.match(regex);
                // Set attribute name to be keyed off of hash  and value without any indices
                this.#attributeNames.set(hash, attrName);

                // Add indices back to the hashed value for the update expression
                return `${hash}${indices ? indices.join('') : ''}`;
            })
            .join('.');
    };

    #__getValHash = val => {
        let hash = getMapKeyFromValue(converter.input(val), this.#attributeValues);
        if (!hash) {
            hash = `:${PREFIX}_${this.#valCode}`;

            this.#valCode = incrementCharacter(this.#valCode);
            this.#attributeValues.set(hash, converter.input(val));
        }

        return hash;
    };

    #__addAttribute = attr => {
        const hash = this.#__getAttrHash(attr);
        return this.#__addToken(hash);
    };

    #__addToken = token => {
        const tokenList = this.#isFilterExpression ? this.#filterTokens : this.#expressionTokens;
        tokenList.push(token);
        return this;
    };

    #__getUpdateExpression = (tokens, operation) => {
        return tokens.length ? `${operation} ${tokens.join(', ')} ` : '';
    };

    #__addTokenAndValue = (token, val) => {
        const hash = this.#__getValHash(val);
        return this.#__addToken(token).#__addToken(hash);
    };

    #__addAttributeTypeToken = (attr, type) => {
        const attrHash = this.#__getAttrHash(attr);
        const typeHash = this.#__getValHash(type);
        return this.#__addToken(`attribute_type(${attrHash}, ${typeHash})`);
    };

    constructor(tableName) {
        if (!tableName) throw Error('table name must be included');

        this.tableName = tableName;
    }

    EQ(attr, val) {
        return this.#__addAttribute(attr).#__addTokenAndValue(EQ, val);
    }

    LT(attr, val) {
        return this.#__addAttribute(attr).#__addTokenAndValue(LT, val);
    }

    GT(attr, val) {
        return this.#__addAttribute(attr).#__addTokenAndValue(GT, val);
    }

    LE(attr, val) {
        return this.#__addAttribute(attr).#__addTokenAndValue(LE, val);
    }

    GE(attr, val) {
        return this.#__addAttribute(attr).#__addTokenAndValue(GE, val);
    }

    BETWEEN(attr, val1, val2) {
        return this.#__addAttribute(attr)
            .#__addTokenAndValue(BETWEEN, val1)
            .#__addTokenAndValue(AND, val2);
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

    AttrExists(attr) {
        const hash = this.#__getAttrHash(attr);
        return this.#__addToken(`attribute_exists(${hash})`);
    }

    AttrNotExists(attr) {
        const hash = this.#__getAttrHash(attr);
        return this.#__addToken(`attribute_not_exists(${hash})`);
    }

    Contains(attr, val) {
        const attrHash = this.#__getAttrHash(attr);
        const valHash = this.#__getValHash(val);
        return this.#__addToken(`contains(${attrHash}, ${valHash})`);
    }

    BeginsWith(attr, val) {
        const attrHash = this.#__getAttrHash(attr);
        const valHash = this.#__getValHash(val);
        return this.#__addToken(`begins_with(${attrHash}, ${valHash})`);
    }

    AssertStringType(attr) {
        return this.#__addAttributeTypeToken(attr, DATA_TYPES.STRING);
    }

    AssertStringSetType(attr) {
        return this.#__addAttributeTypeToken(attr, DATA_TYPES.STRING_SET);
    }

    AssertNumberType(attr) {
        return this.#__addAttributeTypeToken(attr, DATA_TYPES.NUMBER);
    }

    AssertNumberSetType(attr) {
        return this.#__addAttributeTypeToken(attr, DATA_TYPES.NUMBER_SET);
    }

    AssertBinaryType(attr) {
        return this.#__addAttributeTypeToken(attr, DATA_TYPES.BINARY);
    }

    AssertBinarySetType(attr) {
        return this.#__addAttributeTypeToken(attr, DATA_TYPES.BINARY_SET);
    }

    AssertBooleanType(attr) {
        return this.#__addAttributeTypeToken(attr, DATA_TYPES.BOOLEAN);
    }

    AssertNullType(attr) {
        return this.#__addAttributeTypeToken(attr, DATA_TYPES.NULL);
    }

    AssertListType(attr) {
        return this.#__addAttributeTypeToken(attr, DATA_TYPES.LIST);
    }

    AssertMapType(attr) {
        return this.#__addAttributeTypeToken(attr, DATA_TYPES.MAP);
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
        const attrHash = this.#__getAttrHash(attr);
        const valHash = this.#__getValHash(val);

        this.#setTokens.push(`${attrHash} ${EQ} ${valHash}`);

        return this;
    }

    SetPlus(attr, val) {
        const attrHash = this.#__getAttrHash(attr);
        const valHash = this.#__getValHash(val);

        this.#setTokens.push(`${attrHash} ${EQ} ${attrHash} ${PLUS} ${valHash}`);

        return this;
    }

    SetMinus(attr, val) {
        const attrHash = this.#__getAttrHash(attr);
        const valHash = this.#__getValHash(val);

        this.#setTokens.push(`${attrHash} ${EQ} ${attrHash} ${MINUS} ${valHash}`);

        return this;
    }

    Add(attr, val) {
        const attrHash = this.#__getAttrHash(attr);
        const valHash = this.#__getValHash(val);

        this.#addTokens.push(`${attrHash} ${valHash}`);

        return this;
    }

    AddAttr(attr) {
        const attrHash = this.#__getAttrHash(attr);

        this.#addTokens.push(attrHash);

        return this;
    }

    RemoveAttr(attr) {
        const attrHash = this.#__getAttrHash(attr);

        this.#removeTokens.push(attrHash);

        return this;
    }

    Projections(projections) {
        projections.forEach(attr => {
            const attrHash = this.#__getAttrHash(attr);
            this.#projectionTokens.add(attrHash);
        });

        return this;
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
        if (Object.values(ExpressionAttributeValues).length) {
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

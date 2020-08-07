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
    LIST_INDEX_REG,
    STRING,
    STRING_SET,
    NUMBER,
    NUMBER_SET,
    BINARY,
    BINARY_SET,
    BOOLEAN,
    NULL,
    LIST,
    MAP,
} = require('./constants');

const { incrementCharacter, getMapKeyFromValue } = require('./utils');

/**
 * ExpressionBuilder provides a convenient builder pattern implementation
 * for creating DynamoDB query, condition, and update expressions.
 *
 * Users can utilize built in methods to build up expression objects that
 * can be passed directly the aws-sdk dynamo client representing the
 * queries, condition expressions, and update expressions for their needs.
 */
class ExpressionBuilder {
    /**
     * private attributeNames property stores a mapping
     * of automatic expression attribute names to given attributes
     *
     * @type {Map}
     */
    #attributeNames = new Map();

    /**
     * private attributeValues property stores a mapping
     * of automatic expression attribute values to automatically
     * typed objects for given values.
     *
     * @type {Map}
     */
    #attributeValues = new Map();

    /**
     * private keys property stores a mapping of given key object
     * property names to automatically typed objects for their values

     * @type {Map}
     */
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

    #__getNameHash = attrPath => {
        let hash = getMapKeyFromValue(attrPath, this.#attributeNames);
        if (!hash) {
            hash = `#${PREFIX}_${this.#attrCode}`;
            this.#attrCode = incrementCharacter(this.#attrCode);
        }

        return hash;
    };

    #__getAttrHash = attrPath =>
        attrPath
            .split('.')
            .map(attrPart => {
                const attrName = attrPart.replace(LIST_INDEX_REG, '');
                const indices = attrPart.match(LIST_INDEX_REG);

                const hash = this.#__getNameHash(attrName);

                // Set attribute name to be keyed off of hash and value without any indices
                this.#attributeNames.set(hash, attrName);

                // Add indices back to the hashed value for the update expression
                return `${hash}${indices ? indices.join('') : ''}`;
            })
            .join('.');

    #__getValHash = val => {
        let hash = getMapKeyFromValue(converter.input(val), this.#attributeValues);
        if (!hash) {
            hash = `:${PREFIX}_${this.#valCode}`;

            this.#valCode = incrementCharacter(this.#valCode);
            this.#attributeValues.set(hash, converter.input(val));
        }

        return hash;
    };

    #__addAttribute = attrPath => {
        const hash = this.#__getAttrHash(attrPath);
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

    #__addAttributeTypeToken = (attrPath, type) => {
        const attrHash = this.#__getAttrHash(attrPath);
        const typeHash = this.#__getValHash(type);
        return this.#__addToken(`attribute_type(${attrHash}, ${typeHash})`);
    };

    constructor(tableName) {
        if (!tableName) throw Error('table name must be included');

        this.tableName = tableName;
    }

    EQ(attrPath, val) {
        return this.#__addAttribute(attrPath).#__addTokenAndValue(EQ, val);
    }

    LT(attrPath, val) {
        return this.#__addAttribute(attrPath).#__addTokenAndValue(LT, val);
    }

    GT(attrPath, val) {
        return this.#__addAttribute(attrPath).#__addTokenAndValue(GT, val);
    }

    LE(attrPath, val) {
        return this.#__addAttribute(attrPath).#__addTokenAndValue(LE, val);
    }

    GE(attrPath, val) {
        return this.#__addAttribute(attrPath).#__addTokenAndValue(GE, val);
    }

    BETWEEN(attrPath, val1, val2) {
        return this.#__addAttribute(attrPath)
            .#__addTokenAndValue(BETWEEN, val1)
            .#__addTokenAndValue(AND, val2);
    }

    SizeEQ(attrPath, val) {
        const hash = this.#__getAttrHash(attrPath);
        return this.#__addToken(`size(${hash})`).#__addTokenAndValue(EQ, val);
    }

    SizeLT(attrPath, val) {
        const hash = this.#__getAttrHash(attrPath);
        return this.#__addToken(`size(${hash})`).#__addTokenAndValue(LT, val);
    }

    SizeLE(attrPath, val) {
        const hash = this.#__getAttrHash(attrPath);
        return this.#__addToken(`size(${hash})`).#__addTokenAndValue(LE, val);
    }

    SizeGT(attrPath, val) {
        const hash = this.#__getAttrHash(attrPath);
        return this.#__addToken(`size(${hash})`).#__addTokenAndValue(GT, val);
    }

    SizeGE(attrPath, val) {
        const hash = this.#__getAttrHash(attrPath);
        return this.#__addToken(`size(${hash})`).#__addTokenAndValue(GE, val);
    }

    SizeBETWEEN(attrPath, val1, val2) {
        const hash = this.#__getAttrHash(attrPath);
        return this.#__addToken(`size(${hash})`)
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

    AttrExists(attrPath) {
        const hash = this.#__getAttrHash(attrPath);
        return this.#__addToken(`attribute_exists(${hash})`);
    }

    AttrNotExists(attrPath) {
        const hash = this.#__getAttrHash(attrPath);
        return this.#__addToken(`attribute_not_exists(${hash})`);
    }

    Contains(attrPath, val) {
        const attrHash = this.#__getAttrHash(attrPath);
        const valHash = this.#__getValHash(val);
        return this.#__addToken(`contains(${attrHash}, ${valHash})`);
    }

    BeginsWith(attrPath, val) {
        const attrHash = this.#__getAttrHash(attrPath);
        const valHash = this.#__getValHash(val);
        return this.#__addToken(`begins_with(${attrHash}, ${valHash})`);
    }

    AssertStringType(attrPath) {
        return this.#__addAttributeTypeToken(attrPath, STRING);
    }

    AssertStringSetType(attrPath) {
        return this.#__addAttributeTypeToken(attrPath, STRING_SET);
    }

    AssertNumberType(attrPath) {
        return this.#__addAttributeTypeToken(attrPath, NUMBER);
    }

    AssertNumberSetType(attrPath) {
        return this.#__addAttributeTypeToken(attrPath, NUMBER_SET);
    }

    AssertBinaryType(attrPath) {
        return this.#__addAttributeTypeToken(attrPath, BINARY);
    }

    AssertBinarySetType(attrPath) {
        return this.#__addAttributeTypeToken(attrPath, BINARY_SET);
    }

    AssertBooleanType(attrPath) {
        return this.#__addAttributeTypeToken(attrPath, BOOLEAN);
    }

    AssertNullType(attrPath) {
        return this.#__addAttributeTypeToken(attrPath, NULL);
    }

    AssertListType(attrPath) {
        return this.#__addAttributeTypeToken(attrPath, LIST);
    }

    AssertMapType(attrPath) {
        return this.#__addAttributeTypeToken(attrPath, MAP);
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

    Set(attrPath, val) {
        const attrHash = this.#__getAttrHash(attrPath);
        const valHash = this.#__getValHash(val);

        this.#setTokens.push(`${attrHash} ${EQ} ${valHash}`);

        return this;
    }

    SetIfNotExists(attrPath, val) {
        const attrHash = this.#__getAttrHash(attrPath);
        const valHash = this.#__getValHash(val);

        this.#setTokens.push(`${attrHash} ${EQ} if_not_exists(${attrHash}, ${valHash})`);

        return this;
    }

    SetPlus(attrPath, val) {
        const attrHash = this.#__getAttrHash(attrPath);
        const valHash = this.#__getValHash(val);

        this.#setTokens.push(`${attrHash} ${EQ} ${attrHash} ${PLUS} ${valHash}`);

        return this;
    }

    SetMinus(attrPath, val) {
        const attrHash = this.#__getAttrHash(attrPath);
        const valHash = this.#__getValHash(val);

        this.#setTokens.push(`${attrHash} ${EQ} ${attrHash} ${MINUS} ${valHash}`);

        return this;
    }

    SetListAppend(attrPath, list) {
        const attrHash = this.#__getAttrHash(attrPath);
        const valHash = this.#__getValHash(list);

        this.#setTokens.push(`${attrHash} ${EQ} list_append(${attrHash}, ${valHash})`);

        return this;
    }

    Add(attrPath, val) {
        const attrHash = this.#__getAttrHash(attrPath);
        const valHash = this.#__getValHash(val);

        this.#addTokens.push(`${attrHash} ${valHash}`);

        return this;
    }

    Delete(attrPath, val) {
        const attrHash = this.#__getAttrHash(attrPath);
        const valHash = this.#__getValHash(val);

        this.#deleteTokens.push(`${attrHash} ${valHash}`);

        return this;
    }

    Remove(attrPath) {
        const attrHash = this.#__getAttrHash(attrPath);

        this.#removeTokens.push(attrHash);

        return this;
    }

    Projections(projections) {
        projections.forEach(attrPath => {
            const attrHash = this.#__getAttrHash(attrPath);
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

    BuildConditionExpressions() {
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

    BuildUpdateExpressions() {
        const response = {
            TableName: this.tableName,
            Key: this.KeyExpression(),
            UpdateExpression: this.UpdateExpression(),
            ExpressionAttributeNames: this.ExpressionAttributeNames(),
        };

        const ExpressionAttributeValues = this.ExpressionAttributeValues();
        if (Object.values(ExpressionAttributeValues).length) {
            response.ExpressionAttributeValues = ExpressionAttributeValues;
        }

        const ConditionExpression = this.ConditionExpression();
        if (ConditionExpression) {
            response.ConditionExpression = ConditionExpression;
        }

        return response;
    }
}

module.exports = { ExpressionBuilder, converter, createSet };

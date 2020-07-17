const tap = require('tap');
const { ExpressionBuilder } = require('../');

tap.test('Constructor', t => {
    const tableName = 'test-table';

    t.throws(
        () => new ExpressionBuilder(),
        new Error('table name must be included'),
        'throws an error when table name not included'
    );

    t.equal(
        new ExpressionBuilder(tableName).tableName,
        tableName,
        'should store the given tableName'
    );

    t.end();
});

tap.test('BuildQueryExpressions', t => {
    const tableName = 'test-table';
    const expectedDefaultShape = {
        TableName: tableName,
        KeyConditionExpression: '',
        ExpressionAttributeNames: {},
        ExpressionAttributeValues: {},
    };

    t.same(
        new ExpressionBuilder(tableName).BuildQueryExpressions(),
        expectedDefaultShape,
        'should be an object with "TableName","KeyConditionExpression", "ExpressionAttributeNames", and "ExpressionAttributeValues" as a default'
    );

    const attr1 = 'Test';
    const val1 = 'Value';
    const val2 = 42;
    const val3 = 0;

    const expectedEQShape = {
        TableName: tableName,
        KeyConditionExpression: '#eb_a = :eb_a',
        ExpressionAttributeNames: { '#eb_a': attr1 },
        ExpressionAttributeValues: { ':eb_a': { S: val1 } },
    };

    t.same(
        new ExpressionBuilder(tableName).Attr(attr1).EQ(val1).BuildQueryExpressions(),
        expectedEQShape,
        'should include equality expressions in the key condition expression'
    );

    const expectedLTShape = {
        TableName: tableName,
        KeyConditionExpression: '#eb_a < :eb_a',
        ExpressionAttributeNames: { '#eb_a': attr1 },
        ExpressionAttributeValues: { ':eb_a': { N: val2 } },
    };

    t.same(
        new ExpressionBuilder(tableName).Attr(attr1).LT(val2).BuildQueryExpressions(),
        expectedLTShape,
        'should include less than expressions in the key condition expression'
    );

    const expectedGTShape = {
        TableName: tableName,
        KeyConditionExpression: '#eb_a > :eb_a',
        ExpressionAttributeNames: { '#eb_a': attr1 },
        ExpressionAttributeValues: { ':eb_a': { N: val2 } },
    };

    t.same(
        new ExpressionBuilder(tableName).Attr(attr1).GT(val2).BuildQueryExpressions(),
        expectedGTShape,
        'should include greater than expressions in the key condition expression'
    );

    const expectedGTEShape = {
        TableName: tableName,
        KeyConditionExpression: '#eb_a >= :eb_a',
        ExpressionAttributeNames: { '#eb_a': attr1 },
        ExpressionAttributeValues: { ':eb_a': { N: val2 } },
    };

    t.same(
        new ExpressionBuilder(tableName).Attr(attr1).GE(val2).BuildQueryExpressions(),
        expectedGTEShape,
        'should include greater than or equal expressions in the key condition expression'
    );

    const expectedLTEShape = {
        TableName: tableName,
        KeyConditionExpression: '#eb_a <= :eb_a',
        ExpressionAttributeNames: { '#eb_a': attr1 },
        ExpressionAttributeValues: { ':eb_a': { N: val2 } },
    };

    t.same(
        new ExpressionBuilder(tableName).Attr(attr1).LE(val2).BuildQueryExpressions(),
        expectedLTEShape,
        'should include less than or equal expressions in the key condition expression'
    );

    const expectedDuplicateAttrShape = {
        TableName: tableName,
        KeyConditionExpression: '#eb_a <= :eb_a AND #eb_a >= :eb_b',
        ExpressionAttributeNames: { '#eb_a': attr1 },
        ExpressionAttributeValues: { ':eb_a': { N: val2 }, ':eb_b': { N: val3 } },
    };

    t.same(
        new ExpressionBuilder(tableName)
            .Attr(attr1)
            .LE(val2)
            .AND()
            .Attr(attr1)
            .GE(val3)
            .BuildQueryExpressions(),
        expectedDuplicateAttrShape,
        'should include a single attribute mapping for the same attribute value if it is used in any expression more than once'
    );

    const expectedBetweenShape = {
        TableName: tableName,
        KeyConditionExpression: '#eb_a BETWEEN :eb_a AND :eb_b',
        ExpressionAttributeNames: { '#eb_a': attr1 },
        ExpressionAttributeValues: { ':eb_a': { N: val2 }, ':eb_b': { N: val3 } },
    };

    t.same(
        new ExpressionBuilder(tableName).Attr(attr1).BETWEEN(val2, val3).BuildQueryExpressions(),
        expectedBetweenShape,
        'should produce the correct shape when using the BETWEEN function'
    );

    const attr2 = 'Some Other Attribute';

    expectedFilterShape = {
        TableName: tableName,
        KeyConditionExpression: '#eb_a = :eb_a',
        ExpressionAttributeNames: { '#eb_a': attr1, '#eb_b': attr2 },
        ExpressionAttributeValues: { ':eb_a': { S: val1 }, ':eb_b': { N: val2 } },
        FilterExpression: '#eb_b < :eb_b',
    };

    t.same(
        new ExpressionBuilder(tableName)
            .Attr(attr1)
            .EQ(val1)
            .FilterStart()
            .Attr(attr2)
            .LT(val2)
            .FilterEnd()
            .BuildQueryExpressions(),
        expectedFilterShape,
        'should produce the correct FilterExpression if FilterStart, FilterEnd used'
    );

    t.end();
});

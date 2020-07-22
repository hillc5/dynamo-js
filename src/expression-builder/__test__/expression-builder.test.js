const tap = require('tap');
const { ExpressionBuilder: builder } = require('../');

tap.test('Constructor', t => {
    const tableName = 'test-table';

    t.throws(
        () => new builder(),
        new Error('table name must be included'),
        'throws an error when table name not included'
    );

    t.equal(new builder(tableName).tableName, tableName, 'should store the given tableName');

    t.end();
});

tap.test('Comparison Operators', t => {
    const tableName = 'Test-Table';
    const attr1 = 'Test';
    const attr2 = 'SubTest';
    const attr3 = 'ThirdAttribute';
    const val1 = 'Value';
    const val2 = 'Other Value';

    const expectedEQConditionExpression = {
        TableName: tableName,
        ConditionExpression: '#eb_a = :eb_a',
        ExpressionAttributeNames: { '#eb_a': attr1 },
        ExpressionAttributeValues: { ':eb_a': { S: val1 } },
    };

    t.same(
        new builder(tableName).EQ(attr1, val1).BuildConditionExpressions(),
        expectedEQConditionExpression,
        'should create the EQ condition expression'
    );

    const expectedLTConditionExpression = {
        TableName: tableName,
        ConditionExpression: '#eb_a < :eb_a',
        ExpressionAttributeNames: { '#eb_a': attr1 },
        ExpressionAttributeValues: { ':eb_a': { S: val1 } },
    };

    t.same(
        new builder(tableName).LT(attr1, val1).BuildConditionExpressions(),
        expectedLTConditionExpression,
        'should create the LT condition expression'
    );

    const expectedLEConditionExpression = {
        TableName: tableName,
        ConditionExpression: '#eb_a <= :eb_a',
        ExpressionAttributeNames: { '#eb_a': attr1 },
        ExpressionAttributeValues: { ':eb_a': { S: val1 } },
    };

    t.same(
        new builder(tableName).LE(attr1, val1).BuildConditionExpressions(),
        expectedLEConditionExpression,
        'should create the LE condition expression'
    );

    const expectedGTConditionExpression = {
        TableName: tableName,
        ConditionExpression: '#eb_a > :eb_a',
        ExpressionAttributeNames: { '#eb_a': attr1 },
        ExpressionAttributeValues: { ':eb_a': { S: val1 } },
    };

    t.same(
        new builder(tableName).GT(attr1, val1).BuildConditionExpressions(),
        expectedGTConditionExpression,
        'should create the GT condition expression'
    );

    const expectedGEConditionExpression = {
        TableName: tableName,
        ConditionExpression: '#eb_a >= :eb_a',
        ExpressionAttributeNames: { '#eb_a': attr1 },
        ExpressionAttributeValues: { ':eb_a': { S: val1 } },
    };

    t.same(
        new builder(tableName).GE(attr1, val1).BuildConditionExpressions(),
        expectedGEConditionExpression,
        'should create the GE condition expression'
    );

    const expectedANDConditionExpression = {
        TableName: tableName,
        ConditionExpression: '#eb_a >= :eb_a AND #eb_a <= :eb_b',
        ExpressionAttributeNames: { '#eb_a': attr1 },
        ExpressionAttributeValues: { ':eb_a': { S: val1 }, ':eb_b': { S: val2 } },
    };

    t.same(
        new builder(tableName)
            .GE(attr1, val1)
            .AND()
            .LE(attr1, val2)
            .BuildConditionExpressions(),
        expectedANDConditionExpression,
        'should create the AND condition expression'
    );

    const expectedORConditionExpression = {
        TableName: tableName,
        ConditionExpression: '#eb_a >= :eb_a OR #eb_a <= :eb_b',
        ExpressionAttributeNames: { '#eb_a': attr1 },
        ExpressionAttributeValues: { ':eb_a': { S: val1 }, ':eb_b': { S: val2 } },
    };

    t.same(
        new builder(tableName)
            .GE(attr1, val1)
            .OR()
            .LE(attr1, val2)
            .BuildConditionExpressions(),
        expectedORConditionExpression,
        'should create the OR condition expression'
    );

    const expectedBETWEENConditionExpression = {
        TableName: tableName,
        ConditionExpression: '#eb_a BETWEEN :eb_a AND :eb_b',
        ExpressionAttributeNames: { '#eb_a': attr1 },
        ExpressionAttributeValues: { ':eb_a': { S: val1 }, ':eb_b': { S: val2 } },
    };

    t.same(
        new builder(tableName).BETWEEN(attr1, val1, val2).BuildConditionExpressions(),
        expectedBETWEENConditionExpression,
        'should create the BETWEEN condition expression'
    );

    const expectedGroupedConditionExpression = {
        TableName: tableName,
        ConditionExpression: '( #eb_a = :eb_a AND #eb_b > :eb_b ) OR #eb_c = :eb_b',
        ExpressionAttributeNames: { '#eb_a': attr1, '#eb_b': attr2, '#eb_c': attr3 },
        ExpressionAttributeValues: { ':eb_a': { S: val1 }, ':eb_b': { S: val2 } },
    };

    t.same(
        new builder(tableName)
            .GroupStart()
            .EQ(attr1, val1)
            .AND()
            .GT(attr2, val2)
            .GroupEnd()
            .OR()
            .EQ(attr3, val2)
            .BuildConditionExpressions(),
        expectedGroupedConditionExpression,
        'should allow logical groupings with GroupStart and GroupEnd functions'
    );

    t.end();
});

tap.test('Size Comparison Operators', t => {
    const tableName = 'Test-Table';
    const attr1 = 'Test';
    const attr2 = 'SubTest';
    const attr3 = 'ThirdAttribute';
    const val1 = 'Value';
    const val2 = 'Other Value';

    const expectedEQConditionExpression = {
        TableName: tableName,
        ConditionExpression: 'size(#eb_a) = :eb_a',
        ExpressionAttributeNames: { '#eb_a': attr1 },
        ExpressionAttributeValues: { ':eb_a': { S: val1 } },
    };

    t.same(
        new builder(tableName).SizeEQ(attr1, val1).BuildConditionExpressions(),
        expectedEQConditionExpression,
        'should create the SizeEQ condition expression'
    );

    const expectedLTConditionExpression = {
        TableName: tableName,
        ConditionExpression: 'size(#eb_a) < :eb_a',
        ExpressionAttributeNames: { '#eb_a': attr1 },
        ExpressionAttributeValues: { ':eb_a': { S: val1 } },
    };

    t.same(
        new builder(tableName).SizeLT(attr1, val1).BuildConditionExpressions(),
        expectedLTConditionExpression,
        'should create the SizeLT condition expression'
    );

    const expectedLEConditionExpression = {
        TableName: tableName,
        ConditionExpression: 'size(#eb_a) <= :eb_a',
        ExpressionAttributeNames: { '#eb_a': attr1 },
        ExpressionAttributeValues: { ':eb_a': { S: val1 } },
    };

    t.same(
        new builder(tableName).SizeLE(attr1, val1).BuildConditionExpressions(),
        expectedLEConditionExpression,
        'should create the SizeLE condition expression'
    );

    const expectedGTConditionExpression = {
        TableName: tableName,
        ConditionExpression: 'size(#eb_a) > :eb_a',
        ExpressionAttributeNames: { '#eb_a': attr1 },
        ExpressionAttributeValues: { ':eb_a': { S: val1 } },
    };

    t.same(
        new builder(tableName).SizeGT(attr1, val1).BuildConditionExpressions(),
        expectedGTConditionExpression,
        'should create the SizeGT condition expression'
    );

    const expectedGEConditionExpression = {
        TableName: tableName,
        ConditionExpression: 'size(#eb_a) >= :eb_a',
        ExpressionAttributeNames: { '#eb_a': attr1 },
        ExpressionAttributeValues: { ':eb_a': { S: val1 } },
    };

    t.same(
        new builder(tableName).SizeGE(attr1, val1).BuildConditionExpressions(),
        expectedGEConditionExpression,
        'should create the SizeGE condition expression'
    );

    const expectedANDConditionExpression = {
        TableName: tableName,
        ConditionExpression: 'size(#eb_a) >= :eb_a AND size(#eb_a) <= :eb_b',
        ExpressionAttributeNames: { '#eb_a': attr1 },
        ExpressionAttributeValues: { ':eb_a': { S: val1 }, ':eb_b': { S: val2 } },
    };

    t.same(
        new builder(tableName)
            .SizeGE(attr1, val1)
            .AND()
            .SizeLE(attr1, val2)
            .BuildConditionExpressions(),
        expectedANDConditionExpression,
        'should create the AND condition expression'
    );

    const expectedORConditionExpression = {
        TableName: tableName,
        ConditionExpression: 'size(#eb_a) >= :eb_a OR size(#eb_a) <= :eb_b',
        ExpressionAttributeNames: { '#eb_a': attr1 },
        ExpressionAttributeValues: { ':eb_a': { S: val1 }, ':eb_b': { S: val2 } },
    };

    t.same(
        new builder(tableName)
            .SizeGE(attr1, val1)
            .OR()
            .SizeLE(attr1, val2)
            .BuildConditionExpressions(),
        expectedORConditionExpression,
        'should create the OR condition expression'
    );

    const expectedBETWEENConditionExpression = {
        TableName: tableName,
        ConditionExpression: 'size(#eb_a) BETWEEN :eb_a AND :eb_b',
        ExpressionAttributeNames: { '#eb_a': attr1 },
        ExpressionAttributeValues: { ':eb_a': { S: val1 }, ':eb_b': { S: val2 } },
    };

    t.same(
        new builder(tableName).SizeBETWEEN(attr1, val1, val2).BuildConditionExpressions(),
        expectedBETWEENConditionExpression,
        'should create the SizeBETWEEN condition expression'
    );

    const expectedGroupedConditionExpression = {
        TableName: tableName,
        ConditionExpression:
            '( size(#eb_a) = :eb_a AND size(#eb_b) > :eb_b ) OR size(#eb_c) = :eb_b',
        ExpressionAttributeNames: { '#eb_a': attr1, '#eb_b': attr2, '#eb_c': attr3 },
        ExpressionAttributeValues: { ':eb_a': { S: val1 }, ':eb_b': { S: val2 } },
    };

    t.same(
        new builder(tableName)
            .GroupStart()
            .SizeEQ(attr1, val1)
            .AND()
            .SizeGT(attr2, val2)
            .GroupEnd()
            .OR()
            .SizeEQ(attr3, val2)
            .BuildConditionExpressions(),
        expectedGroupedConditionExpression,
        'should allow logical groupings with GroupStart and GroupEnd functions'
    );

    t.end();
});

tap.test('AttrExists', t => {
    const tableName = 'Test-Table';
    const attr1 = 'Test';
    const attr2 = 'SubTest';
    const val1 = 'Value';

    const expectedAttrExistsConditionExpression = {
        TableName: tableName,
        ConditionExpression: 'attribute_exists(#eb_a)',
        ExpressionAttributeNames: { '#eb_a': attr1 },
    };

    t.same(
        new builder(tableName).AttrExists(attr1).BuildConditionExpressions(),
        expectedAttrExistsConditionExpression,
        'should store attribute and create a condition expression when AttrExists is called'
    );

    const expectedComplexAttrExistsConditionExpression = {
        TableName: tableName,
        ConditionExpression: 'attribute_exists(#eb_a.#eb_b)',
        ExpressionAttributeNames: { '#eb_a': attr1, '#eb_b': attr2 },
    };

    t.same(
        new builder(tableName).AttrExists(`${attr1}.${attr2}`).BuildConditionExpressions(),
        expectedComplexAttrExistsConditionExpression,
        'should store attribute and create a condition expression when AttrExists is called with a complex attribute'
    );

    const expectedIndexedAttrExistsConditionExpression = {
        TableName: tableName,
        ConditionExpression: 'attribute_exists(#eb_a[1])',
        ExpressionAttributeNames: { '#eb_a': attr1 },
    };

    t.same(
        new builder(tableName).AttrExists(`${attr1}[1]`).BuildConditionExpressions(),
        expectedIndexedAttrExistsConditionExpression,
        'should store attribute and create a condition expression when AttrExists is called with an indexed attribute'
    );

    const expectedComplexIndexedAttrExistsConditionExpression = {
        TableName: tableName,
        ConditionExpression: 'attribute_exists(#eb_a.#eb_b[1][0])',
        ExpressionAttributeNames: { '#eb_a': attr1, '#eb_b': attr2 },
    };

    t.same(
        new builder(tableName).AttrExists(`${attr1}.${attr2}[1][0]`).BuildConditionExpressions(),
        expectedComplexIndexedAttrExistsConditionExpression,
        'should store attribute and create a condition expression when AttrExists is called with a complex indexed attribute'
    );

    t.end();
});

tap.test('AttrNotExists', t => {
    const tableName = 'Test-Table';
    const attr1 = 'Test';
    const attr2 = 'SubTest';
    const val1 = 'Value';

    const expectedAttrNotExistsConditionExpression = {
        TableName: tableName,
        ConditionExpression: 'attribute_not_exists(#eb_a)',
        ExpressionAttributeNames: { '#eb_a': attr1 },
    };

    t.same(
        new builder(tableName).AttrNotExists(attr1).BuildConditionExpressions(),
        expectedAttrNotExistsConditionExpression,
        'should store attribute and create a condition expression when AttrNotExists is called'
    );

    const expectedComplexAttrNotExistsConditionExpression = {
        TableName: tableName,
        ConditionExpression: 'attribute_not_exists(#eb_a.#eb_b)',
        ExpressionAttributeNames: { '#eb_a': attr1, '#eb_b': attr2 },
    };

    t.same(
        new builder(tableName).AttrNotExists(`${attr1}.${attr2}`).BuildConditionExpressions(),
        expectedComplexAttrNotExistsConditionExpression,
        'should store attribute and create a condition expression when AttrNotExists is called with a complex attribute'
    );

    const expectedIndexedAttrNotExistsConditionExpression = {
        TableName: tableName,
        ConditionExpression: 'attribute_not_exists(#eb_a[1])',
        ExpressionAttributeNames: { '#eb_a': attr1 },
    };

    t.same(
        new builder(tableName).AttrNotExists(`${attr1}[1]`).BuildConditionExpressions(),
        expectedIndexedAttrNotExistsConditionExpression,
        'should store attribute and create a condition expression when AttrNotExists is called with an indexed attribute'
    );

    const expectedComplexIndexedAttrNotExistsConditionExpression = {
        TableName: tableName,
        ConditionExpression: 'attribute_not_exists(#eb_a.#eb_b[1][0])',
        ExpressionAttributeNames: { '#eb_a': attr1, '#eb_b': attr2 },
    };

    t.same(
        new builder(tableName).AttrNotExists(`${attr1}.${attr2}[1][0]`).BuildConditionExpressions(),
        expectedComplexIndexedAttrNotExistsConditionExpression,
        'should store attribute and create a condition expression when AttrNotExists is called with a complex indexed attribute'
    );

    t.end();
});

tap.test('Contains', t => {
    const tableName = 'Test-Table';
    const attr1 = 'Test';
    const attr2 = 'SubTest';
    const val1 = 'Value';

    const expectedContainsConditionExpression = {
        TableName: tableName,
        ConditionExpression: 'contains(#eb_a, :eb_a)',
        ExpressionAttributeNames: { '#eb_a': attr1 },
        ExpressionAttributeValues: { ':eb_a': { S: val1 } },
    };

    t.same(
        new builder(tableName).Contains(attr1, val1).BuildConditionExpressions(),
        expectedContainsConditionExpression,
        'should store attribute and create a condition expression when Contains is called'
    );

    const expectedComplexContainsConditionExpression = {
        TableName: tableName,
        ConditionExpression: 'contains(#eb_a.#eb_b, :eb_a)',
        ExpressionAttributeNames: { '#eb_a': attr1, '#eb_b': attr2 },
        ExpressionAttributeValues: { ':eb_a': { S: val1 } },
    };

    t.same(
        new builder(tableName).Contains(`${attr1}.${attr2}`, val1).BuildConditionExpressions(),
        expectedComplexContainsConditionExpression,
        'should store attribute and create a condition expression when Contains is called with a complex attribute'
    );

    const expectedIndexedContainsConditionExpression = {
        TableName: tableName,
        ConditionExpression: 'contains(#eb_a[1], :eb_a)',
        ExpressionAttributeNames: { '#eb_a': attr1 },
        ExpressionAttributeValues: { ':eb_a': { S: val1 } },
    };

    t.same(
        new builder(tableName).Contains(`${attr1}[1]`, val1).BuildConditionExpressions(),
        expectedIndexedContainsConditionExpression,
        'should store attribute and create a condition expression when Contains is called with an indexed attribute'
    );

    const expectedComplexIndexedContainsConditionExpression = {
        TableName: tableName,
        ConditionExpression: 'contains(#eb_a.#eb_b[1][0], :eb_a)',
        ExpressionAttributeNames: { '#eb_a': attr1, '#eb_b': attr2 },
        ExpressionAttributeValues: { ':eb_a': { S: val1 } },
    };

    t.same(
        new builder(tableName)
            .Contains(`${attr1}.${attr2}[1][0]`, val1)
            .BuildConditionExpressions(),
        expectedComplexIndexedContainsConditionExpression,
        'should store attribute and create a condition expression when Contains is called with a complex indexed attribute'
    );
    t.end();
});

tap.test('BeginsWith', t => {
    const tableName = 'Test-Table';
    const attr1 = 'Test';
    const attr2 = 'SubTest';
    const val1 = 'Value';

    const expectedBeginsWithConditionExpression = {
        TableName: tableName,
        ConditionExpression: 'begins_with(#eb_a, :eb_a)',
        ExpressionAttributeNames: { '#eb_a': attr1 },
        ExpressionAttributeValues: { ':eb_a': { S: val1 } },
    };

    t.same(
        new builder(tableName).BeginsWith(attr1, val1).BuildConditionExpressions(),
        expectedBeginsWithConditionExpression,
        'should store attribute and create a condition expression when BeginsWith is called'
    );

    const expectedComplexBeginsWithConditionExpression = {
        TableName: tableName,
        ConditionExpression: 'begins_with(#eb_a.#eb_b, :eb_a)',
        ExpressionAttributeNames: { '#eb_a': attr1, '#eb_b': attr2 },
        ExpressionAttributeValues: { ':eb_a': { S: val1 } },
    };

    t.same(
        new builder(tableName).BeginsWith(`${attr1}.${attr2}`, val1).BuildConditionExpressions(),
        expectedComplexBeginsWithConditionExpression,
        'should store attribute and create a condition expression when BeginsWith is called with a complex attribute'
    );

    const expectedIndexedBeginsWithConditionExpression = {
        TableName: tableName,
        ConditionExpression: 'begins_with(#eb_a[1], :eb_a)',
        ExpressionAttributeNames: { '#eb_a': attr1 },
        ExpressionAttributeValues: { ':eb_a': { S: val1 } },
    };

    t.same(
        new builder(tableName).BeginsWith(`${attr1}[1]`, val1).BuildConditionExpressions(),
        expectedIndexedBeginsWithConditionExpression,
        'should store attribute and create a condition expression when BeginsWith is called with an indexed attribute'
    );

    const expectedComplexIndexedBeginsWithConditionExpression = {
        TableName: tableName,
        ConditionExpression: 'begins_with(#eb_a.#eb_b[1][0], :eb_a)',
        ExpressionAttributeNames: { '#eb_a': attr1, '#eb_b': attr2 },
        ExpressionAttributeValues: { ':eb_a': { S: val1 } },
    };

    t.same(
        new builder(tableName)
            .BeginsWith(`${attr1}.${attr2}[1][0]`, val1)
            .BuildConditionExpressions(),
        expectedComplexIndexedBeginsWithConditionExpression,
        'should store attribute and create a condition expression when BeginsWith is called with a complex indexed attribute'
    );

    t.end();
});

tap.test('Type Assertions', t => {
    const tableName = 'Test-Table';
    const attr1 = 'Test';
    const attr2 = 'Other Test';

    const expectedStringTypeAssertionConditionExpression = {
        TableName: tableName,
        ConditionExpression: 'attribute_type(#eb_a, :eb_a)',
        ExpressionAttributeNames: { '#eb_a': attr1 },
        ExpressionAttributeValues: { ':eb_a': { S: 'S' } },
    };

    t.same(
        new builder(tableName).AssertStringType(attr1).BuildConditionExpressions(),
        expectedStringTypeAssertionConditionExpression,
        'should build an attribute_type function for STRING types using expression attribute names and values'
    );

    const expectedStringSetTypeAssertionConditionExpression = {
        TableName: tableName,
        ConditionExpression: 'attribute_type(#eb_a, :eb_a)',
        ExpressionAttributeNames: { '#eb_a': attr1 },
        ExpressionAttributeValues: { ':eb_a': { S: 'SS' } },
    };

    t.same(
        new builder(tableName).AssertStringSetType(attr1).BuildConditionExpressions(),
        expectedStringSetTypeAssertionConditionExpression,
        'should build an attribute_type function for STRING_SET types using expression attribute names and values'
    );

    const expectedNumberTypeAssertionConditionExpression = {
        TableName: tableName,
        ConditionExpression: 'attribute_type(#eb_a, :eb_a)',
        ExpressionAttributeNames: { '#eb_a': attr1 },
        ExpressionAttributeValues: { ':eb_a': { S: 'N' } },
    };

    t.same(
        new builder(tableName).AssertNumberType(attr1).BuildConditionExpressions(),
        expectedNumberTypeAssertionConditionExpression,
        'should build an attribute_type function for NUMBER types using expression attribute names and values'
    );

    const expectedNumberSetTypeAssertionConditionExpression = {
        TableName: tableName,
        ConditionExpression: 'attribute_type(#eb_a, :eb_a)',
        ExpressionAttributeNames: { '#eb_a': attr1 },
        ExpressionAttributeValues: { ':eb_a': { S: 'NS' } },
    };

    t.same(
        new builder(tableName).AssertNumberSetType(attr1).BuildConditionExpressions(),
        expectedNumberSetTypeAssertionConditionExpression,
        'should build an attribute_type function for NUMBER_SET types using expression attribute names and values'
    );

    const expectedBinaryTypeAssertionConditionExpression = {
        TableName: tableName,
        ConditionExpression: 'attribute_type(#eb_a, :eb_a)',
        ExpressionAttributeNames: { '#eb_a': attr1 },
        ExpressionAttributeValues: { ':eb_a': { S: 'B' } },
    };

    t.same(
        new builder(tableName).AssertBinaryType(attr1).BuildConditionExpressions(),
        expectedBinaryTypeAssertionConditionExpression,
        'should build an attribute_type function for BINARY types using expression attribute names and values'
    );

    const expectedBinarySetTypeAssertionConditionExpression = {
        TableName: tableName,
        ConditionExpression: 'attribute_type(#eb_a, :eb_a)',
        ExpressionAttributeNames: { '#eb_a': attr1 },
        ExpressionAttributeValues: { ':eb_a': { S: 'BS' } },
    };

    t.same(
        new builder(tableName).AssertBinarySetType(attr1).BuildConditionExpressions(),
        expectedBinarySetTypeAssertionConditionExpression,
        'should build an attribute_type function for BINARY_SET types using expression attribute names and values'
    );

    const expectedBooleanTypeAssertionConditionExpression = {
        TableName: tableName,
        ConditionExpression: 'attribute_type(#eb_a, :eb_a)',
        ExpressionAttributeNames: { '#eb_a': attr1 },
        ExpressionAttributeValues: { ':eb_a': { S: 'BOOL' } },
    };

    t.same(
        new builder(tableName).AssertBooleanType(attr1).BuildConditionExpressions(),
        expectedBooleanTypeAssertionConditionExpression,
        'should build an attribute_type function for BOOLEAN types using expression attribute names and values'
    );

    const expectedNullTypeAssertionConditionExpression = {
        TableName: tableName,
        ConditionExpression: 'attribute_type(#eb_a, :eb_a)',
        ExpressionAttributeNames: { '#eb_a': attr1 },
        ExpressionAttributeValues: { ':eb_a': { S: 'NULL' } },
    };

    t.same(
        new builder(tableName).AssertNullType(attr1).BuildConditionExpressions(),
        expectedNullTypeAssertionConditionExpression,
        'should build an attribute_type function for NULL types using expression attribute names and values'
    );

    const expectedListTypeAssertionConditionExpression = {
        TableName: tableName,
        ConditionExpression: 'attribute_type(#eb_a, :eb_a)',
        ExpressionAttributeNames: { '#eb_a': attr1 },
        ExpressionAttributeValues: { ':eb_a': { S: 'L' } },
    };

    t.same(
        new builder(tableName).AssertListType(attr1).BuildConditionExpressions(),
        expectedListTypeAssertionConditionExpression,
        'should build an attribute_type function for LIST types using expression attribute names and values'
    );

    const expectedMapTypeAssertionConditionExpression = {
        TableName: tableName,
        ConditionExpression: 'attribute_type(#eb_a, :eb_a)',
        ExpressionAttributeNames: { '#eb_a': attr1 },
        ExpressionAttributeValues: { ':eb_a': { S: 'M' } },
    };

    t.same(
        new builder(tableName).AssertMapType(attr1).BuildConditionExpressions(),
        expectedMapTypeAssertionConditionExpression,
        'should build an attribute_type function for MAP types using expression attribute names and values'
    );

    const expectedConcatTypeAssertionConditionExpression = {
        TableName: tableName,
        ConditionExpression: 'attribute_type(#eb_a, :eb_a) AND attribute_type(#eb_b, :eb_a)',
        ExpressionAttributeNames: { '#eb_a': attr1, '#eb_b': attr2 },
        ExpressionAttributeValues: { ':eb_a': { S: 'S' } },
    };

    t.same(
        new builder(tableName)
            .AssertStringType(attr1)
            .AND()
            .AssertStringType(attr2)
            .BuildConditionExpressions(),
        expectedConcatTypeAssertionConditionExpression,
        'should be able to be concatenated with logical operators'
    );

    const expectedComplexAssertionConditionExpression = {
        TableName: tableName,
        ConditionExpression: 'attribute_type(#eb_a.#eb_b, :eb_a)',
        ExpressionAttributeNames: { '#eb_a': attr1, '#eb_b': attr2 },
        ExpressionAttributeValues: { ':eb_a': { S: 'M' } },
    };

    t.same(
        new builder(tableName).AssertMapType(`${attr1}.${attr2}`).BuildConditionExpressions(),
        expectedComplexAssertionConditionExpression,
        'should build complex attribute paths'
    );

    const expectedComplexIndexedAssertionConditionExpression = {
        TableName: tableName,
        ConditionExpression: 'attribute_type(#eb_a[0].#eb_b[1], :eb_a)',
        ExpressionAttributeNames: { '#eb_a': attr1, '#eb_b': attr2 },
        ExpressionAttributeValues: { ':eb_a': { S: 'M' } },
    };

    t.same(
        new builder(tableName).AssertMapType(`${attr1}[0].${attr2}[1]`).BuildConditionExpressions(),
        expectedComplexIndexedAssertionConditionExpression,
        'should build complex indexed attribute paths'
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
        new builder(tableName).BuildQueryExpressions(),
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
        new builder(tableName).EQ(attr1, val1).BuildQueryExpressions(),
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
        new builder(tableName).LT(attr1, val2).BuildQueryExpressions(),
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
        new builder(tableName).GT(attr1, val2).BuildQueryExpressions(),
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
        new builder(tableName).GE(attr1, val2).BuildQueryExpressions(),
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
        new builder(tableName).LE(attr1, val2).BuildQueryExpressions(),
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
        new builder(tableName)
            .LE(attr1, val2)
            .AND()
            .GE(attr1, val3)
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
        new builder(tableName).BETWEEN(attr1, val2, val3).BuildQueryExpressions(),
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
        new builder(tableName)
            .EQ(attr1, val1)
            .FilterStart()
            .LT(attr2, val2)
            .FilterEnd()
            .BuildQueryExpressions(),
        expectedFilterShape,
        'should produce the correct FilterExpression if FilterStart, FilterEnd used'
    );

    expectedProjectionShape = {
        TableName: tableName,
        KeyConditionExpression: '#eb_a = :eb_a',
        ExpressionAttributeNames: { '#eb_a': attr1, '#eb_b': attr2 },
        ExpressionAttributeValues: { ':eb_a': { S: val1 } },
        ProjectionExpression: '#eb_a, #eb_b',
    };

    t.same(
        new builder(tableName)
            .EQ(attr1, val1)
            .Projections([attr1, attr2])
            .BuildQueryExpressions(),
        expectedProjectionShape,
        'should include a ProjectionExpession if the Projections method is called'
    );

    t.end();
});

tap.test('BuildUpdateExpression', t => {
    const tableName = 'test-table';
    const partitionKey = 'PartitionAttribute';
    const sortKey = 'SortAttribute';
    const key = { PK: partitionKey, SK: sortKey };

    const attr1 = 'Test-Attribute';
    const attr2 = 'Another-Test-Attribute';
    const attr3 = 'Third-Attribute';
    const val1 = 'Test Value';
    const val2 = 'Another Test Value';
    const val3 = 'Third Test Value';

    const numVal1 = 2;
    const numVal2 = 42;
    const numVal3 = 1;

    const listVal1 = [2];
    const listVal2 = [42, 2];
    const listVal3 = [1, 2, 3];

    const expectedDefaultShape = {
        TableName: tableName,
        Key: {},
        UpdateExpression: '',
        ExpressionAttributeNames: {},
    };

    t.same(
        new builder(tableName).BuildUpdateExpressions(),
        expectedDefaultShape,
        'should include "TableName", "Key", "UpdateExpression", and "ExpressionAttributeNames"'
    );

    const expectedKeyShape = {
        TableName: tableName,
        Key: { PK: { S: partitionKey }, SK: { S: sortKey } },
        UpdateExpression: '',
        ExpressionAttributeNames: {},
    };

    t.same(
        new builder(tableName).Key(key).BuildUpdateExpressions(),
        expectedKeyShape,
        'should add correct typing for key object when Key is called'
    );

    const expectedSetShape = {
        TableName: tableName,
        Key: { PK: { S: partitionKey }, SK: { S: sortKey } },
        UpdateExpression: 'SET #eb_a = :eb_a',
        ExpressionAttributeNames: { '#eb_a': attr1 },
        ExpressionAttributeValues: { ':eb_a': { S: val1 } },
    };

    t.same(
        new builder(tableName)
            .Key(key)
            .Set(attr1, val1)
            .BuildUpdateExpressions(),
        expectedSetShape,
        'should build the expressions correctly when the Set function is called once for a simple attribute path'
    );

    const expectedMultipleSetShape = {
        TableName: tableName,
        Key: { PK: { S: partitionKey }, SK: { S: sortKey } },
        UpdateExpression: 'SET #eb_a = :eb_a, #eb_b = :eb_b, #eb_c = :eb_c',
        ExpressionAttributeNames: { '#eb_a': attr1, '#eb_b': attr2, '#eb_c': attr3 },
        ExpressionAttributeValues: {
            ':eb_a': { S: val1 },
            ':eb_b': { S: val2 },
            ':eb_c': { S: val3 },
        },
    };

    t.same(
        new builder(tableName)
            .Key(key)
            .Set(attr1, val1)
            .Set(attr2, val2)
            .Set(attr3, val3)
            .BuildUpdateExpressions(),
        expectedMultipleSetShape,
        'should build the expressions correctly when the Set function is called more than once for simple attribute paths'
    );

    const expectedMultipleComplexSetShape = {
        TableName: tableName,
        Key: { PK: { S: partitionKey }, SK: { S: sortKey } },
        UpdateExpression: 'SET #eb_a.#eb_b = :eb_a, #eb_a[0].#eb_b[1] = :eb_b, #eb_c[0][1] = :eb_c',
        ExpressionAttributeNames: { '#eb_a': attr1, '#eb_b': attr2, '#eb_c': attr3 },
        ExpressionAttributeValues: {
            ':eb_a': { S: val1 },
            ':eb_b': { S: val2 },
            ':eb_c': { S: val3 },
        },
    };

    t.same(
        new builder(tableName)
            .Key(key)
            .Set(`${attr1}.${attr2}`, val1)
            .Set(`${attr1}[0].${attr2}[1]`, val2)
            .Set(`${attr3}[0][1]`, val3)
            .BuildUpdateExpressions(),
        expectedMultipleComplexSetShape,
        'should build the expressions correctly when the Set function is called more than once for complex and indexed attribute paths'
    );

    const expectedSetIfNotExistsShape = {
        TableName: tableName,
        Key: { PK: { S: partitionKey }, SK: { S: sortKey } },
        UpdateExpression: 'SET #eb_a = if_not_exists(#eb_a, :eb_a)',
        ExpressionAttributeNames: { '#eb_a': attr1 },
        ExpressionAttributeValues: { ':eb_a': { S: val1 } },
    };

    t.same(
        new builder(tableName)
            .Key(key)
            .SetIfNotExists(attr1, val1)
            .BuildUpdateExpressions(),
        expectedSetIfNotExistsShape,
        'should build the expressions correctly when the SetIfNotExists function is called once for a simple attribute path'
    );

    const expectedMultipleSetIfNotExistsShape = {
        TableName: tableName,
        Key: { PK: { S: partitionKey }, SK: { S: sortKey } },
        UpdateExpression:
            'SET #eb_a = if_not_exists(#eb_a, :eb_a), #eb_b = if_not_exists(#eb_b, :eb_b), #eb_c = if_not_exists(#eb_c, :eb_c)',
        ExpressionAttributeNames: { '#eb_a': attr1, '#eb_b': attr2, '#eb_c': attr3 },
        ExpressionAttributeValues: {
            ':eb_a': { S: val1 },
            ':eb_b': { S: val2 },
            ':eb_c': { S: val3 },
        },
    };

    t.same(
        new builder(tableName)
            .Key(key)
            .SetIfNotExists(attr1, val1)
            .SetIfNotExists(attr2, val2)
            .SetIfNotExists(attr3, val3)
            .BuildUpdateExpressions(),
        expectedMultipleSetIfNotExistsShape,
        'should build the expressions correctly when the SetIfNotExists function is called more than once for simple attribute paths'
    );

    const expectedMultipleComplexSetIfNotExistsShape = {
        TableName: tableName,
        Key: { PK: { S: partitionKey }, SK: { S: sortKey } },
        UpdateExpression:
            'SET #eb_a.#eb_b = if_not_exists(#eb_a.#eb_b, :eb_a), #eb_a[0].#eb_b[1] = if_not_exists(#eb_a[0].#eb_b[1], :eb_b), #eb_c[0][1] = if_not_exists(#eb_c[0][1], :eb_c)',
        ExpressionAttributeNames: { '#eb_a': attr1, '#eb_b': attr2, '#eb_c': attr3 },
        ExpressionAttributeValues: {
            ':eb_a': { S: val1 },
            ':eb_b': { S: val2 },
            ':eb_c': { S: val3 },
        },
    };

    t.same(
        new builder(tableName)
            .Key(key)
            .SetIfNotExists(`${attr1}.${attr2}`, val1)
            .SetIfNotExists(`${attr1}[0].${attr2}[1]`, val2)
            .SetIfNotExists(`${attr3}[0][1]`, val3)
            .BuildUpdateExpressions(),
        expectedMultipleComplexSetIfNotExistsShape,
        'should build the expressions correctly when the SetIfNotExists function is called more than once for complex and indexed attribute paths'
    );

    const expectedSetPlusShape = {
        TableName: tableName,
        Key: { PK: { S: partitionKey }, SK: { S: sortKey } },
        UpdateExpression: 'SET #eb_a = #eb_a + :eb_a',
        ExpressionAttributeNames: { '#eb_a': attr1 },
        ExpressionAttributeValues: { ':eb_a': { N: numVal1 } },
    };

    t.same(
        new builder(tableName)
            .Key(key)
            .SetPlus(attr1, numVal1)
            .BuildUpdateExpressions(),
        expectedSetPlusShape,
        'should build the expressions correctly when the SetPlus function is called once for a simple attribute path'
    );

    const expectedMultipleSetPlusShape = {
        TableName: tableName,
        Key: { PK: { S: partitionKey }, SK: { S: sortKey } },
        UpdateExpression: 'SET #eb_a = #eb_a + :eb_a, #eb_b = #eb_b + :eb_b, #eb_c = #eb_c + :eb_c',
        ExpressionAttributeNames: { '#eb_a': attr1, '#eb_b': attr2, '#eb_c': attr3 },
        ExpressionAttributeValues: {
            ':eb_a': { N: numVal1 },
            ':eb_b': { N: numVal2 },
            ':eb_c': { N: numVal3 },
        },
    };

    t.same(
        new builder(tableName)
            .Key(key)
            .SetPlus(attr1, numVal1)
            .SetPlus(attr2, numVal2)
            .SetPlus(attr3, numVal3)
            .BuildUpdateExpressions(),
        expectedMultipleSetPlusShape,
        'should build the expressions correctly when the SetPlus function is called more than once for simple attribute paths'
    );

    const expectedMultipleComplexSetPlusShape = {
        TableName: tableName,
        Key: { PK: { S: partitionKey }, SK: { S: sortKey } },
        UpdateExpression:
            'SET #eb_a.#eb_b = #eb_a.#eb_b + :eb_a, #eb_a[0].#eb_b[1] = #eb_a[0].#eb_b[1] + :eb_b, #eb_c[0][1] = #eb_c[0][1] + :eb_c',
        ExpressionAttributeNames: { '#eb_a': attr1, '#eb_b': attr2, '#eb_c': attr3 },
        ExpressionAttributeValues: {
            ':eb_a': { N: numVal1 },
            ':eb_b': { N: numVal2 },
            ':eb_c': { N: numVal3 },
        },
    };

    t.same(
        new builder(tableName)
            .Key(key)
            .SetPlus(`${attr1}.${attr2}`, numVal1)
            .SetPlus(`${attr1}[0].${attr2}[1]`, numVal2)
            .SetPlus(`${attr3}[0][1]`, numVal3)
            .BuildUpdateExpressions(),
        expectedMultipleComplexSetPlusShape,
        'should build the expressions correctly when the SetPlus function is called more than once for complex and indexed attribute paths'
    );

    const expectedSetMinusShape = {
        TableName: tableName,
        Key: { PK: { S: partitionKey }, SK: { S: sortKey } },
        UpdateExpression: 'SET #eb_a = #eb_a - :eb_a',
        ExpressionAttributeNames: { '#eb_a': attr1 },
        ExpressionAttributeValues: { ':eb_a': { N: numVal1 } },
    };

    t.same(
        new builder(tableName)
            .Key(key)
            .SetMinus(attr1, numVal1)
            .BuildUpdateExpressions(),
        expectedSetMinusShape,
        'should build the expressions correctly when the SetMinus function is called once for a simple attribute path'
    );

    const expectedMultipleSetMinusShape = {
        TableName: tableName,
        Key: { PK: { S: partitionKey }, SK: { S: sortKey } },
        UpdateExpression: 'SET #eb_a = #eb_a - :eb_a, #eb_b = #eb_b - :eb_b, #eb_c = #eb_c - :eb_c',
        ExpressionAttributeNames: { '#eb_a': attr1, '#eb_b': attr2, '#eb_c': attr3 },
        ExpressionAttributeValues: {
            ':eb_a': { N: numVal1 },
            ':eb_b': { N: numVal2 },
            ':eb_c': { N: numVal3 },
        },
    };

    t.same(
        new builder(tableName)
            .Key(key)
            .SetMinus(attr1, numVal1)
            .SetMinus(attr2, numVal2)
            .SetMinus(attr3, numVal3)
            .BuildUpdateExpressions(),
        expectedMultipleSetMinusShape,
        'should build the expressions correctly when the SetMinus function is called more than once for simple attribute paths'
    );

    const expectedMultipleComplexSetMinusShape = {
        TableName: tableName,
        Key: { PK: { S: partitionKey }, SK: { S: sortKey } },
        UpdateExpression:
            'SET #eb_a.#eb_b = #eb_a.#eb_b - :eb_a, #eb_a[0].#eb_b[1] = #eb_a[0].#eb_b[1] - :eb_b, #eb_c[0][1] = #eb_c[0][1] - :eb_c',
        ExpressionAttributeNames: { '#eb_a': attr1, '#eb_b': attr2, '#eb_c': attr3 },
        ExpressionAttributeValues: {
            ':eb_a': { N: numVal1 },
            ':eb_b': { N: numVal2 },
            ':eb_c': { N: numVal3 },
        },
    };

    t.same(
        new builder(tableName)
            .Key(key)
            .SetMinus(`${attr1}.${attr2}`, numVal1)
            .SetMinus(`${attr1}[0].${attr2}[1]`, numVal2)
            .SetMinus(`${attr3}[0][1]`, numVal3)
            .BuildUpdateExpressions(),
        expectedMultipleComplexSetMinusShape,
        'should build the expressions correctly when the SetMinus function is called more than once for complex and indexed attribute paths'
    );

    const expectedSetListAppendShape = {
        TableName: tableName,
        Key: { PK: { S: partitionKey }, SK: { S: sortKey } },
        UpdateExpression: 'SET #eb_a = list_append(#eb_a, :eb_a)',
        ExpressionAttributeNames: { '#eb_a': attr1 },
        ExpressionAttributeValues: { ':eb_a': { L: [{ N: 2 }] } },
    };

    t.same(
        new builder(tableName)
            .Key(key)
            .SetListAppend(attr1, listVal1)
            .BuildUpdateExpressions(),
        expectedSetListAppendShape,
        'should build the expressions correctly when the SetListAppend function is called once for a simple attribute path'
    );

    const expectedMultipleSetListAppendShape = {
        TableName: tableName,
        Key: { PK: { S: partitionKey }, SK: { S: sortKey } },
        UpdateExpression:
            'SET #eb_a = list_append(#eb_a, :eb_a), #eb_b = list_append(#eb_b, :eb_b), #eb_c = list_append(#eb_c, :eb_c)',
        ExpressionAttributeNames: { '#eb_a': attr1, '#eb_b': attr2, '#eb_c': attr3 },
        ExpressionAttributeValues: {
            ':eb_a': { L: [{ N: 2 }] },
            ':eb_b': { L: [{ N: 42 }, { N: 2 }] },
            ':eb_c': { L: [{ N: 1 }, { N: 2 }, { N: 3 }] },
        },
    };

    t.same(
        new builder(tableName)
            .Key(key)
            .SetListAppend(attr1, listVal1)
            .SetListAppend(attr2, listVal2)
            .SetListAppend(attr3, listVal3)
            .BuildUpdateExpressions(),
        expectedMultipleSetListAppendShape,
        'should build the expressions correctly when the SetListAppend function is called more than once for simple attribute paths'
    );

    const expectedMultipleComplexSetListAppendShape = {
        TableName: tableName,
        Key: { PK: { S: partitionKey }, SK: { S: sortKey } },
        UpdateExpression:
            'SET #eb_a.#eb_b = list_append(#eb_a.#eb_b, :eb_a), #eb_a[0].#eb_b[1] = list_append(#eb_a[0].#eb_b[1], :eb_b), #eb_c[0][1] = list_append(#eb_c[0][1], :eb_c)',
        ExpressionAttributeNames: { '#eb_a': attr1, '#eb_b': attr2, '#eb_c': attr3 },
        ExpressionAttributeValues: {
            ':eb_a': { L: [{ N: 2 }] },
            ':eb_b': { L: [{ N: 42 }, { N: 2 }] },
            ':eb_c': { L: [{ N: 1 }, { N: 2 }, { N: 3 }] },
        },
    };

    t.same(
        new builder(tableName)
            .Key(key)
            .SetListAppend(`${attr1}.${attr2}`, listVal1)
            .SetListAppend(`${attr1}[0].${attr2}[1]`, listVal2)
            .SetListAppend(`${attr3}[0][1]`, listVal3)
            .BuildUpdateExpressions(),
        expectedMultipleComplexSetListAppendShape,
        'should build the expressions correctly when the SetListAppend function is called more than once for complex and indexed attribute paths'
    );

    const expectedSimpleAddShape = {
        TableName: tableName,
        Key: { PK: { S: partitionKey }, SK: { S: sortKey } },
        UpdateExpression: 'ADD #eb_a :eb_a',
        ExpressionAttributeNames: { '#eb_a': attr1 },
        ExpressionAttributeValues: { ':eb_a': { S: val1 } },
    };

    t.same(
        new builder(tableName)
            .Key(key)
            .Add(attr1, val1)
            .BuildUpdateExpressions(),
        expectedSimpleAddShape,
        'should build the expressions correctly when the Add function is called once for a simple attribute path'
    );

    const expectedSimpleIndexedAddShape = {
        TableName: tableName,
        Key: { PK: { S: partitionKey }, SK: { S: sortKey } },
        UpdateExpression: 'ADD #eb_a :eb_a, #eb_b :eb_b',
        ExpressionAttributeNames: { '#eb_a': attr1, '#eb_b': attr2 },
        ExpressionAttributeValues: { ':eb_a': { S: val1 }, ':eb_b': { S: val2 } },
    };

    t.same(
        new builder(tableName)
            .Key(key)
            .Add(attr1, val1)
            .Add(attr2, val2)
            .BuildUpdateExpressions(),
        expectedSimpleIndexedAddShape,
        'should build the expressions correctly when the Add function is called more than once for a simple attribute path'
    );

    const expectedComplexAddShape = {
        TableName: tableName,
        Key: { PK: { S: partitionKey }, SK: { S: sortKey } },
        UpdateExpression: 'ADD #eb_a[0].#eb_b[1] :eb_a',
        ExpressionAttributeNames: { '#eb_a': attr1, '#eb_b': attr2 },
        ExpressionAttributeValues: { ':eb_a': { S: val1 } },
    };

    t.same(
        new builder(tableName)
            .Key(key)
            .Add(`${attr1}[0].${attr2}[1]`, val1)
            .BuildUpdateExpressions(),
        expectedComplexAddShape,
        'should build the expressions correctly when the add function is called once with a complex indexed attribute path'
    );

    const expectedSimpleDeleteShape = {
        TableName: tableName,
        Key: { PK: { S: partitionKey }, SK: { S: sortKey } },
        UpdateExpression: 'DELETE #eb_a :eb_a',
        ExpressionAttributeNames: { '#eb_a': attr1 },
        ExpressionAttributeValues: { ':eb_a': { S: val1 } },
    };

    t.same(
        new builder(tableName)
            .Key(key)
            .Delete(attr1, val1)
            .BuildUpdateExpressions(),
        expectedSimpleDeleteShape,
        'should build the expressions correctly when the Delete function is called once for a simple attribute path'
    );

    const expectedSimpleIndexedDeleteShape = {
        TableName: tableName,
        Key: { PK: { S: partitionKey }, SK: { S: sortKey } },
        UpdateExpression: 'DELETE #eb_a :eb_a, #eb_b :eb_b',
        ExpressionAttributeNames: { '#eb_a': attr1, '#eb_b': attr2 },
        ExpressionAttributeValues: { ':eb_a': { S: val1 }, ':eb_b': { S: val2 } },
    };

    t.same(
        new builder(tableName)
            .Key(key)
            .Delete(attr1, val1)
            .Delete(attr2, val2)
            .BuildUpdateExpressions(),
        expectedSimpleIndexedDeleteShape,
        'should build the expressions correctly when the Delete function is called more than once for a simple attribute path'
    );

    const expectedComplexDeleteShape = {
        TableName: tableName,
        Key: { PK: { S: partitionKey }, SK: { S: sortKey } },
        UpdateExpression: 'DELETE #eb_a[0].#eb_b[1] :eb_a',
        ExpressionAttributeNames: { '#eb_a': attr1, '#eb_b': attr2 },
        ExpressionAttributeValues: { ':eb_a': { S: val1 } },
    };

    t.same(
        new builder(tableName)
            .Key(key)
            .Delete(`${attr1}[0].${attr2}[1]`, val1)
            .BuildUpdateExpressions(),
        expectedComplexDeleteShape,
        'should build the expressions correctly when the Delete function is called once with a complex indexed attribute path'
    );

    const expectedSimpleRemoveShape = {
        TableName: tableName,
        Key: { PK: { S: partitionKey }, SK: { S: sortKey } },
        UpdateExpression: 'REMOVE #eb_a',
        ExpressionAttributeNames: { '#eb_a': attr1 },
    };

    t.same(
        new builder(tableName)
            .Key(key)
            .Remove(attr1, val1)
            .BuildUpdateExpressions(),
        expectedSimpleRemoveShape,
        'should build the expressions correctly when the Remove function is called once for a simple attribute path'
    );

    const expectedSimpleIndexedRemoveShape = {
        TableName: tableName,
        Key: { PK: { S: partitionKey }, SK: { S: sortKey } },
        UpdateExpression: 'REMOVE #eb_a, #eb_b',
        ExpressionAttributeNames: { '#eb_a': attr1, '#eb_b': attr2 },
    };

    t.same(
        new builder(tableName)
            .Key(key)
            .Remove(attr1, val1)
            .Remove(attr2, val2)
            .BuildUpdateExpressions(),
        expectedSimpleIndexedRemoveShape,
        'should build the expressions correctly when the Remove function is called more than once for a simple attribute path'
    );

    const expectedComplexRemoveShape = {
        TableName: tableName,
        Key: { PK: { S: partitionKey }, SK: { S: sortKey } },
        UpdateExpression: 'REMOVE #eb_a[0].#eb_b[1]',
        ExpressionAttributeNames: { '#eb_a': attr1, '#eb_b': attr2 },
    };

    t.same(
        new builder(tableName)
            .Key(key)
            .Remove(`${attr1}[0].${attr2}[1]`, val1)
            .BuildUpdateExpressions(),
        expectedComplexRemoveShape,
        'should build the expressions correctly when the Remove function is called once with a complex indexed attribute path'
    );

    const expectedMultiUpdateShape = {
        TableName: tableName,
        Key: { PK: { S: partitionKey }, SK: { S: sortKey } },
        UpdateExpression: 'SET #eb_b = :eb_a REMOVE #eb_a DELETE #eb_c :eb_b',
        ExpressionAttributeNames: { '#eb_a': attr1, '#eb_b': attr2, '#eb_c': attr3 },
        ExpressionAttributeValues: {
            ':eb_a': { S: val2 },
            ':eb_b': { L: [{ N: '1' }, { N: '2' }, { N: '3' }] },
        },
    };

    t.same(
        new builder(tableName)
            .Key(key)
            .Remove(attr1)
            .Set(attr2, val2)
            .Delete(attr3, listVal3)
            .BuildUpdateExpressions(),
        expectedMultiUpdateShape,
        'should allow multiple update commands to be called'
    );

    const expectedConditionUpdateShape = {
        TableName: tableName,
        Key: { PK: { S: partitionKey }, SK: { S: sortKey } },
        UpdateExpression: 'SET #eb_b = :eb_a REMOVE #eb_a DELETE #eb_c :eb_b',
        ExpressionAttributeNames: { '#eb_a': attr1, '#eb_b': attr2, '#eb_c': attr3 },
        ExpressionAttributeValues: {
            ':eb_a': { S: val2 },
            ':eb_b': { L: [{ N: '1' }, { N: '2' }, { N: '3' }] },
        },
        ConditionExpression:
            'attribute_exists(#eb_a) AND attribute_exists(#eb_b) AND attribute_exists(#eb_c)',
    };

    t.same(
        new builder(tableName)
            .Key(key)
            .Remove(attr1)
            .Set(attr2, val2)
            .Delete(attr3, listVal3)
            .AttrExists(attr1)
            .AND()
            .AttrExists(attr2)
            .AND()
            .AttrExists(attr3)
            .BuildUpdateExpressions(),
        expectedConditionUpdateShape,
        'should allow a ConditionExpression to be built'
    );

    t.end();
});

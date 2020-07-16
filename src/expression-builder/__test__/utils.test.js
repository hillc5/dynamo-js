const tap = require('tap');

const { incrementCharacter, getMapKeyFromValue } = require('../utils');

tap.test('incrementCharacter', t => {
    t.equal(incrementCharacter('a'), 'b', '"a" incremented is "b"');
    t.equal(incrementCharacter('z'), '{', '"z" incremented is "{"');
    t.equal(incrementCharacter('0'), '1', '"0" incremented is "1"');
    t.equal(incrementCharacter('A'), 'B', '"A" incremented is "B"');
    t.equal(incrementCharacter('Z'), '[', '"Z" incremented is "["');
    t.equal(incrementCharacter('@'), 'A', '"@" incremented is "A"');
    t.equal(incrementCharacter('`'), 'a', '"`" incremented is "a"');
    t.end();
});

tap.test('getMapKeyFromValue', t => {
    const keysAndValues = [
        [1, 'test'],
        [2, 'other_test'],
        [['a', 'b', 'c'], 42],
        [3, 'duplicate_value'],
        [4, 'duplicate_value'],
    ];

    const m = new Map(keysAndValues);

    keysAndValues.forEach(([k, v]) => {
        if (v === 'duplicate_value') {
            t.equal(getMapKeyFromValue(v, m), 3, `${v} should return 3`);
        } else {
            t.equal(getMapKeyFromValue(v, m), k, `${v} should return ${k}`);
        }
    });

    t.end();
});

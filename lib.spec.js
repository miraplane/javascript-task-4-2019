/* eslint-env mocha */
'use strict';

const assert = require('assert');

const lib = require('./lib');

const friends = [
    {
        name: 'Sam',
        friends: ['Mat', 'Sharon'],
        gender: 'male',
        best: true
    },
    {
        name: 'Sally',
        friends: ['Brad', 'Emily'],
        gender: 'female',
        best: true
    },
    {
        name: 'Mat',
        friends: ['Sam', 'Sharon'],
        gender: 'male'
    },
    {
        name: 'Sharon',
        friends: ['Sam', 'Itan', 'Mat'],
        gender: 'female'
    },
    {
        name: 'Brad',
        friends: ['Sally', 'Emily', 'Julia'],
        gender: 'male'
    },
    {
        name: 'Emily',
        friends: ['Sally', 'Brad'],
        gender: 'female'
    },
    {
        name: 'Itan',
        friends: ['Sharon', 'Julia'],
        gender: 'male'
    },
    {
        name: 'Julia',
        friends: ['Brad', 'Itan'],
        gender: 'female'
    }
];

const newListFriends = [
    {
        name: 'Sam',
        friends: ['Sally', 'Alise'],
        gender: 'male',
        best: true
    },
    {
        name: 'Sally',
        friends: ['Sam', 'Mat'],
        gender: 'female'
    },
    {
        name: 'Mat',
        friends: ['Sally', 'Alise'],
        gender: 'male'
    },
    {
        name: 'Alise',
        friends: ['Mat', 'Sam'],
        gender: 'female'
    }
];

const bestFriends = [
    {
        name: 'Sam',
        friends: [],
        gender: 'male',
        best: true
    },
    {
        name: 'Sally',
        friends: [],
        gender: 'female',
        best: true
    },
    {
        name: 'Mat',
        friends: [],
        gender: 'male',
        best: true
    },
    {
        name: 'Alise',
        friends: [],
        gender: 'female',
        best: true
    }
];

describe('Итераторы', () => {
    it('должны обойти в правильном порядке друзей и составить пары', () => {
        assert.deepStrictEqual(doFriendList(friends), [
            [friend(friends, 'Sam'), friend(friends, 'Sally')],
            [friend(friends, 'Brad'), friend(friends, 'Emily')],
            [friend(friends, 'Mat'), friend(friends, 'Sharon')],
            friend(friends, 'Julia')
        ]);
    });

    it('должны обойти в правильном порядке граф с циклом', () => {
        assert.deepStrictEqual(doFriendList(newListFriends), [
            [friend(newListFriends, 'Sam'), friend(newListFriends, 'Alise')],
            [friend(newListFriends, 'Mat'), friend(newListFriends, 'Sally')]
        ]);
    });

    it('должны обойти в правильном порядке несвязный граф', () => {
        assert.deepStrictEqual(doFriendList(bestFriends), [
            [friend(bestFriends, 'Mat'), friend(bestFriends, 'Alise')],
            [friend(bestFriends, 'Sam'), friend(bestFriends, 'Sally')]
        ]);
    });

    function doFriendList(friendList) {
        const maleFilter = new lib.MaleFilter();
        const femaleFilter = new lib.FemaleFilter();
        const maleIterator = new lib.LimitedIterator(friendList, maleFilter, 2);
        const femaleIterator = new lib.Iterator(friendList, femaleFilter);

        const invitedFriends = [];

        while (!maleIterator.done() && !femaleIterator.done()) {
            invitedFriends.push([
                maleIterator.next(),
                femaleIterator.next()
            ]);
        }

        while (!femaleIterator.done()) {
            invitedFriends.push(femaleIterator.next());
        }

        return invitedFriends;
    }

    function friend(friendList, name) {
        let len = friendList.length;

        while (len--) {
            if (friendList[len].name === name) {
                return friendList[len];
            }
        }
    }
});

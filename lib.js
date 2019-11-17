'use strict';

function getFriends(friend, used, friendsName) {
    let nextFriends = [];
    for (let i = 0; i < friend.friends.length; i++) {
        let distantFriend = friend.friends[i];
        if (!used.hasOwnProperty(distantFriend)) {
            nextFriends.push(friendsName[distantFriend]);
            used[distantFriend] = true;
        }
    }

    return nextFriends;
}

function takeNextCircle(currentCircle, used, friendsName) {
    let nextCircle = [];
    for (let friend of currentCircle) {
        nextCircle = nextCircle.concat(getFriends(friend, used, friendsName));
    }

    return nextCircle;
}

function getBestFriend(friends, used, friendsName) {
    let bestFriend = [];
    for (let friend of friends) {
        if (friend.hasOwnProperty('best') && friend.best) {
            used[friend.name] = true;
            bestFriend.push(friend);
        }
        friendsName[friend.name] = friend;
    }

    return bestFriend;
}

function sortInCircle(first, second) {
    if (first.name > second.name) {
        return 1;
    } else if (second.name > first.name) {
        return -1;
    }

    return 0;
}

function sortFriends(friends) {
    let sortedFriends = [];
    let used = {};
    let friendsName = {};

    sortedFriends.push(getBestFriend(friends, used, friendsName));

    while (Object.keys(used).length !== Object.keys(friendsName).length) {
        let index = sortedFriends.length - 1;
        let next = takeNextCircle(sortedFriends[index], used, friendsName);
        sortedFriends.push(next);
    }
    for (let circle of sortedFriends) {
        circle.sort(sortInCircle);
    }

    return sortedFriends;
}

function filterInCircle(filter, circle) {
    let filteredInCircle = [];
    for (let friend of circle) {
        if (filter.filter(friend)) {
            filteredInCircle.push(friend);
        }
    }

    return filteredInCircle;
}

function filterFriends(friends, filter) {
    let filteredFriends = [];
    for (let circle of friends) {
        let filteredInCircle = filterInCircle(filter, circle);
        if (filteredInCircle.length !== 0) {
            filteredFriends.push(filteredInCircle);
        }
    }

    return filteredFriends;
}

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    if (!(Filter.prototype.isPrototypeOf(filter))) {
        throw TypeError;
    }

    this.sortedFriends = filterFriends(sortFriends(friends), filter);
    this.circle = 0;
    this.index = 0;
}

Iterator.prototype.done = function () {
    return (this.circle === this.sortedFriends.length - 1 &&
        this.index === this.sortedFriends[this.circle].length) ||
        this.sortedFriends.length === 0;
};

Iterator.prototype.next = function () {
    if (Iterator.prototype.done.call(this)) {
        return null;
    }

    if (this.index === this.sortedFriends[this.circle].length) {
        this.circle += 1;
        this.index = 0;
    }
    let next = this.sortedFriends[this.circle][this.index];
    this.index += 1;

    return next;

};

/**
 * Итератор по друзям с ограничением по кругу
 * @extends Iterator
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 * @param {Number} maxLevel – максимальный круг друзей
 */
function LimitedIterator(friends, filter, maxLevel) {
    this.maxLevel = maxLevel;
    Iterator.call(this, friends, filter);
}

LimitedIterator.prototype.done = function () {
    return this.circle === this.maxLevel - 1 &&
        this.index === this.sortedFriends[this.maxLevel - 1].length;
};

LimitedIterator.prototype.next = function () {
    let element = Iterator.prototype.next.call(this);
    if (this.circle >= this.maxLevel) {
        return null;
    }

    return element;
};


/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
}

Filter.prototype.filter = function (friend, field = 'name', value = friend.name) {
    return friend[field] === value;
};

/**
 * Фильтр друзей-парней
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
}

MaleFilter.prototype = Object.create(Filter.prototype);
MaleFilter.prototype.filter = function (friend) {
    return Filter.prototype.filter.call(this, friend, 'gender', 'male');
};

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
}

FemaleFilter.prototype = Object.create(Filter.prototype);
FemaleFilter.prototype.filter = function (friend) {
    return Filter.prototype.filter.call(this, friend, 'gender', 'female');
};

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;

'use strict';

function getFriendByName(friends) {
    let friendByName = {};
    for (let friend of friends) {
        friendByName[friend.name] = friend;
    }

    return friendByName;
}

function getBestFriend(friends) {
    let bestFriend = [];
    for (let friend of friends) {
        if (friend.hasOwnProperty('best') && friend.best) {
            bestFriend.push(friend);
        }
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

function filterInCircle(circle, filter) {
    let filteredInCircle = [];
    for (let friend of circle) {
        if (filter.filter(friend)) {
            filteredInCircle.push(friend);
        }
    }

    return filteredInCircle;
}

function getFriends(friendsName, used, friendByName) {
    let friends = [];
    for (let name of friendsName) {
        let friend = friendByName[name];
        if (used.indexOf(friend) === -1) {
            friends.push(friend);
            used.push(friend);
        }
    }

    return friends;
}

function getNextCircle(currentCircle, used, friendByName) {
    let nextCircle = [];
    for (let current of currentCircle) {
        nextCircle = nextCircle.concat(getFriends(current.friends, used, friendByName));
    }

    return nextCircle;
}

function checkFilter(filter) {
    if (!Filter.prototype.isPrototypeOf(filter)) {
        throw new TypeError();
    }
}

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    checkFilter(filter);

    this.friends = friends;
    this.filter = filter;

    this.friendByName = getFriendByName(friends);
    this.currentCircle = getBestFriend(friends).sort(sortInCircle);
    this.level = 1;
    this.viewFrind = [].concat(this.currentCircle);
    this.used = [].concat(this.currentCircle);
    this.nextCircle = getNextCircle(this.currentCircle, this.used, this.friendByName);

    this.filteredCircle = filterInCircle(this.currentCircle, filter);
    this.currentIndex = 0;
    this.currentValue = undefined;

    this.update = function () {
        this.viewFrind = this.viewFrind.concat(this.nextCircle);
        this.currentCircle = this.nextCircle.sort(sortInCircle);
        this.level += 1;
        this.nextCircle = getNextCircle(this.currentCircle, this.used, this.friendByName);
        this.filteredCircle = filterInCircle(this.currentCircle, this.filter);
        this.currentIndex = 0;
    };

    this.updateValue = function (value) {
        this.currentValue = value;
        this.currentIndex += 1;
    };

    this.next(true);
}
Iterator.prototype = {
    done() {
        return this.currentValue === null;
    },

    next(initial = false) {
        if (this.done()) {
            this.updateValue(null);

            return this.currentValue;
        }
        if (this.currentIndex >= this.filteredCircle.length) {
            if (this.nextCircle.length === 0) {
                let answer = this.currentValue;
                this.updateValue(null);

                return answer;
            }
            this.update();
        }
        if (this.filteredCircle.length === 0) {
            return this.next();
        }
        let answer = this.currentValue;
        this.updateValue(this.filteredCircle[this.currentIndex]);

        if (!initial) {
            return answer;
        }
    }
};
Iterator.prototype.constructor = Iterator;

/**
 * Итератор по друзям с ограничением по кругу
 * @extends Iterator
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 * @param {Number} maxLevel – максимальный круг друзей
 */
function LimitedIterator(friends, filter, maxLevel) {
    Iterator.call(this, friends, filter);
    this.maxLevel = maxLevel;
}
LimitedIterator.prototype = {
    done() {
        return super.done() || this.level > this.maxLevel;
    }
};
LimitedIterator.prototype.constructor = LimitedIterator;
Object.setPrototypeOf(LimitedIterator.prototype, Iterator.prototype);

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
}

Filter.prototype = {
    filter(friend, field = 'name', value = friend.name) {
        return friend[field] === value;
    }
};
Filter.prototype.constructor = Filter;

/**
 * Фильтр друзей-парней
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
}
MaleFilter.prototype = {
    filter(friend) {
        return super.filter(friend, 'gender', 'male');
    }
};
MaleFilter.prototype.constructor = MaleFilter;
Object.setPrototypeOf(MaleFilter.prototype, Filter.prototype);

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
}
FemaleFilter.prototype = {
    filter(friend) {
        return super.filter(friend, 'gender', 'female');
    }
};
FemaleFilter.prototype.constructor = FemaleFilter;
Object.setPrototypeOf(FemaleFilter.prototype, Filter.prototype);

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;

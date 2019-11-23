'use strict';

/**
 * Возвращает словарь: ключ - имя, значение - друг
 * @param {Array} friends - список друзей
 * @returns {Object}
 */
function getFriendByName(friends) {
    let friendByName = {};
    for (let friend of friends) {
        friendByName[friend.name] = friend;
    }

    return friendByName;
}

/**
 * Возвращает лучших друзей
 * @param {Array} friends - список всех друзей
 * @returns {Array}
 */
function getBestFriend(friends) {
    return friends.filter((friend) => {
        return friend.hasOwnProperty('best') && friend.best;
    });
}

/**
 * Сравнивает друзей по имени
 * @param {Object} first - первый друг
 * @param {Object} second - второй друг
 * @returns {number}
 */
function compareFriends(first, second) {
    return first.name.localeCompare(second.name);
}

/**
 * Фильтрует друзей в круге
 * @param {Array} circle - круг друзей
 * @param {Object} filter - фильтр
 * @returns {Array}
 */
function filterInCircle(circle, filter) {
    let filteredInCircle = [];
    for (let friend of circle) {
        if (filter.filter(friend)) {
            filteredInCircle.push(friend);
        }
    }

    return filteredInCircle;
}

/**
 * Возвращает список друзей
 * @param {Object} human - человек
 * @param {Array} used - уже просморенные друзья
 * @param {Object} friendByName - список всех друзей
 * @returns {Array}
 */
function getFriends(human, used, friendByName) {
    let friends = [];
    for (let name of human.friends) {
        let friend = friendByName[name];
        if (used.indexOf(friend) === -1) {
            friends.push(friend);
            used.push(friend);
        }
    }

    return friends;
}

/**
 * Возвращает следующий круг дрзей
 * @param {Array} currentCircle - текущий круг друзей
 * @param {Array} used - уже просмотренные друзья
 * @param {Object} friendByName - список всех дузей
 * @returns {Array}
 */
function getNextCircle(currentCircle, used, friendByName) {
    return currentCircle.reduce((accumulator, currentValue) => {
        return accumulator.concat(getFriends(currentValue, used, friendByName));
    }, []);
}

/**
 * Проверяет, что filter является производным конструктора Filter
 * @param {Object} filter - фильтр
 */
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

    this.filter = filter;
    this.friendByName = getFriendByName(friends);

    this.currentCircle = getBestFriend(friends).sort(compareFriends);
    this.level = 1;
    this.viewFrind = [].concat(this.currentCircle);
    this.used = [].concat(this.currentCircle);
    this.nextCircle = getNextCircle(this.currentCircle, this.used, this.friendByName);

    this.filteredCircle = filterInCircle(this.currentCircle, filter);
    this.currentIndex = 0;
    this.currentValue = undefined;

    this.next(true);
}
Iterator.prototype = {
    constructor: Iterator,

    goToNextCircle() {
        this.viewFrind = this.viewFrind.concat(this.nextCircle);
        this.currentCircle = this.nextCircle.sort(compareFriends);
        this.level += 1;
        this.nextCircle = getNextCircle(this.currentCircle, this.used, this.friendByName);
        this.filteredCircle = filterInCircle(this.currentCircle, this.filter);
        this.currentIndex = 0;
    },

    updateValue(value) {
        this.currentValue = value;
        this.currentIndex += 1;
    },

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
            this.goToNextCircle();
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
    constructor: LimitedIterator,
    done() {
        return super.done() || this.level > this.maxLevel;
    }
};
Object.setPrototypeOf(LimitedIterator.prototype, Iterator.prototype);

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
}
Filter.prototype = {
    constructor: Filter,
    filter(friend, field = 'name', value = friend.name) {
        return friend[field] === value;
    }
};

/**
 * Фильтр друзей-парней
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
}
MaleFilter.prototype = {
    constructo: MaleFilter,
    filter(friend) {
        return super.filter(friend, 'gender', 'male');
    }
};
Object.setPrototypeOf(MaleFilter.prototype, Filter.prototype);

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
}
FemaleFilter.prototype = {
    constructor: FemaleFilter,
    filter(friend) {
        return super.filter(friend, 'gender', 'female');
    }
};
Object.setPrototypeOf(FemaleFilter.prototype, Filter.prototype);

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;

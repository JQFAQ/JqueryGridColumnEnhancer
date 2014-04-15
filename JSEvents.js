// This can be used like this:
//function f1(s, d) { alert('f1 called w/ ' + d); }
//function f2(s, d) { alert('f2 called w/ ' + d); }

//// create the event
//var myEvent = new ObjectEvent('special');
//var myOtherEvent = new ObjectEvent('other special', f1);

//// add some subscribers and then fire the event
//myEvent.subscribe(f1);
//myEvent.subscribe(f2);
//myEvent.raise(null, 'hello world');

//// unsubscribe a handler and fire again
//myEVent.unsubscribe(f1);
//myEvent.raise(null, 'hello world again');

//// fire our other event which passed the handler into the constructor
//myOtherEvent.raise(null, 'hello other world');

function ObjectEvent(eventName, callback) {
    this.type = eventName;
    this.fn = [];
    this._thisArgs = [];
    this._crntIndex = -1;
    if (typeof (callback) == 'function') {
        this.fn[0] = callback;
    }
    this.__noOfDirtyItems = 0;
    this.__addedDirtyItemIndices = [];
    this.__removedDirtyItemIndices = [];
}
ObjectEvent.prototype.isSubscribed = function (fnc) {
    if (fnc) {
        return $.inArray(fnc, this.fn) == -1 ? false : true;
    }
    else {
        if (this.fn.length > 0)
            return true;
        else
            return false;
    }
}
ObjectEvent.prototype.raise = function (sender, args) {
    this.__noOfDirtyItems = 0;
    this.__addedDirtyItemIndices = [];
    this.__removedDirtyItemIndices = [];
    for (var i = 0; i < (this.fn.length - this.__addedDirtyItemIndices.length) ; i++) {
        if (typeof this.fn[i] == 'function') {
            this._crntIndex = i;
            this.fn[i].apply(this._thisArgs[i], arguments);
            // Fix for when the unsubscribe function is called while the same collection is raising events.
            if (this._crntIndex != -1 && this._crntIndex < i)
                i = this._crntIndex;
        }
    }
    this._crntIndex = -1;
    this.__noOfDirtyItems = 0;
    this.__addedDirtyItemIndices = [];
    this.__removedDirtyItemIndices = [];
};
ObjectEvent.prototype.subscribe = function (fn, thisArg) {
    if (this._crntIndex > -1) {
        this.__addedDirtyItemIndices.push(this.fn.length);
    }
    thisArg ? this._thisArgs.push(thisArg) : this._callee ? this._thisArgs.push(this._callee) : this._thisArgs.push(this);
    //if (fn && this.isSubscribed(fn)) {
    //    var index = $.inArray(fn, this.fn);
    //    if (index >= 0 && this._thisArgs[index] === thisArg)
    //        return;
    //}
    this.fn[this.fn.length] = fn;
};
ObjectEvent.prototype.unsubscribe = function (fn, context) {
    this.__noOfDirtyItems = this.__noOfDirtyItems || 0;
    if (context) {
        for (var i = 0; i < this._thisArgs.length; i++) {
            if (this._thisArgs[i] === context && this.fn[i] == fn) {
                // Fix for when the unsubscribe function is called while the same collection is raising events.
                if (this._crntIndex == i) {
                    this._crntIndex--;
                    this.__noOfDirtyItems++;
                    this.__removedDirtyItemIndices.push(i);
                }

                this.fn.splice(i, 1);
                this._thisArgs.splice(i, 1);
                break;
            }
        }
    }
    else {
        for (var i = 0; i < this.fn.length; i++) {
            if (this.fn[i] === fn) {
                if (this._crntIndex > -1) {
                    this.__noOfDirtyItems++;
                    this.__removedDirtyItemIndices.push(i);
                }
                this.fn.splice(i, 1);
                this._thisArgs.splice(i, 1);
                break;
            }
        }
    }
};
ObjectEvent.prototype.clear = function () {
    ObjectEvent.call(this, this.type);
};

ObjectEvent.prototype.IsEqual = function () {
    var left = this, right = arguments[0];
    var leftList = null, rightList = null;
    if (!left.isSubscribed() && right.isSubscribed())
        return false;
    if (left.isSubscribed() && !right.isSubscribed())
        return false;

    if (left.isSubscribed() && right.isSubscribed()) {
        leftList = left.fn;
        rightList = right.fn;

        if (left.fn.length != right.fn.length)
            return false;

        for (var i = 0; i < leftList.length; i++) {
            if (leftList[i] != rightList[i])
                return false;
        }
    }
    return true;
};
//Object.prototype.ObjectEvent = function (eventName, callback) {
//    this[eventName] = new ObjectEvent(eventName, callback);
//    this[eventName]._callee = this;
//}

//Object.addProperty(Object.prototype, "ObjectEvent", {
//    enumerable: false,
//    configurable: true
//});

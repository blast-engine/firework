
var itemsCache = {
  keys: [],
  instance: null
}

var ListRef = Object(_blast_engine_mixable__WEBPACK_IMPORTED_MODULE_0__["createMixableClass"])({
  name: 'list_ref',
  inherits: [_base__WEBPACK_IMPORTED_MODULE_2__["Ref"]],
  body: function () {
    function body() {
      _classCallCheck(this, body);
    }

    _createClass(body, [{
      key: '_constructor',
      value: function _constructor() {
        var _this = this;

        var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        this._ensure('ListRef has Ref class prop', function () {
          return 'itemRef' in _this._class();
        });
        this._ensure('path is provided in args', function () {
          return 'path' in args;
        });

        this.path = args.path;
      }
    }, {
      key: 'query',
      value: function query() {
        var _this2 = this;

        // @todo: use "once per child" query
        return new _queries__WEBPACK_IMPORTED_MODULE_3__["FullNodeQuery"]({
          path: this._strPath(),
          instantiate: function instantiate(data) {
            if (_this2.constructor.name === 'CraftGlobalItemBasicList_ref') {
              if (itemsCache.instance) {
                const keys = Object.keys(data)
                if (keys.length !== itemsCache.keys.length) {
                  const instance = _this2._spinoff(_this2._class().full(), {
                    path: _this2._path(),
                    data: data
                  })
                  itemsCache.keys = keys
                  itemsCache.instance = instance
                  return itemsCache.instance
                } else {
                  return itemsCache.instance
                }
              }
              else {
                const instance = _this2._spinoff(_this2._class().full(), {
                  path: _this2._path(),
                  data: data
                })
                const keys = Object.keys(data)
                itemsCache.keys = keys
                itemsCache.instance = instance
                return instance
              }
            }
            else return _this2._spinoff(_this2._class().full(), {
              path: _this2._path(),
              data: data
            });
          }
        });
      }
    }, {
      key: 'newKey',
      value: function newKey() {
        return this._fb.newKey(this._strPath());
      }
    }
  ])
}})
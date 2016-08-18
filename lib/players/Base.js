'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _props = require('../props');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SEEK_ON_PLAY_EXPIRY = 5000;

var Base = function (_Component) {
  _inherits(Base, _Component);

  function Base() {
    var _Object$getPrototypeO;

    var _temp, _this, _ret;

    _classCallCheck(this, Base);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(Base)).call.apply(_Object$getPrototypeO, [this].concat(args))), _this), _this.isReady = false, _this.startOnPlay = true, _this.durationOnPlay = false, _this.seekOnPlay = null, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(Base, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      if (this.props.url) {
        this.load(this.props.url);
      }
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this.stop();
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      // Invoke player methods based on incoming props
      if (this.props.url !== nextProps.url && nextProps.url) {
        this.seekOnPlay = null;
        this.startOnPlay = true;
        this.load(nextProps.url);
      } else if (this.props.url && !nextProps.url) {
        this.stop();
        clearTimeout(this.updateTimeout);
      } else if (!this.props.playing && nextProps.playing) {
        this.play();
      } else if (this.props.playing && !nextProps.playing) {
        this.pause();
      } else if (this.props.volume !== nextProps.volume) {
        this.setVolume(nextProps.volume);
      }
    }
  }, {
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps) {
      return this.props.url !== nextProps.url;
    }
  }, {
    key: 'seekTo',
    value: function seekTo(fraction) {
      var _this2 = this;

      // When seeking before player is ready, store value and seek later
      if (!this.isReady && fraction !== 0) {
        this.seekOnPlay = fraction;
        setTimeout(function () {
          _this2.seekOnPlay = null;
        }, SEEK_ON_PLAY_EXPIRY);
      }
    }
  }, {
    key: 'onPlay',
    value: function onPlay() {
      if (this.startOnPlay) {
        this.setVolume(this.props.volume);
        this.props.onStart();
        this.startOnPlay = false;
      }
      this.props.onPlay();
      if (this.seekOnPlay) {
        this.seekTo(this.seekOnPlay);
        this.seekOnPlay = null;
      }
      if (this.durationOnPlay) {
        this.props.onDuration(this.getDuration());
        this.durationOnPlay = false;
      }
    }
  }, {
    key: 'onReady',
    value: function onReady() {
      this.isReady = true;
      if (this.props.playing || this.preloading) {
        this.preloading = false;
        if (this.loadOnReady) {
          this.load(this.loadOnReady);
          this.loadOnReady = null;
        } else {
          this.play();
        }
      }
      var duration = this.getDuration();
      if (duration) {
        this.props.onDuration(duration);
      } else {
        this.durationOnPlay = true;
      }
    }
  }]);

  return Base;
}(_react.Component);

Base.propTypes = _props.propTypes;
Base.defaultProps = _props.defaultProps;
exports['default'] = Base;
module.exports = exports['default'];
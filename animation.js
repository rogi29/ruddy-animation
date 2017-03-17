/**
 * RuddyJS Extensions - Animation
 *
 * @package     ruddy-animation
 * @author      Gil Nimer <info@ruddymonkey.com>
 * @author      Nick Vlug <info@ruddy.nl>
 * @copyright   RuddyJS licensed under MIT. Copyright (c) 2017 Ruddy Monkey & ruddy.nl
 */

var $Export = $Export || require('ruddy').export;

$Export
    .module(
        'Animation',
        '+animation',
        'ruddy-animation'
    )
    .include([
        'window',
        '@function',
        '@ruddy'
    ])
    .init(
        this,
        module,
        function (window, $func, $r) {
            "use strict";

            var lastTime = 0;
            var vendors = ['ms', 'moz', 'webkit', 'o'];

            for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
                window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
                window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame']
                    || window[vendors[x] + 'CancelRequestAnimationFrame'];
            }

            if(!window.setTimeout)
                window.setTimeout = setTimeout;

            if(!window.clearTimeout)
                window.clearTimeout = clearTimeout;

            if (!window.requestAnimationFrame)
                window.requestAnimationFrame = function (callback, element) {
                    var currTime = new Date().getTime();
                    var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                    var id = window.setTimeout(function () {
                            callback(currTime + timeToCall);
                        },
                        timeToCall);
                    lastTime = currTime + timeToCall;
                    return id;
                };

            if (!window.cancelAnimationFrame) {
                window.cancelAnimationFrame = function (id) {
                    clearTimeout(id);
                };
            }

            /**
             * Animation Object
             *
             * @module ext/Animation
             * @param options
             * @returns {Animation}
             *
             * @constructor
             */
            function Animation(options) {
                if (!(this instanceof Animation)) {
                    return new Animation(options);
                }

                this.options = options || {};
            }

            Animation.prototype = {
                /**
                 *
                 */
                delta: {
                    /**
                     *
                     * @param progress
                     * @returns {*}
                     */
                    linear: function (progress) {
                        return progress;
                    },

                    /**
                     *
                     * @param progress
                     * @param x
                     * @returns {number}
                     */
                    quadrantic: function (progress, x) {
                        return Math.pow(progress, x);
                    },

                    /**
                     *
                     * @param progress
                     * @returns {number}
                     */
                    circ: function (progress) {
                        return 1 - Math.sin(Math.acos(progress));
                    },

                    /**
                     *
                     * @param progress
                     * @param x
                     * @returns {number}
                     */
                    backbow: function (progress, x) {
                        return Math.pow(progress, 2) * ((x + 1) * progress - x);
                    },

                    /**
                     *
                     * @param progress
                     * @returns {number}
                     */
                    bounce: function (progress) {
                        for (var a = 0, b = 1, result; 1; a += b, b /= 2) {
                            if (progress >= (7 - 4 * a) / 11) {
                                return -Math.pow((11 - 6 * a - 11 * progress) / 4, 2) + Math.pow(b, 2);
                            }
                        }
                    },

                    /**
                     *
                     * @param progress
                     * @param x
                     * @returns {number}
                     */
                    elastic: function (progress, x) {
                        return Math.pow(2, 10 * (progress - 1)) * Math.cos(20 * Math.PI * x / 3 * progress);
                    },

                    /**
                     *
                     * @param progress
                     * @returns {number}
                     */
                    custom: function (progress) {
                        return Math.pow(progress, Math.LOG10E);
                    }
                },

                /**
                 *
                 * @param callback
                 * @returns {Number}
                 */
                requestAnimation: function (animation) {
                    return window.requestAnimationFrame(animation);
                },

                /**
                 *
                 * @param callback
                 */
                cancleAnimation: function (animation) {
                    this.animation = function () {
                        window.cancelAnimationFrame(animation || this.animation);
                    };

                    this.animation();
                },

                /**
                 * Get current value
                 *
                 * @param startPoint
                 * @param endPoint
                 * @param delta
                 * @returns {*}
                 */
                getValue: function (startPoint, endPoint, delta) {
                    return startPoint + (endPoint - startPoint) * delta;
                },

                /**
                 * Start animation
                 *
                 * @param opts
                 * @param callback
                 * @param condition
                 */
                setAni: function (opts, action, callback, condition) {
                    var start = Date.now(), delay = Date.now(), time, timePassed, progress, delta;

                    this.animation = $func(function () {
                        time = Date.now();

                        if (!condition || opts.startPoint == opts.endPoint) {
                            if (callback)
                                callback.apply(this.options, opts);

                            return;
                        }

                        if(time - delay >= opts.delay * 1000) {
                            timePassed = Date.now() - start;
                            progress = timePassed / opts.duration;

                            if (progress > 1)
                                progress = 1;

                            delta = opts.delta(progress);
                            opts.step(delta);

                            if (action)
                                action.apply(this.options, opts);

                            if (progress == 1) {
                                if (callback)
                                    callback.apply(this.options, opts);

                                this.cancleAnimation(this.animation);
                                return;
                            }

                            delay = Date.now();
                        }

                        window.requestAnimationFrame(this.animation.bind(this));
                    });

                    this.animation();
                },

                /**
                 * Animate (set values)
                 *
                 * @param params {step: *, startPoint: *, endPoint: *, delay: *, duration: *, delta: *, ext: *, callback: *, condition: *}
                 */
                animate: function (params) {
                    var
                        params      = params            || {},
                        ext         = params.ext        || '',
                        delay       = params.delay      || 0,
                        startPoint  = params.startPoint || 0,
                        endPoint    = params.endPoint   || 0,
                        callback    = params.callback   || false,
                        action      = params.action     || false,
                        condition   = params.condition  || true,
                        step        = params.step       || function(){},
                        duration    = params.duration * 1000 || 1000,
                        delta       = params.delta || this.setDelta('easeOut', {name: 'linear', progress: 1});

                    this.setAni({
                        delay:      delay,
                        duration:   duration,
                        delta:      delta,
                        ext:        ext,
                        startPoint: startPoint,
                        endPoint:   endPoint,
                        step: $func(function (delta) {
                            step(this.getValue, startPoint, endPoint, delta, ext);
                        }).bind(this)
                    }, action, callback, condition);
                },
                /**
                 * Get delta
                 *
                 * @param name
                 * @param x
                 * @returns {Function}
                 */
                getDelta: function (name, x) {
                    var delta = this.delta;

                    if(!(name in delta))
                        return function linear(progress) { return progress; };

                    return function(progress) {
                        return delta[name](progress, x);
                    }
                },

                /**
                 * Set ease
                 *
                 * @param type
                 * @param delta
                 * @param delta_2
                 * @returns {*}
                 */
                setEase: function (type, delta, delta_2) {
                    switch (type) {
                        case 'easeOut':
                            return function (progress) {
                                return 1 - delta(1 - progress);
                            };
                            break;

                        case 'easeInOut':
                            return function (progress) {
                                if (progress < .5) {
                                    return delta(2 * progress) / 2
                                } else {
                                    return (2 - delta(2 * (1 - progress))) / 2
                                }
                            };
                            break;

                        case 'easeInOut_delta':
                            return function (progress) {
                                if (progress < 0.5) {
                                    return delta(2 * progress) / 2
                                } else {
                                    return (2 - delta_2(2 * (1 - progress))) / 2
                                }
                            };
                            break;

                        default:
                            return delta;
                            break;
                    }
                },

                /**
                 * Set delta
                 *
                 * @param type
                 * @param delta
                 * @param delta_2
                 * @returns {*}
                 */
                setDelta: function (type, delta, delta_2) {
                    delta = (delta) ? this.getDelta(delta.name, delta.progress) : false;
                    delta_2 = (delta_2) ? this.getDelta(delta_2.name, delta_2.progress) : false;
                    return this.setEase(type, delta, delta_2);
                }
            }

            if(typeof $r === 'undefined')
                return Animation;

            /**
             * Animation extenstion for Ruddy
             *
             * @method animate
             * @param params
             *
             * @returns {*}
             */
            $r.assign('animate', function(params) {
                var style = params.style || '',
                    value;

                if(!('animation' in this))
                    this.animation = Animation(this);

                params.step = $func(function(getValue, startPoint, endPoint, delta, ext) {
                    switch(style) {
                        case 'x':
                            this.setTranslateX(getValue(startPoint, endPoint, delta));
                            break;

                        case 'y':
                            this.setTranslateY(getValue(startPoint, endPoint, delta));
                            break;

                        case 'xy':
                            this.setTranslate(
                                getValue(startPoint.x, endPoint.x, delta),
                                getValue(startPoint.y, endPoint.y, delta)
                            );
                            break;

                        default:
                            if(typeof style == 'function') {
                                style.call(this, getValue, startPoint, endPoint, delta);
                                return;
                            }

                            value = getValue(startPoint, endPoint, delta);
                            this.style(style, value + ext);
                            break;
                    }
                }).bind(this);

                return this.animation.animate(params);
            });



            /**
             *
             * @param type
             * @param delta
             * @param delta_2
             * @returns {*}
             */
            $r.assign('cancleAnimation', function(instance) {
                var animation =  this.animation || Animation(this);
                return animation.cancleAnimation(instance);
            });

            /**
             *
             * @param type
             * @param delta
             * @param delta_2
             * @returns {*}
             */
            $r.assign('setDelta', function(type, delta, delta_2) {
                var animation =  this.animation || Animation(this);
                return animation.setDelta(type, delta, delta_2);
            });

            return Animation;
        }
    );
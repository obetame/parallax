/** 兼容ie */
const _addEvent = (function(){
	if (document.addEventListener){
		return function(el, type, fn){
			if (el.length) {
				for (let i = 0; i < el.length; i++){
					_addEvent(el[i], type, fn);
				}
			} else {
				el.addEventListener(type, fn, false);
			}
		};
	} else {
		return function(el, type, fn){
			if (el.length){
				for (let i = 0; i < el.length; i++){
					_addEvent(el[i], type, fn);
				}
			} else {
				el.attachEvent('on' + type, function(){
					return fn.call(el, window.event);
				});
			}
		};
	}
})();

/** 动画 */
const requestAnimationFrame = (function(){
	return  window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame    ||
		window.oRequestAnimationFrame      ||
		window.msRequestAnimationFrame     ||
		function(callback){
			window.setTimeout(callback, 1000 / 60);
		};
})();

/** 选择器获取dom,是否是获取监听事件的元素 */
const _getElement = function(ele, isListen) {
	if (typeof ele === 'object') {
		return ele;
	} else {
		try {
			let el = document.querySelectorAll(ele);
			if (isListen) {
				return el[0]; // 返回单一的父元素(不需要多个)
			}
			return el;
		} catch (e) {
			throw new Error(e);
		}
	}
}

/** 获取元素类型 */
const _getType = function(ele) {
	return Object.prototype.toString.call(ele).replace(/\[object (\w*)\]/ig, '$1').toLowerCase();
}

/** 函数节流 */
const _throttle = function(fn, time = 1000/60) {
	let lastTime,
			timer;
	return function() {
		let nowTime = Date.now();
		if (lastTime && nowTime < lastTime + time) {
			clearTimeout(timer);
			timer = setTimeout(() => {
				lastTime = nowTime;
				fn.apply(this, arguments);
			}, time);
		} else {
			lastTime = nowTime;
			fn.apply(this, arguments);
		}
	}
}

/** 格式化数据为真假 */
const parseData = function(data) {
	if (!data) {
		return false;
	}
	if (data.length && data.length === 0) {
		return false;
	} else {
		switch(data) {
			case 'true':
				return true;
			case 'false':
				return false;
			case '1':
				return true;
			case '0':
				return false;
			default:
				return true;
		}
	}
}

/** 获取dom上的配置数据 */
const getDomConfigData = function(ele) {
	let xRange, yRange;
	if (ele.element.dataset) {
		if (parseInt(ele.element.dataset.xrange, 0) === 0) {
			xRange = 0;
		} else {
			xRange = parseInt(ele.element.dataset.xrange, 0) || ele.config.xRange;
		}

		if (parseInt(ele.element.dataset.yrange, 0) === 0) {
			yRange = 0;
		} else {
			yRange = parseInt(ele.element.dataset.yrange, 0) || ele.config.yRange;
		}
	} else {
		xRange = ele.config.xRange;
		yRange = ele.config.yRange;
	}
	return {
		xRange,
		yRange
	}
}

/** 导出 */
export default class Parallax {
	constructor(ele, config = {}) {
		this._config = Object.assign({
			xRange: 20,
			yRange: 20,
			listenElement: window,
			animate: false, // 移动端才会使用
			invert: false, // 反向移动
			enterCallback: () => {},
			leaveCallback: () => {}
		}, config);
		this.element = _getElement(ele); // 获取元素
		this.animateElements = [];
		this.animateElementsConfig; // 需要进行动画的所有dom有关的细节
		this.isMobile = Boolean(navigator.userAgent.match(/(iPhone|iPod|Android|ios)/i));
		this.isEnter = false; // 是否进入tag

		this.add(); // add all element to this.animateElements
		this._init(); // this.animateElementsConfig
		this._resize();
		this._start();
	}

	/** 初始化配置 */
	_init() {
		this.animateElementsConfig = this.animateElements.map((ele, index) => {
			this._clearStyle(ele.element); // 清除之前的top,left样式
			const 
				{ xRange, yRange } = getDomConfigData(ele),
				offsetLeft = ele.element.offsetLeft, // 左边的距离
				offsetTop = ele.element.offsetTop, // 上边的距离
				listenElement = _getElement(ele.config.listenElement, true), // 获取监听事件的元素
				listenElementWidth = listenElement.innerWidth ? listenElement.innerWidth : listenElement.clientWidth, // 监听的元素的宽度
				listenElementHeight = listenElement.innerHeight ? listenElement.innerHeight : listenElement.clientHeight, // 监听的元素的高度
				isInvert = ele.element.dataset ? parseData(ele.element.dataset.invert) || ele.config.invert : ele.config.invert; // 默认优先dom上的参数;

			if (this.isMobile && this._config.animate) {
				// 配置移动端样式,当xRange,yRange数值较大的时候可以启用,
				// 但是较小的时候就不需要,
				// 考虑增加一个配置参数来设置,
				// 但是会增加动画的延迟时间
				ele.element.style.transition = 'top,left 0.05s linear'; // 移动端增加缓动动画
			}
			return {
				element: ele.element,
				xRange: xRange,
				yRange: yRange,
				offsetLeft: offsetLeft,
				offsetTop: offsetTop,
				listenElement: listenElement,
				listenElementWidth: listenElementWidth,
				listenElementHeight: listenElementHeight,
				isInvert: isInvert
			}
		});
	}

	/** 开始监听事件(移动dom) */
	_start() {
		// 移动端监听重力加速度
		if (this.isMobile && 'ondevicemotion' in window) {
			_addEvent(window, 'devicemotion', e => {
				requestAnimationFrame(() => {
					let {x, y} = e.accelerationIncludingGravity;
					try {
						x = parseFloat(x.toFixed(4));
						y = parseFloat(y.toFixed(4));
					} catch(e) {
						console.warn('你需要使用真实的移动设备来测试,并且需要有陀螺仪功能.');
						return;
					}
					if (x === 0 || y === 0) return;

					this.animateElementsConfig.forEach(item => {
						let top = (y / 9.78049) * item.yRange,
								left = (-x / 9.78049) * item.xRange;

						item.isInvert && (top = -top,left = -left);
						if (item.element.style.top !== top) {
							item.element.style.top = top + item.offsetTop + 'px';
						}
						if (item.element.style.left !== left) {
							item.element.style.left = left + item.offsetLeft + 'px';
						}
					});
				});
			});
			return;
		}

		const listenElement = _getElement(this._config.listenElement, true);
		// PC上监听元素监听鼠标移动事件
		_addEvent(listenElement, 'mousemove', e => {
			requestAnimationFrame(() => {
				if (!this.isEnter) {
					this.isEnter = true;
					this._config.enterCallback();
				}
				this.animateElementsConfig.forEach(item => {
					let top = (e.pageY / item.listenElementHeight) * item.yRange,
							left = (e.pageX / item.listenElementWidth) * item.xRange;

					item.isInvert && (top = -top,left = -left);
					if (item.element.style.top !== top) {
						item.element.style.top = top + item.offsetTop + 'px';
					}
					if (item.element.style.left !== left) {
						item.element.style.left = left + item.offsetLeft + 'px';
					}
				});
			});
		});
		// 监听移除事件
		_addEvent(listenElement, 'mouseleave', e => {
			if (this.isEnter) {
				this.isEnter = false;
				this._config.leaveCallback();
			}
		});
		return this;
	}

	/** 添加一个新的动画元素 */
	add(ele = this.element, config = {}) {
		config = Object.assign({}, this._config, config);
		const element = _getElement(ele);
		if (!element || element.length === 0) {
			// 没有找到元素
			console.warn('Element not found!\n未找到元素!');
			return;
		};
		if (element.length) {
			for(let i = 0; i < element.length; i++) {
				this.animateElements.push({
					element: element[i],
					config: config
				});
			}
		} else {
			this.animateElements.push({
				element: element,
				config: config
			});
		}
		return this;
	}

	/** 移除一个元素 */
	remove(ele) {
		let element = _getElement(ele);
		if (!element || element.length === 0) {
			// 没有找到元素
			console.warn('Element not found!\n未找到需要删除的元素.');
			return;
		};

		// 移除元素
		for(let i = 0; i < element.length; i++) {
			for(let j = 0; j < this.animateElements.length; j++) {
				if (element[i] === this.animateElements[j].element || element[i].isEqualNode(this.animateElements[j].element)) {
					this.animateElements[j].isRemove = true; // 标志需要稍后移除的元素
				}
			}
		}
		this.animateElements = this.animateElements.filter(item => !item.isRemove); // 移除
		return this;
	}

	/** 添加完新的动画元素后需要刷新(添加元素都要手动刷新,考虑到可能一次加很多元素就让使用者自己控制) */
	refresh() {
		this._init();
		return this;
	}

	/** 监听resize重新绘制 */
	_resize() {
		_addEvent(window, 'resize', _throttle(() => {
			this.refresh();
		}, 200));
	}

	/** 清除之前的样式 */
	_clearStyle(ele) {
		let style = ele.getAttribute('style'); // 获取样式
		if (style) {
			// 修复resize后获取的top,left是之前动画最后帧设置的bug
			style = style.split(';').filter(item => {
				const trim = item.trim();
				return trim.slice(0, 3) !== 'top' && trim.slice(0, 4) !== 'left';
			});
			ele.setAttribute('style', style.join(';'));
		}
	}
}
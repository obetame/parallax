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

/** 导出 */
export default class Parallax {
	constructor(ele, config = {}) {
		this._config = Object.assign({
			xRange: 20,
			yRange: 20,
			listenElement: window,
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
				xRange = ele.element.dataset ? parseInt(ele.element.dataset.xrange, 0) || ele.config.xRange : ele.config.xRange, // 默认优先dom上的参数
				yRange = ele.element.dataset ? parseInt(ele.element.dataset.yrange, 0) || ele.config.yRange : ele.config.yRange,
				offsetLeft = ele.element.offsetLeft, // 左边的距离
				offsetTop = ele.element.offsetTop, // 上边的距离
				listenElement = _getElement(ele.config.listenElement, true), // 获取监听事件的元素
				listenElementWidth = listenElement.innerWidth ? listenElement.innerWidth : listenElement.clientWidth, // 监听的元素的宽度
				listenElementHeight = listenElement.innerHeight ? listenElement.innerHeight : listenElement.clientHeight; // 监听的元素的高度

			if (this.isMobile) {
				// 配置移动端样式
				ele.element.style.transition = 'top,left 0.2s ease-in-out'; // 移动端增加缓动动画
			}
			return {
				element: ele.element,
				xRange: xRange,
				yRange: yRange,
				offsetLeft: offsetLeft,
				offsetTop: offsetTop,
				listenElement: listenElement,
				listenElementWidth: listenElementWidth,
				listenElementHeight: listenElementHeight
			}
		});
	}

	/** 开始监听事件(移动dom) */
	_start() {
		// 监听元素监听鼠标移动事件
		const listenElement = _getElement(this._config.listenElement, true);
		_addEvent(listenElement, 'mousemove', e => {
			if (!this.isEnter) {
				this.isEnter = true;
				this._config.enterCallback();
			}
			requestAnimationFrame(() => {
				for(let i = 0; i < this.animateElementsConfig.length; i++) {
					this.animateElementsConfig[i].element.style.top = (e.pageY / this.animateElementsConfig[i].listenElementHeight) * this.animateElementsConfig[i].yRange + this.animateElementsConfig[i].offsetTop + 'px';
					this.animateElementsConfig[i].element.style.left = (e.pageX / this.animateElementsConfig[i].listenElementWidth) * this.animateElementsConfig[i].xRange + this.animateElementsConfig[i].offsetLeft + 'px';
				}
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
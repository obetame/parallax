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
const _throttle = function(fn, time = 1000/30) {
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
		this.config = Object.assign({
			maxWidth: 20,
			maxHeight: 20,
			listenElement: window
		}, config);
		this.animateElements = [], // 需要进行动画的所有dom有关的细节
		this.animateElementsConfig;
		this.element = _getElement(ele); // 获取元素

		this.add(); // 增加所有的element元素

		this._init(); // 初始化动画
		return this;
	}

	/** 初始化配置 */
	_init() {
		this.animateElementsConfig = this.animateElements.map((ele, index) => {
			const 
				maxWidth = ele.dataset ? parseInt(ele.dataset.maxwidth, 0) || this.config.maxWidth : this.config.maxWidth, // 默认优先dom上的参数
				maxHeight = ele.dataset ? parseInt(ele.dataset.maxheight, 0) || this.config.maxHeight : this.config.maxHeight,
				offsetLeft = ele.offsetLeft, // 左边的距离
				offsetTop = ele.offsetTop, // 上边的距离
				listenElement = _getElement(this.config.listenElement, true), // 获取监听事件的元素
				listenElementWidth = listenElement.innerWidth ? listenElement.innerWidth : listenElement.clientWidth, // 监听的元素的宽度
				listenElementHeight = listenElement.innerHeight ? listenElement.innerHeight : listenElement.clientHeight; // 监听的元素的高度
			return {
				element: ele,
				maxWidth: maxWidth,
				maxHeight: maxHeight,
				offsetLeft: offsetLeft,
				offsetTop: offsetTop,
				listenElement: listenElement,
				listenElementWidth: listenElementWidth,
				listenElementHeight: listenElementHeight
			}
		});
	}

	/** 移动图片形成视差 */
	start() {
		// 监听元素监听鼠标移动事件
		_addEvent(_getElement(this.config.listenElement, true), 'mousemove', _throttle(e => {
			for(let i = 0; i < this.animateElementsConfig.length; i++) {
				this.animateElementsConfig[i].element.style.top = (e.pageY / this.animateElementsConfig[i].listenElementHeight) * this.animateElementsConfig[i].maxHeight + this.animateElementsConfig[i].offsetTop + 'px';
				this.animateElementsConfig[i].element.style.left = (e.pageX / this.animateElementsConfig[i].listenElementWidth) * this.animateElementsConfig[i].maxWidth + this.animateElementsConfig[i].offsetLeft + 'px';
			}
		}));
		return this;
	}

	/** 添加一个新的动画元素 */
	add(ele = this.element, config = {}) {
		this.config = Object.assign({}, this.config, config);
		const element = _getElement(ele);
		if (element.length === 0) {
			// 没有找到元素
			throw new Error('No select dom.');
			return;
		};
		if (element.length) {
			for(let i = 0; i < element.length; i++) {
				this.animateElements.push(element[i]);
			}
		} else {
			this.animateElements.push(element);
		}
		return this;
	}

	/** 添加完新的动画元素后需要刷新 */
	refresh() {
		this._init();
		return this;
	}
}
/** 兼容ie */
const addEvent = (function(){
	if (document.addEventListener){
		return function(el, type, fn){
			if (el.length) {
				for (let i = 0; i < el.length; i++){
					addEvent(el[i], type, fn);
				}
			} else {
				el.addEventListener(type, fn, false);
			}
		};
	} else {
		return function(el, type, fn){
			if (el.length){
				for (let i = 0; i < el.length; i++){
					addEvent(el[i], type, fn);
				}
			} else {
				el.attachEvent('on' + type, function(){
					return fn.call(el, window.event);
				});
			}
		};
	}
})();

/** 选择器获取dom,是否返回多个 */
function getElement(ele, isParent) {
	if (typeof ele === 'object') {
		return ele;
	} else {
		try {
			let el = document.querySelectorAll(ele);
			if (isParent) {
				return el[0]; // 返回单一的父元素(不需要多个)
			}
			return el;
		} catch (e) {
			throw new Error(e);
		}
	}
}

/** 移动图片形成视差 */
function moveAnimate(ele, config) {
	const maxWidth = parseInt(ele.dataset.maxwidth, 0) || config.maxWidth, // 默认优先dom上的参数
		maxHeight = parseInt(ele.dataset.maxheight, 0) || config.maxHeight,
		imgOffsetLeft = ele.offsetLeft, // 左边的距离
		imgOffsetTop = ele.offsetTop, // 上边的距离
		parentElement = getElement(config.parentElement, true), // 获取父元素
		width = parentElement.innerWidth ? parentElement.innerWidth : parentElement.clientWidth, // 父元素的宽度
		height = parentElement.innerHeight ? parentElement.innerHeight : parentElement.clientHeight; // 父元素的高度

	// 监听鼠标移动事件
	addEvent(parentElement, 'mousemove', e => {
		ele.style.top = (e.pageY / height) * maxHeight + imgOffsetTop + 'px';
		ele.style.left = (e.pageX / width) * maxWidth + imgOffsetLeft + 'px';
	});
};

/** 导出 */
export default function(ele, config = {}) {
	config = Object.assign({
		maxWidth: 20,
		maxHeight: 20,
		parentElement: window
	}, config);
	const element = getElement(ele); // 获取元素

	if (element.length === 0) {
		// 没有找到元素
		throw new Error('No select dom.');
		return;
	};
	if (element.length) {
		for(let i = 0; i < element.length; i++) {
			moveAnimate(element[i], config);
		}
	} else {
		moveAnimate(element, config);
	}
}
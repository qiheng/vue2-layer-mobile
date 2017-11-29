# vue2.0-layer-mobile移动端弹层

## 安装方法

```
npm install vue2-layer-mobile -S
```

## 使用方法
```
import layer from 'vue2-layer-mobile'
Vue.use(layer)
```

> 该组件是基于开源插件[layer-mobile](http://layer.layui.com/mobile/)用vue重新改写的，并且扩展了一些便捷方法
> 具体的API与layer-mobile高度保持一值，大家可以放心使用

## 实例

```

// 询问层
const index = this.$layer.open({
	btn: ['确认', '取消'],
	content: 'hello word',
	className: 'good luck1',
	shade:true,
	success(layer) {
		console.log('layer id is:',layer.id)
	},
	yes(index, $layer) {
		console.log(arguments)
		// 函数返回 false 可以阻止弹层自动关闭，需要手动关闭
		// return false;
	},
	end() {
		console.log('end')
	}
})

// 关闭层
this.$layer.close(index)

// loading层
const index = this.$layer.open({
	type:2,
	content: '加载中...',
	success(layer) {
		console.log('layer id is:',layer.id)
	},
	end() {
		console.log('end')
	}
})

// 底部对话框
this.$layer.open({
	content: '这是一个底部弹出的询问提示',
	btn: ['删除', '取消'],
	skin: 'footer',
	yes: (index) => {
		this.$layer.open({content: '执行删除操作'})
	}
})

// 页面层
this.$layer.open({
	type: 1,
	content: '可传入任何内容，支持html。一般用于手机页面中',
	anim: 'up',
	// 特别注意，这个styles属性跟 layer-mobile 有点区别多加了个s，因为style在vue中是保留关键词
	styles: 'position:fixed; bottom:0; left:0; width: 100%; height: 200px; padding:10px 0; border:none;'
})

```

### 扩展方法
__以下方法都可以通过 this.$layer.open 这个方法来实现.__

提示层(msg)
```

this.$layer.msg('hello world', () => console.log('end!!!'))

```

信息层(alert)
```

this.$layer.alert('您确定要刷新页面吗', () => window.location.reload())

```

询问层(confirm)
```
const index = this.$layer.confirm('您确定要删除吗？', () => alert('yes'), () => alert('no'))

setTimeout(() => {
	this.$layer.close(index)
}, 3000)

```

## 说明

1.参数(options)

~~style~~改成styles

*特别注意，这个styles属性跟 layer-mobile 有点区别多加了个s，因为style在vue中是保留关键词*

2.扩展方法\[msg、alert、confirm\]
*只有当你调用以上扩展方法时*，会自动给层添加一个css类'layui-m-'\+方法名\[msg、alert、confirm\]









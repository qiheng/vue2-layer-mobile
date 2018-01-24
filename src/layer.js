/**
 * Created by qiheng on 2017/11/23.
 * email qihengxiao@gmail.com
 */

import LayerComponent from './layer.vue'

let uuid = 0;
const ready = {
    extend: function(oldObj, targetObj){
        var newobj = JSON.parse(JSON.stringify(oldObj));
        for(var i in targetObj){
            newobj[i] = targetObj[i];
        }
        return newobj;
    },
    timer: {}, end: {}, layerPool: {}
};

// 合并默认参数与传入参数
const mergeOptions = function ($vm, options) {
    const defaults = {}
    for (let i in $vm.$options.props) {
        if (i !== 'value') {
            defaults[i] = $vm.$options.props[i].default
        }
    }
    const _options = ready.extend(defaults, options)
    for (let i in _options) {
        $vm[i] = _options[i]
    }
}

const plugin = {
    install(Vue, options = {}) {

        const doc = document
        const LayerCom = Vue.extend(LayerComponent)
        const layer = {
            version: '1.0.3',
            __init(options = {}) {
                const that = this
                options.uuid = uuid

                const $layer = that.$layer =  new LayerCom({
                    el: doc.createElement('div')
                });

                if (options.skin) {
                    options.anim = 'up'

                    options.skin === 'msg' && (options.shade = false)
                }

                if(!options.fixed){
                    options.styles = options.styles || '';
                    options.styles += ' top:'+ ( doc.body.scrollTop + options.top) + 'px';
                }

                mergeOptions($layer, options)

                $layer.$nextTick(() => {
                    document.body.appendChild($layer.$el)
                    $layer.visible = true
                    options.success && options.success($layer.$el)
                })

                ready.layerPool[$layer.uuid] = $layer.$el
                that.__action(options, $layer)
            },
            __action(options, $layer) {
                const that = this

                /*if (options.time) {
                    ready.timer[$layer.uuid] = setTimeout(() => {
                        that.close($layer.uuid)
                    }, options.time * 1000)
                }*/

                // 移除组件事件监听
                /*$layer.$off('close')
                $layer.$off('sure')
                $layer.$off('cancel')*/

                // 添加组件事件监听
                $layer.$on('input', (val) => {
                    $layer.visible = val
                })

                $layer.$on('sure', () => {
                    if (options.yes && options.yes($layer.uuid, $layer) === false) return
                        console.log('重复')
                    that.close($layer.uuid)
                })

                $layer.$on('cancel', () => {
                    if (options.no && options.no($layer.uuid, $layer) === false) return
                    that.close($layer.uuid)
                })

                $layer.$on('close', () => {
                    console.log('close eent')
                    setTimeout(() => {
                        that.close($layer.uuid)
                    }, 20)
                })

                options.end && (ready.end[$layer.uuid] = options.end)
            },
            // 核心函数
            open(options = {}) {
                const that = this
                that.__init(options)
                return uuid++
            },
            // 关闭层
            close(index) {
                const layerEl = ready.layerPool[index];
                if (layerEl && layerEl.parentNode) {
                    layerEl.parentNode.removeChild(layerEl)
                    this.$layer.$destroy()
                    delete ready.layerPool[index]
                    clearTimeout(ready.timer[index])
                    delete ready.timer[index]
                    typeof ready.end[index] === 'function' && ready.end[index]()
                    delete ready.end[index]
                }
            },
            // 关闭所有层
            closeAll() {
                for (const key in ready.layerPool) {
                    this.close(key)
                }
            },
            msg(content, options = {time: 3}, end) {
                if (typeof options === 'function') {
                    end = options
                    options = {time: 3}
                }
                options.className = 'layui-m-msg' + (options.className ? ' ' + options.className : '')
                options = ready.extend(options, {
                    content: content || '',
                    skin: 'msg',
                    end,
                })

                return this.open(options)
            },
            alert(content, options = {}, yes) {
                if (typeof options === 'function') {
                    yes = options
                    options = {}
                }

                options.btn = options.btn || ['确认']
                options.className = 'layui-m-alert' + (options.className ? ' ' + options.className : '')
                options = ready.extend(options, {
                    type: 0,
                    content: content || '',
                    yes,
                })

                return this.open(options)
            },
            confirm(content, options = {}, yes, no) {
                if (typeof options === 'function') {
                    yes = options
                    options = {}
                }

                options.btn = options.btn || ['确认', '取消']
                options.className = 'layui-m-confirm' + (options.className ? ' ' + options.className : '')
                options = ready.extend(options, {
                    type: 0,
                    content: content || '',
                    yes,
                    no,
                })

                return this.open(options)
            }
        }

        if (!Vue.layer) {
            Vue.layer = layer
        }

        Vue.mixin({
            created() {
                this.$layer = Vue.layer;
            },
			components: {
				[LayerComponent.name]: LayerComponent
			}
        })
    }
};

export default plugin

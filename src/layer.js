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
            version: '0.0.1',
            __init(options = {}) {
                const that = this
                options.uuid = uuid

                const $layer = new LayerCom({
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
                    options.success && options.success($layer.$el)
                })

                ready.layerPool[$layer.uuid] = $layer.$el
                that.__action(options, $layer)
            },
            __action(options, $layer) {
                const that = this

                if (options.time) {
                    ready.timer[$layer.uuid] = setTimeout(() => {
                        that.close($layer.uuid)
                    }, options.time * 1000)
                }

                // 移除组件事件监听
                $layer.$off('shade-close')
                $layer.$off('on-yes')
                $layer.$off('on-no')

                // 添加组件事件监听
                $layer.$on('on-yes', () => {
                    if (options.yes && options.yes($layer.uuid, $layer) === false) return
                    that.close($layer.uuid)
                })

                $layer.$on('on-no', () => {
                    if (options.no && options.no($layer.uuid, $layer) === false) return
                    that.close($layer.uuid)
                })

                $layer.$on('shade-close', () => {
                    that.close($layer.uuid)
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
                // console.log(index,'--------关闭前---------',ready.layerPool)
                if (layerEl && layerEl.parentNode) {
                    layerEl.parentNode.removeChild(layerEl);
                    delete ready.layerPool[index]
                    clearTimeout(ready.timer[index])
                    delete ready.timer[index]
                    typeof ready.end[index] === 'function' && ready.end[index]()
                    delete ready.end[index]
                    //window.ready = ready
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
            }
        })
    }
};

export default plugin

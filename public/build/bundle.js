
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35730/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.32.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/components/Input.svelte generated by Svelte v3.32.1 */

    const file = "src/components/Input.svelte";

    function create_fragment(ctx) {
    	let div;
    	let input;
    	let t0;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			t0 = space();
    			button = element("button");
    			button.textContent = "ADD";
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "할일을 입력하쇼");
    			attr_dev(input, "class", "svelte-1qe6e00");
    			add_location(input, file, 7, 2, 95);
    			attr_dev(button, "class", "svelte-1qe6e00");
    			add_location(button, file, 8, 2, 190);
    			attr_dev(div, "class", "svelte-1qe6e00");
    			add_location(div, file, 6, 0, 87);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);
    			set_input_value(input, /*todo*/ ctx[0]);
    			append_dev(div, t0);
    			append_dev(div, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[3]),
    					listen_dev(input, "keyup", /*keyup_handler*/ ctx[4], false, false, false),
    					listen_dev(
    						button,
    						"click",
    						function () {
    							if (is_function(/*addTodo*/ ctx[1])) /*addTodo*/ ctx[1].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (dirty & /*todo*/ 1 && input.value !== /*todo*/ ctx[0]) {
    				set_input_value(input, /*todo*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Input", slots, []);
    	let { todo } = $$props;
    	let { addTodo } = $$props;
    	let { handleKeyUp } = $$props;
    	const writable_props = ["todo", "addTodo", "handleKeyUp"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Input> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		todo = this.value;
    		$$invalidate(0, todo);
    	}

    	const keyup_handler = e => handleKeyUp(e);

    	$$self.$$set = $$props => {
    		if ("todo" in $$props) $$invalidate(0, todo = $$props.todo);
    		if ("addTodo" in $$props) $$invalidate(1, addTodo = $$props.addTodo);
    		if ("handleKeyUp" in $$props) $$invalidate(2, handleKeyUp = $$props.handleKeyUp);
    	};

    	$$self.$capture_state = () => ({ todo, addTodo, handleKeyUp });

    	$$self.$inject_state = $$props => {
    		if ("todo" in $$props) $$invalidate(0, todo = $$props.todo);
    		if ("addTodo" in $$props) $$invalidate(1, addTodo = $$props.addTodo);
    		if ("handleKeyUp" in $$props) $$invalidate(2, handleKeyUp = $$props.handleKeyUp);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [todo, addTodo, handleKeyUp, input_input_handler, keyup_handler];
    }

    class Input extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { todo: 0, addTodo: 1, handleKeyUp: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Input",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*todo*/ ctx[0] === undefined && !("todo" in props)) {
    			console.warn("<Input> was created without expected prop 'todo'");
    		}

    		if (/*addTodo*/ ctx[1] === undefined && !("addTodo" in props)) {
    			console.warn("<Input> was created without expected prop 'addTodo'");
    		}

    		if (/*handleKeyUp*/ ctx[2] === undefined && !("handleKeyUp" in props)) {
    			console.warn("<Input> was created without expected prop 'handleKeyUp'");
    		}
    	}

    	get todo() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set todo(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get addTodo() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set addTodo(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get handleKeyUp() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set handleKeyUp(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/TodoItem.svelte generated by Svelte v3.32.1 */

    const file$1 = "src/components/TodoItem.svelte";

    function create_fragment$1(ctx) {
    	let div;
    	let input;
    	let input_checked_value;
    	let t0;
    	let p;
    	let t1_value = /*todo*/ ctx[0].text + "";
    	let t1;
    	let t2;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			t0 = space();
    			p = element("p");
    			t1 = text(t1_value);
    			t2 = space();
    			button = element("button");
    			attr_dev(input, "type", "checkbox");
    			input.checked = input_checked_value = /*todo*/ ctx[0].completed;
    			attr_dev(input, "class", "svelte-1b62zt2");
    			add_location(input, file$1, 7, 2, 101);
    			attr_dev(p, "class", "svelte-1b62zt2");
    			toggle_class(p, "done", /*todo*/ ctx[0].completed);
    			add_location(p, file$1, 8, 2, 193);
    			attr_dev(button, "class", "svelte-1b62zt2");
    			add_location(button, file$1, 9, 2, 242);
    			attr_dev(div, "class", "svelte-1b62zt2");
    			add_location(div, file$1, 6, 0, 93);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);
    			append_dev(div, t0);
    			append_dev(div, p);
    			append_dev(p, t1);
    			append_dev(div, t2);
    			append_dev(div, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "change", /*change_handler*/ ctx[3], false, false, false),
    					listen_dev(button, "click", /*click_handler*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*todo*/ 1 && input_checked_value !== (input_checked_value = /*todo*/ ctx[0].completed)) {
    				prop_dev(input, "checked", input_checked_value);
    			}

    			if (dirty & /*todo*/ 1 && t1_value !== (t1_value = /*todo*/ ctx[0].text + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*todo*/ 1) {
    				toggle_class(p, "done", /*todo*/ ctx[0].completed);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TodoItem", slots, []);
    	let { todo } = $$props;
    	let { deleteTodo } = $$props;
    	let { handleComplete } = $$props;
    	const writable_props = ["todo", "deleteTodo", "handleComplete"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TodoItem> was created with unknown prop '${key}'`);
    	});

    	const change_handler = () => handleComplete(todo.id);
    	const click_handler = () => deleteTodo(todo.id);

    	$$self.$$set = $$props => {
    		if ("todo" in $$props) $$invalidate(0, todo = $$props.todo);
    		if ("deleteTodo" in $$props) $$invalidate(1, deleteTodo = $$props.deleteTodo);
    		if ("handleComplete" in $$props) $$invalidate(2, handleComplete = $$props.handleComplete);
    	};

    	$$self.$capture_state = () => ({ todo, deleteTodo, handleComplete });

    	$$self.$inject_state = $$props => {
    		if ("todo" in $$props) $$invalidate(0, todo = $$props.todo);
    		if ("deleteTodo" in $$props) $$invalidate(1, deleteTodo = $$props.deleteTodo);
    		if ("handleComplete" in $$props) $$invalidate(2, handleComplete = $$props.handleComplete);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [todo, deleteTodo, handleComplete, change_handler, click_handler];
    }

    class TodoItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			todo: 0,
    			deleteTodo: 1,
    			handleComplete: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TodoItem",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*todo*/ ctx[0] === undefined && !("todo" in props)) {
    			console.warn("<TodoItem> was created without expected prop 'todo'");
    		}

    		if (/*deleteTodo*/ ctx[1] === undefined && !("deleteTodo" in props)) {
    			console.warn("<TodoItem> was created without expected prop 'deleteTodo'");
    		}

    		if (/*handleComplete*/ ctx[2] === undefined && !("handleComplete" in props)) {
    			console.warn("<TodoItem> was created without expected prop 'handleComplete'");
    		}
    	}

    	get todo() {
    		throw new Error("<TodoItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set todo(value) {
    		throw new Error("<TodoItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get deleteTodo() {
    		throw new Error("<TodoItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set deleteTodo(value) {
    		throw new Error("<TodoItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get handleComplete() {
    		throw new Error("<TodoItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set handleComplete(value) {
    		throw new Error("<TodoItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Todos.svelte generated by Svelte v3.32.1 */
    const file$2 = "src/components/Todos.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (9:2) {#each todoList as todo }
    function create_each_block(ctx) {
    	let todoitem;
    	let current;

    	todoitem = new TodoItem({
    			props: {
    				todo: /*todo*/ ctx[3],
    				deleteTodo: /*deleteTodo*/ ctx[1],
    				handleComplete: /*handleComplete*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(todoitem.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(todoitem, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const todoitem_changes = {};
    			if (dirty & /*todoList*/ 1) todoitem_changes.todo = /*todo*/ ctx[3];
    			if (dirty & /*deleteTodo*/ 2) todoitem_changes.deleteTodo = /*deleteTodo*/ ctx[1];
    			if (dirty & /*handleComplete*/ 4) todoitem_changes.handleComplete = /*handleComplete*/ ctx[2];
    			todoitem.$set(todoitem_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(todoitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(todoitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(todoitem, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(9:2) {#each todoList as todo }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div;
    	let current;
    	let each_value = /*todoList*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "svelte-1e6oqrs");
    			add_location(div, file$2, 7, 0, 141);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*todoList, deleteTodo, handleComplete*/ 7) {
    				each_value = /*todoList*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Todos", slots, []);
    	let { todoList } = $$props;
    	let { deleteTodo } = $$props;
    	let { handleComplete } = $$props;
    	const writable_props = ["todoList", "deleteTodo", "handleComplete"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Todos> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("todoList" in $$props) $$invalidate(0, todoList = $$props.todoList);
    		if ("deleteTodo" in $$props) $$invalidate(1, deleteTodo = $$props.deleteTodo);
    		if ("handleComplete" in $$props) $$invalidate(2, handleComplete = $$props.handleComplete);
    	};

    	$$self.$capture_state = () => ({
    		TodoItem,
    		todoList,
    		deleteTodo,
    		handleComplete
    	});

    	$$self.$inject_state = $$props => {
    		if ("todoList" in $$props) $$invalidate(0, todoList = $$props.todoList);
    		if ("deleteTodo" in $$props) $$invalidate(1, deleteTodo = $$props.deleteTodo);
    		if ("handleComplete" in $$props) $$invalidate(2, handleComplete = $$props.handleComplete);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [todoList, deleteTodo, handleComplete];
    }

    class Todos extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			todoList: 0,
    			deleteTodo: 1,
    			handleComplete: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Todos",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*todoList*/ ctx[0] === undefined && !("todoList" in props)) {
    			console.warn("<Todos> was created without expected prop 'todoList'");
    		}

    		if (/*deleteTodo*/ ctx[1] === undefined && !("deleteTodo" in props)) {
    			console.warn("<Todos> was created without expected prop 'deleteTodo'");
    		}

    		if (/*handleComplete*/ ctx[2] === undefined && !("handleComplete" in props)) {
    			console.warn("<Todos> was created without expected prop 'handleComplete'");
    		}
    	}

    	get todoList() {
    		throw new Error("<Todos>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set todoList(value) {
    		throw new Error("<Todos>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get deleteTodo() {
    		throw new Error("<Todos>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set deleteTodo(value) {
    		throw new Error("<Todos>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get handleComplete() {
    		throw new Error("<Todos>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set handleComplete(value) {
    		throw new Error("<Todos>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.32.1 */
    const file$3 = "src/App.svelte";

    function create_fragment$3(ctx) {
    	let main;
    	let div;
    	let p;
    	let t1;
    	let input;
    	let t2;
    	let todos;
    	let t3;
    	let link0;
    	let t4;
    	let link1;
    	let current;

    	input = new Input({
    			props: {
    				todo: /*todo*/ ctx[0],
    				addTodo: /*addTodo*/ ctx[2],
    				handleKeyUp: /*handleKeyUp*/ ctx[3]
    			},
    			$$inline: true
    		});

    	todos = new Todos({
    			props: {
    				todoList: /*todoList*/ ctx[1],
    				deleteTodo: /*deleteTodo*/ ctx[4],
    				handleComplete: /*handleComplete*/ ctx[5]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");
    			p = element("p");
    			p.textContent = "To Do List";
    			t1 = space();
    			create_component(input.$$.fragment);
    			t2 = space();
    			create_component(todos.$$.fragment);
    			t3 = space();
    			link0 = element("link");
    			t4 = space();
    			link1 = element("link");
    			attr_dev(p, "class", "svelte-1fkidfo");
    			add_location(p, file$3, 57, 2, 975);
    			attr_dev(div, "class", "svelte-1fkidfo");
    			add_location(div, file$3, 56, 1, 967);
    			attr_dev(main, "class", "svelte-1fkidfo");
    			add_location(main, file$3, 55, 0, 959);
    			attr_dev(link0, "rel", "preconnect");
    			attr_dev(link0, "href", "https://fonts.gstatic.com");
    			add_location(link0, file$3, 63, 0, 1104);
    			attr_dev(link1, "href", "https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap");
    			attr_dev(link1, "rel", "stylesheet");
    			add_location(link1, file$3, 64, 0, 1161);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    			append_dev(div, p);
    			append_dev(div, t1);
    			mount_component(input, div, null);
    			append_dev(div, t2);
    			mount_component(todos, div, null);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, link0, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, link1, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const input_changes = {};
    			if (dirty & /*todo*/ 1) input_changes.todo = /*todo*/ ctx[0];
    			input.$set(input_changes);
    			const todos_changes = {};
    			if (dirty & /*todoList*/ 2) todos_changes.todoList = /*todoList*/ ctx[1];
    			todos.$set(todos_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			transition_in(todos.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			transition_out(todos.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(input);
    			destroy_component(todos);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(link0);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(link1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let todo = "";

    	let todoList = [
    		{
    			id: 1,
    			text: "할일이 산더미다",
    			completed: false
    		},
    		{ id: 2, text: "할일이 없나?", completed: false },
    		{
    			id: 3,
    			text: "할일을 미루고싶다",
    			completed: true
    		}
    	];

    	let lastId = todoList[todoList.length - 1]["id"];

    	let addTodo = () => {
    		if (todo) {
    			let newTodo = {
    				id: ++lastId,
    				text: todo,
    				completed: false
    			};

    			$$invalidate(1, todoList[todoList.length] = newTodo, todoList);
    			$$invalidate(0, todo = "");
    		}
    	};

    	let handleKeyUp = e => {
    		$$invalidate(0, todo = e.target.value);

    		if (e.keyCode === 13) {
    			addTodo();
    		}
    	};

    	let deleteTodo = id => {
    		$$invalidate(1, todoList = todoList.filter(todo => todo.id !== id));
    	};

    	let handleComplete = id => {
    		const index = todoList.findIndex(todo => todo.id === id);
    		$$invalidate(1, todoList[index]["completed"] = !todoList[index]["completed"], todoList);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Input,
    		Todos,
    		todo,
    		todoList,
    		lastId,
    		addTodo,
    		handleKeyUp,
    		deleteTodo,
    		handleComplete
    	});

    	$$self.$inject_state = $$props => {
    		if ("todo" in $$props) $$invalidate(0, todo = $$props.todo);
    		if ("todoList" in $$props) $$invalidate(1, todoList = $$props.todoList);
    		if ("lastId" in $$props) lastId = $$props.lastId;
    		if ("addTodo" in $$props) $$invalidate(2, addTodo = $$props.addTodo);
    		if ("handleKeyUp" in $$props) $$invalidate(3, handleKeyUp = $$props.handleKeyUp);
    		if ("deleteTodo" in $$props) $$invalidate(4, deleteTodo = $$props.deleteTodo);
    		if ("handleComplete" in $$props) $$invalidate(5, handleComplete = $$props.handleComplete);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [todo, todoList, addTodo, handleKeyUp, deleteTodo, handleComplete];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    const app = new App({
      target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map

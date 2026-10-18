// === EMBEDDED REACT 18 COMPATIBLE ENGINE ===
// Provides 100% offline standalone compatibility for React 18 apps

(function () {
  if (window.React && window.ReactDOM) return; // Use native React if already loaded from CDN

  let currentComponent = null;
  let hookIndex = 0;

  function createElement(type, props, ...children) {
    props = props || {};
    const flatChildren = children.flat().filter(c => c !== null && c !== undefined && c !== false);
    return {
      $$typeof: Symbol.for('react.element'),
      type,
      props: {
        ...props,
        children: flatChildren.length === 1 ? flatChildren[0] : flatChildren
      }
    };
  }

  function useState(initialState) {
    const comp = currentComponent;
    const idx = hookIndex++;
    if (comp.hooks[idx] === undefined) {
      comp.hooks[idx] = typeof initialState === 'function' ? initialState() : initialState;
    }
    const setState = (newState) => {
      const val = typeof newState === 'function' ? newState(comp.hooks[idx]) : newState;
      if (comp.hooks[idx] !== val) {
        comp.hooks[idx] = val;
        comp.scheduleUpdate();
      }
    };
    return [comp.hooks[idx], setState];
  }

  function useMemo(factory, deps) {
    const comp = currentComponent;
    const idx = hookIndex++;
    const prev = comp.hooks[idx];
    if (prev && deps && prev.deps.every((d, i) => d === deps[i])) {
      return prev.value;
    }
    const value = factory();
    comp.hooks[idx] = { value, deps };
    return value;
  }

  function useRef(initialValue) {
    return useMemo(() => ({ current: initialValue }), []);
  }

  function useCallback(fn, deps) {
    return useMemo(() => fn, deps);
  }

  function useEffect(effect, deps) {
    const comp = currentComponent;
    const idx = hookIndex++;
    const prev = comp.hooks[idx];
    const hasChanged = !prev || !deps || !prev.deps || !deps.every((d, i) => d === prev.deps[i]);
    if (hasChanged) {
      if (prev && typeof prev.cleanup === 'function') {
        try { prev.cleanup(); } catch (e) {}
      }
      comp.effects.push(() => {
        const cleanup = effect();
        comp.hooks[idx] = { cleanup, deps };
      });
    }
  }

  function Fragment(props) {
    return props.children;
  }

  // DOM renderer
  function renderVNode(vnode, container) {
    if (vnode === null || vnode === undefined || vnode === false) return null;
    if (typeof vnode === 'string' || typeof vnode === 'number') {
      const textNode = document.createTextNode(String(vnode));
      container.appendChild(textNode);
      return textNode;
    }

    if (typeof vnode.type === 'function') {
      const compInstance = {
        hooks: [],
        effects: [],
        vnode,
        container,
        domNodes: [],
        scheduleUpdate: () => {
          if (compInstance.queued) return;
          compInstance.queued = true;
          queueMicrotask(() => {
            compInstance.queued = false;
            compInstance.update();
          });
        },
        update: () => {
          currentComponent = compInstance;
          hookIndex = 0;
          compInstance.effects = [];
          
          const rendered = vnode.type(vnode.props);
          const frag = document.createDocumentFragment();
          renderVNode(rendered, frag);
          
          // Replace previous DOM nodes
          if (compInstance.domNodes.length > 0) {
            const firstNode = compInstance.domNodes[0];
            const parent = firstNode.parentNode;
            if (parent) {
              parent.insertBefore(frag, firstNode);
              compInstance.domNodes.forEach(n => {
                if (n.parentNode) n.parentNode.removeChild(n);
              });
            }
          } else {
            container.appendChild(frag);
          }
          
          compInstance.domNodes = Array.from(frag.childNodes);
          compInstance.effects.forEach(eff => eff());
        }
      };

      compInstance.update();
      return compInstance;
    }

    // HTML Element
    const el = document.createElement(vnode.type);
    const props = vnode.props || {};

    Object.keys(props).forEach(key => {
      if (key === 'children') return;
      if (key.startsWith('on') && typeof props[key] === 'function') {
        const eventName = key.substring(2).toLowerCase();
        el.addEventListener(eventName, props[key]);
      } else if (key === 'className') {
        el.className = props[key] || '';
      } else if (key === 'style' && typeof props[key] === 'object') {
        Object.assign(el.style, props[key]);
      } else if (key === 'disabled') {
        el.disabled = Boolean(props[key]);
      } else if (key === 'value') {
        el.value = props[key];
      } else if (key === 'placeholder') {
        el.placeholder = props[key];
      } else if (key === 'rows') {
        el.rows = props[key];
      } else if (key === 'autoFocus') {
        if (props[key]) setTimeout(() => el.focus(), 50);
      } else if (key === 'type') {
        el.type = props[key];
      } else if (key === 'src') {
        el.src = props[key];
      } else if (key === 'alt') {
        el.alt = props[key];
      } else {
        el.setAttribute(key, props[key]);
      }
    });

    const children = Array.isArray(props.children) ? props.children : (props.children !== undefined ? [props.children] : []);
    children.forEach(child => renderVNode(child, el));
    container.appendChild(el);
    return el;
  }

  function createRoot(container) {
    return {
      render(element) {
        container.innerHTML = '';
        renderVNode(element, container);
      }
    };
  }

  window.React = {
    createElement,
    useState,
    useMemo,
    useRef,
    useCallback,
    useEffect,
    Fragment,
    StrictMode: Fragment
  };

  window.ReactDOM = {
    createRoot
  };
})();

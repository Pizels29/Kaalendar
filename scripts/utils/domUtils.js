// Utility functions for DOM manipulation
const domUtils = {
    // Create an element with attributes and properties
    createElement(tag, attributes = {}, properties = {}) {
        const element = document.createElement(tag);
        Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
        Object.entries(properties).forEach(([key, value]) => {
            element[key] = value;
        });
        return element;
    },

    // Add event listeners to an element
    addEventListeners(element, listeners = {}) {
        Object.entries(listeners).forEach(([event, handler]) => {
            element.addEventListener(event, handler);
        });
        return element;
    },

    // Create a button element
    createButton(text, attributes = {}, listeners = {}) {
        const button = this.createElement('button', {
            type: 'button',
            ...attributes
        }, { textContent: text });
        return this.addEventListeners(button, listeners);
    },

    // Remove all children from an element
    clearElement(element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
        return element;
    },

    // Create an event element
    createEventElement(event) {
        const element = this.createElement('div', {
            class: `calendar-event${event.isCompleted ? ' completed' : ''}`,
            'data-event-id': event.id,
            style: `background-color: ${event.color}`,
            draggable: 'true',
            tabindex: '0'
        });

        element.innerHTML = `
            <div class="event-title">${event.title}</div>
            <div class="event-time">${dateUtils.formatTime(event.start)}</div>
            <div class="event-resize-handle"></div>
        `;

        return element;
    },

    // Position an element absolutely within its container
    positionElement(element, top, left, width, height) {
        Object.assign(element.style, {
            position: 'absolute',
            top: `${top}px`,
            left: `${left}px`,
            width: `${width}px`,
            height: `${height}px`
        });
    },

    // Create a debounced version of a function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Create a throttled version of a function
    throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Handle drag and drop
    initializeDragAndDrop(element, options = {}) {
        const {
            onDragStart,
            onDragOver,
            onDrop,
            dragSelector = '[draggable="true"]',
            dropSelector = '*'
        } = options;

        if (onDragStart) {
            element.addEventListener('dragstart', (e) => {
                if (e.target.matches(dragSelector)) {
                    onDragStart(e);
                }
            });
        }

        if (onDragOver) {
            element.addEventListener('dragover', (e) => {
                if (e.target.matches(dropSelector)) {
                    e.preventDefault();
                    onDragOver(e);
                }
            });
        }

        if (onDrop) {
            element.addEventListener('drop', (e) => {
                if (e.target.matches(dropSelector)) {
                    e.preventDefault();
                    onDrop(e);
                }
            });
        }
    },

    // Handle resize
    initializeResize(element, options = {}) {
        const {
            onResizeStart,
            onResize,
            onResizeEnd,
            handleSelector = '.event-resize-handle'
        } = options;

        let isResizing = false;
        let startY;
        let startHeight;

        element.addEventListener('mousedown', (e) => {
            if (e.target.matches(handleSelector)) {
                isResizing = true;
                startY = e.clientY;
                startHeight = element.offsetHeight;
                onResizeStart?.(e);
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            
            const deltaY = e.clientY - startY;
            const newHeight = startHeight + deltaY;
            onResize?.(e, newHeight);
        });

        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                onResizeEnd?.();
            }
        });
    }
};
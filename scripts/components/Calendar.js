class Calendar {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? document.querySelector(container) : container;
        this.options = {
            defaultView: 'month',
            startOnMonday: true,
            workingHours: {
                start: 9,
                end: 17
            },
            ...options
        };

        this.currentDate = new Date();
        this.currentView = this.options.defaultView;
        this.events = new Map();
        
        this.init();
    }

    init() {
        this.render();
        this.setupEventListeners();
    }

    render() {
        this.container.innerHTML = `
            <div class="calendar">
                ${this.renderHeader()}
                ${this.renderView()}
            </div>
        `;
    }

    renderHeader() {
        return `
            <div class="calendar-header">
                <div class="calendar-navigation">
                    <button class="nav-button prev">&lt;</button>
                    <h2 class="calendar-title">${this.getHeaderTitle()}</h2>
                    <button class="nav-button next">&gt;</button>
                    <button class="nav-button today">Today</button>
                </div>
                <div class="calendar-controls">
                    <div class="calendar-view-selector">
                        <button class="view-button${this.currentView === 'month' ? ' active' : ''}" data-view="month">Month</button>
                        <button class="view-button${this.currentView === 'week' ? ' active' : ''}" data-view="week">Week</button>
                        <button class="view-button${this.currentView === 'day' ? ' active' : ''}" data-view="day">Day</button>
                    </div>
                </div>
            </div>
        `;
    }

    renderView() {
        switch (this.currentView) {
            case 'month':
                return this.renderMonthView();
            case 'week':
                return this.renderWeekView();
            case 'day':
                return this.renderDayView();
            default:
                return this.renderMonthView();
        }
    }

    renderMonthView() {
        const dates = dateUtils.getMonthViewDates(this.currentDate);
        const weeks = [];
        
        for (let i = 0; i < dates.length; i += 7) {
            weeks.push(dates.slice(i, i + 7));
        }

        return `
            <div class="calendar-month-view">
                <div class="calendar-weekdays">
                    ${this.getWeekDayNames().map(name => 
                        `<div class="weekday">${name}</div>`
                    ).join('')}
                </div>
                <div class="calendar-grid">
                    ${weeks.map(week => this.renderWeek(week)).join('')}
                </div>
            </div>
        `;
    }

    renderWeek(dates) {
        return dates.map(date => {
            const isToday = dateUtils.isToday(date);
            const isCurrentMonth = dateUtils.isCurrentMonth(date, this.currentDate);
            const events = this.getEventsForDate(date);

            return `
                <div class="calendar-cell${isToday ? ' today' : ''}${!isCurrentMonth ? ' other-month' : ''}"
                     data-date="${dateUtils.formatDate(date)}">
                    <span class="calendar-date">${date.getDate()}</span>
                    <div class="events-container">
                        ${this.renderEvents(events)}
                    </div>
                </div>
            `;
        }).join('');
    }

    renderWeekView() {
        const dates = dateUtils.getWeekViewDates(this.currentDate);
        const hours = Array.from({ length: 24 }, (_, i) => i);

        return `
            <div class="calendar-week-view">
                <div class="time-labels">
                    ${hours.map(hour => 
                        `<div class="time-label">${hour.toString().padStart(2, '0')}:00</div>`
                    ).join('')}
                </div>
                <div class="week-grid">
                    ${dates.map(date => this.renderDayColumn(date)).join('')}
                </div>
            </div>
        `;
    }

    renderDayView() {
        const hours = Array.from({ length: 24 }, (_, i) => i);
        const events = this.getEventsForDate(this.currentDate);

        return `
            <div class="calendar-day-view">
                <div class="time-labels">
                    ${hours.map(hour => 
                        `<div class="time-label">${hour.toString().padStart(2, '0')}:00</div>`
                    ).join('')}
                </div>
                <div class="day-grid">
                    ${hours.map(hour => this.renderHourSlot(hour, events)).join('')}
                </div>
            </div>
        `;
    }

    renderDayColumn(date) {
        const events = this.getEventsForDate(date);
        const hours = Array.from({ length: 24 }, (_, i) => i);

        return `
            <div class="day-column" data-date="${dateUtils.formatDate(date)}">
                ${hours.map(hour => this.renderHourSlot(hour, events)).join('')}
            </div>
        `;
    }

    renderHourSlot(hour, events) {
        const slotEvents = events.filter(event => 
            event.start.getHours() === hour
        );

        return `
            <div class="time-slot" data-hour="${hour}">
                ${this.renderEvents(slotEvents)}
            </div>
        `;
    }

    renderEvents(events) {
        return events.map(event => `
            <div class="calendar-event${event.isCompleted ? ' completed' : ''}"
                 style="background-color: ${event.color}"
                 data-event-id="${event.id}"
                 draggable="true">
                <div class="event-title">${event.title}</div>
                <div class="event-time">${dateUtils.formatTime(event.start)}</div>
                <div class="event-resize-handle"></div>
            </div>
        `).join('');
    }

    getHeaderTitle() {
        const options = { month: 'long', year: 'numeric' };
        return this.currentDate.toLocaleDateString(undefined, options);
    }

    getWeekDayNames() {
        const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        if (this.options.startOnMonday) {
            weekdays.push(weekdays.shift());
        }
        return weekdays;
    }

    setupEventListeners() {
        // Navigation
        this.container.querySelector('.nav-button.prev').addEventListener('click', () => this.navigate('prev'));
        this.container.querySelector('.nav-button.next').addEventListener('click', () => this.navigate('next'));
        this.container.querySelector('.nav-button.today').addEventListener('click', () => this.goToToday());

        // View switching
        this.container.querySelectorAll('.view-button').forEach(button => {
            button.addEventListener('click', () => this.changeView(button.dataset.view));
        });

        // Event handling
        this.setupEventDragAndDrop();
        this.setupEventResize();
    }

    setupEventDragAndDrop() {
        domUtils.initializeDragAndDrop(this.container, {
            onDragStart: (e) => {
                const eventId = e.target.dataset.eventId;
                e.dataTransfer.setData('text/plain', eventId);
                e.target.classList.add('dragging');
            },
            onDragOver: (e) => {
                const cell = e.target.closest('.calendar-cell, .time-slot');
                if (cell) {
                    cell.classList.add('drag-over');
                }
            },
            onDrop: (e) => {
                const cell = e.target.closest('.calendar-cell, .time-slot');
                if (cell) {
                    const eventId = e.dataTransfer.getData('text/plain');
                    const newDate = new Date(cell.dataset.date);
                    this.moveEvent(eventId, newDate);
                    cell.classList.remove('drag-over');
                }
                document.querySelector('.dragging')?.classList.remove('dragging');
            }
        });
    }

    setupEventResize() {
        this.container.addEventListener('mousedown', (e) => {
            if (!e.target.matches('.event-resize-handle')) return;

            const eventElement = e.target.closest('.calendar-event');
            const eventId = eventElement.dataset.eventId;
            const startY = e.clientY;
            const startHeight = eventElement.offsetHeight;

            const onMouseMove = (e) => {
                const deltaY = e.clientY - startY;
                const newHeight = Math.max(30, startHeight + deltaY);
                eventElement.style.height = `${newHeight}px`;
            };

            const onMouseUp = () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                
                const newDuration = Math.round(eventElement.offsetHeight / 30) * 30;
                this.resizeEvent(eventId, newDuration);
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    }

    // Navigation methods
    navigate(direction) {
        const amount = direction === 'prev' ? -1 : 1;
        
        switch (this.currentView) {
            case 'month':
                this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + amount);
                break;
            case 'week':
                this.currentDate = dateUtils.addDays(this.currentDate, amount * 7);
                break;
            case 'day':
                this.currentDate = dateUtils.addDays(this.currentDate, amount);
                break;
        }

        this.render();
    }

    goToToday() {
        this.currentDate = new Date();
        this.render();
    }

    changeView(view) {
        this.currentView = view;
        this.render();
    }

    // Event methods
    addEvent(event) {
        this.events.set(event.id, event);
        this.render();
    }

    updateEvent(eventId, updates) {
        const event = this.events.get(eventId);
        if (event) {
            this.events.set(eventId, { ...event, ...updates });
            this.render();
        }
    }

    deleteEvent(eventId) {
        this.events.delete(eventId);
        this.render();
    }

    moveEvent(eventId, newDate) {
        const event = this.events.get(eventId);
        if (event) {
            const timeDiff = event.end.getTime() - event.start.getTime();
            const newStart = new Date(newDate);
            newStart.setHours(event.start.getHours(), event.start.getMinutes());
            const newEnd = new Date(newStart.getTime() + timeDiff);
            
            this.updateEvent(eventId, { start: newStart, end: newEnd });
        }
    }

    resizeEvent(eventId, newDurationMinutes) {
        const event = this.events.get(eventId);
        if (event) {
            const newEnd = new Date(event.start.getTime() + newDurationMinutes * 60000);
            this.updateEvent(eventId, { end: newEnd });
        }
    }

    getEventsForDate(date) {
        return Array.from(this.events.values()).filter(event => 
            dateUtils.isSameDay(event.start, date)
        );
    }
}
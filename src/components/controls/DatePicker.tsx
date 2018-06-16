/**
 * Created following the tutorial on: https://www.codementor.io/chrisharrington/build-date-picker-react-js-classes-du107v566
 */

import * as React from 'react';
import { CSSProperties } from 'react';
import Language from '../../helpers/Language';

type CalendarPos = { top: number, left: number };

interface DatePickerProps {
    onSelect: (date: Date) => void;
    selected?: Date;
    style?: CSSProperties;
    inputHeight?: number;
}

interface CalenderProps {
    visible: boolean;
    view: Date;
    selected: Date;
    onSelect: (date: Date) => void;
    position: CalendarPos;
    minDate?: Date;
    maxDate?: Date;
}

interface MonthHeaderProps {
    view: Date;
    onMove: (view: Date, isForward: boolean) => void;
}

interface WeeksProps {
    view: Date;
    selected: Date;
    onSelect: (date: Date) => void;
    onTransitionEnd: () => void;
    minDate?: Date;
    maxDate?: Date;
}

interface WeekProps {
    start: Date;
    month: number;
    onSelect: (day: Date) => void;
    minDate?: Date;
    maxDate?: Date;
    selected?: Date;
}

interface DatePickerState {
    view: Date;
    selected: Date;
    // visible: boolean;
    calendar: JSX.Element | undefined;
    minDate?: Date;
    maxDate?: Date;
}

interface MonthHeaderState {
    view: Date;
    isEnabled: boolean;
}

interface WeeksState {
    view: Date;
    other: Date;
    sliding: string | undefined;
}

export class DatePicker extends React.Component<DatePickerProps, DatePickerState> {
    private readonly CALENDAR_OFFSET: number = 1;
    private readonly CALENDAR_HEIGHT: number = 203;
    private readonly CALENDER_DIV_MIN_HEIGHT: number = this.CALENDAR_HEIGHT + this.CALENDAR_OFFSET;
    private readonly DIV_ID: string = 'date-picker-div';

    private ourDiv: HTMLDivElement | null = null;
    private parent!: HTMLElement;
    private inputStyle: CSSProperties;

    constructor(props: DatePickerProps) {
        super(props);

        this.state = this.getInitialState();
        this.inputStyle = {};

        if (this.props.inputHeight) {
            this.inputStyle.height = this.props.inputHeight + 'px';
        }
    }

    componentDidMount() {
        // Find a parent
        let div: HTMLElement | null = document.getElementById(this.DIV_ID);
        let ourHeight = 0;
        let offsetTop = 0;

        if (div) {
            ourHeight = div.clientHeight;
            offsetTop = div.offsetTop + ourHeight + 1;
        }

        let minHeight = this.CALENDER_DIV_MIN_HEIGHT;
        let p: HTMLElement | null = null;

        while (div !== null) {
            let scrollOffsetY = div.scrollTop;
            let maxHeightToBottom = div.clientHeight + div.offsetTop - scrollOffsetY - offsetTop - this.CALENDAR_OFFSET;
            let maxHeightToTop = offsetTop - scrollOffsetY - div.offsetTop - this.CALENDAR_OFFSET;

            if (maxHeightToBottom >= minHeight || maxHeightToTop >= minHeight) {
                p = div;
                break;
            }

            div = div.parentElement;
        }

        if (p === null) {
            throw new Error('[ERROR] DatePicker::componentDidMount -- Could not get a valid parent for this component.');
        }

        // We found one BUT it could be that this one is in a scrollable div. So search, if a parent is scrollable
        div = p;

        while (div !== null) {
            if (div.style.overflow !== 'hidden' && div.clientHeight < div.scrollHeight) {
                // The element is scrollable AND has content hight than it's height.
                p = div;
                break;
            }

            div = div.parentElement;
        }

        this.parent = p;

        // Make sure, the calendar gets blurred if the user clicks NOT in it.
        document.addEventListener('click', (event) => {
            let target = event.target as HTMLElement;
            if (this.state.calendar && target.className != 'date-picker-trigger' && !this.parentsHaveClassName(target, 'date-picker')) {
                this.hide();
            }
        });
    }

    render() {
        return (
            <div ref={(ref) => this.ourDiv = ref} id={this.DIV_ID} className='ardp-date-picker' style={this.props.style} >
                <input
                    type='text'
                    className='date-picker-trigger'
                    style={this.inputStyle}
                    readOnly
                    value={DateUtilities.toString(this.state.selected)}
                    onClick={this.show.bind(this)}
                />

                {this.state.calendar}
            </div>
        );
    }

    private getInitialState(): DatePickerState {
        let def: Date = this.props.selected || new Date();

        return {
            view: DateUtilities.clone(def),
            selected: DateUtilities.clone(def),
            minDate: undefined,
            maxDate: undefined,
            calendar: undefined
        };
    }

    private parentsHaveClassName(el: HTMLElement, className: string): boolean {
        let parent: HTMLElement | null = el;

        while (parent) {
            if (parent.className && parent.className.indexOf(className) > -1) {
                return true;
            }

            parent = parent.parentElement;
        }

        return false;
    }

    // private setMinDate(minDate: Date | undefined) {
    //     this.setState({ minDate });
    // }

    // private setMaxDate(maxDate: Date | undefined) {
    //     this.setState({ maxDate });
    // }

    private onSelect(day: Date) {
        this.setState({ selected: day });
        this.props.onSelect(day);
        this.hide();
    }

    private show() {
        if (!this.ourDiv) {
            return;
        }

        let scrollTop: number = this.parent.scrollTop;

        let top: number = this.ourDiv.offsetTop + this.ourDiv.clientHeight + this.CALENDAR_OFFSET - scrollTop;
        let left: number = this.ourDiv.offsetLeft;

        let maxHeight = this.parent.clientHeight + this.parent.offsetTop - this.ourDiv.offsetTop - scrollTop - this.CALENDAR_OFFSET;

        if (maxHeight <= this.CALENDER_DIV_MIN_HEIGHT) {
            top = this.ourDiv.offsetTop - scrollTop - this.CALENDER_DIV_MIN_HEIGHT - 2;
        }

        let pos: CalendarPos = { top, left };

        let calendar = <Calendar
            visible={true}
            view={this.state.view}
            selected={this.state.selected}
            onSelect={this.onSelect.bind(this)}
            minDate={this.state.minDate}
            maxDate={this.state.maxDate}
            position={pos}
        />;

        this.setState({ calendar });
    }

    private hide() {
        this.setState({ calendar: undefined });
    }
}

class Calendar extends React.Component<CalenderProps, object> {
    private monthHeader: MonthHeader | null = null;
    private weeks: Weeks | null = null;

    render() {
        let style: CSSProperties = {
            top: this.props.position.top + 'px',
            left: this.props.position.left + 'px'
        };

        return (
            <div
                className={'calendar ' + (this.props.visible ? 'calendar-show' : 'calendar-hide')}
                style={style}
            >
                <MonthHeader
                    ref={(ref) => this.monthHeader = ref}
                    view={this.props.view}
                    onMove={this.onMove.bind(this)}
                />
                <WeekHeader />
                <Weeks
                    ref={(ref) => this.weeks = ref}
                    view={this.props.view}
                    selected={this.props.selected}
                    onTransitionEnd={this.onTransitionEnd.bind(this)}
                    onSelect={this.props.onSelect}
                    minDate={this.props.minDate}
                    maxDate={this.props.maxDate}
                />
            </div>
        );
    }

    private onMove(view: Date, isForward: boolean) {
        if (!this.weeks) {
            return;
        }

        this.weeks.moveTo(view, isForward);
    }

    private onTransitionEnd() {
        if (!this.monthHeader) {
            return;
        }

        this.monthHeader.enable();
    }
}

class MonthHeader extends React.Component<MonthHeaderProps, MonthHeaderState> {
    constructor(props: MonthHeaderProps) {
        super(props);

        this.state = {
            view: DateUtilities.clone(this.props.view),
            isEnabled: true
        };
    }

    render() {
        let isEnabled = this.state.isEnabled;
        return (
            <div className='month-header' >
                <i className={isEnabled ? '' : 'disabled'} onClick={this.moveBackward.bind(this)} >{String.fromCharCode(9664)}</i>
                <span>{DateUtilities.toMonthAndYearString(this.state.view)}</span>
                <i className={isEnabled ? '' : 'disabled'} onClick={this.moveForward.bind(this)} >{String.fromCharCode(9654)}</i>
            </div>
        );
    }

    private moveBackward() {
        let view = DateUtilities.clone(this.state.view);
        view.setMonth(view.getMonth() - 1);
        this.move(view, false);
    }

    private moveForward() {
        let view = DateUtilities.clone(this.state.view);
        view.setMonth(view.getMonth() + 1);
        this.move(view, true);
    }

    private move(view: Date, isForward: boolean) {
        if (!this.state.isEnabled) {
            return;
        }

        this.setState({
            view,
            isEnabled: false
        });

        this.props.onMove(view, isForward);
    }

    public enable() {
        this.setState({ isEnabled: true });
    }
}

class WeekHeader extends React.Component<object, object> {
    render() {
        let days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        let spans: JSX.Element[] = [];

        days.forEach((day) => spans.push(<span key={'week-header-' + day} >{Language.getString('DAY_SHORT_' + day.toUpperCase())}</span>));

        return (
            <div className='week-header' >
                {spans}
            </div>
        );
    }
}

class Weeks extends React.Component<WeeksProps, WeeksState> {
    private current: HTMLDivElement | null = null;
    private other: HTMLDivElement | null = null;

    constructor(props: WeeksProps) {
        super(props);

        this.state = {
            view: DateUtilities.clone(this.props.view),
            other: DateUtilities.clone(this.props.view),
            sliding: undefined
        };
    }

    componentDidMount() {
        if (this.current) {
            this.current.addEventListener('transitionend', this.onTransitionEnd.bind(this));
        }
    }

    render() {
        return (
            <div className='weeks' >
                <div ref={(ref) => this.current = ref} className={'current ' + (this.state.sliding ? ('sliding ' + this.state.sliding) : '')} >
                    {this.renderWeeks(this.state.view)}
                </div>

                <div ref={(ref) => this.other = ref} className={'other ' + (this.state.sliding ? ('sliding ' + this.state.sliding) : '')} >
                    {this.renderWeeks(this.state.other)}
                </div>
            </div>
        );
    }

    private onTransitionEnd() {
        this.setState({
            sliding: undefined,
            view: DateUtilities.clone(this.state.other)
        });

        this.props.onTransitionEnd();
    }

    private getWeekStartDates(view: Date): Date[] {
        view.setDate(1);
        view = DateUtilities.moveToDayOfWeek(DateUtilities.clone(view), 0);

        let current: Date = DateUtilities.clone(view);
        current.setDate(current.getDate() + 7);

        let starts: Date[] = [view];
        let month: number = current.getMonth();

        while (current.getMonth() === month) {
            starts.push(DateUtilities.clone(current));
            current.setDate(current.getDate() + 7);
        }

        return starts;
    }

    public moveTo(view: Date, isForward: boolean) {
        this.setState({
            sliding: isForward ? 'left' : 'right',
            other: DateUtilities.clone(view)
        });
    }

    private renderWeeks(view: Date): JSX.Element[] {
        let starts: Date[] = this.getWeekStartDates(view);
        // Take the month of the SECOND week as a reference so we get the current month FOR SURE. The first week could start with a couple of days from the last month.
        let month: number = starts[1].getMonth();

        return starts.map((day, idx) => {
            return <Week
                key={idx}
                start={day}
                month={month}
                selected={this.props.selected}
                onSelect={this.props.onSelect}
                minDate={this.props.minDate}
                maxDate={this.props.maxDate}
            />;
        });
    }
}

class Week extends React.Component<WeekProps, object> {
    render() {
        let days: Date[] = this.buildDays(this.props.start);
        let innerDivs: JSX.Element[] = days.map((day, idx) => {
            return (
                <div
                    key={idx}
                    onClick={() => this.onSelect(day)}
                    className={this.getDayClassName(day)}
                >
                    {DateUtilities.toDayOfMonthString(day)}
                </div>
            );
        });

        return (
            <div className='week' >
                {innerDivs}
            </div>
        );
    }

    private buildDays(start: Date): Date[] {
        let days = [DateUtilities.clone(start)];
        let clone = DateUtilities.clone(start);

        for (let i = 0; i < 6; i++) {
            clone = DateUtilities.clone(clone);
            clone.setDate(clone.getDate() + 1);
            days.push(clone);
        }

        return days;
    }

    private getDayClassName(day: Date): string {
        let className = 'day';

        if (DateUtilities.isSameDay(day, new Date())) {
            className += ' today';
        }

        if (this.props.month !== day.getMonth()) {
            className += ' other-month';
        }

        if (this.props.selected && DateUtilities.isSameDay(day, this.props.selected)) {
            className += ' selected';
        }

        if (this.isDisabled(day)) {
            className += ' disabled';
        }

        return className;
    }

    private onSelect(day: Date) {
        if (!this.isDisabled(day)) {
            this.props.onSelect(day);
        }
    }

    private isDisabled(day: Date): boolean {
        let minDate = this.props.minDate;
        let maxDate = this.props.maxDate;

        let isBefore: boolean = minDate ? DateUtilities.isBefore(day, minDate) : false;
        let isAfter: boolean = maxDate ? DateUtilities.isAfter(day, maxDate) : false;

        return isBefore || isAfter;
    }
}

class DateUtilities {
    public static pad(value: string, length: number): string {
        while (value.length < length) {
            value = '0' + value;
        }

        return value;
    }

    public static clone(date: Date): Date {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
    }

    public static toString(date: Date): string {
        // Month gets increased by 1 because the date start counting the month at 0 (jan = 0, ..., dez = 11).
        return this.pad(date.getDate().toString(), 2) + '.' + this.pad((date.getMonth() + 1).toString(), 2) + '.' + date.getFullYear();
    }

    public static toDayOfMonthString(date: Date): string {
        return this.pad(date.getDate().toString(), 0);
    }

    public static toMonthAndYearString(date: Date): string {
        let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        let monthName = Language.getString('MONTH_' + months[date.getMonth()].toUpperCase());

        return monthName + ' ' + date.getFullYear();
    }

    public static moveToDayOfWeek(date: Date, dayOfWeek: number): Date {
        while (date.getDay() !== dayOfWeek) {
            date.setDate(date.getDate() - 1);
        }

        return date;
    }

    public static isSameDay(first: Date, second: Date): boolean {
        return (
            first.getFullYear() === second.getFullYear() &&
            first.getMonth() === second.getMonth() &&
            first.getDate() === second.getDate()
        );
    }

    public static isBefore(first: Date, second: Date): boolean {
        return first.getTime() < second.getTime();
    }

    public static isAfter(first: Date, second: Date): boolean {
        return first.getTime() > second.getTime();
    }

}
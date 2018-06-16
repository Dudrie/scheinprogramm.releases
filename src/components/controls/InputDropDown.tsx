import * as React from 'react';
import { CSSProperties, FormEvent } from 'react';

interface Props<T extends HasName> {
    id: string;
    placeholder: string;
    /** Function which is used to sort the items in the DropDown */
    sortFunction?: (a: T, b: T) => number;
    items?: T[];
    showBelow?: boolean;
    disabled?: boolean;
    parent?: HTMLElement | null | undefined;
    selected?: T | null;
    onSelectionChanged?: (oldSel: T | null, newSel: T | null) => void;
    mustSelect?: boolean;
    style?: CSSProperties;
    /** If provided, the width of the DropDown will be this. If not, some default values are used. */
    dropDownWidth?: number;
    /** Works ONLY, if shown below! If provided, the left offset of the DropDown will be this. If not, some default values are used. */
    customLeftOffset?: number;
}

interface State<T extends HasName> {
    dropDown: JSX.Element | null;
    filterText: string;
    selected: T | null;
}

export interface HasName {
    getName: () => string;
}

// FIXME: Wenn das DropDown rechts angezeigt wird, ist es trotzdem so breit wie der Input+Button.
//          -> Ragt dann evtl. aus dem Fenster raus.
//          -> Sieht dämlich aus.
//          -> Fixe Größe oder den Abstand zum rechten Rand nutzen?
// TODO: Blur on Escape-Press?
export class InputDropDown<T extends HasName> extends React.Component<Props<T>, State<T>> {
    private parent!: HTMLElement;
    private input!: HTMLInputElement;
    private timerShowDropDown!: NodeJS.Timer;
    private timerBlur: NodeJS.Timer | null = null;
    private heightItem: number = 35;
    private minNumItems: number = 5;
    private lastOffset: number = 0;
    private padding: number = 7;
    private isMounting: boolean;
    private mounted: boolean;

    /** If provided, the width of the DropDown will be this. If not, some default values are used. */
    private dropDownWidth: number | undefined;

    /** Works ONLY, if shown below! If provided, the left offset of the DropDown will be this. If not, some default values are used. */
    private customLeftOffset: number | undefined;

    constructor(props: Props<T>) {
        super(props);

        if (this.props.mustSelect && !this.props.selected) {
            throw new Error('[ERROR] InputDropDown -- If a skill has to be selected it is important that you provide a selected skill within the props.');
        }

        this.state = {
            dropDown: null,
            filterText: '',
            selected: null
        };

        this.isMounting = false;
        this.mounted = false;

        this.dropDownWidth = this.props.dropDownWidth;
        this.customLeftOffset = this.props.customLeftOffset;

        this.setRefForInput = this.setRefForInput.bind(this);
        this.onBlur = this.onBlur.bind(this);
        this.onFocus = this.onFocus.bind(this);
        this.onButtonClicked = this.onButtonClicked.bind(this);
        this.onItemClicked = this.onItemClicked.bind(this);
        this.onScroll = this.onScroll.bind(this);
        this.onInputFocus = this.onInputFocus.bind(this);
        this.onInputClicked = this.onInputClicked.bind(this);
        this.onWindowResize = this.onWindowResize.bind(this);
        this.onInputValueChanged = this.onInputValueChanged.bind(this);
    }

    componentDidMount() {
        this.mounted = true;

        // If we got a parent in the props take that one. If not, search for one.
        if (this.props.parent) {
            this.parent = this.props.parent;

        } else {
            let div: HTMLElement | null = document.getElementById(this.props.id);
            let ourHeight = 0;
            let offsetTop = 0;

            if (div) {
                // Only add our height to the min height if the dropdown should be shown below.
                ourHeight = this.props.showBelow ? div.clientHeight : 0;
                offsetTop = div.offsetTop + ourHeight + 1;
            }

            let minHeight: number = this.minNumItems * this.heightItem + ourHeight;
            let p: HTMLElement | null = null;

            // Search for an element which height is greate than the minimum height needed for the dropdown.
            while (div !== null) {
                let scrollOffsetY = div.scrollTop;
                let maxHeightToBottom = div.clientHeight + div.offsetTop - scrollOffsetY - offsetTop - this.padding;
                let maxHeightToTop = offsetTop - scrollOffsetY - div.offsetTop - this.padding;
                let offsetDif = offsetTop - div.offsetTop;

                if (maxHeightToBottom >= minHeight || maxHeightToTop >= minHeight) {
                    p = div;
                    break;
                }

                div = div.parentElement;
            }

            if (p === null) {
                throw new Error('[ERROR] InputDropDown::onReference -- Could not get a valid parent for this component.');
            }

            // We found one BUT it could be that this one is in a scrollable div. So search, if a parent is scrollable
            div = p;
            let isOverflowing: boolean = false;

            while (div !== null) {
                isOverflowing = false;
                if (div.style.overflow !== 'hidden' && div.clientHeight < div.scrollHeight) {
                    // The element is scrollable AND has content hight than it's height.
                    p = div;
                    break;
                }

                div = div.parentElement;
            }

            this.parent = p;
        }

        this.parent.addEventListener('scroll', this.throttle(this.onScroll, 300));
        window.addEventListener('resize', this.onWindowResize);

        if (this.props.selected) {
            this.isMounting = true;
            this.selectItem(this.props.selected);
            this.isMounting = false;
        }
    }

    componentWillUnmount() {
        this.mounted = false;

        this.parent.removeEventListener('scroll', this.onScroll);
        window.removeEventListener('resize', this.onWindowResize);

        if (this.timerBlur) {
            clearTimeout(this.timerBlur);
        }

        if (this.timerShowDropDown) {
            clearTimeout(this.timerShowDropDown);
        }
    }

    componentWillReceiveProps(nextProps: Props<T>, _: any) {
        if (nextProps.items) {
            if (nextProps.items !== this.props.items) {
                // The list of items got updated, so reset the selection
                this.selectItem(null);
            }
        }
    }

    render() {
        return (
            <div id={this.props.id} className='input-drop-down' onBlur={this.onBlur} onFocus={this.onFocus} style={this.props.style}>
                <input
                    ref={this.setRefForInput}
                    disabled={this.props.disabled}
                    placeholder={this.props.placeholder}
                    onFocus={this.onInputFocus}
                    onClick={this.onInputClicked}
                    onChange={this.onInputValueChanged}
                    style={{ minWidth: '0px' }}
                />

                <button disabled={this.props.disabled} onClick={this.onButtonClicked}>
                    <i className='far fa-angle-down'></i>
                </button>
                {this.state.dropDown}
            </div>
        );
    }

    /**
     * Sets a reference to the input node so we can use it later.
     * @param node Input node
     */
    private setRefForInput(node: HTMLInputElement | null) {
        if (node === null) {
            // The ref for the element got 'destroyed'.
            return;
        }

        this.input = node;
    }

    /**
     * Gets called if we (or one of our children) gets the focus.
     */
    private onFocus() {
        if (this.timerBlur) {
            clearTimeout(this.timerBlur);
            this.timerBlur = null;
            return; // Just in case there's additional code.
        }
    }

    /**
     * Gets called if we (or one of our children) loses the focus.
     */
    private onBlur() {
        // Wait a small moment to check, if we really lost focus or if the focus just switched between our children.
        this.timerBlur = setTimeout(() => {
            if (this.mounted) {
                this.hideDropDown();
            }

            this.timerBlur = null;
        }, 250);
    }

    /**
     * Shows the DropDown list if there are items available as props. Additionally it sorts the items shown by the input in the input field.
     */
    private showDropDown(filterText?: string): void {
        // Check if we have any items to show. If not, abort.
        if (!this.props.items || this.props.items.length === 0) {
            console.error('InputDropDown -- No items available for this InputDropDown (placeholder: ' + this.props.placeholder + ').');
            return;
        }

        // Calculate the position and the width of the element
        let div: HTMLElement | null = document.getElementById(this.props.id);

        if (div === null) {
            // We do not exist anymore, so abort.
            console.log('[WARNING] InputDropDown::showDropDown -- Our div could not be found.');
            return;
        }

        let scrollOffset = {
            x: this.parent.scrollLeft,
            y: this.parent.scrollTop
        };

        let top: number;
        let left: number;

        if (this.props.showBelow) {
            // Show below
            top = div.offsetTop + div.clientHeight + 1;
            left = this.customLeftOffset ? this.customLeftOffset : div.offsetLeft;

        } else {
            // Show on the side
            top = div.offsetTop;
            left = div.offsetLeft + div.clientWidth + 5;
        }

        // Subtract the scroll offset, so we get positioned correctly.
        top -= scrollOffset.y;
        left -= scrollOffset.x;

        // let padding = 7;
        let width = this.dropDownWidth ? this.dropDownWidth : div.clientWidth;
        let height = 2; // A little offset so you don't have to scroll if the box is smaller than the max height.
        let maxHeight = this.parent.clientHeight + this.parent.offsetTop - top - this.padding;
        let showAbove = false;

        if (maxHeight <= this.minNumItems * this.heightItem) {
            // Not enough place to open towards the bottom of the window. So move up.
            // First, adjust the max height
            maxHeight = div.offsetTop - scrollOffset.y - this.parent.offsetTop - this.padding;

            // Get the new top position
            if (this.props.showBelow) {
                top = div.offsetTop - scrollOffset.y - maxHeight - 2;

            } else {
                top = div.offsetTop - scrollOffset.y - maxHeight + div.clientHeight;
            }

            showAbove = true;
        }

        let filter: string;

        if (filterText || filterText === '') {
            filter = filterText.trim().toLowerCase();
        } else {
            filter = this.state.filterText.toLowerCase();
        }

        let jsxItems: JSX.Element[] = [];
        let items = this.props.items.filter((s) => s.getName().toLowerCase().indexOf(filter) !== -1);

        if (items.length === 0) {
            this.setState({ dropDown: null });
            return;
        }

        let sortFunction: (a: T, b: T) => number;

        if (this.props.sortFunction) {
            sortFunction = this.props.sortFunction;

        } else {
            // If no sort function is provided in the props (most of the time there won't be one) it defaults to sorting the items alphatically.
            sortFunction = (a, b) => {
                let aName = a.getName().toLowerCase();
                let bName = b.getName().toLowerCase();
                let n = 0;

                // Check if one (and only one) of the two names starts with the filter
                if (aName.startsWith(filter) && !bName.startsWith(filter)) {
                    return -2;
                } else if (bName.startsWith(filter) && !aName.startsWith(filter)) {
                    return 2;
                }

                // Either both start with the filter or both don't.
                if (aName.startsWith(filter) && bName.startsWith(filter)) {
                    n += 3;
                }

                // Check which one is 'smaller'.
                if (aName.localeCompare(bName) < 0) {
                    n = (-1) * (n + 1);
                } else {
                    n = n + 1;
                }

                return n;
            };
        }

        items.sort(sortFunction);

        let isBorderDrawn: boolean = false;

        items.forEach((skill, idx) => {
            let name = skill.getName();
            let idxFilter = name.toLowerCase().indexOf(filter);
            let style: CSSProperties = {
                height: this.heightItem
            };

            if (name.toLowerCase().startsWith(filter) && !isBorderDrawn && idx < items.length - 1) {
                // We have at least one more item after us, check if it starts with the filter. If not, draw a small line beneath us.
                if (!items[idx + 1].getName().toLowerCase().startsWith(filter)) {
                    style.borderBottomWidth = '2px';
                    isBorderDrawn = true;
                }
            }

            let a: string = name.substring(0, idxFilter);
            let b: string = name.substring(idxFilter, idxFilter + filter.length);
            let c: string = name.substring(idxFilter + filter.length);

            jsxItems.push(
                <div
                    className='drop-down-item'
                    style={style}
                    onClick={() => this.onItemClicked(skill)}
                    key={name}>

                    {/* The additional span is needed so react does NOT delete whitespace at the begin/end of 'b' - without the additional span the span containing b counts as 'new line' in the generated HTML code and therefore react will remove leading and trailing whitespace. */}
                    <span>
                        {a}<span className='filter-highlight'>{b}</span>{c}
                    </span>

                </div>
            );
            height += this.heightItem;
        });

        if (height > maxHeight) {
            height = maxHeight;
        } else if (showAbove && height < maxHeight) {
            // Make sure, that the drop down menu is shown at the right place if it is shown above and does not take up the full height.
            top += (maxHeight - height);
        }

        this.setState({
            dropDown: (
                <div className='drop-down-box' style={{ top, left, width, height }}>
                    {jsxItems}
                </div>
            ),
            filterText: filter
        });
    }

    /**
     * Hides the dropDown and makes sure that the timer is cleared if it's not already passed.
     */
    private hideDropDown() {
        if (this.input.value === '') {
            this.selectItem(null);

        } else if (this.state.selected) {
            if (this.input.value !== this.state.selected.getName()) {
                this.input.value = this.state.selected.getName();
                this.setState({ filterText: '' });
            }
        } else {
            // There's something in the input field but no skill is selected, so clear the input field
            this.input.value = '';
            this.setState({ filterText: '' });
        }

        // Destroy the timers
        if (this.timerShowDropDown) {
            clearTimeout(this.timerShowDropDown);
        }

        // Hide the dropDown
        if (this.state.dropDown) {
            this.setState({ dropDown: null });
        }
    }

    /**
     * If the button gets clicked, show the drop down.
     */
    private onButtonClicked() {
        if (!this.state.dropDown) {
            this.showDropDown();
        }
    }

    /**
     * If the user clicked on an item in the list, select it.
     * @param item Item the user clicked on
     */
    private onItemClicked(item: T) {
        this.selectItem(item);
    }

    /**
     * Makes adjustments according to the selected skill. If no skill should be selected or if the selection should be cleared 'item' should be null.
     * @param item Skill to select, null if no skill should be selected
     */
    private selectItem(item: T | null) {
        if (item) {
            this.input.value = item.getName();

        } else if (this.props.mustSelect) {
            // 'Reselect' the previously selected skill if possible, because we have to select a skill and the caller of the method wants to select no skill.
            if (this.state.selected) {
                this.input.value = this.state.selected.getName();
                item = this.state.selected;

            } else {
                throw new Error('[ERROR] InputDropDown::selectSkill -- Could not select the previously selected skill because there was no skill selected earlier.');
            }
        } else {
            this.input.value = '';
        }

        if (this.props.onSelectionChanged && !this.isMounting && item !== this.state.selected) {
            this.props.onSelectionChanged(this.state.selected, item);
        }

        this.setState({
            selected: item,
            dropDown: null,
            filterText: ''
        });
    }

    /**
     * If there's a scroll event in our parent this gets called and we will hide the drop down box.
     * @param _ UIEvent related to the scroll (Not used)
     */
    private onScroll() {
        let offset = this.parent.scrollTop;

        // Make sure, the event was a 'real' scroll event. That means that the component actually got scrolled.
        if (offset !== this.lastOffset) {
            if (this.state.dropDown) {
                this.setState({ dropDown: null });
            }

            this.lastOffset = offset;
        }
    }

    private throttle(fn: Function, wait: number) {
        let time = Date.now();

        return () => {
            if ((time + wait - Date.now()) < 0) {
                fn();
                time = Date.now();
            }
        };
    }

    /**
     * If the input element gets the focus highlight all the text.
     * @param e FocusEvent
     */
    private onInputFocus() {
        this.input.selectionStart = 0;
        this.input.selectionEnd = this.input.value.length;

        this.onInputClicked();
    }

    /**
     * If we don't show a dropDown show it (with a small delay).
     */
    private onInputClicked() {
        this.timerShowDropDown = setTimeout(() => {
            if (this.state.dropDown === null) {
                this.showDropDown();
            }
        }, 200);
    }

    /**
     * Gets called if the text in the input element changes.
     * @param e FormEvent created by the InputElement
     */
    private onInputValueChanged(_: FormEvent<HTMLInputElement>) {
        // let input = e.target as HTMLInputElement;
        let value = this.input.value;

        this.showDropDown(value);
    }

    /**
     * Adjusts the DropDown if the window gets resized.
     */
    private onWindowResize() {
        // If we show a drop down, create it again, so it matches the new size of the window
        // and gets a new, correct position.
        if (this.state.dropDown) {
            this.setState({ dropDown: null });
            this.showDropDown();
        }
    }

    public clearSelection() {
        this.selectItem(null);
    }

    public setDropDownWidth(width: number) {
        this.dropDownWidth = width;
    }

    public setCustomLeftOffset(offset: number) {
        this.customLeftOffset = offset;
    }
}
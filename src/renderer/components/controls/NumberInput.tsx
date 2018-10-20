import { createStyles, Grid, TextField, Theme, WithStyles, withStyles } from '@material-ui/core';
import { StandardTextFieldProps } from '@material-ui/core/TextField';
import * as React from 'react';
import { ChangeEvent, FocusEvent } from 'react';
import { SquareButton } from './SquareButton';
import { GridProps } from '@material-ui/core/Grid';

const style = (_: Theme) => createStyles({
    inputType: {
        height: 'inherit',
    }
});

interface Props extends StandardTextFieldProps {
    minValue?: number;
    maxValue?: number;
    showButtons?: boolean;
    modifiedStepSize?: number;
    onValueChanged?: (oldValue: number, newValue: number) => void;
    gridContainerProps?: GridProps;
    usesDezimal?: boolean;
}

interface State {
    value: number;
    emptyInput: boolean;
    step: number;
}

type PropType = Props & WithStyles<typeof style>;

class NumberInputClass extends React.Component<PropType, State> {
    private readonly INPUT_HEIGHT: number = 25;
    private minValue: number;
    private maxValue: number;

    constructor(props: PropType) {
        super(props);

        let initValue = 0;

        if (this.props.defaultValue) {
            // Check, if it's a number (convert it to a string first, to eliminate the edge case of it being already a number)
            let s: string = this.props.defaultValue + '';

            if (!Number.isNaN(Number.parseInt(s))) {
                initValue = Number.parseInt(s);
            }
        }

        if (this.props.value) {
            let s: string = this.props.value + '';

            if (!Number.isNaN(Number.parseInt(s))) {
                initValue = Number.parseInt(s);
            }
        }

        this.state = {
            value: initValue,
            emptyInput: false,
            step: (this.props.usesDezimal) ? 0.1 : 1
        };

        this.minValue = this.props.minValue ? this.props.minValue : 0;
        this.maxValue = this.props.maxValue ? this.props.maxValue : Number.MAX_SAFE_INTEGER;
    }

    componentWillReceiveProps(nextProps: Props, _nextContext: any) {
        if (nextProps.minValue !== undefined) {
            this.minValue = nextProps.minValue;
        }

        if (nextProps.maxValue !== undefined) {
            this.maxValue = nextProps.maxValue;
        }
    }

    render() {
        let { value, minValue, maxValue, showButtons, onValueChanged, disabled, defaultValue, classes, helperText, modifiedStepSize, InputProps, gridContainerProps, usesDezimal, ...other } = this.props;
        let btnWidth: number = showButtons ? this.INPUT_HEIGHT : 0;

        let disablePlus: boolean = this.state.value >= this.maxValue;
        let disableMinus: boolean = this.state.value <= this.minValue;

        value = (this.props.value !== undefined) ? this.props.value : this.state.value + '';
        if (this.state.emptyInput) {
            value = '';
        }

        // Add provided InputProps to the locally used ones.
        let localInputProps = Object.assign({
            classes: {
                inputType: classes.inputType
            }
        }, InputProps);

        return (
            <Grid
                container
                direction='row'
                wrap='nowrap'
                alignContent='flex-end'
                alignItems={helperText ? 'center' : 'flex-end'}
                justify='flex-end'
                spacing={8}
                {...gridContainerProps}
            >
                {showButtons &&
                    <Grid item>
                        <SquareButton
                            style={{
                                width: btnWidth + 'px',
                                height: btnWidth + 'px',
                                padding: '0'
                            }}
                            onClick={this.onMinusClicked}
                            disabled={disabled || disableMinus}
                            variant='contained'
                            tabIndex={-1}
                        >
                            -
                        </SquareButton>
                    </Grid>
                }
                <Grid item xs >
                    <TextField
                        value={value}
                        disabled={disabled}
                        onFocus={this.onFocus}
                        onChange={this.onInputChange}
                        onBlur={this.onBlur}
                        InputProps={localInputProps}
                        helperText={helperText}
                        onWheel={this.onWheel}
                        onKeyDown={this.onKeyDown}
                        fullWidth
                        type='number'
                        {...other}
                    />
                </Grid>
                {showButtons &&
                    <Grid item>
                        <SquareButton
                            style={{
                                width: btnWidth + 'px',
                                height: btnWidth + 'px',
                                padding: '0'
                            }}
                            onClick={this.onPlusClicked}
                            disabled={disabled || disablePlus}
                            variant='contained'
                            tabIndex={-1}
                        >
                            +
                        </SquareButton>
                    </Grid>
                }
            </Grid>
        );
    }

    /**
     * Sets the value of the input field. Makes sure, it's between 0 and the maxValue. If there is a onValueChanged listener in the Props it gets called with the old and the new value.
     * @param value New value
     */
    public setValue(value: number) {
        value = Math.round(value * 10) / 10;

        if (value > this.maxValue) {
            value = this.maxValue;
        } else if (value < this.minValue) {
            value = this.minValue;
        }

        this.setState({
            value,
            emptyInput: false
        });

        // If the value has changed and we have a listener call that listener
        if (value !== this.state.value && this.props.onValueChanged) {
            this.props.onValueChanged(this.state.value, value);
        }
    }

    // public getValue(): number {
    //     return this.state.value;
    // }

    /**
     * Increases the value of this input by the given amout.
     * @param by Amount by which we want to increase the value
     */
    public increase(by: number) {
        let value = this.state.emptyInput ? 0 : this.state.value;

        this.setValue(value + by);
    }

    /**
     * Decreases the value of this input by the given amout.
     * @param by Amount by which we want to decrease the value
     */
    public decrease(by: number) {
        let value = this.state.emptyInput ? 0 : this.state.value;

        this.setValue(value - by);
    }

    private getStep(ctrlKey: boolean, shiftKey: boolean): number {
        // Determine the amount the number should increase/decrease. It can be modified by pressing shift (to set it to 1 - only important if the input uses decimal numbers) or ctrl to set it to the given modifiedStepSize (default: 10).
        let step: number = this.state.step;

        if (shiftKey) {
            step = 1;
        }

        if (ctrlKey) {
            step = this.props.modifiedStepSize ? this.props.modifiedStepSize : 10;
        }

        return step;
    }

    /**
     * Gets called if the input's value gets changed.
     * @param event Reference to the event
     */
    private onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        let el: HTMLInputElement = event.target as HTMLInputElement;
        let input = el.value;

        if (input == '') {
            this.setState({ emptyInput: true });
            return;
        }

        if (input.startsWith('-')) {
            return;
        }

        if (input.includes('.')) {
            let split = input.split('.');
            let decimal: string = split[1];
            decimal = decimal.substring(0, 1);

            input = split[0] + '.' + decimal;
        }

        // Remove leading zeros.
        while (input.length > 1 && input.startsWith('0')) {
            input = input.substring(1);
        }
        el.value = input;

        let value: number = Number.parseFloat(input);

        if (Number.isNaN(value) || value + '' != input) {
            return;
        }

        this.setValue(value);
    }

    /**
     * Gets called if the input field loses the focus. At the end this will call the onBlur listener of the given Props if available.
     * @param event Reference to the event
     */
    private onBlur = (event: FocusEvent<HTMLInputElement>) => {
        let value = (event.target as HTMLInputElement).value;

        if (value === '') {
            // If we leave the input without typing something in, go back to the previous value
            this.setValue(this.state.value);
        }

        // Call the onBlur event of the props, if available
        if (this.props.onBlur) {
            this.props.onBlur(event);
        }
    }

    /**
     * Gets called if the input field gets focused. Will select all the text currently in the input. At the end this will call the onFocus listener of the given Props if available.
     * @param event: Reference to the event.
     */
    private onFocus = (event: FocusEvent<HTMLInputElement>) => {
        if (this.props.onFocus) {
            this.props.onFocus(event);
        }
    }

    private onWheel = (event: React.WheelEvent<HTMLDivElement>) => {
        // Prevent the brower's default event in the number input, so the wheel-event does NOT get evaluated 'twice' if the input is focused while the user scrolls in it.
        event.preventDefault();

        if (this.props.disabled) {
            return;
        }

        let step: number = this.getStep(event.ctrlKey, event.shiftKey);

        if (event.deltaY < 0) {
            // User scrolled towards the TOP side
            this.increase(step);
        } else if (event.deltaY > 0) {
            // User scrolled towards the BOTTOM side
            this.decrease(step);
        }
    }

    private onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        // 38: Arrow up, 40: Arrow down
        if (event.keyCode !== 38 && event.keyCode !== 40) {
            return;
        }

        event.preventDefault();

        let step: number = this.getStep(event.ctrlKey, event.shiftKey);

        if (event.keyCode === 38) {
            this.increase(step);

        } else if (event.keyCode === 40) {
            this.decrease(step);
        }
    }

    /**
     * Gets called if the plus button gets clicked.
     */
    private onPlusClicked = () => {
        this.increase(this.state.step);
    }

    /**
     * Gets called if the minus button gets clicked.
     */
    private onMinusClicked = () => {
        this.decrease(this.state.step);
    }
}

/**
 * React component which is an HTMLInputElement which only allows positive numbers. Will call a listener (if present) if the value changes.
 */
export const NumberInput = withStyles(style)(NumberInputClass);
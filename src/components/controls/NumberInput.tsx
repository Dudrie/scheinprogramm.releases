import { TextFieldProps } from '@material-ui/core/TextField';
import * as React from 'react';
import { FocusEvent, SyntheticEvent } from 'react';
import { SquareButton } from './SquareButton';
import { GridSpacing } from '@material-ui/core/Grid';
import { Grid, TextField } from '@material-ui/core';

interface Props extends TextFieldProps {
    minValue?: number;
    maxValue?: number;
    showButtons?: boolean;
    onValueChanged?: (oldValue: number, newValue: number) => void;
}

interface State {
    value: number;
    emptyInput: boolean;
}

// TODO: Blur on Escape-Press?
/**
 * React component which is an HTMLInputElement which only allows positive numbers. Will call a listener (if present) if the value changes.
 */
export class NumberInput extends React.Component<Props, State> {
    private minValue: number;
    private maxValue: number;

    constructor(props: Props) {
        super(props);

        let initValue = 0;

        if (this.props.defaultValue) {
            // Check, if it's a number (convert it to a string first, to eliminate the edge case of it being already a number)
            let s: string = this.props.defaultValue + '';

            if (!Number.isNaN(Number.parseInt(s))) {
                initValue = Number.parseInt(s);
            }
        }

        this.state = {
            value: initValue,
            emptyInput: false
        };

        this.minValue = this.props.minValue ? this.props.minValue : 0;
        this.maxValue = this.props.maxValue ? this.props.maxValue : 999;

        this.onInputChange = this.onInputChange.bind(this);
        this.onFocus = this.onFocus.bind(this);
        this.onBlur = this.onBlur.bind(this);
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
        let { value, minValue, maxValue, showButtons, onValueChanged, disabled, defaultValue, style, ...other } = this.props;
        let btnWidth: number = showButtons ? 25 : 0;
        let spacing: GridSpacing = showButtons ? 8 : 0;

        let disablePlus: boolean = this.state.value >= this.maxValue;
        let disableMinus: boolean = this.state.value <= this.minValue;

        value = this.state.emptyInput ? '' : this.state.value + '';

        return (
            <Grid
                container
                direction='row'
                wrap='nowrap'
                alignContent='flex-end'
                alignItems='flex-end'
                justify='flex-end'
                spacing={spacing}
            >
                {showButtons &&
                    <Grid item>
                        <SquareButton
                            style={{
                                width: btnWidth + 'px',
                                height: btnWidth + 'px',
                                padding: '0'
                            }}
                            onClick={this.onMinusClicked.bind(this)}
                            disabled={disabled || disableMinus}
                            variant='raised'
                        >
                            -
                        </SquareButton>
                    </Grid>
                }
                <Grid item style={{ width: 'calc(100% - 2 * ' + btnWidth + 'px - 2 * ' + spacing + 'px' }}>
                    <TextField
                        value={value}
                        disabled={disabled}
                        onFocus={this.onFocus}
                        onChange={this.onInputChange}
                        onBlur={this.onBlur}
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
                            onClick={this.onPlusClicked.bind(this)}
                            disabled={disabled || disablePlus}
                            variant='raised'
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

    public getValue(): number {
        return this.state.value;
    }

    /**
     * Gets called if the input's value gets changed.
     * @param event Reference to the event
     */
    private onInputChange(event: SyntheticEvent<HTMLInputElement>) {
        let input = (event.target as HTMLInputElement).value;

        if (input.startsWith('-')) {
            return;
        }
        
        if (input === '') {
            this.setState({ emptyInput: true });
            return;
        }

        let value: number;

        value = Number.parseInt(input);

        if (Number.isNaN(value) || value + '' !== input) {
            return;
        }

        this.setValue(value);
    }

    /**
     * Gets called if the input field loses the focus. At the end this will call the onBlur listener of the given Props if available.
     * @param event Reference to the event
     */
    private onBlur(event: FocusEvent<HTMLInputElement>) {
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
    private onFocus(event: FocusEvent<HTMLInputElement>) {
        if (this.props.onFocus) {
            this.props.onFocus(event);
        }
    }

    /**
     * Gets called if the plus button gets clicked.
     */
    private onPlusClicked() {
        this.increase(1);
    }

    /**
     * Gets called if the minus button gets clicked.
     */
    private onMinusClicked() {
        this.decrease(1);
    }

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
}
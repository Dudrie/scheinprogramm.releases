import { PropTypes, Tooltip } from '@material-ui/core';
import { ButtonProps } from '@material-ui/core/Button';
import * as React from 'react';
import { SquareButton } from './SquareButton';

interface Props extends ButtonProps {
    /** Element to show in the tooltip. */
    tooltipElement: React.ReactNode;

    /**
     * Callback which is called on the second click. Will receive the click event.
     * @param event Click event of the second click.
     * */
    onAcceptClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

interface State {
    /** Was the button clicked before? */
    clicked: boolean;
    /** Last time the user clicked the button. Used to prevent accidental double clicks. */
    lastClickTime: number;
}

/**
 * Special SquareButton which needs two (2) clicks to accept a user's action.
 *
 * - The **first click** will change the color of the button to the '_secondary_' color of the theme (default: red) and will display a tooltip (from _material-ui_).
 * - The **second click** (if it occurs 'in time') will accept the action.
 *
 * ButtonProperties will be passed down to the SquareButton but the color propertiy will get overriden to provide a feedback to the user after clicking once.
 *
 * **It is NOT recommended to set _color_ to '_secondary_' because this is the color used as a feedback to the first click!**.
 *
 * @author Sascha Skowronnek
 */
export class DeleteButton extends React.Component<Props, State> {
    /** Time until the state resets after the first click (in ms). */
    private readonly RESET_TIME: number = 2000;
    /** Minimum number of ms between two clicks without ignoring the second one (used to prevent accidental double clicks). */
    private readonly TIME_BETWEEN_CLICKS: number = 250;
    private timerButtonClicked: NodeJS.Timer | undefined;

    constructor(props: Props) {
        super(props);

        this.state = {
            clicked: false,
            lastClickTime: 0
        };

        this.onClick = this.onClick.bind(this);
    }

    componentWillUnmount() {
        // Clear the timer on unmount if there is any.
        if (this.timerButtonClicked) {
            clearTimeout(this.timerButtonClicked);
        }
    }

    render() {
        let defaultColor: PropTypes.Color = this.props.color ? this.props.color : 'default';
        let color: PropTypes.Color = this.state.clicked ? 'secondary' : defaultColor;
        let { onAcceptClick, tooltipElement, ...other } = this.props;

        return (
            <Tooltip
                title={tooltipElement}
                open={this.state.clicked}
                placement='top'
            >
                <SquareButton
                    color={color}
                    onClick={this.onClick}
                    {...other}
                >
                    {this.props.children}
                </SquareButton>
            </Tooltip>
        );
    }

    /**
     * Will get called if the button is clicked. Will take action corresponding to the 'state' of the button (ie. was it clicked shortly before?).
     *
     * @param ev Click event (will be passed to the listener if it's the 2nd click)
     */
    private onClick(ev: React.MouseEvent<HTMLButtonElement>) {
        let clickTime: number = Date.now();

        // Prevent clicked twice accidentally
        if (clickTime - this.state.lastClickTime < this.TIME_BETWEEN_CLICKS) {
            return;
        }

        // Clear timer if there is one.
        if (this.timerButtonClicked) {
            clearTimeout(this.timerButtonClicked);
        }

        if (this.state.clicked) {
            // If it is clicked AFTER it was already clicked once, user accepts the action.
            if (this.props.onAcceptClick) {
                this.props.onAcceptClick(ev);
            }

            this.setState({
                clicked: false
            });
        } else {
            // If not clicked, color the button.
            this.setState({
                clicked: true,
                lastClickTime: clickTime
            });

            // Initialize a timeout if the user takes to long to click again.
            this.timerButtonClicked = setTimeout(
                () => {
                    this.timerButtonClicked = undefined;
                    this.setState({ clicked: false });
                },
                this.RESET_TIME
            );

        }
    }
}
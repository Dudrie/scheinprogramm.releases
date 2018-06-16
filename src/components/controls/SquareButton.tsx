import * as React from 'react';
import { ButtonProps } from '@material-ui/core/Button';
import Button from '@material-ui/core/Button/Button';
import { Tooltip } from '@material-ui/core';

interface Props extends ButtonProps {
    tooltip?: React.ReactNode;
}

/**
 * Special button which uses the button from the _material-ui_ package. The button will be displayed as a **square** with a default size of 40px (each direction).
 *
 * All properties will be passed down to the underlying button. Styles given via the _style_-property will **override** the style of the SquareButton (this could be a way to change the size of the button).
 *
 * @author Sascha Skowronnek
 */
export class SquareButton extends React.Component<Props, object> {
    private buttonStyle: React.CSSProperties = {
        borderRadius: '0',
        minWidth: '0',
        width: '40px',
        minHeight: '0',
        height: '40px',
        fontSize: '1em'
    };

    render() {
        let { style, children, ...other } = this.props;
        // Copy the style-object
        let btnStyle = Object.assign({}, this.buttonStyle);
        // Assign any given style from the props.
        Object.assign(btnStyle, style);

        let button = (
            <Button style={btnStyle} {...other} >
                {children}
            </Button>
        );

        if (this.props.tooltip) {
            return (
                <Tooltip
                    title={this.props.tooltip}
                >
                    {button}
                </Tooltip>
            );
        }

        return button;
    }
}
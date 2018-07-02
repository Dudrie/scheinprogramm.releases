import * as React from 'react';
import { InfoBar } from './InfoBar';
import { SquareButton } from '../controls/SquareButton';
import { PaperProps } from '@material-ui/core/Paper';
import { ButtonProps } from '@material-ui/core/Button';
import { PropTypes } from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface Props extends PaperProps {
    /**
     * Function which gets called if the create-button gets clicked.
     */
    onCreateClicked: () => void;

    /**
     * Variant of the create-button. If not provided it defaults to 'raised'.
     */
    variant?: ButtonProps['variant'];

    /**
     * Color of the create-button. If not provided it defaults to 'primary'.
     */
    color?: PropTypes.Color;
}

/**
 * InfoBar which displays a create-button. Used for unifing the experience with the bars for creation.
 */
export class CreateBar extends React.Component<Props, object> {
    render() {
        let { children, onCreateClicked, variant, color, ...other } = this.props;

        return (
            <InfoBar
                style={{ cursor: 'pointer' }}
                onClick={onCreateClicked}
                addButtons={[
                    <SquareButton
                        color={color ? color : 'primary'}
                        onClick={onCreateClicked}
                        variant={variant ? variant : 'raised'}
                    >
                        <FontAwesomeIcon icon={{ prefix: 'far', iconName: 'plus' }} />
                    </SquareButton>
                ]}
                hideInfoButton
                elevation={8}
                {...other}
            >
                {children}
            </InfoBar>
        );
    }
}
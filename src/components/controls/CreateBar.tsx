import * as React from 'react';
import { InfoBar } from './InfoBar';
import { SquareButton } from './SquareButton';
import { PaperProps } from '@material-ui/core/Paper';
import { ButtonProps } from '@material-ui/core/Button';

interface Props extends PaperProps {
    /**
     * Function which gets called if the create-button gets clicked.
     */
    onCreateClicked: () => void;

    /**
     * Variant of the create-button. If not provided it defaults to 'raised'.
     */
    variant?: ButtonProps['variant'];
}

/**
 * InfoBar which displays a create-button. Used for unifing the experience with the bars for creation.
 */
export class CreateBar extends React.Component<Props, object> {
    render() {
        let {children, onCreateClicked, variant, ...other} = this.props;

        if (!variant) {
            variant = 'raised';
        }

        return (
            <InfoBar
                addButtons={[
                    <SquareButton
                        color='primary'
                        onClick={onCreateClicked}
                        variant={variant}
                    >
                        <i className='far fa-plus'></i>
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
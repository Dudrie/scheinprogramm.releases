import { createStyles, Omit, Theme, WithStyles, withStyles } from '@material-ui/core';
import * as React from 'react';
import { SystemBoxBase, SystemBoxBaseProps } from './SystemBoxBase';

const style = (theme: Theme) => createStyles({
    content: {
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid purple'
    }
});

interface Props extends Omit<SystemBoxBaseProps, 'children' | 'classes'>, WithStyles<typeof style> {

}

interface State {

}

class SystemSheetPercentageBoxClass extends React.Component<Props, State> {
    render() {
        let { classes, ...other } = this.props;

        return (
            <SystemBoxBase
                {...other}
            >
                <div className={classes.content} >

                </div>

            </SystemBoxBase>
        );
    }
}

export const SystemSheetPercentageBox = withStyles(style)(SystemSheetPercentageBoxClass);
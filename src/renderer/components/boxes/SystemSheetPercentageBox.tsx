import * as React from 'react';
import { WithStyles, Theme, withStyles, createStyles } from '@material-ui/core';

const style = (theme: Theme) => createStyles({
    
});

interface Props extends WithStyles<typeof style> {
    
}

interface State {
    
}

class SystemSheetPercentageBoxClass extends React.Component<Props, State> {
    render() {
        return (
            
        );
    }
}

export const SystemSheetPercentageBox = withStyles(style)(SystemSheetPercentageBoxClass);
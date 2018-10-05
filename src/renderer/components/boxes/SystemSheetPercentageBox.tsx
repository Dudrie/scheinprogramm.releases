import { createStyles, Omit, Theme, WithStyles, withStyles, ListItem, Typography } from '@material-ui/core';
import * as React from 'react';
import { SystemBoxBase, SystemBoxBaseProps } from './SystemBoxBase';
import Language from '../../helpers/Language';

const style = (theme: Theme) => createStyles({
    content: {
        display: 'flex',
        flexDirection: 'column',
    },
    gridItem: {
        padding: 0,
        marginBottom: theme.spacing.unit / 2,
        '&:last-of-type': {
            marginBottom: 0
        }
    },
    gridRowTitle: {
        textAlign: 'left',
        flex: 1,
        marginRight: theme.spacing.unit * 2
    },
    gridRowContent: {
        paddingRight: theme.spacing.unit / 2
    }
});

interface Props extends Omit<SystemBoxBaseProps, 'children' | 'classes'>, WithStyles<typeof style> {
    sheetsPassed: number;
    sheetsTotal: number;
}

class SystemSheetPercentageBoxClass extends React.Component<Props, object> {
    render() {
        let { classes, sheetsPassed, sheetsTotal, ...other } = this.props;
        let percentage: number = (sheetsTotal != 0) ? (sheetsPassed / sheetsTotal * 100) : 0;

        percentage = Math.round(percentage * 10) / 10;

        return (
            <SystemBoxBase
                {...other}
            >
                <div className={classes.content} >
                    <ListItem className={classes.gridItem}>
                        <Typography className={classes.gridRowTitle}>
                            {`${Language.getString('SYSTEM_OVERVIEW_SHEETS_PASSED')}:`}
                        </Typography>
                        <Typography className={classes.gridRowContent}>
                            {`${sheetsPassed} / ${sheetsTotal}`}
                        </Typography>
                    </ListItem>
                    <ListItem className={classes.gridItem}>
                        <Typography className={classes.gridRowTitle}>
                            {`${Language.getString('SYSTEM_OVERVIEW_PERCENTAGE')}:`}
                        </Typography>
                        <Typography className={classes.gridRowContent}>
                            {sheetsTotal == 0 ? '-' : `${percentage}%`}
                        </Typography>
                    </ListItem>
                </div>

            </SystemBoxBase>
        );
    }
}

export const SystemSheetPercentageBox = withStyles(style)(SystemSheetPercentageBoxClass);
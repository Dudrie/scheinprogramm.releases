import { Divider, Grid, ListItem, Omit, Theme, Typography, withStyles, WithStyles, createStyles } from '@material-ui/core';
import * as React from 'react';
import Language from '../../helpers/Language';
import { SystemBoxBase, SystemBoxBaseProps } from './SystemBoxBase';

export type SystemOverviewBoxIcon = 'none' | 'achieved' | 'notAchieved';

interface State {
    isExpanded: boolean;
}

const style = (theme: Theme) => createStyles({
    divider: {
        marginTop: theme.spacing.unit / 2 + 'px',
        marginBottom: theme.spacing.unit / 2 + 'px',
    },
    gridItem: {
        padding: 0,
        // width: '100%',
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
    pointsEarned: number;
    pointsTotal: number;
    pointsPerFutureSheets?: number;
}

class SystemPercentageBoxClass extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            isExpanded: true
        };
    }

    render() {
        let { classes, pointsEarned, pointsTotal, pointsPerFutureSheets, ...other } = this.props;

        let percentage: number = (pointsTotal != 0) ? (pointsEarned / pointsTotal * 100) : 0;
        percentage = Math.round(percentage * 10) / 10; // Round on the last diget

        return (
            <SystemBoxBase
                {...other}
            >
                <Grid container direction='column' >
                    <ListItem className={classes.gridItem} >
                        <Typography className={classes.gridRowTitle}>
                            {Language.getString('SYSTEM_OVERVIEW_POINTS') + ':'}
                        </Typography>
                        <Typography className={classes.gridRowContent}>
                            {pointsEarned + ' / ' + pointsTotal}
                        </Typography>
                    </ListItem>
                    <ListItem className={classes.gridItem}>
                        <Typography className={classes.gridRowTitle}>
                            {Language.getString('SYSTEM_OVERVIEW_PERCENTAGE') + ':'}
                        </Typography >
                        <Typography className={classes.gridRowContent}>
                            {pointsTotal != 0 ? percentage + '%' : '-'}
                        </Typography>
                    </ListItem>

                    {
                        pointsPerFutureSheets !== undefined && <>
                            <Divider className={classes.divider} />

                            <ListItem className={classes.gridItem} >
                                <Typography className={classes.gridRowTitle} >
                                    {Language.getString('SYSTEM_OVERVIEW_FUTURE_SHEETS') + ':'}
                                </Typography>
                                <Typography className={classes.gridRowContent} >
                                    {(pointsPerFutureSheets < 0) ? Language.getString('SHORT_NOT_AVAILABLE') : pointsPerFutureSheets}
                                </Typography>
                            </ListItem>
                        </>
                    }
                </Grid>
            </SystemBoxBase>
        );
    }
}

export const SystemPercentageBox = withStyles(style)(SystemPercentageBoxClass);
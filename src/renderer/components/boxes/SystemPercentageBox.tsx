import { createStyles, Divider, Grid, ListItem, Omit, Theme, Typography, withStyles } from '@material-ui/core';
import { green, orange, red } from '@material-ui/core/colors';
import * as React from 'react';
import Language from '../../helpers/Language';
import { SystemBoxBase, SystemBoxBaseProps } from './SystemBoxBase';

export type SystemOverviewBoxIcon = 'none' | 'achieved' | 'notAchieved';

interface State {
    isExpanded: boolean;
}

const style = (theme: Theme) => {
    let borderWidth: string = '2px';

    return createStyles({
        root: {
            padding: theme.spacing.unit + 'px',
            borderStyle: 'solid',
            borderColor: theme.palette.primary.light,
            borderWidth: 0,
            borderTopWidth: borderWidth,
            transition: theme.transitions.create('border-bottom-width', {
                easing: theme.transitions.easing.easeInOut,
                duration: theme.transitions.duration.short
            }),
        },
        rootCollapsed: {
            borderBottomWidth: borderWidth,
        },
        header: {
            cursor: 'pointer'
        },
        headerDisabledCollapse: {
            cursor: 'default'
        },
        completedIcon: {
            marginRight: theme.spacing.unit + 'px',
            color: green['400']
        },
        notAchievedColor: {
            color: red['400']
        },
        estimatedColor: {
            color: orange['400']
        },
        divider: {
            marginTop: theme.spacing.unit / 2 + 'px',
            marginBottom: theme.spacing.unit / 2 + 'px',
        },
        collpased: {
            transform: 'rotate(0deg)',
            transition: theme.transitions.create('transform', {
                duration: theme.transitions.duration.shortest
            })
        },
        extended: {
            transform: 'rotate(180deg)'
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
};

interface Props extends Omit<SystemBoxBaseProps, 'children'> {
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
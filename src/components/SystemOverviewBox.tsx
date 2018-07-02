import { Grid, ListItem, Paper, StyleRulesCallback, Theme, Typography, WithStyles, withStyles } from '@material-ui/core';
import * as React from 'react';
import { PaperProps } from '@material-ui/core/Paper';

interface Props extends PaperProps {
    systemName: string;
    pointsEarned: number;
    pointsTotal: number;
    pointsPerFutureSheets: number;
}

type SystemOverviewBoxKey =
    | 'root'
    | 'header'
    | 'gridItem'
    | 'gridRowTitle'
    | 'gridRowContent';

const style: StyleRulesCallback<SystemOverviewBoxKey> = (theme: Theme) => {
    let outerBorderColor: string = theme.palette.primary.light;

    return {
        root: {
            padding: theme.spacing.unit + 'px',
            paddingRight: 0,
            backgroundColor: 'transparent',
            borderBottom: '1px solid ' + outerBorderColor,
            borderLeft: '1px solid ' + outerBorderColor
        },
        header: {
            marginBottom: theme.spacing.unit / 2 + 'px',
            '&:after': {
                // marginLeft: -theme.spacing.unit + 'px',
                borderBottom: '1px solid ' + 'rgba(255, 255, 255, 0.5)',
                content: '""',
                display: 'block',
            }
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
    };
};

type PropType = Props & WithStyles<SystemOverviewBoxKey>;

class SystemOverviewBoxClass extends React.Component<PropType, object> {
    render() {
        let { classes, systemName, pointsEarned, pointsTotal, pointsPerFutureSheets, ...other } = this.props;
        let percentage: number = pointsEarned / pointsTotal * 100;

        return (
            <Paper className={classes.root} elevation={0} square {...other} >
                <Typography variant='subheading' className={classes.header} >
                    {systemName}
                </Typography>
                <Grid container direction='column' >
                    <ListItem className={classes.gridItem} >
                        <Typography className={classes.gridRowTitle}>
                            Punkte:
                        </Typography>
                        <Typography className={classes.gridRowContent}>
                            {pointsEarned + '/' + pointsTotal}
                        </Typography>
                    </ListItem>
                    <ListItem className={classes.gridItem} divider >
                        <Typography className={classes.gridRowTitle}>
                            Prozent:
                        </Typography >
                        <Typography className={classes.gridRowContent}>
                            {percentage + '%'}
                        </Typography>
                    </ListItem>
                    <ListItem className={classes.gridItem} >
                        <Typography className={classes.gridRowTitle} >
                            Zukünftige pro Blatt:
                        </Typography>
                        <Typography className={classes.gridRowContent} >
                            {pointsPerFutureSheets}
                        </Typography>
                    </ListItem>
                </Grid>
            </Paper>
        );
    }
}

export const SystemOverviewBox = withStyles(style)<Props>(SystemOverviewBoxClass);
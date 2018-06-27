import { Grid, ListItem, Paper, StyleRulesCallback, Theme, Typography, WithStyles, withStyles } from '@material-ui/core';
import * as React from 'react';

type SystemOverviewBoxKey =
    | 'root'
    | 'header'
    | 'gridItem'
    | 'gridRowTitle'
    | 'gridRowContent';

const style: StyleRulesCallback<SystemOverviewBoxKey> = (theme: Theme) => ({
    root: {
        padding: theme.spacing.unit + 'px',
    },
    header: {
        borderBottom: '1px solid ' + theme.palette.primary.main,
        marginBottom: theme.spacing.unit / 2 + 'px'
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

type PropType = object & WithStyles<SystemOverviewBoxKey>;

class SystemOverviewBoxClass extends React.Component<PropType, object> {
    render() {
        let { classes } = this.props;
        return (
            <Paper className={classes.root} >
                <Typography variant='subheading' className={classes.header} >
                    SYSTEM_NAME
                </Typography>
                <Grid container direction='column' >
                    <ListItem className={classes.gridItem} >
                        <Typography className={classes.gridRowTitle}>
                            Punkte:
                        </Typography>
                        <Typography className={classes.gridRowContent}>
                            _E_/_G_
                        </Typography>
                    </ListItem>
                    <ListItem className={classes.gridItem} divider >
                        <Typography className={classes.gridRowTitle}>
                            Prozent:
                        </Typography >
                        <Typography className={classes.gridRowContent}>
                            _P_%
                        </Typography>
                    </ListItem>
                    <ListItem className={classes.gridItem} >
                        <Typography className={classes.gridRowTitle} >
                            Zukünftige pro Blatt:
                        </Typography>
                        <Typography className={classes.gridRowContent} >
                            _WELL_
                        </Typography>
                    </ListItem>
                </Grid>
            </Paper>
        );
    }
}

export const SystemOverviewBox = withStyles(style)<object>(SystemOverviewBoxClass);
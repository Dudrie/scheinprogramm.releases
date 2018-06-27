import { Paper, StyleRulesCallback, Theme, WithStyles, withStyles, Typography, Grid, ListItem } from '@material-ui/core';
import * as React from 'react';

type SystemOverviewBoxKey =
    | 'root'
    | 'header'
    | 'gridItem'
    | 'gridRowTitle'
    | 'gridRowContent';

const style: StyleRulesCallback<SystemOverviewBoxKey> = (theme: Theme) => ({
    root: {
        padding: theme.spacing.unit + 'px'
    },
    header: {
        // borderBottom: '1px solid ' + theme.palette.grey['500'],
        borderBottom: '1px solid ' + theme.palette.primary.main,
        marginBottom: theme.spacing.unit / 2 + 'px'
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
        width: '50%',
        marginRight: theme.spacing.unit * 2
    },
    gridRowContent: {
        textAlign: 'right',
        width: '50%',
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
                        <Typography className={classes.gridRowTitle} style={{ gridArea: '1 / 1' }}>
                            Erreicht:
                        </Typography >
                        <Typography className={classes.gridRowContent} style={{ gridArea: '1 / 2' }}>
                            _DERP_
                        </Typography>
                    </ListItem>
                    <ListItem className={classes.gridItem} divider >
                        <Typography className={classes.gridRowTitle} style={{ gridArea: '2 / 1' }}>
                            Benötigt:
                        </Typography>
                        <Typography className={classes.gridRowContent} style={{ gridArea: '2 / 2' }}>
                            _KEKS_
                        </Typography>
                    </ListItem>
                    <ListItem className={classes.gridItem} >
                        <Typography className={classes.gridRowTitle} variant='body2' style={{ gridArea: '2 / 1' }}>
                            Gesamt:
                        </Typography>
                        <Typography className={classes.gridRowContent} variant='body2' style={{ gridArea: '2 / 2' }}>
                            _FOO_
                        </Typography>
                    </ListItem>
                    <ListItem className={classes.gridItem} >
                        <Typography className={classes.gridRowTitle} style={{ gridArea: '2 / 1' }}>
                            Pro Blatt:
                        </Typography>
                        <Typography className={classes.gridRowContent} style={{ gridArea: '2 / 2' }}>
                            _WELL_
                        </Typography>
                    </ListItem>
                </Grid>
            </Paper>
        );
    }
}

export const SystemOverviewBox = withStyles(style)<object>(SystemOverviewBoxClass);
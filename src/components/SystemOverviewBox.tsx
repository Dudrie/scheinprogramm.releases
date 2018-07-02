import { Grid, ListItem, Paper, StyleRulesCallback, Theme, Typography, WithStyles, withStyles, Divider, Button, IconButton, Slide, Collapse } from '@material-ui/core';
import * as React from 'react';
import { PaperProps } from '@material-ui/core/Paper';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SquareButton } from './controls/SquareButton';

interface Props extends PaperProps {
    systemName: string;
    pointsEarned: number;
    pointsTotal: number;
    pointsPerFutureSheets: number;
}

interface State {
    isExpanded: boolean;
}

type SystemOverviewBoxKey =
    | 'root'
    | 'rootCollapsed'
    | 'header'
    | 'divider'
    | 'extended'
    | 'collpased'
    | 'gridItem'
    | 'gridRowTitle'
    | 'gridRowContent';

const style: StyleRulesCallback<SystemOverviewBoxKey> = (theme: Theme) => {
    let borderWidth: string = '2px';

    return {
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
    };
};

type PropType = Props & WithStyles<SystemOverviewBoxKey>;

class SystemOverviewBoxClass extends React.Component<PropType, State> {
    constructor(props: PropType) {
        super(props);

        this.state = {
            isExpanded: true
        };
    }

    render() {
        let { classes, systemName, pointsEarned, pointsTotal, pointsPerFutureSheets, ...other } = this.props;
        let percentage: number = pointsEarned / pointsTotal * 100;

        let rootClass: string = classes.root;
        let buttonClass: string = classes.collpased;

        if (this.state.isExpanded) {
            buttonClass += ' ' + classes.extended;
        } else {
            rootClass += ' ' + classes.rootCollapsed;
        }

        return (
            <Paper className={rootClass} elevation={0} square {...other} >
                <Grid
                    container
                    onClick={this.onHeaderClicked}
                    className={classes.header}
                >
                    <Grid item xs>
                        <Typography variant='subheading' >
                            {systemName}
                        </Typography>
                    </Grid>
                    <Grid item>
                        <SquareButton
                            style={{ width: '25px', height: '25px' }}
                            onClick={this.onExpandClicked}
                        >
                            <FontAwesomeIcon className={buttonClass} icon={{ prefix: 'far', iconName: 'angle-up' }} />
                        </SquareButton>
                    </Grid>
                </Grid>

                <Collapse in={this.state.isExpanded} >
                    <Divider className={classes.divider} />

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
                </Collapse>
            </Paper>
        );
    }

    /**
     * Toggles the expansion state.
     */
    private toggleExpand() {
        this.setState({
            isExpanded: !this.state.isExpanded
        });
    }

    /**
     * Handles the click on the header part of the box.
     * @param event Click event
     */
    private onHeaderClicked = (event: React.MouseEvent<HTMLElement>) => {
        if (event.target instanceof HTMLButtonElement) {
            // Don't react on events generated by button clicks.
            return;
        }

        this.toggleExpand();
    }

    /**
     * Handles the click on the expand/collapse button.
     */
    private onExpandClicked = () => {
        this.toggleExpand();
    }
}

export const SystemOverviewBox = withStyles(style)<Props>(SystemOverviewBoxClass);
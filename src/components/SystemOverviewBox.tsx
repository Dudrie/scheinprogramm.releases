import { Grid, ListItem, Paper, StyleRulesCallback, Theme, Typography, WithStyles, withStyles, Divider, Button, IconButton, Slide, Collapse } from '@material-ui/core';
import * as React from 'react';
import { PaperProps } from '@material-ui/core/Paper';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SquareButton } from './controls/SquareButton';
import Language from '../helpers/Language';

interface Props extends PaperProps {
    systemName: string;
    pointsEarned: number;
    pointsTotal: number;
    pointsPerFutureSheets?: number;
    disableCollapse?: boolean;
}

interface State {
    isExpanded: boolean;
}

type SystemOverviewBoxKey =
    | 'root'
    | 'rootCollapsed'
    | 'header'
    | 'headerDisabledCollapse'
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
        headerDisabledCollapse: {
            cursor: 'default'
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
        // Round on the last diget
        percentage = Math.round(percentage * 10) / 10;

        let rootClass: string = classes.root;
        let buttonClass: string = classes.collpased;

        if (this.state.isExpanded && !this.props.disableCollapse) {
            buttonClass += ' ' + classes.extended;
        } else {
            rootClass += ' ' + classes.rootCollapsed;
        }

        return (
            <Paper className={rootClass} elevation={0} square {...other} >
                <Grid
                    container
                    onClick={this.onHeaderClicked}
                    className={this.props.disableCollapse ? classes.headerDisabledCollapse : classes.header}
                >
                    <Grid item xs>
                        <Typography variant='subheading' >
                            {systemName}
                        </Typography>
                    </Grid>
                    {!this.props.disableCollapse &&
                        <Grid item>
                            <SquareButton
                                style={{ width: '25px', height: '25px' }}
                                onClick={this.onExpandClicked}
                            >
                                <FontAwesomeIcon className={buttonClass} icon={{ prefix: 'far', iconName: 'angle-up' }} />
                            </SquareButton>
                        </Grid>
                    }
                </Grid>

                <Collapse in={this.state.isExpanded || this.props.disableCollapse} >
                    <Divider className={classes.divider} />

                    <Grid container direction='column' >
                        <ListItem className={classes.gridItem} >
                            <Typography className={classes.gridRowTitle}>
                                {Language.getString('SYSTEM_OVERVIEW_POINTS') + ':'}
                            </Typography>
                            <Typography className={classes.gridRowContent}>
                                {pointsEarned + '/' + pointsTotal}
                            </Typography>
                        </ListItem>
                        <ListItem className={classes.gridItem}>
                            <Typography className={classes.gridRowTitle}>
                                {Language.getString('SYSTEM_OVERVIEW_PERCENTAGE') + ':'}
                            </Typography >
                            <Typography className={classes.gridRowContent}>
                                {percentage + '%'}
                            </Typography>
                        </ListItem>

                        {pointsPerFutureSheets !== undefined && <>
                            <Divider className={classes.divider} />

                            <ListItem className={classes.gridItem} >
                                <Typography className={classes.gridRowTitle} >
                                    {Language.getString('SYSTEM_OVERVIEW_FUTURE_SHEETS') + ':'}
                                </Typography>
                                <Typography className={classes.gridRowContent} >
                                    {pointsPerFutureSheets}
                                </Typography>
                            </ListItem>
                        </>}
                    </Grid>
                </Collapse>
            </Paper>
        );
    }

    /**
     * Toggles the expansion state.
     */
    private toggleExpand() {
        if (this.props.disableCollapse) {
            return;
        }

        this.setState({
            isExpanded: !this.state.isExpanded
        });
    }

    /**
     * Handles the click on the header part of the box.
     * @param event Click event
     */
    private onHeaderClicked = () => {
        this.toggleExpand();
    }

    /**
     * Handles the click on the expand/collapse button.
     */
    private onExpandClicked = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        this.toggleExpand();
    }
}

export const SystemOverviewBox = withStyles(style)<Props>(SystemOverviewBoxClass);
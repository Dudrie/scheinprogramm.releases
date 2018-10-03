import { IconName } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Collapse, createStyles, Divider, Grid, Omit, Paper, Theme, Tooltip, Typography, WithStyles, withStyles } from '@material-ui/core';
import { green, orange, red } from '@material-ui/core/colors';
import { PaperProps } from '@material-ui/core/Paper';
import * as React from 'react';
import Language from '../../helpers/Language';
import { SquareButton } from '../controls/SquareButton';

export type SystemOverviewBoxIcon = 'none' | 'achieved' | 'notAchieved';

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

export interface SystemBoxBaseProps extends Omit<PaperProps, 'classes'>, WithStyles<typeof style> {
    children: React.ReactNode;
    systemName: string;
    disableCollapse?: boolean;
    iconToShow?: SystemOverviewBoxIcon;
    usesEstimation?: boolean;
}

interface State {
    isExpanded: boolean;
}

class SystemBoxBaseClass extends React.Component<SystemBoxBaseProps, State> {
    constructor(props: SystemBoxBaseProps) {
        super(props);

        this.state = {
            isExpanded: true
        };
    }

    render() {
        let { classes, systemName, disableCollapse, iconToShow, usesEstimation, ...other } = this.props;
        
        let iconTooltipText: string = '';
        let rootClass: string = classes.root;
        let buttonClass: string = classes.collpased;
        let iconClass: string = classes.completedIcon;

        // Assign some dummy value
        let iconName: IconName = 'question';

        if (iconToShow) {
            switch (iconToShow) {
                case 'achieved':
                    iconName = 'check';
                    iconTooltipText = Language.getString('SYSTEM_OVERVIEW_BOX_TOOLTIP_ICON_ACHIEVED');
                    break;
                case 'notAchieved':
                    iconName = 'times';
                    iconClass += ` ${classes.notAchievedColor}`;
                    iconTooltipText = Language.getString('SYSTEM_OVERVIEW_BOX_TOOLTIP_ICON_NOT_ACHIEVED');
                    break;
            }
        }

        if (this.state.isExpanded && !disableCollapse) {
            buttonClass += ' ' + classes.extended;
        } else {
            rootClass += ' ' + classes.rootCollapsed;
        }

        if (usesEstimation) {
            iconClass += ` ${classes.estimatedColor}`;
            iconTooltipText += ` (${Language.getString('SYSTEM_OVERVIEW_BOX_TOOLTIP_ICON_ESTIMATED')})`;
        }

        return (
            <Paper className={rootClass} elevation={0} square {...other} >
                <Grid
                    container
                    onClick={this.onHeaderClicked}
                    className={disableCollapse ? classes.headerDisabledCollapse : classes.header}
                >
                    <Grid item xs>
                        <Typography variant='subheading' >
                            {(iconToShow && iconToShow != 'none') &&
                                <Tooltip
                                    title={iconTooltipText}
                                >
                                    <FontAwesomeIcon className={iconClass} icon={{ prefix: 'far', iconName }} />
                                </Tooltip>
                            }
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

                <Collapse in={this.state.isExpanded || disableCollapse} >
                    <Divider className={classes.divider} />

                    {this.props.children}
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

export const SystemBoxBase = withStyles(style)(SystemBoxBaseClass);
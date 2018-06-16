import { Collapse, Paper, Theme, withStyles, WithStyles } from '@material-ui/core';
import { StyleRulesCallback } from '@material-ui/core/styles';
import * as React from 'react';
import { SquareButton } from './SquareButton';
import { PaperProps } from '@material-ui/core/Paper';

interface Props extends PaperProps {
    /**
     * Function, which gets called if the user clicks on the info button.
     */
    onInfoClicked?: () => void;

    /**
     * Hides the info button. If an `onInfoClicked` function is provided via the props it's essentially useless because it won't get called.
     */
    hideInfoButton?: boolean;

    /**
     * If provided the content gets shown in the info box.
     */
    infos?: React.ReactNode;

    /**
     * If provided the buttons (or JSX.Elements) will get added to the right of the info button.
     */
    addButtons?: JSX.Element[];
}

type InfoBarClassKey =
    | 'root'
    | 'paperBar'
    | 'contentDiv'
    | 'collapseBox'
    | 'collapsePaper'
    | 'additionalButtonDiv';

type PropType = Props & WithStyles<InfoBarClassKey>;

const style: StyleRulesCallback<InfoBarClassKey> = (theme: Theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    },
    paperBar: {
        display: 'flex',
        width: '100%',
        height: '55px',
        alignContent: 'center',
        alignItems: 'center',
        padding: '0px',
        paddingLeft: theme.spacing.unit,
        paddingRight: theme.spacing.unit,
        zIndex: 2,
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'transparent',
        '&:hover': {
            borderColor: theme.palette.primary.light
        }
    },
    contentDiv: {
        flex: 1,
        marginRight: theme.spacing.unit
    },
    collapseBox: {
        width: '90%'
    },
    collapsePaper: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '55px', // Has to be the same minHeight as the bar to prevent some strangly appearing holes in the UI.
        // padding: '5px',
        padding: theme.spacing.unit,
        backgroundColor: '#343434',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: '#424242',
        borderTop: 'none'
    },
    additionalButtonDiv: {
        marginLeft: theme.spacing.unit
    }
});

/**
 * Class used for the stlyed component.
 */
class InfoBarClass extends React.Component<PropType, object> {
    constructor(props: PropType) {
        super(props);

        if (this.props.hideInfoButton && this.props.onInfoClicked) {
            console.warn('[WARNING] BarWithInfoBox -- There is an onInfoClicked function provided even though the info button will be hidden. The provided function will therefore not be called.');
        }
    }

    render() {
        let { onInfoClicked, hideInfoButton, infos, addButtons, className, classes, ...other } = this.props;
        let { root, paperBar, contentDiv, collapseBox, collapsePaper, additionalButtonDiv, ...paperClasses } = classes;

        let isShowAddInfo = (this.props.infos !== undefined && this.props.infos !== null);
        let bgInfo: string = isShowAddInfo ? '#ffb74d' : '';

        return (
            <div className={this.props.classes.root} >
                <Paper
                    className={className + ' ' + this.props.classes.paperBar}
                    square
                    elevation={3}
                    classes={paperClasses}
                    {...other}
                >
                    <div className={this.props.classes.contentDiv} >
                        {this.props.children}
                    </div>
                    {!this.props.hideInfoButton &&
                        <div>
                            <SquareButton
                                style={{ backgroundColor: bgInfo }}
                                variant='raised'
                                onClick={this.props.onInfoClicked}
                            >
                                <i className='fas fa-info'></i>
                            </SquareButton>
                        </div>
                    }
                    {this.props.addButtons &&
                        this.props.addButtons.map((btn, idx) =>
                            <div key={idx} className={this.props.classes.additionalButtonDiv} >
                                {btn}
                            </div>)
                    }
                </Paper>
                <Collapse
                    in={isShowAddInfo}
                    className={this.props.classes.collapseBox}
                >
                    <Paper
                        className={this.props.classes.collapsePaper}
                        elevation={1}
                        square
                    >
                        {this.props.infos}
                    </Paper>
                </Collapse>
            </div>
        );
    }
}

/**
 * Bar component which has the ability to show additional information beneath it. Based on the material-ui Paper component which is styled in a special way.
 *
 * These props are props used in this special component. All other props are passed down to the Paper component used for the bar itself (NOT the info box).:
 * @prop onInfoClicked - Callback on info button click
 * @prop hideInfoButton - If `true` the info button gets hidden
 * @prop infos - Infos to show in the info box
 * @prop addButtons - Additional buttons to be rendered on the right of the info button (or the bar if the info button is hidden)
 */
export const InfoBar = withStyles(style)<Props>(InfoBarClass);
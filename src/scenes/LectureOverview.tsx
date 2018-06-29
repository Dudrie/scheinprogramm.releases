import { Grid, Slide, StyleRulesCallback, Theme, Typography, withStyles, WithStyles } from '@material-ui/core';
import * as React from 'react';
import { CreateBar } from '../components/bars/CreateBar';
import { SheetBar } from '../components/bars/SheetBar';
import { SheetEditor } from '../components/editors/SheetEditor';
import Language from '../helpers/Language';
import { SystemOverviewBox } from '../components/SystemOverviewBox';

interface State {
    isEditingSheet: boolean;
}

type LectureOverviewClassKey =
    | 'sheetBox'
    | 'statBox'
    | 'statGeneralInfo'
    | 'statTitle';

const style: StyleRulesCallback<LectureOverviewClassKey> = (theme: Theme) => ({
    sheetBox: {
        paddingRight: theme.spacing.unit,
        paddingTop: 0,
        overflowY: 'auto',
        overflowX: 'hidden'
    },
    statBox: {
        minWidth: '225px',
        marginBottom: (theme.spacing.unit / 1) + 'px',
        paddingLeft: theme.spacing.unit * 2 + 'px',
        height: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
        // Move scrollbar to the right window border.
        // TODO: Von außen kontrollieren?
        paddingRight: '20px',
        marginRight: '-20px',
        '& > *': {
            marginBottom: theme.spacing.unit + 'px'
        }
    },
    statGeneralInfo: {
        // borderTop: '1px solid ' + theme.palette.grey['500'],
        borderBottom: '1px solid ' + theme.palette.grey['500'],
        borderLeft: '1px solid ' + theme.palette.grey['500'],
        padding: theme.spacing.unit
    },
    statTitle: {
        // borderBottom: '2px solid ' + theme.palette.primary.main,
        color: theme.palette.primary.light,
        marginBottom: theme.spacing.unit + 'px'
    }
});

type PropType = object & WithStyles<LectureOverviewClassKey>;

class LectureOverviewClass extends React.Component<PropType, State> {
    constructor(props: PropType) {
        super(props);

        this.state = {
            isEditingSheet: false
        };
    }
    render() {
        return (
            <Grid
                container
                style={{ height: '100%' }}
            >
                <Grid
                    item
                    xs
                    className={this.props.classes.sheetBox}
                >
                    {!this.state.isEditingSheet &&
                        <Grid
                            container
                            direction='column'
                            spacing={8}
                        >
                            <Grid item xs>
                                <CreateBar
                                    onCreateClicked={this.onCreateClicked}
                                    elevation={0}
                                >
                                    <Typography variant='subheading'>
                                        {Language.getString('OVERVIEW_ADD_SHEET')}
                                    </Typography>
                                </CreateBar>
                            </Grid>
                            <Grid item xs>
                                <SheetBar />
                            </Grid>
                            <Grid item xs>
                                <SheetBar />
                            </Grid>
                            <Grid item xs>
                                <SheetBar />
                            </Grid>
                            <Grid item xs>
                                <SheetBar />
                            </Grid>
                            <Grid item xs>
                                <SheetBar />
                            </Grid>
                            <Grid item xs>
                                <SheetBar />
                            </Grid>
                            <Grid item xs>
                                <SheetBar />
                            </Grid>
                            <Grid item xs>
                                <SheetBar />
                            </Grid>
                            <Grid item xs>
                                <SheetBar />
                            </Grid>
                            <Grid item xs>
                                <SheetBar />
                            </Grid>
                        </Grid>
                    }
                    {this.state.isEditingSheet &&
                        // TODO: Exit Animation?
                        <Slide direction='right' in={this.state.isEditingSheet} timeout={350} unmountOnExit>
                            <div>
                                <SheetEditor
                                    headerText={Language.getString('SHEET_EDITOR_NEW_SHEET')}
                                    btnText={Language.getString('BUTTON_ADD')}
                                    onAbortClicked={this.onAbortClicked}
                                />
                            </div>
                        </Slide>
                    }
                </Grid>

                <Grid item className={this.props.classes.statBox} >
                    <Typography variant='title' classes={{ title: this.props.classes.statTitle }} >
                        {Language.getString('OVERVIEW_STATS_OVERVIEW')}
                    </Typography>

                    <div className={this.props.classes.statGeneralInfo} >
                        <Typography variant='body2' >
                            Schein kann (nicht) erreicht werden.
                        </Typography>
                        <Typography variant='body1' >
                            Vorrechenpunkte: 0/0
                        </Typography>
                    </div>

                    {/* TODO: Zusammenfassung aller Blätter */}
                    <SystemOverviewBox
                        systemName='SYSTEM_NAME'
                        pointsEarned={5}
                        pointsTotal={10}
                        pointsPerFutureSheets={12}
                    // style={{ minWidth: '200px' }}
                    />

                    <SystemOverviewBox
                        systemName='SYSTEM_NAME'
                        pointsEarned={5}
                        pointsTotal={10}
                        pointsPerFutureSheets={12}
                    // style={{ minWidth: '200px' }}
                    />

                    <SystemOverviewBox
                        systemName='SYSTEM_NAME'
                        pointsEarned={5}
                        pointsTotal={10}
                        pointsPerFutureSheets={12}
                    // style={{ minWidth: '200px' }}
                    />

                    {/* <SystemOverviewBox
                        systemName='SYSTEM_NAME'
                        pointsEarned={5}
                        pointsTotal={10}
                        pointsPerFutureSheets={12}
                        // style={{ minWidth: '200px' }}
                    />

                    <SystemOverviewBox
                        systemName='SYSTEM_NAME'
                        pointsEarned={5}
                        pointsTotal={10}
                        pointsPerFutureSheets={12}
                        // style={{ minWidth: '200px' }}
                    /> */}
                </Grid>
            </Grid>
        );
    }

    /**
     * Gets called with the 'Create Sheet' bar/button is clicked.
     */
    private onCreateClicked = () => {
        this.setState({ isEditingSheet: true });
    }

    /**
     * Get called when the user clicks the abort button in the SheetEditor.
     */
    private onAbortClicked = () => {
        this.setState({ isEditingSheet: false });
    }
}

export const LectureOverview = withStyles(style)<object>(LectureOverviewClass);
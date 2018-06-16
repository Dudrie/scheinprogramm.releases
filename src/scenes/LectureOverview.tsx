import { Grid, StyleRulesCallback, Theme, Typography, withStyles, WithStyles, Zoom, Slide } from '@material-ui/core';
import * as React from 'react';
import { CreateBar } from '../components/controls/CreateBar';
import { SheetBar } from '../components/SheetBar';
import { SheetEditor } from '../components/SheetEditor';
import Language from '../helpers/Language';

interface State {
    isEditingSheet: boolean;
}

type LectureOverviewClassKey =
    | 'statBox'
    | 'sheetBox'
    | 'statTitle';

const style: StyleRulesCallback<LectureOverviewClassKey> = (theme: Theme) => ({
    sheetBox: {
        paddingRight: theme.spacing.unit,
        paddingTop: 0,
        overflowY: 'auto',
        overflowX: 'hidden'
    },
    statBox: {
        width: '250px',
        marginBottom: (theme.spacing.unit / 1) + 'px',
        paddingLeft: theme.spacing.unit * 2 + 'px'
    },
    statTitle: {
        borderBottom: '2px solid ' + theme.palette.primary.main
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
                                    // TODO: onClickListener
                                    onCreateClicked={() => this.setState({ isEditingSheet: true })}
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
                        // TODO: Schönere Animation?
                        <Slide direction='right' in={this.state.isEditingSheet} timeout={350} unmountOnExit>
                            <div>
                                <SheetEditor
                                    headerText={Language.getString('SHEET_EDITOR_NEW_SHEET')}
                                    btnText={Language.getString('BUTTON_ADD')}
                                    // TODO: Listener extrahieren
                                    onAbortClicked={() => this.setState({ isEditingSheet: false })}
                                />
                            </div>
                        </Slide>
                    }
                </Grid>

                <Grid item className={this.props.classes.statBox} >
                    <Typography variant='title' classes={{ title: this.props.classes.statTitle }} >
                        {Language.getString('OVERVIEW_STATS_OVERVIEW')}
                    </Typography>
                    {/* TODO: Zusammenfassung aller Bläter */}
                </Grid>
            </Grid>
        );
    }
}

export const LectureOverview = withStyles(style)<object>(LectureOverviewClass);
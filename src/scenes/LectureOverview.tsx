import { Grid, Slide, StyleRulesCallback, Theme, Typography, withStyles, WithStyles, List, ListItem } from '@material-ui/core';
import * as React from 'react';
import { CreateBar } from '../components/bars/CreateBar';
import { SheetBar } from '../components/bars/SheetBar';
import { SheetEditor } from '../components/editors/SheetEditor';
import Language from '../helpers/Language';
import { SystemOverviewBox } from '../components/SystemOverviewBox';
import { DataService } from '../helpers/DataService';
import { LectureSystem } from '../data/LectureSystem';
import { Sheet, Points } from '../data/Sheet';
import { NotificationService } from '../helpers/NotificationService';

interface State {
    isCreatingSheet: boolean;
}

type LectureOverviewClassKey =
    | 'root'
    | 'sheetBox'
    | 'statBox'
    | 'statGeneralInfo'
    | 'statTitle'
    | 'listItemDenseOverride';

const style: StyleRulesCallback<LectureOverviewClassKey> = (theme: Theme) => ({
    root: {
        height: '100%'
    },
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
        // TODO: Von außen kontrollieren?
        // Move scrollbar to the right window border.
        paddingRight: '20px',
        marginRight: '-20px',
        '& > *': {
            marginBottom: theme.spacing.unit + 'px'
        }
    },
    statGeneralInfo: {
        padding: theme.spacing.unit
    },
    statTitle: {
        color: theme.palette.primary.light,
        marginBottom: 0
    },
    listItemDenseOverride: {
        paddingTop: theme.spacing.unit / 1,
        paddingBottom: theme.spacing.unit / 2
    }
});

type PropType = object & WithStyles<LectureOverviewClassKey>;

class LectureOverviewClass extends React.Component<PropType, State> {
    constructor(props: PropType) {
        super(props);

        this.state = {
            isCreatingSheet: false
        };
    }

    render() {
        let presPoints: Points = DataService.getActiveLecturePresentationPoints();

        return (
            <Grid
                container
                className={this.props.classes.root}
            >
                <Grid
                    item
                    xs
                    className={this.props.classes.sheetBox}
                >
                    {!this.state.isCreatingSheet &&
                        <List dense >
                            {/* Component of the list items need to be a 'div' (or at least not 'li') bc React does not like nested 'li' elements. */}
                            <ListItem component={'div'} disableGutters classes={{ dense: this.props.classes.listItemDenseOverride }} >
                                <CreateBar
                                    onCreateClicked={this.onCreateClicked}
                                    elevation={0}
                                >
                                    <Typography variant='subheading'>
                                        {Language.getString('OVERVIEW_ADD_SHEET')}
                                    </Typography>
                                </CreateBar>
                            </ListItem>
                            {DataService.getActiveLectureSheets().map((sheet, idx) => (
                                <ListItem key={'SHEET_' + idx} component={'div'} disableGutters classes={{ dense: this.props.classes.listItemDenseOverride }} >
                                    <SheetBar
                                        sheet={sheet}
                                        lectureSystems={DataService.getActiveLectureSystems()}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    }
                    {this.state.isCreatingSheet &&
                        // TODO: Exit Animation?
                        <Slide direction='right' in={this.state.isCreatingSheet} timeout={350} unmountOnExit>
                            <div>
                                <SheetEditor
                                    headerText={Language.getString('SHEET_EDITOR_NEW_SHEET')}
                                    lectureSystems={DataService.getActiveLectureSystems()}
                                    initialSheetNr={DataService.getActiveLectureLastSheetNr() + 1}
                                    onAddClicked={this.onAddSheetClicked}
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
                        {DataService.isActiveLectureHasPresentation() && (
                            <Typography variant='body1' >
                                Vorrechenpunkte: {presPoints.achieved + ' / ' + presPoints.total}
                            </Typography>
                        )}
                    </div>

                    {DataService.getActiveLectureSystems().map((sys) => this.generateSystemOverviewBox(sys))}
                </Grid>
            </Grid >
        );
    }

    private generateSystemOverviewBox(system: LectureSystem): JSX.Element {
        let points = DataService.getActiveLecturePointsOfSystem(system.id);

        return (
            <SystemOverviewBox
                key={'SYS_OVERVIEW_' + system.id}
                systemName={system.name}
                pointsEarned={points.achieved}
                pointsTotal={points.total}
                // TODO: Berechnen!
                pointsPerFutureSheets={-12}
            />
        );
    }

    /**
     * Gets called with the 'Create Sheet' bar/button is clicked.
     */
    private onCreateClicked = () => {
        this.setState({ isCreatingSheet: true });
    }

    /**
     * Get called when the user clicks the abort button in the SheetEditor.
     */
    private onAbortClicked = () => {
        this.setState({ isCreatingSheet: false });
    }

    private onAddSheetClicked = (sheet: Sheet) => {
        DataService.addSheetToActiveLecture(sheet);

        // TODO: Erfolg abfragen?
        NotificationService.showNotification({
            level: 'success',
            message: Language.getString('NOTI_SHEET_ADDED_MSG'),
            title: Language.getString('NOTI_SHEET_ADDED_TITLE'),
        });

        this.setState({ isCreatingSheet: false });
    }
}

export const LectureOverview = withStyles(style)<object>(LectureOverviewClass);
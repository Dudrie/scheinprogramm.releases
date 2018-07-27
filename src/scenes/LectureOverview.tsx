import { Grid, Slide, StyleRulesCallback, Theme, Typography, withStyles, WithStyles, List, ListItem } from '@material-ui/core';
import * as React from 'react';
import { CreateBar } from '../components/bars/CreateBar';
import { SheetBar } from '../components/bars/SheetBar';
import { SheetEditor } from '../components/editors/SheetEditor';
import Language from '../helpers/Language';
import { SystemOverviewBox } from '../components/SystemOverviewBox';
import { DataService } from '../helpers/DataService';
import { LectureSystem, SystemType } from '../data/LectureSystem';
import { Sheet, Points } from '../data/Sheet';
import { NotificationService } from '../helpers/NotificationService';

interface State {
    isCreatingSheet: boolean;
    sheetToEdit: Sheet | undefined;
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
        paddingBottom: theme.spacing.unit / 2,
        '&:first-of-type': {
            paddingTop: 0
        }
    }
});

type PropType = object & WithStyles<LectureOverviewClassKey>;

class LectureOverviewClass extends React.Component<PropType, State> {
    constructor(props: PropType) {
        super(props);

        this.state = {
            isCreatingSheet: false,
            sheetToEdit: undefined
        };
    }

    render() {
        let presPoints: Points = DataService.getActiveLecturePresentationPoints();
        let showEditor: boolean = this.state.isCreatingSheet || (this.state.sheetToEdit != undefined);

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
                    {!showEditor &&
                        <List dense disablePadding >
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
                                        onEditClicked={this.onEditSheetClicked}
                                        onDeleteClicked={this.onDeleteSheetClicked}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    }
                    {showEditor &&
                        // TODO: Exit Animation?
                        <Slide direction='right' in={showEditor} timeout={350} unmountOnExit>
                            <div>
                                <SheetEditor
                                    lectureSystems={DataService.getActiveLectureSystems()}
                                    initialSheetNr={DataService.getActiveLectureLastSheetNr() + 1}
                                    hasPresentationPoints={DataService.hasActiveLecturePresentation()}
                                    sheetToEdit={this.state.sheetToEdit}
                                    onAcceptClicked={this.onAddSheetClicked}
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
                        {DataService.hasActiveLecturePresentation() && (
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
                pointsPerFutureSheets={this.calculatePointsPerFutureSheets(system, points.achieved, points.total)}
            />
        );
    }

    private calculatePointsPerFutureSheets(system: LectureSystem, ptsAchieved: number, ptsTotal: number): number {
        let totalSheets = DataService.getActiveLectureTotalSheetCount();

        if (totalSheets == 0) {
            return -1;
        }

        let perSheet: number = system.pointsPerSheet;
        let criteria: number = system.criteria;
        let sheetCount: number = DataService.getActiveLectureCurrentSheetCount();
        let sheetsRemaining = totalSheets - sheetCount;

        let ptsNeededTotal: number = 0;

        // TODO: Ist die Heuristik, die 'rät' überhaupt sinnvoll?
        if (perSheet == 0) {
            if (ptsTotal == 0 || sheetCount == 0) {
                // We can't 'guess' the amount of points per sheet, if there are not sheets (or no points) in the past.
                return -1;
            }

            perSheet = ptsTotal / sheetCount;
        }

        if (system.systemType === SystemType.ART_PROZENT) {
            // Add the amount of points for every OTHER sheet. Afterwards multiply with the criteria (which is a percentage). Also, respect all previous points in saved in the sheets, so sheets which don't have the same points as 'perSheet' are counted correctly.
            ptsNeededTotal += ptsTotal + perSheet * sheetsRemaining;
            ptsNeededTotal *= (criteria / 100);

        } else {
            // If we're in a point based system, the needed points are simply the criteria of that system.
            ptsNeededTotal = criteria;
        }

        let ptsFuture: number = 0;

        if (sheetsRemaining <= 0 || ptsNeededTotal <= ptsAchieved) {
            return 0;
        }

        ptsFuture = (ptsNeededTotal - ptsAchieved) / sheetsRemaining;
        return Math.round(ptsFuture * 10) / 10;
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
        this.setState({ isCreatingSheet: false, sheetToEdit: undefined });
    }

    private onAddSheetClicked = (sheet: Sheet) => {
        if (this.state.sheetToEdit) {
            DataService.editSheetOfActiveLecture(sheet);
            this.setState({ sheetToEdit: undefined });

        } else {
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

    private onEditSheetClicked = (sheet: Sheet) => {
        this.setState({
            sheetToEdit: sheet
        });
    }

    private onDeleteSheetClicked = (sheet: Sheet) => {
        DataService.removeSheetFromActiveLecture(sheet.id);

        this.forceUpdate();

        NotificationService.showNotification({
            title: Language.getString('NOTI_SHEET_DELETED_TITLE'),
            message: Language.getString('NOTI_SHEET_DELETED_MESSAGE', sheet.sheetNr + ''),
            level: 'success'
        });
    }
}

export const LectureOverview = withStyles(style)<object>(LectureOverviewClass);
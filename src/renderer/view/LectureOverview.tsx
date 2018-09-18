import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Grid, List, ListItem, Slide, StyleRulesCallback, Theme, Tooltip, Typography, withStyles, WithStyles } from '@material-ui/core';
import { green, orange, red } from '@material-ui/core/colors';
import * as React from 'react';
import { CONTENT_PADDING } from '../App';
import { CreateBar } from '../components/bars/CreateBar';
import { SheetBar } from '../components/bars/SheetBar';
import { SheetEditor } from '../components/editors/SheetEditor';
import { SystemOverviewBox, SystemOverviewBoxIcon } from '../components/SystemOverviewBox';
import { LectureSystem, SystemType } from '../data/LectureSystem';
import { Points, Sheet } from '../data/Sheet';
import { DataService } from '../helpers/DataService';
import Language from '../helpers/Language';
import { NotificationService } from '../helpers/NotificationService';

enum AchieveState {
    ACHIEVED, CAN_BE_ACHIEVED, PROBABLY_ACHIEVED, ALMOST_ACHIEVED, NOT_ACHIEVABLE, NO_INFO_AVAILABLE
}

type LectureOverviewClassKey =
    | 'root'
    | 'sheetBox'
    | 'statBox'
    | 'statTitle'
    | 'statGeneralInfo'
    | 'statGeneralInfoIcon'
    | 'listItemDenseOverride'
    | 'achievedColor'
    | 'almostAchievedColor'
    | 'notAchievedColor';

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
        minWidth: '250px',
        marginBottom: (theme.spacing.unit / 1) + 'px',
        paddingLeft: theme.spacing.unit * 2 + 'px',
        height: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
        // Move scrollbar to the right window border.
        paddingRight: `${CONTENT_PADDING}px`,
        marginRight: `-${CONTENT_PADDING}px`,
        '& > *': {
            marginBottom: theme.spacing.unit + 'px'
        }
    },
    statGeneralInfo: {
        padding: theme.spacing.unit / 2
    },
    statGeneralInfoIcon: {
        marginRight: theme.spacing.unit / 2
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
    },
    achievedColor: {
        color: green['400']
    },
    almostAchievedColor: {
        color: orange['400']
    },
    notAchievedColor: {
        color: red['400']
    }
});

type PropType = object & WithStyles<LectureOverviewClassKey>;

interface State {
    isCreatingSheet: boolean;
    sheetToEdit: Sheet | undefined;
}

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

        let totalSheetCount = DataService.getActiveLectureTotalSheetCount();
        let currentSheetCount = DataService.getActiveLectureCurrentSheetCount();
        let showCreateBar: boolean = (totalSheetCount == 0) || (currentSheetCount < totalSheetCount);

        let generalInformation = this.generateGeneralInformation();

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
                            {showCreateBar &&
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
                            }
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
                        <Tooltip
                            title={generalInformation.addTooltip}
                        >
                            <Typography variant='body1' className={generalInformation.colorClass} >
                                {generalInformation.text}
                            </Typography>
                        </Tooltip>
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

    private checkIfAchievable(): AchieveState {
        // Check, if there's a total sheet count in the active lecture. If not, we cannot estimate things.
        let activeLecture = DataService.getActiveLecture();
        if (activeLecture && activeLecture.totalSheetCount == 0) {
            return AchieveState.NO_INFO_AVAILABLE;
        }

        let achieveState: AchieveState = AchieveState.CAN_BE_ACHIEVED;
        let lectureSystems: LectureSystem[] = DataService.getActiveLectureSystems();
        let sheetsRemaining = DataService.getActiveLectureTotalSheetCount() - DataService.getActiveLectureCurrentSheetCount();

        // Check all the system if they are achieved.
        for (let i = 0; i < lectureSystems.length; i++) {
            const lecSys = lectureSystems[i];

            let points = DataService.getActiveLecturePointsOfSystem(lecSys.id);
            let pointsPerFutureSheet = this.calculatePointsPerFutureSheets(lecSys, points.achieved, points.total);

            // If there's one system not achievable consider it NOT_ACHIEVABLE in general
            if (pointsPerFutureSheet == Number.NEGATIVE_INFINITY) {
                achieveState = AchieveState.NOT_ACHIEVABLE;
                break;
            }

            // That system is considered achieved if it's the first consider everything achieved (achieved systems later won't change that).
            // However, if there's a system not achieved yet, 'reset' the state - it'll not change back.
            if (pointsPerFutureSheet == 0) {
                if (i == 0) {
                    achieveState = AchieveState.ACHIEVED;
                }

                if (achieveState == AchieveState.ACHIEVED && lecSys.pointsPerSheet == 0 && sheetsRemaining > 0) {
                    // The LectureSystem uses an estimation and there are sheets remaining, so we're careful with predictions.
                    achieveState = AchieveState.PROBABLY_ACHIEVED;
                }
            } else {
                achieveState = AchieveState.CAN_BE_ACHIEVED;
            }
        }

        // If we're not achievable at this point we won't be further down the process.
        if (achieveState == AchieveState.NOT_ACHIEVABLE) {
            return achieveState;
        }

        // Check if the presentation points are met
        if (achieveState == AchieveState.ACHIEVED) {
            let presentationPoints = DataService.getActiveLecturePresentationPoints();

            if (presentationPoints.achieved < presentationPoints.total) {
                achieveState = AchieveState.ALMOST_ACHIEVED;
            }
        }

        return achieveState;
    }

    private generateGeneralInformation(): { text: React.ReactNode, colorClass: string, addTooltip: string } {
        let text: React.ReactNode = '';
        let colorClass: string = '';
        let addTooltip: string = '';

        let achieveState = this.checkIfAchievable();

        switch (achieveState) {
            case AchieveState.CAN_BE_ACHIEVED:
                text = Language.getString('LECTURE_OVERVIEW_INFO_CAN_BE_ACHIEVED');
                break;

            case AchieveState.PROBABLY_ACHIEVED:
                text = (<>
                    <FontAwesomeIcon
                        icon={{ prefix: 'fas', iconName: 'question' }}
                        className={this.props.classes.statGeneralInfoIcon}
                    />
                    {Language.getString('LECTURE_OVERVIEW_INFO_PROBABLY_ACHIEVED')}
                </>);
                addTooltip = Language.getString('LECTURE_OVERVIEW_INFO_PROBABLY_ACHIEVED_TOOLTIP');
                colorClass = this.props.classes.almostAchievedColor;
                break;

            case AchieveState.ACHIEVED:
                text = (<>
                    <FontAwesomeIcon
                        icon={{ prefix: 'fas', iconName: 'check' }}
                        className={this.props.classes.statGeneralInfoIcon}
                    />
                    {Language.getString('LECTURE_OVERVIEW_INFO_ACHIEVED')}
                </>);
                addTooltip = Language.getString('LECTURE_OVERVIEW_INFO_ACHIEVED_TOOLTIP');
                colorClass = this.props.classes.achievedColor;
                break;

            case AchieveState.NOT_ACHIEVABLE:
                text = (<>
                    <FontAwesomeIcon
                        icon={{ prefix: 'fas', iconName: 'times' }}
                        className={this.props.classes.statGeneralInfoIcon}
                    />
                    {Language.getString('LECTURE_OVERVIEW_INFO_NOT_ACHIEVABLE')}
                </>);
                addTooltip = Language.getString('LECTURE_OVERVIEW_INFO_NOT_ACHIEVABLE_TOOLTIP');
                colorClass = this.props.classes.notAchievedColor;
                break;

            case AchieveState.ALMOST_ACHIEVED:
                text = (<>
                    <FontAwesomeIcon
                        icon={{ prefix: 'fas', iconName: 'info' }}
                        className={this.props.classes.statGeneralInfoIcon}
                    />
                    {Language.getString('LECTURE_OVERVIEW_INFO_ALMOST_ACHIEVED')}
                </>);
                addTooltip = Language.getString('LECTURE_OVERVIEW_INFO_ALMOST_ACHIEVED_TOOLTIP');
                colorClass = this.props.classes.almostAchievedColor;
                break;

            case AchieveState.NO_INFO_AVAILABLE:
                text = (<>
                    <FontAwesomeIcon
                        icon={{ prefix: 'fas', iconName: 'info' }}
                        className={this.props.classes.statGeneralInfoIcon}
                    />
                    {Language.getString('LECTURE_OVERVIEW_INFO_NO_INFO_AVAILABLE')}
                </>);
                addTooltip = Language.getString('LECTURE_OVERVIEW_INFO_NO_INFO_AVAILABLE_TOOLTIP');
                break;

            default:
                console.error(`[ERROR] LectureOverview::getInformationText -- No case for the AchieveState ${achieveState} given.`);
        }

        return { text, colorClass, addTooltip };
    }

    private generateSystemOverviewBox(system: LectureSystem): JSX.Element {
        let points = DataService.getActiveLecturePointsOfSystem(system.id);
        let pointsPerFutureSheet: number = this.calculatePointsPerFutureSheets(system, points.achieved, points.total);
        let sheetsRemaining = DataService.getActiveLectureTotalSheetCount() - DataService.getActiveLectureCurrentSheetCount();
        let iconToShow: SystemOverviewBoxIcon = 'none';

        if (pointsPerFutureSheet == 0) {
            iconToShow = 'achieved';

        } else if (pointsPerFutureSheet == Number.NEGATIVE_INFINITY) {
            iconToShow = 'notAchieved';

        }

        return (
            <SystemOverviewBox
                key={'SYS_OVERVIEW_' + system.id}
                systemName={system.name}
                pointsEarned={points.achieved}
                pointsTotal={points.total}
                pointsPerFutureSheets={pointsPerFutureSheet}
                iconToShow={iconToShow}
                usesEstimation={sheetsRemaining > 0 && system.pointsPerSheet == 0}
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

        if (ptsNeededTotal <= ptsAchieved) {
            return 0;
        }

        if (sheetsRemaining <= 0) {
            // We have not achieved the points we need and there are no sheets left.
            return Number.NEGATIVE_INFINITY;
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
import { Button, Checkbox, Fade, FormControl, FormControlLabel, FormGroup, Grid, Paper, StyleRulesCallback, TextField, Theme, Typography, WithStyles, withStyles, Zoom, Tooltip } from '@material-ui/core';
import * as React from 'react';
import { CreateBar } from '../components/bars/CreateBar';
import { DeleteButton } from '../components/controls/DeleteButton';
import { InfoBar } from '../components/bars/InfoBar';
import { NumberInput } from '../components/controls/NumberInput';
import { SquareButton } from '../components/controls/SquareButton';
import { SystemEditor } from '../components/editors/SystemEditor';
import { LectureSystem } from '../data/LectureSystem';
import Language from '../helpers/Language';
import StateService from '../helpers/StateService';
import { Lecture } from '../data/Lecture';
import { DataService } from '../helpers/DataService';
import { NotificationService } from '../helpers/NotificationService';

interface Props {

}

interface RequiredInputFields {
    isValidName: boolean;
    hasValidSystems: boolean;
    isValidPresentationValue: boolean;
    // TODO: Vervollständigen
}

interface State extends RequiredInputFields {
    lectureName: string;
    lectureSheetCount: number;
    hasPresentationPoints: boolean;
    lecturePresentationPoints: number;

    isEditingSystem: boolean;
    lectureSystems: LectureSystem[];
}

type CreateLectureClassKey =
    | 'root'
    | 'generalInfoDiv'
    | 'generalInfoPaper'
    | 'systemsDiv'
    | 'systemOverviewList'
    | 'errorBorder'
    | 'buttonBox';

const style: StyleRulesCallback<CreateLectureClassKey> = (theme: Theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        alignContent: 'flex-start',
        height: '100%'
    },
    generalInfoDiv: {
        display: 'flex',
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignContent: 'flex-start'
    },
    generalInfoPaper: {
        flex: 1,
        marginRight: theme.spacing.unit * 2,
        padding: theme.spacing.unit * 1.5
    },
    systemsDiv: {
        // backgroundColor: 'purple',
        flex: 1,
        overflowY: 'auto',
        padding: theme.spacing.unit * 1.5,
        position: 'relative',
        border: '2px solid ' + theme.palette.divider,
        '&> h3': {
            marginBottom: theme.spacing.unit
        }
    },
    systemOverviewList: {
        position: 'absolute',
        left: theme.spacing.unit * 1.5,
        right: theme.spacing.unit * 1.5,
        paddingBottom: theme.spacing.unit
    },
    buttonBox: {
        display: 'flex',
        justifyContent: 'flex-end',
        width: '100%',
        marginTop: theme.spacing.unit * 2
    },
    errorBorder: {
        borderColor: theme.palette.error.main
    }
});
type PropType = Props & WithStyles<CreateLectureClassKey>;

// TODO: Input-Validation
// TODO: Wenn Lecture in Prop übergeben, dann wird das ganze zu einer Edit-Scene?
class CreateLectureClass extends React.Component<PropType, State> {
    constructor(props: PropType) {
        super(props);

        this.state = {
            lectureName: '',
            lectureSheetCount: 0,
            hasPresentationPoints: false,
            lecturePresentationPoints: 1,
            isEditingSystem: true,
            lectureSystems: [],

            isValidName: true,
            hasValidSystems: true,
            isValidPresentationValue: true
        };
    }

    render() {
        let isLectureSystemError = !this.state.isEditingSystem && !this.state.hasValidSystems;
        let addClassSystemDiv = isLectureSystemError ? this.props.classes.errorBorder : '';

        return (
            <div className={this.props.classes.root} >
                <div className={this.props.classes.generalInfoDiv} >
                    <Paper square elevation={5} className={this.props.classes.generalInfoPaper} >
                        <Grid container direction='column' spacing={16} >
                            <Grid item>
                                <Typography variant='subheading' >
                                    {Language.getString('CREATE_LECTURE_DETAIL_OVERVIEW')}
                                </Typography>
                            </Grid>
                            <Grid item>
                                {/* TODO: Name */}
                                <TextField
                                    type='text'
                                    label={Language.getString('CREATE_LECTURE_NAME')}
                                    value={this.state.lectureName}
                                    onChange={this.handleNameChanged}
                                    error={!this.state.isValidName}
                                    helperText={!this.state.isValidName ? Language.getString('CREATE_LECTURE_NO_VALID_NAME') : ''}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item>
                                {/* TODO: Anzahl Blätter */}
                                <NumberInput
                                    value={this.state.lectureSheetCount}
                                    onValueChanged={this.handleSheetCountChanged}
                                    label={Language.getString('CREATE_LECTURE_SHEET_COUNT')}
                                    helperText={Language.getString('CREATE_LECTURE_SHEET_COUNT_HELPER')}
                                />
                            </Grid>
                            <Grid item>
                                {/* TODO: Vorrechenpunkte */}
                                <FormGroup>
                                    <FormControlLabel
                                        control={<Checkbox color='primary' />}
                                        onChange={this.handleHasPresentationChanged}
                                        label={Language.getString('CREATE_LECTURE_NEEDS_PRESENTATION_POINTS')}
                                    />
                                    <FormControl>
                                        <NumberInput
                                            // defaultValue={1}
                                            value={this.state.lecturePresentationPoints}
                                            disabled={!this.state.hasPresentationPoints}
                                            onValueChanged={this.handlePresentationPointsChanged}
                                            label={Language.getString('CREATE_LECTURE_PRESENTATION_POINTS')}
                                            error={!this.state.isValidPresentationValue}
                                            helperText={!this.state.isValidPresentationValue ? Language.getString('CREATE_LECTURE_NO_VALID_PRESENTATION_POINTS') : ''}
                                        />
                                    </FormControl>
                                </FormGroup>
                            </Grid>
                        </Grid>
                    </Paper>

                    <Tooltip
                        title={
                            <Typography variant='body1' >
                                {Language.getString('CREATE_LECTURE_NO_SYSTEM_CREATED')}
                            </Typography>
                        }
                        placement='bottom'
                        open={isLectureSystemError}
                    >
                        <div
                            className={this.props.classes.systemsDiv + ' ' + addClassSystemDiv}
                        >
                            <Fade
                                in={!this.state.isEditingSystem}
                                // Make sure this element is unmounted while the system-editor is shown so there are no unneccessary scrollbars
                                unmountOnExit
                                timeout={400}
                            >
                                <div className={this.props.classes.systemOverviewList} >
                                    <Typography variant='subheading' >
                                        {Language.getString('CREATE_LECTURE_OVERVIEW_LECTURE_SYSTEMS')}
                                    </Typography>
                                    <Grid container direction='column' spacing={8} >
                                        <Grid item xs>
                                            <CreateBar
                                                onCreateClicked={this.showEditor}
                                                color='default'
                                                variant='outlined'
                                                elevation={0}
                                            >
                                                {Language.getString('CREATE_LECTURE_CREATE_SYSTEM')}
                                            </CreateBar>
                                        </Grid>
                                        {this.state.lectureSystems.map((sys, idx) =>
                                            <Grid key={sys.id + idx} item xs>
                                                <InfoBar
                                                    elevation={0}
                                                    addButtons={[
                                                        // TODO: Listener einfügen
                                                        <SquareButton variant='outlined' >
                                                            <i className='far fa-pen' ></i>
                                                        </SquareButton>,
                                                        <DeleteButton
                                                            variant='outlined'
                                                            tooltipElement={Language.getString('CREATE_LECTURE_CONFIRM_SYSTEM_DELETION')}
                                                        >
                                                            <i className='far fa-trash-alt' ></i>
                                                        </DeleteButton>
                                                    ]}
                                                    hideInfoButton
                                                >
                                                    {sys.name}
                                                </InfoBar>
                                            </Grid>
                                        )}
                                    </Grid>
                                </div>
                            </Fade>

                            <Zoom
                                in={this.state.isEditingSystem}
                                unmountOnExit
                                style={{ zIndex: 10 }}
                                timeout={500}
                            >
                                <SystemEditor
                                    onSystemCreation={this.onSystemCreation}
                                    onAbortClicked={this.onSystemCreationAbort}
                                />
                            </Zoom>
                        </div>
                    </Tooltip>
                </div>

                <div className={this.props.classes.buttonBox} >
                    <Button
                        color='secondary'
                        variant='outlined'
                        style={{ borderRadius: '0', marginRight: '8px' }}
                        onClick={() => StateService.goBack()}
                    >
                        {Language.getString('BUTTON_ABORT')}
                    </Button>
                    <Button
                        color='primary'
                        variant='raised'
                        onClick={this.handleCreateLecture}
                        style={{ borderRadius: '0' }}
                    >
                        {Language.getString('BUTTON_CREATE')}
                    </Button>
                </div>
            </div>
        );
    }

    private handleCreateLecture = () => {
        if (!this.isValidInput()) {
            return;
        }

        // TODO: Alle Infos in VL abspeichern.
        let lecture: Lecture = new Lecture(
            'BLANK',
            this.state.lectureName,
            this.state.lectureSystems
        );
        DataService.addLecture(lecture);

        NotificationService.showNotification({
            title: Language.getString('CREACTE_LECTURE_SUCCESS_NOTI_TITLE'),
            // message: 'Die Vorlesung ' + this.state.lectureName + ' wurde erfolgreich erstellt.',
            message: Language.getString('CREACTE_LECTURE_SUCCESS_NOTI_MESSAGE', '\"' + this.state.lectureName + '\"'),
            level: 'success'
        });

        StateService.goBack();
    }

    private isValidInput(): boolean {
        let reqInputs: RequiredInputFields = {
            isValidName: this.isValidLectureName(this.state.lectureName),
            hasValidSystems: this.hasValidSystems(),
            isValidPresentationValue: this.isValidPresentationValue(this.state.hasPresentationPoints, this.state.lecturePresentationPoints)
        };

        // Check if every input is valid
        let isAllValid = true;
        Object.entries(reqInputs).forEach((val) => {
            if (!val[1]) {
                isAllValid = false;
            }
        });

        this.setState(reqInputs);
        return isAllValid;
    }

    private isValidLectureName(name: string): boolean {
        return name !== '';
    }

    private hasValidSystems(): boolean {
        return this.state.lectureSystems.length > 0;
    }

    private isValidPresentationValue(hasPresPoints: boolean, amount: number): boolean {
        if (!hasPresPoints) {
            // If there are no presentations every presentation value is considered valid.
            return true;
        }

        return amount > 0;
    }

    /**
     * Gets called when the user changes the name of the lecture.
     */
    private handleNameChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            lectureName: event.target.value,
            isValidName: this.isValidLectureName(event.target.value)
        });
    }

    /**
     * Gets called when the user changes the amount of sheets.
     */
    private handleSheetCountChanged = (_: number, newCount: number) => {
        this.setState({
            lectureSheetCount: newCount
        });
    }

    /**
     * Gets called when the user checks/unchecks the option if there are presentation points.
     */
    private handleHasPresentationChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            hasPresentationPoints: event.target.checked,
            isValidPresentationValue: this.isValidPresentationValue(event.target.checked, this.state.lecturePresentationPoints)
        });
    }

    /**
     * Gets called when the user changes the amount of presentation points needed.
     */
    private handlePresentationPointsChanged = (_: number, newPoints: number) => {
        this.setState({
            lecturePresentationPoints: newPoints,
            isValidPresentationValue: this.isValidPresentationValue(this.state.hasPresentationPoints, newPoints)
        });
    }

    /**
     * Gets called after the LectureSystem is created by the SystemEditor.
     * @param sys Created LectureSystem
     */
    private onSystemCreation = (sys: LectureSystem) => {
        this.state.lectureSystems.push(sys);
        this.hideEditor();

    }

    /**
     * Gets called if the creation/editing of a lecture system is aborted.
     */
    private onSystemCreationAbort = () => {
        this.hideEditor();
    }

    /**
     * Called when the SystemEditor should be shown.
     */
    private showEditor = () => {
        this.setState({ isEditingSystem: true });
    }

    /**
     * Called when the SystemEditor should be hidden.
     */
    private hideEditor() {
        this.setState({
            isEditingSystem: false,
            hasValidSystems: this.hasValidSystems()
        });
    }
}

/**
 * Scene for creating a lecture. Lets the user input all information needed and handles the communication with the DataService in all relevant cases.
 */
export const CreateLecture = withStyles(style)<Props>(CreateLectureClass);
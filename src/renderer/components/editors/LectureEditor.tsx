import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Checkbox, createStyles, Fade, FormControl, FormControlLabel, FormGroup, Grid, Paper, Popper, TextField, Theme, Typography, WithStyles, withStyles, Zoom } from '@material-ui/core';
import * as React from 'react';
import { Lecture } from '../../data/Lecture';
import { LectureSystem } from '../../data/LectureSystem';
import { DataService } from '../../helpers/DataService';
import Language from '../../helpers/Language';
import { CreateBar } from '../bars/CreateBar';
import { InfoBar } from '../bars/InfoBar';
import { DeleteButton } from '../controls/DeleteButton';
import { NumberInput } from '../controls/NumberInput';
import { SquareButton } from '../controls/SquareButton';
import { SystemEditor } from './SystemEditor';

const style = (theme: Theme) => createStyles({
    root: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        alignContent: 'flex-start'
    },
    generalInfoDiv: {
        display: 'flex',
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignContent: 'flex-start'
    },
    generalInfoPaper: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        marginRight: theme.spacing.unit * 2,
        padding: theme.spacing.unit * 1.5
    },
    generalInfoPaperTitle: {
        marginBottom: theme.spacing.unit
    },
    generalInfoPaperForm: {
        height: 'inherit',
        overflowY: 'auto',
        overflowX: 'hidden'
    },
    systemsDiv: {
        flex: 1,
        padding: theme.spacing.unit * 1.5,
        paddingTop: theme.spacing.unit,
        position: 'relative',
        border: '2px solid ' + theme.palette.divider,
        '&> h3': {
            marginBottom: theme.spacing.unit
        }
    },
    popperPaper: {
        marginBottom: theme.spacing.unit / 2,
        padding: theme.spacing.unit
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

interface Props extends WithStyles<typeof style> {
    onCreateClicked: (lecture: Lecture) => void;
    onAbortClicked: () => void;
    lectureToEdit?: Lecture;
}

interface RequiredInputFields {
    isValidName: boolean;
    hasValidSystems: boolean;
    // isValidPresentationValue: boolean;
}

interface State extends RequiredInputFields {
    lectureName: string;
    sheetCount: number;
    hasPresentationPoints: boolean;
    presentationPoints: number;
    lectureSystems: LectureSystem[];

    isCreatingSystem: boolean;
    systemToEdit: LectureSystem | undefined;
    btnTextAbort: string;
    btnTextAccept: string;
}

class LectureEditorClass extends React.Component<Props, State> {
    private lectureNameTfRef: React.RefObject<HTMLInputElement>;
    private systemEditorRef: React.RefObject<HTMLDivElement>;
    private createButtonRef: React.RefObject<HTMLButtonElement>;

    constructor(props: Props) {
        super(props);

        this.systemEditorRef = React.createRef();
        this.createButtonRef = React.createRef();
        this.lectureNameTfRef = React.createRef();

        let lectureName: string = '';
        let sheetCount: number = 0;
        let hasPresentationPoints: boolean = false;
        let presentationPoints: number = 1;
        let lectureSystems: LectureSystem[] = [];
        let btnTextAccept: string = Language.getString('BUTTON_CREATE');

        if (this.props.lectureToEdit) {
            lectureName = this.props.lectureToEdit.name;
            sheetCount = this.props.lectureToEdit.totalSheetCount;
            hasPresentationPoints = this.props.lectureToEdit.hasPresentationPoints;

            if (hasPresentationPoints) {
                presentationPoints = this.props.lectureToEdit.criteriaPresentation;
            }

            this.props.lectureToEdit.getSystems().forEach((sys) => lectureSystems.push(sys));

            // Don't show the SystemEditor & modify the button text
            btnTextAccept = Language.getString('BUTTON_SAVE');
        }

        this.state = {
            lectureName,
            sheetCount,
            hasPresentationPoints,
            presentationPoints,
            lectureSystems,

            isCreatingSystem: false,
            systemToEdit: undefined,
            isValidName: true,
            hasValidSystems: true,
            btnTextAbort: Language.getString('BUTTON_ABORT'),
            btnTextAccept
        };
    }

    componentDidMount() {
        this.setState({
            isCreatingSystem: this.props.lectureToEdit == undefined
        });

        setTimeout(() => {
            if (this.lectureNameTfRef.current) {
                this.lectureNameTfRef.current.focus();
            }
        }, 0);
    }

    render() {
        let isLectureSystemError = !this.state.isCreatingSystem && !this.state.hasValidSystems;
        let addClassSystemDiv = isLectureSystemError ? this.props.classes.errorBorder : '';

        let showSystemEditor = this.state.isCreatingSystem || (this.state.systemToEdit !== undefined);

        let stillReqMsg: string | undefined = this.getStillRequiredMessage();

        return (
            <div className={this.props.classes.root} >
                <div className={this.props.classes.generalInfoDiv} >
                    <Paper square elevation={5} className={this.props.classes.generalInfoPaper} >
                        <Typography variant='subtitle1' className={this.props.classes.generalInfoPaperTitle} >
                            {Language.getString('CREATE_LECTURE_DETAIL_OVERVIEW')}
                        </Typography>

                        <div className={this.props.classes.generalInfoPaperForm}>
                            <Grid container direction='column' spacing={16}>
                                <Grid item>
                                    <TextField
                                        type='text'
                                        label={Language.getString('CREATE_LECTURE_NAME')}
                                        value={this.state.lectureName}
                                        onChange={this.handleNameChanged}
                                        error={!this.state.isValidName}
                                        InputProps={{
                                            inputRef: this.lectureNameTfRef
                                        }}
                                        helperText={!this.state.isValidName ? Language.getString('CREATE_LECTURE_NO_VALID_NAME') : ''}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item>
                                    <NumberInput
                                        value={this.state.sheetCount}
                                        onValueChanged={this.handleSheetCountChanged}
                                        label={Language.getString('CREATE_LECTURE_SHEET_COUNT')}
                                        helperText={Language.getString('CREATE_LECTURE_SHEET_COUNT_HELPER')}
                                    />
                                </Grid>
                                <Grid item>
                                    <FormGroup>
                                        <FormControlLabel
                                            control={<Checkbox
                                                color='primary'
                                                checked={this.state.hasPresentationPoints}
                                                onChange={this.handleHasPresentationChanged}
                                            />}
                                            label={Language.getString('CREATE_LECTURE_NEEDS_PRESENTATION_POINTS')}
                                        />
                                        <FormControl>
                                            <NumberInput
                                                // defaultValue={1}
                                                minValue={1}
                                                value={this.state.presentationPoints}
                                                disabled={!this.state.hasPresentationPoints}
                                                onValueChanged={this.handlePresentationPointsChanged}
                                                label={Language.getString('CREATE_LECTURE_PRESENTATION_POINTS')}
                                            />
                                        </FormControl>
                                    </FormGroup>
                                </Grid>
                            </Grid>
                        </div>
                    </Paper>

                    <div
                        ref={this.systemEditorRef}
                        className={this.props.classes.systemsDiv + ' ' + addClassSystemDiv}
                    >
                        <Fade
                            in={!showSystemEditor}
                            // Make sure this element is unmounted while the system-editor is shown so there are no unneccessary scrollbars
                            unmountOnExit
                            timeout={400}
                        >
                            <div className={this.props.classes.systemOverviewList} >
                                <Typography variant='subtitle1' style={{ marginBottom: 8 }}  >
                                    {Language.getString('CREATE_LECTURE_OVERVIEW_LECTURE_SYSTEMS')}
                                </Typography>
                                <Grid container direction='column' spacing={8} >
                                    <Grid item xs>
                                        <CreateBar
                                            onCreateClicked={this.onCreateSystemClicked}
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
                                                    <SquareButton variant='outlined' onClick={() => this.onEditSystem(sys)} >
                                                        <FontAwesomeIcon icon={{ prefix: 'far', iconName: 'pen' }} />
                                                    </SquareButton>,
                                                    <DeleteButton
                                                        variant='outlined'
                                                        tooltipElement={Language.getString('CREATE_LECTURE_CONFIRM_SYSTEM_DELETION')}
                                                        onAcceptClick={() => this.onDeleteSystem(sys)}
                                                    >
                                                        <FontAwesomeIcon icon={{ prefix: 'far', iconName: 'trash-alt' }} />
                                                    </DeleteButton>
                                                ]}
                                                onClick={() => this.onEditSystem(sys)}
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
                            in={showSystemEditor}
                            unmountOnExit
                            timeout={500}
                            // style={{ zIndex: 10 }}
                        >
                            <SystemEditor
                                onSystemCreation={this.onSystemCreation}
                                onAbortClicked={this.onSystemCreationAbort}
                                systemToEdit={this.state.systemToEdit}
                            />
                        </Zoom>
                    </div>
                </div>

                <div className={this.props.classes.buttonBox} >
                    <Button
                        color='secondary'
                        variant='outlined'
                        style={{ marginRight: '8px' }}
                        onClick={this.props.onAbortClicked}
                    >
                        {this.state.btnTextAbort}
                    </Button>
                    <Button
                        buttonRef={this.createButtonRef}
                        color='primary'
                        variant='contained'
                        onClick={this.handleCreateLecture}
                        disabled={stillReqMsg !== undefined}
                    >
                        {this.state.btnTextAccept}
                    </Button>
                </div>

                <Popper
                    key={`req_msg_popper_${stillReqMsg}`}
                    anchorEl={this.createButtonRef.current}
                    open={stillReqMsg !== undefined && !showSystemEditor}
                    placement='top-end'
                    transition
                >
                    {({ TransitionProps }) => (
                        <Fade {...TransitionProps} unmountOnExit>
                            <Paper className={this.props.classes.popperPaper}>
                                <Typography variant='caption' >{stillReqMsg}</Typography>
                            </Paper>
                        </Fade>
                    )}
                </Popper>
            </div>
        );
    }

    /**
     * Handles the click on the create lecture button. Will abort if not all required input is present and valid.
     */
    private handleCreateLecture = () => {
        if (!this.isValidInput()) {
            return;
        }

        let lecture = new Lecture(
            this.state.lectureName,
            this.state.lectureSystems,
            this.state.sheetCount,
            this.state.hasPresentationPoints,
            this.state.hasPresentationPoints ? this.state.presentationPoints : 0
        );

        if (this.props.lectureToEdit) {
            lecture.id = this.props.lectureToEdit.id;
        }

        this.props.onCreateClicked(lecture);
    }

    /**
     * Checks if every required input is present AND valid.
     * @returns Is all required input present and valid?
     */
    private isValidInput(): boolean {
        let reqInputs: RequiredInputFields = {
            isValidName: this.isValidLectureName(this.state.lectureName),
            hasValidSystems: this.hasValidSystems(),
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

    /**
     * Checks if the given name is a valid lecture name.
     * @param name Name to check
     * @returns Is the name a valid lecture name?
     */
    private isValidLectureName(name: string): boolean {
        return name !== '';
    }

    /**
     * Checks if the lecture has valid systems.
     * @returns Has the lecture valid systems?
     */
    private hasValidSystems(): boolean {
        return this.state.lectureSystems.length > 0;
    }

    private getStillRequiredMessage(): string | undefined {
        if (!this.state.isValidName) {
            return Language.getString('CREATE_LECTURE_NO_VALID_NAME');
        }

        if (!this.state.hasValidSystems) {
            return Language.getString('CREATE_LECTURE_NO_SYSTEM_CREATED');
        }

        return undefined;
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
            sheetCount: newCount
        });
    }

    /**
     * Gets called when the user checks/unchecks the option if there are presentation points.
     */
    private handleHasPresentationChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            hasPresentationPoints: event.target.checked,
        });
    }

    /**
     * Gets called when the user changes the amount of presentation points needed.
     */
    private handlePresentationPointsChanged = (_: number, newPoints: number) => {
        this.setState({
            presentationPoints: newPoints,
        });
    }

    /**
     * Gets called after the LectureSystem is created by the SystemEditor.
     * @param sys Created LectureSystem
     */
    private onSystemCreation = (sys: LectureSystem) => {
        if (this.state.systemToEdit) {
            let idx = this.state.lectureSystems.findIndex((s) => s.id === sys.id);
            if (idx === -1) {
                return;
            }

            this.state.lectureSystems[idx] = sys;
        } else {
            sys.id = DataService.generateLectureSystemId();

            // No direct need to trigger a rerender because 'hideEditor' will do this for us.
            this.state.lectureSystems.push(sys);
        }

        this.hideEditor();
    }

    /**
     * Gets called if the user presses twice on the DeleteButton to delete the given system.
     * @param sys LectureSystem to delete
     */
    private onDeleteSystem = (sys: LectureSystem) => {
        let idx = this.state.lectureSystems.findIndex((s) => s.id === sys.id);

        if (idx === -1) {
            return;
        }

        // Needs to be done this way so the rerender is triggered after removing the item from the array.
        this.state.lectureSystems.splice(idx, 1);
        this.setState({
            lectureSystems: this.state.lectureSystems,
            hasValidSystems: this.hasValidSystems()
        });
    }

    /**
     * Gets called if the creation/editing of a lecture system is aborted.
     */
    private onSystemCreationAbort = () => {
        this.hideEditor();
    }

    /**
     * Called when the SystemEditor should be shown and a new system should be created..
     */
    private onCreateSystemClicked = () => {
        this.setState({ isCreatingSystem: true });
    }

    private onEditSystem = (system: LectureSystem) => {
        this.setState({
            systemToEdit: system
        });
    }

    /**
     * Called when the SystemEditor should be hidden.
     */
    private hideEditor() {
        this.setState({
            isCreatingSystem: false,
            systemToEdit: undefined,
            hasValidSystems: this.hasValidSystems()
        });
    }
}

/**
 * Scene for creating a lecture. Lets the user input all information needed and handles the communication with the DataService in all relevant cases.
 */
export const LectureEditor = withStyles(style)(LectureEditorClass);
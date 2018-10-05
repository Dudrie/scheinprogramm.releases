import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, createStyles, Grid, IconButton, InputAdornment, Omit, TextField, Theme, Typography, WithStyles, withStyles } from '@material-ui/core';
import * as React from 'react';
import { LectureSystem, SystemType } from '../../data/LectureSystem';
import { FormValidator, ValidationResults, ValidationState } from '../../helpers/FormValidator';
import Language from '../../helpers/Language';
import { NumberInput } from '../controls/NumberInput';

const style = (theme: Theme) => createStyles({
    root: {
        display: 'flex',
        width: '100%',
        height: '100%',
        flexDirection: 'column',
    },
    title: {
        marginBottom: theme.spacing.unit * 2
    },
    form: {
        height: 'inherit',
        overflowY: 'auto',
        // overflowX: 'hidden',
        marginTop: 0,
        marginBottom: 0
    },
    typeButtonBox: {
        display: 'flex',
        flexDirection: 'column',
        paddingTop: theme.spacing.unit * 0,
        height: '100%',
    },
    typeButton: {
        width: '100%',
        fontSize: theme.typography.fontSize * 1.25,
        marginBottom: theme.spacing.unit * 4,
        height: '72px',
        textTransform: 'none',
        '&:last-of-type': {
            marginBottom: 0
        }
    },
    buttonBox: {
        alignSelf: 'flex-end',
        marginTop: theme.spacing.unit * 2,
    }
});

interface Props extends Omit<React.HTMLProps<HTMLDivElement>, 'classes'>, WithStyles<typeof style> {
    /**
     * Called, after a LectureSystem is created. Will pass the newly created LectureSystem as parameter.
     */
    onSystemCreation: (sys: LectureSystem) => void;

    /**
     * Called when the abort button gets clicked.
     */
    onAbortClicked: () => void;

    systemToEdit?: LectureSystem;
}

type FormFields = { name: string, criteria: number, criteriaPerSheet: number };

interface State {
    name: string;
    typeValue: SystemType | undefined;
    criteria: number;
    criteriaPerSheet: number;
    pointsPerSheet: number;

    btnTextAbort: string;
    btnTextAccept: string;

    validationResults: ValidationResults<FormFields>;
}

// TODO: System, um zu tracken, wenn ein bestimmter Prozentsatz aller Blätter bestanden werden muss.
class SystemEditorClass extends React.Component<Props, State> {
    // Used for preventing the situation where the same system gets accidently (through multipli clicks) added multiple times.
    private readonly BUTTON_CLICK_TIMEOUT: number = 2000;
    private lastAddClick: number = 0;
    private validator: FormValidator<FormFields>;

    constructor(props: Props) {
        super(props);

        this.validator = new FormValidator([
            {
                field: 'name',
                errorMessage: Language.getString('SYSTEM_EDITOR_NO_VALID_NAME'),
                method: this.isValidName.bind(this),
                validWhen: true
            },
            {
                field: 'criteria',
                errorMessage: Language.getString('SYSTEM_EDITOR_NO_VALID_CRITERIA'),
                method: this.isValidCriteria.bind(this),
                validWhen: true
            },
            {
                field: 'criteriaPerSheet',
                errorMessage: Language.getString('SYSTEM_EDITOR_NO_VALID_CRITERIA'),
                method: this.isValidCriteria.bind(this),
                validWhen: true
            }
        ]);

        let name: string = '';
        let typeValue: SystemType | undefined = undefined;
        let criteria: number = 0;
        let criteriaPerSheet: number = 0;
        let pointsPerSheet: number = 0;
        let btnTextAccept: string = Language.getString('BUTTON_ADD');

        if (this.props.systemToEdit) {
            name = this.props.systemToEdit.name;
            typeValue = this.props.systemToEdit.systemType;
            criteria = this.props.systemToEdit.criteria;
            criteriaPerSheet = this.props.systemToEdit.criteriaPerSheet;
            pointsPerSheet = this.props.systemToEdit.pointsPerSheet;
            btnTextAccept = Language.getString('BUTTON_SAVE');
        }

        this.state = {
            name,
            typeValue,
            criteria,
            criteriaPerSheet,
            pointsPerSheet,

            btnTextAbort: Language.getString('BUTTON_ABORT'),
            btnTextAccept,
            validationResults: this.validator.getValidationResults()
        };
    }

    render() {
        let { onSystemCreation, onAbortClicked, systemToEdit, classes, ...other } = this.props;
        let { typeValue } = this.state;

        let addTitle: string = '';

        if (typeValue != undefined) {
            addTitle = ` - ${Language.getSystemTypeName(typeValue)}`;
        }

        return (
            <div className={classes.root} {...other}>
                <div>
                    <Typography variant='subheading' className={classes.title}>
                        {Language.getString('SYSTEM_EDITOR_TITLE') + addTitle}

                        <IconButton
                            style={{
                                visibility: (typeValue == undefined ? 'hidden' : 'visible')
                            }}
                            onClick={() => this.setState({ typeValue: undefined })}
                        >
                            <FontAwesomeIcon size='xs' icon={{ prefix: 'far', iconName: 'pencil' }} />
                        </IconButton>
                    </Typography>
                </div>

                <div className={classes.form}>
                    {typeValue == undefined && this.showTypeSelection() || this.showForm()}

                </div>

                <div className={classes.buttonBox} >
                    <Button
                        size='small'
                        variant='outlined'
                        color='secondary'
                        style={{ marginRight: '8px' }}
                        onClick={this.props.onAbortClicked}
                    >
                        {this.state.btnTextAbort}
                    </Button>
                    <Button
                        size='small'
                        variant='outlined'
                        disabled={this.state.typeValue == undefined}
                        onClick={this.onAcceptClicked}
                    >
                        {this.state.btnTextAccept}
                    </Button>
                </div>
            </div>
        );
    }

    private showTypeSelection(): React.ReactNode {
        return (
            <div className={this.props.classes.typeButtonBox}>
                <Button
                    className={this.props.classes.typeButton}
                    variant='outlined'
                    size='large'
                    onClick={() => this.setState({ typeValue: SystemType.ART_PROZENT_TOTAL })}
                >
                    {Language.getSystemTypeName(SystemType.ART_PROZENT_TOTAL)}
                </Button>

                <Button
                    className={this.props.classes.typeButton}
                    variant='outlined'
                    onClick={() => this.setState({ typeValue: SystemType.ART_PROZENT_SHEETS })}
                >
                    {Language.getSystemTypeName(SystemType.ART_PROZENT_SHEETS)}
                </Button>
            </div>
        );
    }

    private showForm(): React.ReactNode {
        if (this.state.typeValue == undefined) {
            // If we end up here but don't have a type (this should NEVER happen) we'll just show the correct interface.
            return this.showTypeSelection();
        }

        let { validationResults } = this.state;

        return (
            <Grid container direction='column' wrap='nowrap' spacing={16}>
                <Grid item >
                    <TextField
                        name='name'
                        label={Language.getString('SYSTEM_EDITOR_NAME_LABEL')}
                        placeholder={Language.getString('SYSTEM_EDITOR_NAME_PLACEHOLDER')}
                        error={validationResults.fields['name'].wasValidated && validationResults.fields['name'].isInvalid}
                        value={this.state.name}
                        onChange={this.handleNameChanged}
                        InputLabelProps={{
                            shrink: true
                        }}
                        helperText={validationResults.fields['name'].errorMessage}
                        fullWidth
                        autoFocus
                    />
                </Grid>
                <Grid item>
                    <div style={{ display: 'flex', alignItems: 'flex-start' }} >
                        {this.getCriteriaInputs()}
                    </div>
                </Grid>
                <Grid item>
                    <NumberInput
                        label={Language.getString('SYSTEM_EDITOR_POINTS_PER_SHEET')}
                        value={this.state.pointsPerSheet}
                        helperText={Language.getString('SYSTEM_EDITOR_ZERO_POINTS_PER_SHEET')}
                        onValueChanged={this.handlePointsPerSheetChanged}
                    />
                </Grid>
            </Grid>
        );
    }

    private getCriteriaInputs(): React.ReactNode {
        let { validationResults, typeValue } = this.state;

        switch (this.state.typeValue) {
            case SystemType.ART_PROZENT_SHEETS:
                return (<>
                    <NumberInput
                        label={Language.getString('SYSTEM_EDITOR_CRITERIA_NEEDED_PERCENTAGE_SHEETS')}
                        error={validationResults.fields['criteria'].wasValidated && validationResults.fields['criteria'].isInvalid}
                        helperText={validationResults.fields['criteria'].errorMessage}
                        InputProps={{
                            startAdornment: <InputAdornment position='start'><FontAwesomeIcon icon={{ prefix: 'fal', iconName: 'percentage' }} /></InputAdornment>
                        }}
                        value={this.state.criteria}
                        maxValue={100}
                        onValueChanged={this.handleCriteriaChanged}
                        gridContainerProps={{
                            style: { marginRight: 4, flex: 1 }
                        }}
                    />

                    {typeValue == SystemType.ART_PROZENT_SHEETS &&
                        // TODO: Eingaben müssen (!) einen Effekt haben.
                        <NumberInput
                            label={Language.getString('SYSTEM_EDITOR_CRITERIA_NEEDED_PERCENTAGE_PER_SHEET')}
                            error={validationResults.fields['criteriaPerSheet'].wasValidated && validationResults.fields['criteriaPerSheet'].isInvalid}
                            helperText={validationResults.fields['criteriaPerSheet'].errorMessage}
                            value={this.state.criteriaPerSheet}
                            maxValue={100}
                            onValueChanged={this.handleCriteriaPerSheeetChanged}
                            InputProps={{
                                startAdornment: <InputAdornment position='start'><FontAwesomeIcon icon={{ prefix: 'fal', iconName: 'percentage' }} /></InputAdornment>
                            }}
                            gridContainerProps={{
                                style: { marginLeft: 4, flex: 1 }
                            }}
                        />
                    }
                </>);

            default:
                return (
                    <NumberInput
                        label={Language.getString('SYSTEM_EDITOR_CRITERIA_NEEDED')}
                        error={validationResults.fields['criteria'].wasValidated && validationResults.fields['criteria'].isInvalid}
                        helperText={validationResults.fields['criteria'].errorMessage}
                        InputProps={{
                            startAdornment: <InputAdornment position='start'><FontAwesomeIcon icon={{ prefix: 'fal', iconName: 'percentage' }} /></InputAdornment>
                        }}
                        value={this.state.criteria}
                        maxValue={100}
                        onValueChanged={this.handleCriteriaChanged}
                    />
                );
        }
    }

    /**
     * Checks if all inputs are valid.
     *
     * @returns Are all inputs valid?
     */
    private isAllInputValid() {
        let validationResults: ValidationResults<FormFields> = this.validator.validateAll({
            name: this.state.name,
            criteria: this.state.criteria,
            criteriaPerSheet: this.state.criteriaPerSheet
        });

        this.setState({
            validationResults
        });

        return validationResults.isValid;
    }

    private validateField(field: keyof FormFields, fieldValue: any) {
        let validationState: ValidationState<FormFields> = {
            name: this.state.name,
            criteria: this.state.criteria,
            criteriaPerSheet: this.state.criteriaPerSheet
        };

        validationState[field] = fieldValue;

        this.setState({
            validationResults: this.validator.validateField(field, validationState)
        });
    }

    /**
     * Checks if the given name is a valid name for a LectureSystem.
     *
     * @param name Name which should be checked.
     * @returns Is the name valid?
     */
    private isValidName(name: string): boolean {
        return name !== '';
    }

    /**
     * Checks if the given criteria is valid. Takes the currently selected SystemType into account.
     *
     * @param criteria Criteria which should be checked
     * @returns Is criteria valid?
     */
    private isValidCriteria(criteria: number): boolean {
        switch (this.state.typeValue) {
            case SystemType.ART_PROZENT_TOTAL:
            case SystemType.ART_PROZENT_SHEETS:
                return criteria > 0 && criteria <= 100;

            case SystemType.ART_PUNKTE:
                return criteria > 0;
        }

        return false;
    }

    /**
     * Handles the click on the accomplishment button. Will create a new LectureSystem via the DataService and pass it to the given callback in the props of this component.
     */
    private onAcceptClicked = () => {
        let clickTime = Date.now();
        if (clickTime < this.lastAddClick + this.BUTTON_CLICK_TIMEOUT) {
            return;
        }

        this.lastAddClick = clickTime;

        if (this.state.typeValue == undefined) {
            return;
        }

        if (!this.isAllInputValid()) {
            return;
        }

        let sys: LectureSystem = new LectureSystem(
            this.state.name,
            this.state.typeValue,
            this.state.criteria,
            this.state.criteriaPerSheet,
            this.state.pointsPerSheet
        );

        if (this.props.systemToEdit) {
            sys.id = this.props.systemToEdit.id;
        }

        this.props.onSystemCreation(sys);
    }

    /**
     * Handles the change event of the name input.
     * @param event ChangeEvent of the corresponding HTMLInputElement
     */
    private handleNameChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            name: event.target.value,
        });

        this.validateField('name', event.target.value);
    }

    /**
     * Handles the change event of the criteria NumberInput.
     * @param _ Not used
     * @param newNumber New value of the criteria
     */
    private handleCriteriaChanged = (_: number, newCriteria: number) => {
        this.setState({
            criteria: newCriteria,
        });

        this.validateField('criteria', newCriteria);
    }

    private handleCriteriaPerSheeetChanged = (_: number, newCriteria: number) => {
        this.setState({
            criteriaPerSheet: newCriteria
        });

        this.validateField('criteriaPerSheet', newCriteria);
    }

    /**
     * Handles the change event of the points per sheet NumberInput.
     * @param _ Not used
     * @param newPoints value of the NumberInput
     */
    private handlePointsPerSheetChanged = (_: number, newPoints: number) => {
        this.setState({ pointsPerSheet: newPoints });
    }
}

/**
 * Editorsheet for creating and modifing a LectureSystem. Will pass a newly created LectureSystem to the given callback in the props if the user 'accepts' the settings of the LectureSystem.
 */
export const SystemEditor = withStyles(style)(SystemEditorClass);
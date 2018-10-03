import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, createStyles, FormControlLabel, FormGroup, FormLabel, Grid, InputAdornment, Radio, RadioGroup, TextField, Theme, Typography, WithStyles, withStyles, Omit } from '@material-ui/core';
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
        overflowX: 'hidden',
        marginTop: 0,
        marginBottom: 0
    },
    buttons: {
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

type FormFields = { name: string, criteria: number };

interface State {
    name: string;
    typeValue: SystemType;
    criteria: number;
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
            }
        ]);

        let name: string = '';
        let typeValue: SystemType = SystemType.ART_PROZENT_TOTAL;
        let criteria: number = 0;
        let pointsPerSheet: number = 0;
        let btnTextAccept: string = Language.getString('BUTTON_ADD');

        if (this.props.systemToEdit) {
            name = this.props.systemToEdit.name;
            typeValue = this.props.systemToEdit.systemType;
            criteria = this.props.systemToEdit.criteria;
            pointsPerSheet = this.props.systemToEdit.pointsPerSheet;
            btnTextAccept = Language.getString('BUTTON_SAVE');
        }

        this.state = {
            name,
            typeValue,
            criteria,
            pointsPerSheet,

            btnTextAbort: Language.getString('BUTTON_ABORT'),
            btnTextAccept,
            validationResults: this.validator.getValidationResults()
        };
    }

    render() {
        let { onSystemCreation, onAbortClicked, systemToEdit, classes, ...other } = this.props;
        let { validationResults } = this.state;
        let maxCriteria: number = this.state.typeValue === SystemType.ART_PROZENT_TOTAL ? 100 : 999;

        return (
            <div className={classes.root} {...other}>
                <Typography variant='subheading' className={classes.title}>
                    {Language.getString('SYSTEM_EDITOR_TITLE')}
                </Typography>
                <div className={classes.form}>
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
                        <FormGroup>
                            <FormLabel>
                                <Typography variant='caption' >{Language.getString('SYSTEM_TYPE_LABEL')}</Typography>
                            </FormLabel>
                            <RadioGroup
                                value={this.state.typeValue.toString()}
                                onChange={this.handleTypeChanged}
                                style={{ flexDirection: 'row' }}
                            >
                                <FormControlLabel
                                    value={SystemType.ART_PROZENT_TOTAL.toString()}
                                    control={<Radio tabIndex={-1} color='primary' />}
                                    label={Language.getString('SYSTEM_TYPE_PERCENT_TOTAL')}
                                />
                                <FormControlLabel
                                    value={SystemType.ART_PROZENT_SHEETS.toString()}
                                    control={<Radio color='primary' />}
                                    label={Language.getString('SYSTEM_TYPE_PERCENT_SHEETS')}
                                    disabled
                                />
                                {/* <FormControlLabel
                                value={SystemType.ART_PUNKTE.toString()}
                                disabled
                                control={<Radio color='primary' />}
                                label={<><s>{Language.getString('SYSTEM_TYPE_POINTS')}</s> (WIP)</>}
                            /> */}
                            </RadioGroup>
                        </FormGroup>
                    </Grid>

                    <Grid item>
                        <NumberInput
                            label='Benötigt'
                            error={validationResults.fields['criteria'].wasValidated && validationResults.fields['criteria'].isInvalid}
                            helperText={validationResults.fields['criteria'].errorMessage}
                            InputProps={{
                                startAdornment: <InputAdornment position='start'><FontAwesomeIcon icon={{ prefix: 'fal', iconName: 'percentage' }} /></InputAdornment>
                            }}
                            value={this.state.criteria}
                            maxValue={maxCriteria}
                            onValueChanged={this.handleCriteriaChanged}
                        />
                    </Grid>
                    <Grid item>
                        <NumberInput
                            label='Punkte pro Blatt'
                            value={this.state.pointsPerSheet}
                            helperText={Language.getString('SYSTEM_EDITOR_ZERO_POINTS_PER_SHEET')}
                            onValueChanged={this.handlePointsPerSheetChanged}
                        />
                        {/* <FormControlLabel
                        control={
                            <Checkbox
                                color='primary'
                                onChange={this.handleHasAdditionalPointsChanged}
                                checked={this.state.hasAdditionalPoints}
                            />
                        }
                        label='Zusatzpunkte möglich'
                    /> */}
                    </Grid>
                </Grid>
                </div>

                <div className={classes.buttons} >
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
                        // disabled={!validationResults.isValid}
                        onClick={this.onAcceptClicked}
                    >
                        {this.state.btnTextAccept}
                    </Button>
                </div>
            </div>
        );
    }

    /**
     * Checks if all inputs are valid.
     *
     * @returns Are all inputs valid?
     */
    private isAllInputValid() {
        let validationResults: ValidationResults<FormFields> = this.validator.validateAll({
            name: this.state.name,
            criteria: this.state.criteria
        });

        this.setState({
            validationResults
        });

        return validationResults.isValid;
    }

    private validateField(field: keyof FormFields, fieldValue: any) {
        let validationState: ValidationState<FormFields> = {
            name: this.state.name,
            criteria: this.state.criteria
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

        if (!this.isAllInputValid()) {
            return;
        }

        let sys: LectureSystem = new LectureSystem(
            this.state.name,
            this.state.typeValue,
            this.state.criteria,
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
     * Handles the change event of the RadioGroup containing the possible SystemTypes.
     * @param event ChangeEvent of the corresponding HTMLFormElement
     */
    private handleTypeChanged = (event: React.ChangeEvent<{}>) => {
        let target: HTMLInputElement = event.target as HTMLInputElement;
        this.setState({
            typeValue: Number.parseInt(target.value)
        });
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
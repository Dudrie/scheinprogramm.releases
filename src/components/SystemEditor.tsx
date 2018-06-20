import { Button, Checkbox, FormControlLabel, FormGroup, FormLabel, Grid, InputAdornment, Radio, RadioGroup, TextField, Typography } from '@material-ui/core';
import { GridProps } from '@material-ui/core/Grid';
import * as React from 'react';
import { LectureSystem, SystemType } from '../data/LectureSystem';
import { DataService } from '../helpers/DataService';
import Language from '../helpers/Language';
import { NumberInput } from './controls/NumberInput';

interface Props extends GridProps {
    /**
     * Called, after a LectureSystem is created. Will pass the newly created LectureSystem as parameter.
     */
    onSystemCreation: (sys: LectureSystem) => void;

    /**
     * Called when the abort button gets clicked.
     */
    onAbortClicked: () => void;
}

interface NonValidInputFields {
    isNonValidName: boolean;
    isNonValidCriteria: boolean;
}

interface State extends NonValidInputFields {
    name: string;
    typeValue: SystemType;
    criteria: number;
    pointsPerSheet: number;
    hasAdditionalPoints: boolean;
}

// TODO: Als Style-Component umfunktionieren?

/**
 * Editorsheet for creating and modifing a LectureSystem. Will pass a newly created LectureSystem to the given callback in the props if the user 'accepts' the settings of the LectureSystem.
 */
export class SystemEditor extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            name: '',
            typeValue: SystemType.ART_PROZENT,
            criteria: 0,
            pointsPerSheet: 0,
            hasAdditionalPoints: false,

            // Consider all inputs as valid at the initialization
            isNonValidName: false,
            isNonValidCriteria: false
        };
    }

    render() {
        let { container, direction, spacing, onSystemCreation, onAbortClicked, ...other } = this.props;
        let maxCriteria: number = this.state.typeValue === SystemType.ART_PROZENT ? 100 : 999;

        return (
            <Grid container direction='column' spacing={16} {...other}>
                <Grid item>
                    <Typography variant='subheading'>
                        {Language.getString('SYSTEM_EDITOR_TITLE')}
                    </Typography>
                </Grid>
                <Grid item>
                    <TextField
                        label='System-Name'
                        error={this.state.isNonValidName}
                        value={this.state.name}
                        onChange={this.handleNameChanged}
                        helperText={this.state.isNonValidName ? Language.getString('SYSTEM_EDITOR_NP_VALID_NAME') : ''}
                        fullWidth
                        autoFocus
                    />
                </Grid>
                <Grid item>
                    <FormGroup>
                        <FormLabel>
                            <Typography variant='caption' >System-Art</Typography>
                        </FormLabel>
                        <RadioGroup
                            value={this.state.typeValue.toString()}
                            onChange={this.handleTypeChanged}
                            style={{ flexDirection: 'row' }}
                        >
                            <FormControlLabel
                                value={SystemType.ART_PROZENT.toString()}
                                control={<Radio color='primary' />}
                                label='Prozent'
                            />
                            <FormControlLabel
                                value={SystemType.ART_PUNKTE.toString()}
                                disabled
                                control={<Radio color='primary' />}
                                label={<><s>Punkte</s> (WIP)</>}
                            />
                        </RadioGroup>
                    </FormGroup>
                </Grid>

                <Grid item>
                    <NumberInput
                        label='Benötigt'
                        error={this.state.isNonValidCriteria}
                        helperText={this.state.isNonValidCriteria ? Language.getString('SYSTEM_EDITOR_NO_VALID_CRITERIA') : ''}
                        InputProps={{
                            startAdornment: <InputAdornment position='start'>{this.state.typeValue === SystemType.ART_PROZENT ? '%' : 'Pkt.'}</InputAdornment>
                        }}
                        value={this.state.criteria}
                        maxValue={maxCriteria}
                        onValueChanged={this.handleCriteriaChanged}
                        // showButtons
                    />
                </Grid>
                <Grid item>
                    <NumberInput
                        label='Punkte pro Blatt'
                        value={this.state.pointsPerSheet}
                        helperText={Language.getString('SYSTEM_EDITOR_ZERO_POINTS_PER_SHEET')}
                        onValueChanged={this.handlePointsPerSheetChanged}
                        // showButtons
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                color='primary'
                                onChange={this.handleHasAdditionalPointsChanged}
                                checked={this.state.hasAdditionalPoints}
                            />
                        }
                        label='Zusatzpunkte möglich'
                    />
                </Grid>
                <Grid item style={{ display: 'flex', justifyContent: 'flex-end' }} >
                    <Button
                        size='small'
                        variant='outlined'
                        color='secondary'
                        style={{ borderRadius: '0', marginRight: '8px' }}
                        onClick={this.props.onAbortClicked}
                    >
                        {Language.getString('BUTTON_ABORT')}
                    </Button>
                    <Button
                        size='small'
                        variant='outlined'
                        style={{ borderRadius: '0' }}
                        onClick={this.handleCreateClicked}
                    >
                        {Language.getString('BUTTON_ADD')}
                    </Button>
                </Grid>
            </Grid>
        );
    }

    /**
     * Checks if all inputs are valid.
     *
     * @returns Are all inputs valid?
     */
    private isValidInput(): boolean {
        let nonValidInputFields: NonValidInputFields = {
            isNonValidName: !this.isValidName(this.state.name),
            isNonValidCriteria: !this.isValidCriteria(this.state.criteria)
        };

        // Check if every input is valid.
        let isAllValidInput: boolean = true;
        Object.entries(nonValidInputFields).forEach((val) => {
            // If one input is NOT valid all input is considered non-valid.
            if (val[1]) {
                isAllValidInput = false;
            }
        });

        this.setState(nonValidInputFields);

        return isAllValidInput;
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
            case SystemType.ART_PROZENT:
                return criteria > 0 && criteria <= 100;

            case SystemType.ART_PUNKTE:
                return criteria > 0;
        }

        return false;
    }

    /**
     * Handles the click on the accomplishment button. Will create a new LectureSystem via the DataService and pass it to the given callback in the props of this component.
     */
    private handleCreateClicked = () => {
        if (!this.isValidInput()) {
            return;
        }

        // TODO: Short generieren
        let sys: LectureSystem = DataService.generateLectureSystem(
            this.state.name,
            'SHORT',
            this.state.typeValue,
            this.state.criteria,
            this.state.pointsPerSheet,
            this.state.hasAdditionalPoints
        );

        this.props.onSystemCreation(sys);
    }

    /**
     * Handles the change event of the name input.
     * @param event ChangeEvent of the corresponding HTMLInputElement
     */
    private handleNameChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            name: event.target.value,
            isNonValidName: event.target.value === ''
        });
    }

    /**
     * Handles the change event of the RadioGroup containing the possible SystemTypes.
     * @param event ChangeEvent of the corresponding HTMLFormElement
     */
    private handleTypeChanged = (event: React.ChangeEvent<HTMLFormElement>) => {
        this.setState({ typeValue: event.target.value });
    }

    /**
     * Handles the change event of the criteria NumberInput.
     * @param _ Not used
     * @param newNumber New value of the criteria
     */
    private handleCriteriaChanged = (_: number, newCriteria: number) => {
        this.setState({
            criteria: newCriteria,
            isNonValidCriteria: !this.isValidCriteria(newCriteria)
        });
    }

    /**
     * Handles the change event of the points per sheet NumberInput.
     * @param _ Not used
     * @param newPoints value of the NumberInput
     */
    private handlePointsPerSheetChanged = (_: number, newPoints: number) => {
        this.setState({ pointsPerSheet: newPoints });
    }

    /**
     * Handles the change event of the hasAdditionalPoints Checkbox.
     * @param event ChangeEvent of the corresponding HTMLInputElement
     */
    private handleHasAdditionalPointsChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ hasAdditionalPoints: event.target.checked });
    }
}
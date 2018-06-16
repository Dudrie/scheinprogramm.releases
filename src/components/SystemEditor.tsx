import { Button, Checkbox, FormControlLabel, FormGroup, FormLabel, Grid, InputAdornment, Radio, RadioGroup, TextField, Typography } from '@material-ui/core';
import { GridProps } from '@material-ui/core/Grid';
import * as React from 'react';
import Language from '../helpers/Language';
import { NumberInput } from './controls/NumberInput';
import { LectureSystem, SystemType } from '../data/LectureSystem';
import { DataService } from '../helpers/DataService';

interface Props {
    onSystemCreation: (sys: LectureSystem) => void;

    onAbortClicked: () => void;
}

interface State {
    name: string;
    typeValue: SystemType;
    criteria: number;
    pointsPerSheet: number;
    hasAdditionalPoints: boolean;

    isNonValidName: boolean;
}

// TODO: Eingaben auf Validität prüfen.
// TODO: Als Style-Component umfunktionieren?

/**
 * Editorsheet for creating and modifing a LectureSystem. Will pass a newly created LectureSystem to the given callback in the props if the user 'accepts' the settings of the LectureSystem.
 */
export class SystemEditor extends React.Component<Props & GridProps, State> {
    constructor(props: Props & GridProps) {
        super(props);

        this.state = {
            name: '',
            typeValue: SystemType.ART_PROZENT,
            criteria: 0,
            pointsPerSheet: 0,
            hasAdditionalPoints: false,
            isNonValidName: false
        };
    }

    render() {
        let { container, direction, spacing, onSystemCreation, onAbortClicked, ...other } = this.props;
        let maxCriteria: number = this.state.typeValue === SystemType.ART_PROZENT ? 100 : 999;

        return (
            <Grid container direction='column' spacing={16} {...other}>
                <Grid item>
                    <Typography variant='subheading'>
                        {Language.getString('SYSTEM_OVERVIEW_TITLE')}
                    </Typography>
                </Grid>
                <Grid item>
                    <TextField
                        label='System-Name'
                        error={this.state.isNonValidName}
                        value={this.state.name}
                        onChange={this.handleNameChanged}
                        helperText={this.state.isNonValidName ? Language.getString('SYSTEM_EDITOR_NAME_NOT_VALID') : ''}
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
                            <FormControlLabel value={SystemType.ART_PROZENT.toString()} control={<Radio color='primary' />} label='Prozent' />
                            <FormControlLabel value={SystemType.ART_PUNKTE.toString()} disabled control={<Radio color='primary' />} label='Punkte (WIP)' />
                        </RadioGroup>
                    </FormGroup>
                </Grid>

                <Grid item>
                    <NumberInput
                        label='Benötigt'
                        InputProps={{
                            startAdornment: <InputAdornment position='start'>{this.state.typeValue === SystemType.ART_PROZENT ? '%' : 'Pkt.'}</InputAdornment>
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
                        onValueChanged={this.handlePointsPerSheetChanged}
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
     * Handles the click on the accomplishment button. Will create a new LectureSystem via the DataService and pass it to the given callback in the props of this component.
     */
    private handleCreateClicked = () => {
        if (this.state.name == '') {
            this.setState({
                isNonValidName: true
            });

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
        this.setState({ criteria: newCriteria });
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
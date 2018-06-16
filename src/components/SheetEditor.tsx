import * as React from 'react';
import Language from '../helpers/Language';
import { NumberInput } from './controls/NumberInput';
import { Grid, Typography, TextField, Button } from '@material-ui/core';

interface Props {
    headerText: string;
    btnText: string;

    onAbortClicked?: () => void;
}

interface State {
    sheetNr: number;
    date: Date;
}

export class SheetEditor extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            sheetNr: 1,
            date: new Date(Date.now())
        };

        this.onDateChanged = this.onDateChanged.bind(this);
        this.onSheetNrChanged = this.onSheetNrChanged.bind(this);
    }

    render() {
        return (
            <Grid container alignContent='center' alignItems='center' spacing={8}>
                <Grid item xs={12}>
                    <Typography variant='title' color='primary' >
                        {this.props.headerText}
                    </Typography>
                </Grid>

                <Grid item xs={4}>
                    <Typography>{Language.getString('SHEET_NUMBER')}:</Typography>
                </Grid>

                <Grid item xs={8}>
                    <NumberInput
                        defaultValue={1}
                        minValue={0}
                        maxValue={5} // TODO: Anpassen, an die aktuelle Vorlesung
                        onValueChanged={this.onSheetNrChanged}
                        showButtons
                    />
                </Grid>

                <Grid item xs={4}>
                    <Typography>{Language.getString('SHEET_DATE')}:</Typography>
                </Grid>

                <Grid item xs={8}>
                    <TextField
                        type='date'
                        value={this.convertDateToString(this.state.date)}
                        onChange={this.onDateChanged}
                        inputProps={{
                            'style': { height: '2.5em' }
                        }}
                        fullWidth
                    />
                </Grid>

                <Grid item xs={12}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }} >
                        <Button
                            variant='outlined'
                            // color='primary'
                            size='small'
                            color='secondary'
                            style={{ borderRadius: '0', marginRight: '8px' }}
                            onClick={this.props.onAbortClicked}
                        >
                            {Language.getString('BUTTON_ABORT')}
                        </Button>
                        <Button
                            variant='outlined'
                            // color='primary'
                            size='small'
                            style={{ borderRadius: '0' }}
                        >
                            {this.props.btnText}
                        </Button>
                    </div>
                </Grid>
            </Grid>
        );
    }

    private onSheetNrChanged(oldValue: number, newValue: number) {
        this.setState({ sheetNr: newValue });
    }

    private onDateChanged(ev: React.ChangeEvent<HTMLInputElement>) {
        // Create a date from the input
        let dateString: string = ev.target.value;
        let date: Date = new Date(dateString);

        // TODO: Mach was mit dem Datum!

        this.setState({
            date
        });
    }

    private convertDateToString(date: Date): string {
        let month: number = date.getMonth() + 1;
        let day: number = date.getDate();

        return date.getFullYear() + '-' + (month < 10 ? '0' + month : month) + '-' + (day < 10 ? '0' + day : day);
    }
}
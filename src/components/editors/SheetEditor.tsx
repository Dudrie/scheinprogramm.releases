import { Button, Grid, Tab, Tabs, TextField, Typography } from '@material-ui/core';
import { GridSize } from '@material-ui/core/Grid';
import * as React from 'react';
import { LectureSystem } from '../../data/LectureSystem';
import Language from '../../helpers/Language';
import { NumberInput } from '../controls/NumberInput';

type SystemEntry = { achieved: number, total: number };

interface Props {
    headerText: string;
    lectureSystems: LectureSystem[];

    onAbortClicked?: () => void;
}

interface State {
    tabIndex: number;
    tabSystemEntries: SystemEntry[];

    sheetNr: number;
    date: Date;
}

// TODO: Styled-Component
// TODO: Grid-Layout anpassen, sodass die linke Spalte eine feste Größe hat?!
export class SheetEditor extends React.Component<Props, State> {
    private readonly LEFT_COL_SIZE: GridSize = 4;
    private readonly RIGHT_COL_SIZE: GridSize = 8;

    constructor(props: Props) {
        super(props);

        let systemEntries: SystemEntry[] = [];

        this.props.lectureSystems.forEach(() => {
            systemEntries.push({ achieved: 0, total: 0 });
        });

        this.state = {
            tabIndex: 0,
            tabSystemEntries: systemEntries,
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

                <Grid item xs={this.LEFT_COL_SIZE}>
                    <Typography>{Language.getString('SHEET_NUMBER')}:</Typography>
                </Grid>

                <Grid item xs={this.RIGHT_COL_SIZE}>
                    <NumberInput
                        defaultValue={1}
                        minValue={0}
                        onValueChanged={this.onSheetNrChanged}
                        showButtons
                    />
                </Grid>

                <Grid item xs={this.LEFT_COL_SIZE}>
                    <Typography>{Language.getString('SHEET_DATE')}:</Typography>
                </Grid>

                <Grid item xs={this.RIGHT_COL_SIZE}>
                    <TextField
                        type='date'
                        value={this.convertDateToString(this.state.date)}
                        onChange={this.onDateChanged}
                        inputProps={{
                            'style': { height: 'inherit' }
                        }}
                        fullWidth
                    />
                </Grid>

                <Grid item xs={12} style={{ marginTop: 16 }} >
                    <div style={{ border: '1px solid gray' }} >
                        <Tabs
                            value={this.state.tabIndex}
                            onChange={this.onTabChanged}
                            indicatorColor='primary'
                            scrollable
                            scrollButtons='auto'
                        >
                            {this.props.lectureSystems.map((sys, idx) => this.generateSystemTab(sys, idx))}
                        </Tabs>
                        <div
                            key={'SYS_IN_' + this.state.tabIndex}
                            style={{ padding: 8, paddingTop: 16 }}
                        >
                            {/* TODO: Animationen beim Tab-Wechsel */}
                            {this.generateSystemInput(this.state.tabIndex)}
                        </div>
                    </div>
                </Grid>

                <Grid item xs={12}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }} >
                        <Button
                            variant='outlined'
                            size='small'
                            color='secondary'
                            style={{ marginRight: '8px' }}
                            onClick={this.props.onAbortClicked}
                        >
                            {Language.getString('BUTTON_ABORT')}
                        </Button>
                        <Button
                            variant='outlined'
                            size='small'
                        >
                            {Language.getString('BUTTON_ADD')}
                        </Button>
                    </div>
                </Grid>
            </Grid>
        );
    }

    private generateSystemTab(sys: LectureSystem, idx: number): JSX.Element {
        let entries: SystemEntry = this.state.tabSystemEntries[idx];

        return (
            <Tab
                key={'SYS_TAB_' + idx}
                value={idx}
                label={sys.name + ' (' + entries.achieved + '/' + entries.total + ')'}
            />
        );
    }

    private generateSystemInput(tabIdx: number): JSX.Element {
        let systemEntry = this.state.tabSystemEntries[tabIdx];

        return (<Grid key={'SYS_IN_' + tabIdx} container spacing={8}>
            <Grid item xs={this.LEFT_COL_SIZE}>
                <Typography>Erreicht:</Typography>
            </Grid>
            <Grid item xs={this.RIGHT_COL_SIZE}>
                <NumberInput
                    value={systemEntry.achieved}
                    onValueChanged={(o, n) => this.onAchievedChanged(tabIdx, o, n)}
                    showButtons
                />
            </Grid>

            <Grid item xs={this.LEFT_COL_SIZE}>
                <Typography>Gesamt:</Typography>
            </Grid>
            <Grid item xs={this.RIGHT_COL_SIZE}>
                <NumberInput
                    value={systemEntry.total}
                    onValueChanged={(o, n) => this.onTotalChanged(tabIdx, o, n)}
                    showButtons
                />
            </Grid>
        </Grid>);
    }

    private onAchievedChanged(tabIdx: number, _: number, newValue: number) {
        this.state.tabSystemEntries[tabIdx].achieved = newValue;

        this.setState({
            tabSystemEntries: this.state.tabSystemEntries
        });
    }

    private onTotalChanged(tabIdx: number, _: number, newValue: number) {
        this.state.tabSystemEntries[tabIdx].total = newValue;

        this.setState({
            tabSystemEntries: this.state.tabSystemEntries
        });
    }

    private onTabChanged = (_: React.ChangeEvent<{}>, newIdx: number) => {
        if (this.state.tabIndex === newIdx) {
            return;
        }

        this.setState({
            tabIndex: newIdx
        });
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
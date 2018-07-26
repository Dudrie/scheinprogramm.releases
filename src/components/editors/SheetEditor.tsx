import { Button, Checkbox, FormControlLabel, Grid, Tab, Tabs, TextField, Typography } from '@material-ui/core';
import { GridSize } from '@material-ui/core/Grid';
import * as React from 'react';
import { LectureSystem } from '../../data/LectureSystem';
import { Points, Sheet } from '../../data/Sheet';
import Language from '../../helpers/Language';
import { NumberInput } from '../controls/NumberInput';
import { HotKeys } from '../../../node_modules/react-hotkeys';
import { DataService } from '../../helpers/DataService';

interface Props {
    lectureSystems: LectureSystem[];
    hasPresentationPoints: boolean;
    initialSheetNr?: number;
    sheetToEdit?: Sheet;

    onAcceptClicked: (sheet: Sheet) => void;
    onAbortClicked: () => void;
}

interface RequiredInputFields {
    isValidSheetNumber: boolean;
    isValidSheetDate: boolean;
}

interface State extends RequiredInputFields {
    tabIndex: number;
    tabSystemEntries: Points[];
    titleText: string;
    addButtonText: string;
    focusTabInput: boolean;

    sheetNr: number;
    // date: Date;
    date: string;
    hasPresented: boolean;
}

export class SheetEditor extends React.Component<Props, State> {
    private readonly LEFT_COL_SIZE: GridSize = 4;
    private readonly RIGHT_COL_SIZE: GridSize = 8;

    constructor(props: Props) {
        super(props);

        let systemEntries: Points[] = [];

        this.props.lectureSystems.forEach((sys) => {
            let achieved: number = 0;
            let total: number = sys.pointsPerSheet ? sys.pointsPerSheet : 0;

            if (this.props.sheetToEdit) {
                let points = this.props.sheetToEdit.getPoints(sys.id);
                achieved = points.achieved;
                total = points.total;
            }

            systemEntries.push({ achieved, total });
        });

        let sheetNr: number;
        let date: Date;
        let hasPresented: boolean;
        let titleText: string;
        let addButtonText: string;

        if (this.props.sheetToEdit) {
            sheetNr = this.props.sheetToEdit.sheetNr;
            date = this.props.sheetToEdit.date;
            hasPresented = this.props.sheetToEdit.hasPresented;
            titleText = Language.getString('SHEET_EDITOR_EDIT_SHEET');
            addButtonText = Language.getString('BUTTON_SAVE');

        } else {
            sheetNr = (this.props.initialSheetNr != undefined) ? this.props.initialSheetNr : 1;
            
            // Remove the hours, mins,... from the date.
            date = new Date(Date.now());
            date.setHours(0, 0, 0, 0);
            
            hasPresented = false;
            titleText = Language.getString('SHEET_EDITOR_NEW_SHEET');
            addButtonText = Language.getString('BUTTON_ADD');

        }

        this.state = {
            tabIndex: 0,
            tabSystemEntries: systemEntries,
            focusTabInput: false,
            sheetNr,
            date: this.convertDateToString(date),
            hasPresented,
            titleText,
            addButtonText,
            isValidSheetNumber: true,
            isValidSheetDate: true
        };

        this.onDateChanged = this.onDateChanged.bind(this);
        this.onSheetNrChanged = this.onSheetNrChanged.bind(this);
    }

    render() {
        return (
            <Grid container alignContent='center' alignItems='center' spacing={8}>
                <Grid item xs={12}>
                    <Typography variant='title' color='primary' >
                        {this.state.titleText}
                    </Typography>
                </Grid>

                <Grid item xs={this.LEFT_COL_SIZE}>
                    <Typography>
                        {Language.getString('SHEET_NUMBER')}:
                    </Typography>
                </Grid>
                <Grid item xs={this.RIGHT_COL_SIZE}>
                    <NumberInput
                        autoFocus
                        defaultValue={this.state.sheetNr}
                        minValue={0}
                        onValueChanged={this.onSheetNrChanged}
                        error={!this.state.isValidSheetNumber}
                        helperText={!this.state.isValidSheetNumber ? Language.getString('SHEET_EDITOR_NO_VALID_NUMBER') : ''}
                        showButtons
                    />
                </Grid>

                <Grid item xs={this.LEFT_COL_SIZE}>
                    <Typography>{Language.getString('SHEET_DATE')}:</Typography>
                </Grid>
                <Grid item xs={this.RIGHT_COL_SIZE}>
                    <TextField
                        type='date'
                        value={this.state.date}
                        onChange={this.onDateChanged}
                        inputProps={{
                            'style': { height: 'inherit' }
                        }}
                        error={!this.state.isValidSheetDate}
                        helperText={!this.state.isValidSheetDate ? Language.getString('SHEET_EDITOR_NO_VALID_DATE') : ''}
                        fullWidth
                    />
                </Grid>

                {this.props.hasPresentationPoints && (<>
                    <Grid item xs={this.LEFT_COL_SIZE}>
                        {/* Empty left 'cell' */}
                        <></>
                    </Grid>
                    <Grid item xs={this.RIGHT_COL_SIZE}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    style={{ height: 'inherit' }}
                                    checked={this.state.hasPresented}
                                    onChange={this.onHasPresentedChanged}
                                />
                            }
                            label={<Typography>{Language.getString('SHEET_EDITOR_HAS_PRESENTED')}</Typography>}
                        />
                    </Grid>
                </>)}

                <Grid item xs={12} style={{ marginTop: 16 }} >
                    <HotKeys handlers={{ 'ctrlTab': this.onCtrlTabInTab }} >
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
                    </HotKeys>
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
                            onClick={this.onAddClicked}
                        >
                            {this.state.addButtonText}
                        </Button>
                    </div>
                </Grid>
            </Grid>
        );
    }

    private generateSystemTab(sys: LectureSystem, idx: number): JSX.Element {
        let entries: Points = this.state.tabSystemEntries[idx];

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

        return (
            <Grid key={'SYS_IN_' + tabIdx} container spacing={8}>
                <Grid item xs={this.LEFT_COL_SIZE}>
                    <Typography>Erreicht:</Typography>
                </Grid>
                <Grid item xs={this.RIGHT_COL_SIZE}>
                    <NumberInput
                        autoFocus={this.state.focusTabInput}
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
            </Grid>
        );
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

    private onCtrlTabInTab = () => {
        if (this.state.tabSystemEntries.length <= 1) {
            return;
        }

        this.setTabIndex((this.state.tabIndex + 1) % this.state.tabSystemEntries.length);
    }

    private onTabChanged = (_: React.ChangeEvent<{}>, newIdx: number) => {
        if (this.state.tabIndex === newIdx) {
            return;
        }

        this.setTabIndex(newIdx);
    }

    private setTabIndex(tabIndex: number) {
        this.setState({
            tabIndex,
            focusTabInput: true
        });
    }

    private onSheetNrChanged(_oldValue: number, newValue: number) {
        this.setState({
            sheetNr: newValue,
            isValidSheetNumber: this.isValidSheetNumber(newValue)
        });
    }

    private onDateChanged(ev: React.ChangeEvent<HTMLInputElement>) {
        this.setState({
            date: ev.target.value,
            isValidSheetDate: this.isValidSheetDate(ev.target.value)
        });
    }

    private onHasPresentedChanged = (ev: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            hasPresented: ev.target.checked
        });
    }

    private onAddClicked = (): void => {
        if (!this.isValidInput()) {
            return;
        }

        let pointsMap: Map<string, Points> = new Map();

        this.props.lectureSystems.forEach((sys, idx) => {
            pointsMap.set(sys.id, this.state.tabSystemEntries[idx]);
        });

        let sheet: Sheet = new Sheet(
            this.props.sheetToEdit ? this.props.sheetToEdit.id : '',
            this.state.sheetNr,
            new Date(this.state.date),
            this.state.hasPresented,
            pointsMap
        );

        this.props.onAcceptClicked(sheet);
    }

    private isValidSheetNumber(sheetNr: number): boolean {
        // Make sure a sheet can stick with it's number.
        if (this.props.sheetToEdit && this.props.sheetToEdit.sheetNr == sheetNr) {
            return true;
        }

        return !DataService.hasActiveLectureSheetWithNr(sheetNr);
    }

    private isValidSheetDate(dateString: string): boolean {
        // TODO: Überprüfen, ob es bereits ein Blatt für den Tag gibt.
        return true;
    }

    private isValidInput(): boolean {
        let reqInputs: RequiredInputFields = {
            isValidSheetNumber: this.isValidSheetNumber(this.state.sheetNr),
            isValidSheetDate: this.isValidSheetDate(this.state.date)
        };

        let isAllValid = true;
        Object.entries(reqInputs).forEach((val) => {
            if (!val[1]) {
                isAllValid = false;
            }
        });

        this.setState(reqInputs);
        return isAllValid;
    }

    private convertDateToString(date: Date): string {
        let month: number = date.getMonth() + 1;
        let day: number = date.getDate();

        return date.getFullYear() + '-' + (month < 10 ? '0' + month : month) + '-' + (day < 10 ? '0' + day : day);
    }
}
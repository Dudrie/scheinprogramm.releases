import * as React from 'react';
import { WithStyles, StyleRulesCallback, withStyles, Typography } from '@material-ui/core';
import { ProgressInfo } from 'builder-util-runtime';
import { ipcRenderer } from 'electron';
import EventNames from '../helpers/EventNames';
import Language from '../helpers/Language';

interface Props {

}

interface State {
    mbPerSecond: number;
    percent: number;
    transferredMB: number;
    totalMB: number;
}

type ProgressTrackerClassKey = 'root';
type PropType = Props & WithStyles<ProgressTrackerClassKey>;
const style: StyleRulesCallback<ProgressTrackerClassKey> = (theme) => ({
    root: {

    }
});

class ProgressTrackerClass extends React.Component<PropType, State> {

    constructor(props: PropType) {
        super(props);

        this.state = {
            percent: -1,
            mbPerSecond: 0,
            transferredMB: 0,
            totalMB: 0
        };
    }

    componentDidMount() {
        ipcRenderer.addListener(EventNames.UPDATE_PROGRESS_UPDATE, this.onProgressReceived);
    }

    componentWillUnmount() {
        ipcRenderer.removeListener(EventNames.UPDATE_PROGRESS_UPDATE, this.onProgressReceived);
    }

    render() {
        return (
            <div>
                {this.state.percent == -1 &&
                    <Typography>{Language.getString('UPDATE_NOTI_UPDATE_DOWNLOAD_STARTED_MESSAGE')}</Typography>
                }
                
                {this.state.percent != -1 && <>
                    <Typography>Fortschritt: {this.state.transferredMB} MB / {this.state.totalMB} MB</Typography>
                    <Typography>Prozent: {this.state.percent}%</Typography>
                    <Typography>Geschwindigkeit: {this.state.mbPerSecond} MB/s</Typography>
                </>}
            </div>
        );
    }

    private onProgressReceived = (_: any, progressInfo: ProgressInfo) => {
        console.log(progressInfo);
        let { bytesPerSecond, transferred, total, percent } = progressInfo;

        this.setState({
            mbPerSecond: this.roundNumber(bytesPerSecond / (1000 * 1000), 2),
            transferredMB: this.roundNumber(transferred / (1000 * 1000), 2),
            totalMB: this.roundNumber(total / (1000 * 1000), 2),
            percent
        });
    }

    private roundNumber(n: number, radix: number): number {
        return Math.round(n * Math.pow(10, radix)) / Math.pow(10, radix);
    }
}

export const ProgressTracker = withStyles(style)<Props>(ProgressTrackerClass);
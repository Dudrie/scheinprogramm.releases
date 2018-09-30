import { Typography } from '@material-ui/core';
import { ProgressInfo } from 'builder-util-runtime';
import { ipcRenderer } from 'electron';
import log from 'electron-log';
import * as React from 'react';
import UpdateEvents from 'common/UpdateEvents';
import Language from '../helpers/Language';

interface State {
    hasUpdateReceived: boolean;
    mbPerSecond: number;
    percent: number;
    transferredMB: number;
    totalMB: number;
}

export class ProgressTracker extends React.Component<React.HTMLProps<HTMLElement>, State> {
    constructor(props: object) {
        super(props);

        this.state = {
            hasUpdateReceived: false,
            percent: 0,
            mbPerSecond: 0,
            transferredMB: 0,
            totalMB: 0
        };
    }

    componentDidMount() {
        ipcRenderer.addListener(UpdateEvents.UPDATE_PROGRESS_UPDATE, this.onProgressReceived);
    }

    componentWillUnmount() {
        ipcRenderer.removeListener(UpdateEvents.UPDATE_PROGRESS_UPDATE, this.onProgressReceived);
    }

    render() {
        return (<>
            {/* As long as we dont get updates on progress just display some generic text */}
            {!this.state.hasUpdateReceived &&
                <Typography>{Language.getString('PROGRESS_TRACKER_UPDATE_IN_PROGRESS')}</Typography>
            }

            {/* If we got an update show the progress */}
            {this.state.hasUpdateReceived &&
                <div>
                    <Typography>Fortschritt: {this.state.transferredMB} MB / {this.state.totalMB} MB</Typography>
                    <Typography>Prozent: {this.state.percent}%</Typography>
                    <Typography>Geschwindigkeit: {this.state.mbPerSecond} MB/s</Typography>
                </div>
            }
        </>);
    }

    private onProgressReceived = (_: any, progressInfo: ProgressInfo) => {
        let { bytesPerSecond, transferred, total, percent } = progressInfo;
        log.info(`[RENDERER] Progress received: ${bytesPerSecond}bytes/s, ${transferred}/${total}, ${percent}%`);

        this.setState({
            mbPerSecond: this.roundNumber(bytesPerSecond / (1000 * 1000), 2),
            transferredMB: this.roundNumber(transferred / (1000 * 1000), 2),
            totalMB: this.roundNumber(total / (1000 * 1000), 2),
            percent: this.roundNumber(percent, 2),
            hasUpdateReceived: true
        });
    }

    private roundNumber(n: number, radix: number): number {
        return Math.round(n * Math.pow(10, radix)) / Math.pow(10, radix);
    }
}
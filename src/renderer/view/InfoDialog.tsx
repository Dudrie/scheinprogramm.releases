import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, createStyles, Dialog, DialogContent, DialogContentText, DialogTitle, Theme, WithStyles, withStyles } from '@material-ui/core';
import { DialogProps } from '@material-ui/core/Dialog';
import UpdateEvents from 'common/UpdateEvents';
import { UpdateState } from 'common/UpdateState';
import { ipcRenderer, remote, shell } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import * as React from 'react';
import Language from '../helpers/Language';

declare const __static: string;

const style = (theme: Theme) => createStyles({
    content: {
        display: 'flex',
        flexDirection: 'column'
    },
    button: {
        flexGrow: 0,
        marginTop: theme.spacing.unit,
        // justifySelf: 'flex-end'
    },
    githubButton: {
        color: '#fff',
        backgroundColor: '#6e5494',
        '&:hover': {
            backgroundColor: '#4d3a67'
        }
    },
    githubIcon: {
        marginRight: theme.spacing.unit
    },
    externalIcon: {
        marginLeft: theme.spacing.unit,
        position: 'absolute',
        right: theme.spacing.unit
    }
});

type Props = DialogProps & WithStyles<typeof style>;

interface State {
    author: string;
    updateState: UpdateState;
}

class InfoDialogClass extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        let author: string = '';

        try {
            let info = JSON.parse(fs.readFileSync(
                path.join(__static, 'info.json')
            ).toString());

            author = info.author;
        } catch (e) {
            console.error(e);
        }

        this.state = {
            author,
            updateState: ipcRenderer.sendSync(UpdateEvents.MAIN_GET_UPDATE_STATE_SYNC, '')
        };
    }

    componentDidMount() {
        this.registerIpcRendererListeners();
    }

    componentWillUnmount() {
        this.unregisterIpcRendererListeners();
    }

    render() {
        let { classes, ...other } = this.props;

        return (
            <Dialog
                {...other}
            >
                <DialogTitle>
                    {Language.getString('INFO_DIALOG_TITLE')}
                </DialogTitle>
                <DialogContent
                    className={classes.content}
                >
                    <DialogContentText>
                        {/* Version will only be correct in the production version */}
                        {Language.getString('INFO_DIALOG_VERSION', `${remote.app.getVersion()}`)}
                    </DialogContentText>
                    <DialogContentText>
                        {Language.getString('INFO_DIALOG_PROGRAMMER', this.state.author)}
                    </DialogContentText>
                    <Button
                        variant='contained'
                        color='primary'
                        onClick={this.updateButtonClicked}
                        className={classes.button}
                        disabled={this.isUpdateButtonDisabled()}
                    >
                        {this.getUpdateButtonText()}...
                    </Button>

                    <Button
                        variant='contained'
                        className={`${classes.button} ${classes.githubButton}`}
                        onClick={this.onOpenGitHubRepoClicked}
                    >
                        <FontAwesomeIcon
                            icon={{ prefix: 'fab', iconName: 'github' }}
                            className={classes.githubIcon}
                        />
                        {Language.getString('BRANDS_GITHUB')}

                        <FontAwesomeIcon
                            icon={{ prefix: 'fas', iconName: 'external-link' }}
                            className={classes.externalIcon}
                        />
                    </Button>
                </DialogContent>
            </Dialog>
        );
    }

    private getUpdateButtonText(): string {
        switch (this.state.updateState) {
            case UpdateState.NOT_SEARCHED:
                return Language.getString('INFO_DIALOG_SEARCH_FOR_UPDATES');

            case UpdateState.CHECKING_FOR_UPDATE:
                return Language.getString('INFO_DIALOG_CHECKING_FOR_UPDATE');

            case UpdateState.UPDATE_FOUND:
                return Language.getString('INFO_DIALOG_DOWNLOAD_UPDATE');

            case UpdateState.DOWNLOADING_UPDATE:
                return Language.getString('INFO_DIALOG_DOWNLOADING_UPDATE');

            case UpdateState.UPDATE_DOWNLOADED:
                return Language.getString('INFO_DIALOG_INSTALL_UPDATE');
        }

        return '';
    }

    private isUpdateButtonDisabled(): boolean {
        switch (this.state.updateState) {
            case UpdateState.CHECKING_FOR_UPDATE:
            case UpdateState.DOWNLOADING_UPDATE:
                return true;
        }

        return false;
    }

    private searchForUpdates() {
        // This is NOT a silent update.
        ipcRenderer.send(UpdateEvents.MAIN_CHECK_FOR_UPDATES, false);

        this.setUpdateState(UpdateState.CHECKING_FOR_UPDATE);
    }

    private downloadUpdate() {
        ipcRenderer.send(UpdateEvents.MAIN_DOWNLOAD_UPDATE);

        this.setUpdateState(UpdateState.DOWNLOADING_UPDATE);
    }

    private installUpdate() {
        ipcRenderer.send(UpdateEvents.MAIN_RESTART_AND_INSTALL_UPDATE);
    }

    private setUpdateState(updateState: UpdateState) {
        this.setState({
            updateState
        });
    }

    private updateButtonClicked = () => {
        switch (this.state.updateState) {
            case UpdateState.NOT_SEARCHED:
                this.searchForUpdates();
                break;

            case UpdateState.UPDATE_FOUND:
                this.downloadUpdate();
                break;

            case UpdateState.UPDATE_DOWNLOADED:
                this.installUpdate();
                break;
        }

    }

    private onUpdateCanceled = () => {
        this.setUpdateState(UpdateState.NOT_SEARCHED);
    }

    private onUpdateFound = () => {
        this.setUpdateState(UpdateState.UPDATE_FOUND);
    }

    private onUpdateDownloaded = () => {
        this.setUpdateState(UpdateState.UPDATE_DOWNLOADED);
    }

    private registerIpcRendererListeners() {
        ipcRenderer.on(UpdateEvents.RENDERER_DOWNLOAD_FINISHED, this.onUpdateDownloaded);

        ipcRenderer.on(UpdateEvents.RENDERER_UPDATE_FOUND, this.onUpdateFound);

        ipcRenderer.on(UpdateEvents.RENDERER_NO_CONNECTION, this.onUpdateCanceled);
        ipcRenderer.on(UpdateEvents.RENDERER_NO_NEW_VERSION_FOUND, this.onUpdateCanceled);
        ipcRenderer.on(UpdateEvents.RENDERER_DOWNLOAD_CANCELED, this.onUpdateCanceled);
        ipcRenderer.on(UpdateEvents.RENDERER_UPDATE_ERROR, this.onUpdateCanceled);
    }

    private unregisterIpcRendererListeners() {
        ipcRenderer.removeListener(UpdateEvents.RENDERER_DOWNLOAD_FINISHED, this.onUpdateDownloaded);

        ipcRenderer.removeListener(UpdateEvents.RENDERER_UPDATE_FOUND, this.onUpdateFound);

        ipcRenderer.removeListener(UpdateEvents.RENDERER_NO_CONNECTION, this.onUpdateCanceled);
        ipcRenderer.removeListener(UpdateEvents.RENDERER_NO_NEW_VERSION_FOUND, this.onUpdateCanceled);
        ipcRenderer.removeListener(UpdateEvents.RENDERER_DOWNLOAD_CANCELED, this.onUpdateCanceled);
        ipcRenderer.removeListener(UpdateEvents.RENDERER_UPDATE_ERROR, this.onUpdateCanceled);

    }

    private onOpenGitHubRepoClicked = () => {
        shell.openExternal('https://github.com/Dudrie/scheinprogramm.releases');
    }
}

export const InfoDialog = withStyles(style)(InfoDialogClass);
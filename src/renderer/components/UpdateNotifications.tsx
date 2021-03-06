import { createStyles, WithStyles, withStyles } from '@material-ui/core';
import UpdateEvents from 'common/UpdateEvents';
import { ipcRenderer } from 'electron';
import { UpdateInfo } from 'electron-updater';
import * as React from 'react';
import ReactResizeDetector from 'react-resize-detector';
import Language from '../helpers/Language';
import { Notification, NotificationService } from '../helpers/NotificationService';
import { ProgressTracker } from './ProgressTracker';

const style = () => createStyles({
    notiActionButtonInfo: {
        background: 'rgb(54, 156, 199)',
        borderRadius: 2,
        padding: '6px 20px',
        fontWeight: 'bold',
        margin: '10px 0px 0px',
        border: 0,
        color: '#fff'
    }
});

interface Props extends WithStyles<typeof style> {

}
interface State {
    currentNotification: Notification | undefined;
}

class UpdateNotificationsClass extends React.Component<Props, State> {
    private notiProgressDiv: React.RefObject<HTMLDivElement> = React.createRef();

    constructor(props: Props) {
        super(props);

        this.state = {
            currentNotification: undefined
        };
    }

    componentDidMount() {
        this.registerUpdateListeners();
    }

    componentWillUnmount() {
        this.unregisterUpdateListeners();
    }

    render() {
        return (
            <></>
        );
    }

    private registerUpdateListeners() {
        ipcRenderer.on(UpdateEvents.RENDERER_SEARCHING_FOR_UPDATES, this.onSearchingForUpdates);
        ipcRenderer.on(UpdateEvents.RENDERER_NO_NEW_VERSION_FOUND, this.onNoUpdateAvailable);
        ipcRenderer.on(UpdateEvents.RENDERER_UPDATE_FOUND, this.onUpdateFound);
        ipcRenderer.on(UpdateEvents.RENDERER_DOWNLOAD_CANCELED, this.onUpdateDownloadCanceled);
        ipcRenderer.on(UpdateEvents.RENDERER_DOWNLOAD_FINISHED, this.onUpdateDownloadComplete);
        ipcRenderer.on(UpdateEvents.RENDERER_DOWNLOADING_UPDATE , this.onUpdateDownloadStarted);

        ipcRenderer.on(UpdateEvents.RENDERER_NO_CONNECTION, this.onUpdateNoConnection);
        ipcRenderer.on(UpdateEvents.RENDERER_UPDATE_ERROR, this.onUpdateError);
    }

    private unregisterUpdateListeners() {
        ipcRenderer.removeListener(UpdateEvents.RENDERER_SEARCHING_FOR_UPDATES, this.onSearchingForUpdates);
        ipcRenderer.removeListener(UpdateEvents.RENDERER_NO_NEW_VERSION_FOUND, this.onNoUpdateAvailable);
        ipcRenderer.removeListener(UpdateEvents.RENDERER_UPDATE_FOUND, this.onUpdateFound);
        ipcRenderer.removeListener(UpdateEvents.RENDERER_DOWNLOAD_CANCELED, this.onUpdateDownloadCanceled);
        ipcRenderer.removeListener(UpdateEvents.RENDERER_DOWNLOAD_FINISHED, this.onUpdateDownloadComplete);
        ipcRenderer.removeListener(UpdateEvents.RENDERER_DOWNLOADING_UPDATE , this.onUpdateDownloadStarted);

        ipcRenderer.removeListener(UpdateEvents.RENDERER_NO_CONNECTION, this.onUpdateNoConnection);
        ipcRenderer.removeListener(UpdateEvents.RENDERER_UPDATE_ERROR, this.onUpdateError);
    }

    private showNotification(notification: Notification) {
        if (this.state.currentNotification) {
            NotificationService.removeNotification(this.state.currentNotification);
        }

        notification.onRemove = () => this.removeNotification(notification);

        let currentNotification = NotificationService.showNotification(notification);

        this.setState({ currentNotification });
    }

    private removeNotification(notification: Notification) {
        NotificationService.removeNotification(notification);

        if (notification == this.state.currentNotification) {
            this.setState({ currentNotification: undefined });
        }
    }

    // =========================================
    //               CALLBACKS
    // =========================================
    private onSearchingForUpdates = () => {
        this.showNotification({
            title: Language.getString('UPDATE_NOTI_CHECKING_FOR_UPDATES_TITLE'),
            message: Language.getString('UPDATE_NOTI_CHECKING_FOR_UPDATES_MESSAGE'),
            autoDismiss: 0,
            level: 'info'
        });
    }

    private onNoUpdateAvailable = () => {
        this.showNotification({
            title: Language.getString('UPDATE_NOTI_NO_UPDATE_FOUND_TITLE'),
            message: Language.getString('UPDATE_NOTI_NO_UPDATE_FOUND_MESSAGE'),
            level: 'info'
        });
    }

    private onUpdateFound = (_: any, updateInfo: UpdateInfo) => {
        this.showNotification({
            title: Language.getString('UPDATE_NOTI_UPDATE_FOUND_TITLE'),
            message: Language.getString('UPDATE_NOTI_UPDATE_FOUND_MESSAGE', updateInfo.version),
            level: 'info',
            autoDismiss: 0,
            action: {
                label: Language.getString('UPDATE_NOTI_UPDATE_FOUND_ACTION_DOWNLOAD_LABEL'),
                callback: () => ipcRenderer.send(UpdateEvents.MAIN_DOWNLOAD_UPDATE)
            }
        });
    }

    private onUpdateDownloadStarted = () => {
        this.showNotification({
            title: Language.getString('UPDATE_NOTI_UPDATE_DOWNLOAD_STARTED_TITLE'),
            level: 'info',
            autoDismiss: 0,
            children: (<div ref={this.notiProgressDiv} >
                <ProgressTracker />
                <button
                    className={this.props.classes.notiActionButtonInfo}
                    onClick={() => ipcRenderer.send(UpdateEvents.MAIN_ABORT_DOWNLOAD_UPDATE)}
                >
                    {Language.getString('BUTTON_ABORT')}
                </button>
                <ReactResizeDetector
                    handleHeight
                    skipOnMount
                    onResize={this.onProgressTrackerResize}
                />
            </div>)
        });
    }

    private onUpdateDownloadCanceled = () => {
        this.showNotification({
            title: Language.getString('UPDATE_NOTI_DOWNLOAD_ABORTED_TITLE'),
            message: Language.getString('UPDATE_NOTI_DOWNLOAD_ABORTED_MESSAGE'),
            level: 'info'
        });
    }

    private onUpdateDownloadComplete = () => {
        this.showNotification({
            title: Language.getString('UPDATE_NOTI_UPDATE_DOWNLOADED_TITLE'),
            message: Language.getString('UPDATE_NOTI_UPDATE_DOWNLOADED_MESSAGE'),
            autoDismiss: 0,
            level: 'info',
            action: {
                label: Language.getString('UPDATE_NOTI_UPDATE_DOWNLOADED_ACTION_RESTART_AND_INSTALL_LABEL'),
                callback: () => ipcRenderer.send(UpdateEvents.MAIN_RESTART_AND_INSTALL_UPDATE)
            }
        });
    }

    private onUpdateNoConnection = () => {
        this.showNotification({
            title: Language.getString('UPDATE_NOTI_NO_CONNECTION_TITLE'),
            message: Language.getString('UPDATE_NOTI_NO_CONNECTION_MESSAGE'),
            level: 'warning'
        });
    }

    private onUpdateError = () => {
        this.showNotification({
            title: Language.getString('UPDATE_NOTI_UPDATE_ERROR_TITLE'),
            message: Language.getString('UPDATE_NOTI_UPDATE_ERROR_MESSAGE'),
            level: 'error'
        });
    }

    // =========================================
    //                HELPERS
    // =========================================
    private onProgressTrackerResize = () => {
        // We are unsetting the height of the notification so it adjust to the resizing of the element inside it.
        let divRef = this.notiProgressDiv.current;

        if (divRef && divRef.parentElement) {
            divRef.parentElement.style.height = 'unset';
        }
    }
}

export const UpdateNotifications = withStyles(style)(UpdateNotificationsClass);
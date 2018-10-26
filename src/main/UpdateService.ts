import { ProgressInfo } from 'builder-util-runtime';
import UpdateEvents from 'common/UpdateEvents';
import { UpdateState } from 'common/UpdateState';
import { ipcMain, IpcMessageEvent, WebContents } from 'electron';
import log from 'electron-log';
import { autoUpdater, CancellationToken, UpdateInfo } from 'electron-updater';
import isOnline from 'common/is-online/isOnline';
import { isDevelopment } from 'common/IsDevelopment';

// const isDevelopment = process.defaultApp || /node_modules[\\/]electron[\\/]/.test(process.execPath);

/**
 * Emits the following events (_[s]_: Will NOT be emitted in the silent process):
 * * __RENDERER_SEARCHING_FOR_UPDATES__ [s]: When UpdateSerivce starts to search for updates.
 * * __RENDERER_NO_NEW_VERSION_FOUND__ [s]: When UpdateService did not find a new version.
 * * __RENDERER_UPDATE_FOUND__: When UpdateService did find a new version.
 * * __RENDERER_DOWNLOADING_UPDATE__: When UpdateService starts to download an update.
 * * __RENDERER_UPDATE_CANCELED__: When UpdateService cancels the update download.
 * * __RENDERER_PROGRESS_UPDATE__: When UpdateService receives a download progress update (will pass the ProgressInfo with the event).
 * * __RENDERER_DOWNLOAD_FINISHED__: When UpdateService successfully finishes the download of the update.
 * * __RENDERER_UPDATE_ERROR__ [s]: When UpdateSerice receives an error from the updater.
 *
 * -----
 *
 * Reacts on the following events:
 * * __MAIN_CHECK_FOR_UPDATES__: UpdateService will check if a new version is available.
 * * __MAIN_DOWNLOAD_UPDATE__: UpdateService will download the new version (if there is any).
 * * __MAIN_ABORT_DOWNLOAD_UPDATE__: UpdateSerice will cancel the download (if there is any).
 * * __MAIN_RESTART_AND_INSTALL_UPDATE__: UpdateService will restart the app and installs the update (_electron close events could not be fired properly - check the auto-updater documentation for more information_).
 */
export abstract class UpdateService {
    private static updateState: UpdateState = UpdateState.NOT_SEARCHED;
    private static sender: WebContents | undefined = undefined;
    private static cancellationToken: CancellationToken | undefined = undefined;
    private static isSilent: boolean = false;

    public static init() {
        ipcMain.on(UpdateEvents.MAIN_GET_UPDATE_STATE_SYNC, UpdateService.getUpdateState);

        if (isDevelopment) {
            console.log('UpdateService::init -- UpdateService will not react on events because the app is considered to be in the \'dev-mode\'. However it will simulate the prozess (except installation).');

            ipcMain.on(UpdateEvents.MAIN_CHECK_FOR_UPDATES, this.simulateUpdate);
            return;
        }

        ipcMain.on(UpdateEvents.MAIN_CHECK_FOR_UPDATES, UpdateService.checkForUpdate);
        ipcMain.on(UpdateEvents.MAIN_DOWNLOAD_UPDATE, UpdateService.downloadUpdate);
        ipcMain.on(UpdateEvents.MAIN_ABORT_DOWNLOAD_UPDATE, UpdateService.cancelUpdateDownload);
        ipcMain.on(UpdateEvents.MAIN_RESTART_AND_INSTALL_UPDATE, UpdateService.restartAndInstallUpdate);

        log.transports.file.level = 'info';

        autoUpdater.logger = log;
        autoUpdater.autoDownload = false;
        autoUpdater.autoInstallOnAppQuit = false;

        autoUpdater.on('update-not-available', this.onUpdateNotAvailable);
        autoUpdater.on('update-available', this.onUpdateFound);
        autoUpdater.on('download-progress', this.onUpdateProgress);
        autoUpdater.on('update-downloaded', this.onUpdateDownloaded);
        autoUpdater.on('error', this.onUpdateError);
    }

    private static getUpdateState(event: Electron.IpcMessageEvent) {
        event.returnValue = UpdateService.updateState;
    }

    private static noConnection() {
        if (!UpdateService.isSilent && UpdateService.sender) {
            UpdateService.sender.send(UpdateEvents.RENDERER_NO_CONNECTION);
        }

        UpdateService.updateState = UpdateState.NOT_SEARCHED;
    }

    private static checkForUpdate = (ev: IpcMessageEvent, isSilent?: boolean) => {
        if (UpdateService.updateState != UpdateState.NOT_SEARCHED) {
            return;
        }

        log.info(`Initializing update process. isSilent: ${isSilent != undefined ? isSilent : false}.`);

        UpdateService.sender = ev.sender;
        UpdateService.updateState = UpdateState.CHECKING_FOR_UPDATE;

        if (isSilent != undefined) {
            UpdateService.isSilent = isSilent;
        }

        if (!UpdateService.isSilent && UpdateService.sender) {
            UpdateService.sender.send(UpdateEvents.RENDERER_SEARCHING_FOR_UPDATES);
        }

        isOnline()
            .then((isOnline) => {
                if (!isOnline) {
                    UpdateService.noConnection();
                    return;
                }

                setImmediate(() => autoUpdater.checkForUpdates());
            })
            .catch(() => UpdateService.onUpdateError());

    }

    private static onUpdateNotAvailable = () => {
        UpdateService.updateState = UpdateState.NOT_SEARCHED;

        if (UpdateService.isSilent) {
            // If we're checking for a silent update, don't show that there's no update.
            return;
        }

        if (UpdateService.sender) {
            UpdateService.sender.send(UpdateEvents.RENDERER_NO_NEW_VERSION_FOUND);
        }
    }

    private static onUpdateFound = (updateInfo: UpdateInfo) => {
        UpdateService.updateState = UpdateState.UPDATE_FOUND;

        if (UpdateService.sender) {
            UpdateService.sender.send(UpdateEvents.RENDERER_UPDATE_FOUND, updateInfo);
        }
    }

    private static downloadUpdate() {
        UpdateService.updateState = UpdateState.DOWNLOADING_UPDATE;
        UpdateService.cancellationToken = new CancellationToken();

        if (UpdateService.sender) {
            UpdateService.sender.send(UpdateEvents.RENDERER_DOWNLOADING_UPDATE);
        }

        autoUpdater.downloadUpdate(UpdateService.cancellationToken);
    }

    private static cancelUpdateDownload() {
        UpdateService.updateState = UpdateState.NOT_SEARCHED;

        if (!UpdateService.cancellationToken) {
            // Nothing to cancel!
            return;
        }

        UpdateService.cancellationToken.cancel();

        if (UpdateService.sender) {
            UpdateService.sender.send(UpdateEvents.RENDERER_DOWNLOAD_CANCELED);
        }
    }

    private static onUpdateProgress = (progInfo: ProgressInfo) => {
        let { bytesPerSecond, transferred, total, percent } = progInfo;
        log.info(`Progress received: ${bytesPerSecond}bytes/s, ${transferred}/${total}, ${percent}%`);

        if (UpdateService.sender) {
            UpdateService.sender.send(UpdateEvents.RENDERER_PROGRESS_UPDATE, progInfo);
        }
    }

    private static onUpdateDownloaded = () => {
        UpdateService.updateState = UpdateState.UPDATE_DOWNLOADED;
        UpdateService.cancellationToken = undefined;

        if (UpdateService.sender) {
            UpdateService.sender.send(UpdateEvents.RENDERER_DOWNLOAD_FINISHED);
        }
    }

    private static restartAndInstallUpdate() {
        autoUpdater.quitAndInstall(false, true);
    }

    private static onUpdateError = () => {
        UpdateService.updateState = UpdateState.NOT_SEARCHED;

        if (UpdateService.isSilent) {
            // If it's a silent update, don't show any errors (BUT they get logged in the log anyway)
            return;
        }

        if (UpdateService.sender) {
            UpdateService.sender.send(UpdateEvents.RENDERER_UPDATE_ERROR);
        }
    }

    private static simulateUpdate = (ev: IpcMessageEvent, isSilent?: boolean) => {
        if (UpdateService.updateState != UpdateState.NOT_SEARCHED) {
            return;
        }

        if (isSilent) {
            return;
        }

        UpdateService.sender = ev.sender;
        UpdateService.updateState = UpdateState.CHECKING_FOR_UPDATE;

        if (UpdateService.sender) {
            UpdateService.sender.send(UpdateEvents.RENDERER_SEARCHING_FOR_UPDATES);
        }

        isOnline()
            .then((isOnline) => {
                if (!isOnline) {
                    UpdateService.noConnection();
                    return;
                }

                ipcMain.on(UpdateEvents.MAIN_RESTART_AND_INSTALL_UPDATE, () => {
                    UpdateService.updateState = UpdateState.NOT_SEARCHED;
                });

                ipcMain.once(UpdateEvents.MAIN_DOWNLOAD_UPDATE, () => {
                    UpdateService.updateState = UpdateState.DOWNLOADING_UPDATE;
                    UpdateService.cancellationToken = new CancellationToken();

                    if (UpdateService.sender) {
                        UpdateService.sender.send(UpdateEvents.RENDERER_DOWNLOADING_UPDATE);
                    }

                    let total: number = UpdateService.round(Math.random() * 50 + 50);
                    let transferred: number = 0;

                    // "Download the update"
                    let interval = setInterval(() => {
                        if (UpdateService.cancellationToken && UpdateService.cancellationToken.cancelled) {
                            clearInterval(interval);

                            return;
                        }

                        if (total <= transferred) {
                            clearInterval(interval);
                            UpdateService.onUpdateDownloaded();

                            return;
                        }

                        let mbPerSec: number = UpdateService.round(Math.random() * 10 + 2);

                        transferred += mbPerSec;
                        if (transferred > total) {
                            transferred = total;
                        }

                        let percent: number = UpdateService.round(transferred / total * 100);

                        if (UpdateService.sender) {
                            let progUpdate: ProgressInfo = {
                                total: total * Math.pow(1000, 2),
                                transferred: transferred * Math.pow(1000, 2),
                                delta: -1,
                                percent,
                                bytesPerSecond: mbPerSec * (Math.pow(1000, 2))
                            };

                            UpdateService.sender.send(UpdateEvents.RENDERER_PROGRESS_UPDATE, progUpdate);
                        }
                    }, 1000);

                });

                ipcMain.once(UpdateEvents.MAIN_ABORT_DOWNLOAD_UPDATE, UpdateService.cancelUpdateDownload);

                // "Search for an update"
                setTimeout(() => UpdateService.onUpdateFound({
                    version: 'DEV-SIMULATE',
                    files: [],
                    path: '',
                    sha512: '',
                    releaseDate: ''
                }), 4000);
            })
            .catch(() => UpdateService.onUpdateError());
    }

    private static round(n: number): number {
        return Math.round(n * 100) / 100;
    }
}
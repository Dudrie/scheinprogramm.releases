import { ProgressInfo } from 'builder-util-runtime';
import UpdateEvents from 'common/UpdateEvents';
import { ipcMain, WebContents } from 'electron';
import log from 'electron-log';
import { autoUpdater, CancellationToken, UpdateInfo } from 'electron-updater';
import { UpdateState } from 'common/UpdateState';

const isDevelopment = process.defaultApp || /node_modules[\\/]electron[\\/]/.test(process.execPath);

// FIXME: Wenn nach dem Suchen eines Updates ein zweites, silent Update gesucht wird, dann bekommt der Nutzer keine Rückmeldungen mehr für das erste Update.
//        -> Resultiert in einer unnötigen Notification oben rechts.
//        -> Der Button im InfoDialog wird erst nach einem Schließen & Öffnen wieder im korrekten State angezeigt.
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

    private static checkForUpdate = (ev: any, isSilent?: boolean) => {
        UpdateService.sender = ev.sender;
        UpdateService.updateState = UpdateState.CHECKING_FOR_UPDATE;

        if (isSilent != undefined) {
            UpdateService.isSilent = isSilent;
        }

        if (!UpdateService.isSilent) {
            if (UpdateService.sender) {
                UpdateService.sender.send(UpdateEvents.RENDERER_SEARCHING_FOR_UPDATES);
            }
        }

        setImmediate(() => autoUpdater.checkForUpdates());
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

    private static onUpdateError() {
        UpdateService.updateState = UpdateState.NOT_SEARCHED;

        if (UpdateService.isSilent) {
            // If it's a silent update, don't show any errors (BUT they get logged in the log anyway)
            return;
        }

        if (UpdateService.sender) {
            UpdateService.sender.send(UpdateEvents.RENDERER_UPDATE_ERROR);
        }
    }

    private static simulateUpdate = (ev: any, isSilent?: boolean) => {
        if (isSilent || (!ev.sender)) {
            return;
        }

        ipcMain.on(UpdateEvents.MAIN_RESTART_AND_INSTALL_UPDATE, () => {
            UpdateService.updateState = UpdateState.NOT_SEARCHED;
        });

        UpdateService.sender = ev.sender;

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
        if (UpdateService.sender) {
            UpdateService.sender.send(UpdateEvents.RENDERER_SEARCHING_FOR_UPDATES);
        }

        UpdateService.updateState = UpdateState.CHECKING_FOR_UPDATE;
        setTimeout(() => UpdateService.onUpdateFound({
            version: 'DEV-SIMULATE',
            files: [],
            path: '',
            sha512: '',
            releaseDate: ''
        }), 5000);
    }

    private static round(n: number): number {
        return Math.round(n * 100) / 100;
    }
}
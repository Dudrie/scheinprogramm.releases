import * as fs from 'fs';
import { DataService } from './DataService';
import { NotificationService } from './NotificationService';
import Language from './Language';
import StateService, { AppState } from './StateService';
import { remote, SaveDialogOptions, OpenDialogOptions } from 'electron';
import { DialogService } from './DialogService';

export abstract class SaveLoadService {
    public static createNewSemester() {
        DialogService.showDialog(
            Language.getString('DIALOG_CREATE_NEW_SEMESTER_TITLE'),
            Language.getString('DIALOG_CREATE_NEW_SEMESTER_MESSAGE'),
            [
                {
                    label: Language.getString('BUTTON_ABORT'),
                    onClick: () => DialogService.closeDialog()
                },
                {
                    label: Language.getString('BUTTON_CREATE'),
                    onClick: () => this._createNewSemester(),
                    buttonProps: {
                        color: 'primary',
                        variant: 'contained'
                    }
                }
            ]
        );
        
    }
    
    private static _createNewSemester() {
        DataService.clearData();

        NotificationService.showNotification({
            title: Language.getString('NOTI_SEMESTER_CREATE_SUCCESS_TITLE'),
            message: Language.getString('NOTI_SEMESTER_CREATE_SUCCESS_MESSAGE'),
            level: 'success'
        });

        StateService.setState(AppState.CHOOSE_LECTURE, undefined, false);
        StateService.preventGoingBack();

        DialogService.closeDialog();
    }

    /**
     * Prompts the user to choose a destination where to save the file. Tries to save the current semester to that file. Handles all communication with the DataService and showing proper notifications.
     */
    public static saveSemester() {
        let options: SaveDialogOptions = {
            title: Language.getString('DIALOG_SAVE_SEMESTER_TITLE'),
            filters: [
                { name: Language.getString('DIALOG_SEMESTER_FILE_TYPE_NAME'), extensions: ['json'] }
            ]
        };

        remote.dialog.showSaveDialog(
            remote.getCurrentWindow(),
            options,
            (filename) => this.saveSemesterToFile(filename)
        );
    }

    /**
     * Prompts the user to choose the file to load. Tries to load the file afterwards. Handles all communication with the DataService and showing proper notifications.
     */
    public static loadSemester() {
        let options: OpenDialogOptions = {
            title: Language.getString('DIALOG_LOAD_SEMESTER_TITLE'),
            filters: [
                { name: Language.getString('DIALOG_SEMESTER_FILE_TYPE_NAME'), extensions: ['json'] }
            ]
        };

        // The dialog returns an array but the user still can only select ONE file.
        remote.dialog.showOpenDialog(
            remote.getCurrentWindow(),
            options,
            (files) => this.loadSemesterFromFile(files)
        );
    }

    /**
     * Saves the current semester in the given file. If no file is provided the method will abort.
     *
     * @param filename Path to the file.
     */
    private static saveSemesterToFile(filename: string) {
        if (!filename) {
            return;
        }

        fs.writeFile(
            filename,
            DataService.getDataAsJson(),
            { encoding: 'utf8' },
            (err) => {
                if (err) {
                    console.error('[ERROR] Semester could not be saved to the file \"' + filename + '\".\n' + err);
                    NotificationService.showNotification({
                        title: Language.getString('NOTI_SEMESTER_SAVE_ERROR_TITLE'),
                        message: Language.getString('NOTI_SEMESTER_SAVE_ERROR_MESSAGE'),
                        level: 'error',
                        autoDismiss: 10
                    });
                    return;
                }

                NotificationService.showNotification({
                    title: Language.getString('NOTI_SEMESTER_SAVE_SUCCESS_TITLE'),
                    message: Language.getString('NOTI_SEMESTER_SAVE_SUCCESS_MESSAGE'),
                    level: 'success'
                });
            }
        );
    }

    /**
     * Loads the semester in the array. Takes only the first file into account. If there's no array or if it's empty the method will abort.
     *
     * @param files Array containing the path to the file, which should be read, at index 0.
     */
    private static loadSemesterFromFile(files: string[]) {
        if (!files || files.length == 0) {
            return;
        }

        let filename: string = files[0];
        let json: string;

        // Read the content of the file if possible.
        try {
            json = fs.readFileSync(filename, { encoding: 'utf8' });

        } catch (err) {
            console.error('[ERROR] File could not be read \"' + filename + '\".');
            NotificationService.showNotification({
                title: Language.getString('NOTI_SEMESTER_LOAD_ERROR_TITLE'),
                message: Language.getString('NOTI_SEMESTER_LOAD_ERROR_ACCESS_FILE_MESSAGE'),
                level: 'error',
                autoDismiss: 10
            });
            return;
        }

        if (DataService.loadDataFromJson(json)) {
            NotificationService.showNotification({
                title: Language.getString('NOTI_SEMESTER_LOAD_SUCCESS_TITLE'),
                message: Language.getString('NOTI_SEMESTER_LOAD_SUCCESS_MESSAGE'),
                level: 'success'
            });

            // Set the new state and prevent the user from going back.
            StateService.setState(AppState.CHOOSE_LECTURE, undefined, false);
            StateService.preventGoingBack();
            
        } else {
            NotificationService.showNotification({
                title: Language.getString('NOTI_SEMESTER_LOAD_ERROR_TITLE'),
                message: Language.getString('NOTI_SEMESTER_LOAD_ERROR_NOT_VALID_JSON_MESSAGE'),
                level: 'error',
                autoDismiss: 10
            });
        }
    }
}